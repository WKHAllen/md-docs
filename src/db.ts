/**
 * Database helper.
 * @packageDocumentation
 */

import { Pool, types } from "pg";
import * as fs from "fs";
import * as path from "path";

// Log database service errors
const logErrors = true;

// Parse timestamps
types.setTypeParser(1114, (timestamp) =>
  new Date(timestamp + "+0000").getTime()
);

/**
 * If an error is thrown, provide information on the error.
 */
function logError(stmt: string, params: any[], res: any, err: Error) {
  const msg = `\n\n######### ERROR #########\n\n\nStatement:\n${stmt}\n\nParameters:\n${params}\n\nResponse:\n${res}\n\nError:\n${err}`;
  console.error(msg);
}

/**
 * Control the database through a single object.
 */
export class DB {
  private pool: Pool;
  private closed: boolean = false;
  private sqlPath: string;

  /**
   * Database controller constructor.
   *
   * @param dbURL Database connection URL.
   * @returns Database controller object.
   */
  constructor(dbURL: string, max: number = 20, sqlPath: string = null) {
    this.pool = new Pool({
      connectionString: dbURL,
      ssl: { rejectUnauthorized: false },
      max: max,
    });
    this.sqlPath = sqlPath;
  }

  /**
   * Get the SQL path value.
   *
   * @returns The default path to SQL files.
   */
  public getSQLPath(): string {
    return this.sqlPath;
  }

  /**
   * Set the SQL path value.
   *
   * @param sqlPath The default path to SQL files.
   */
  public setSQLPath(sqlPath: string): void {
    this.sqlPath = sqlPath;
  }

  /**
   * Execute a SQL query.
   *
   * @param stmt SQL statement.
   * @param params Values to be inserted into the statement.
   * @returns Query results.
   */
  public async execute<T = void>(
    stmt: string,
    params: any[] = []
  ): Promise<T[]> {
    const conn = await this.pool.connect();

    try {
      const res = await conn.query(stmt, params);
      conn.release();
      return res.rows;
    } catch (err) {
      if (logErrors) {
        logError(stmt, params, undefined, err);
      }
      conn.release();
      throw err;
    }
  }

  /**
   * Execute multiple SQL queries, each one right after the last
   *
   * @param stmts SQL statement.
   * @param params Values to be inserted into the statement.
   * @returns Results of all queries.
   */
  public async executeMany<T = void>(
    stmts: string[],
    params: any[][] = []
  ): Promise<T[][]> {
    const conn = await this.pool.connect();
    let res: T[][] = [];

    for (let i = 0; i < stmts.length; i++) {
      try {
        const results = await conn.query(stmts[i], params[i] || []);
        res.push(results.rows);
      } catch (err) {
        if (logErrors) {
          logError(stmts[i], params[i], undefined, err);
        }
        conn.release();
        throw err;
      }
    }

    return res;
  }

  /**
   * Execute a SQL file.
   *
   * @param filename The SQL file to execute.
   * @param params Values to be inserted into the statement.
   * @returns Query results.
   */
  public async executeFile<T = void>(
    filename: string,
    params: any[] = [],
    sqlPath: string = null
  ): Promise<T[]> {
    sqlPath = sqlPath || this.sqlPath;
    const filepath = sqlPath ? path.join(sqlPath, filename) : filename;
    const sql = await fs.promises.readFile(filepath);
    const res = await this.execute<T>(sql.toString(), params);
    return res;
  }

  /**
   * Execute multiple SQL files.
   *
   * @param filenames The SQL files to execute.
   * @param params Values to be inserted into the statement.
   * @returns Results of all queries.
   */
  public async executeFiles<T = void>(
    filenames: string[],
    params: any[][] = [],
    sqlPath: string = null
  ): Promise<T[][]> {
    let res: T[][] = [];

    for (let i = 0; i < filenames.length; i++) {
      sqlPath = sqlPath || this.sqlPath;
      const filepath = sqlPath
        ? path.join(sqlPath, filenames[i])
        : filenames[i];
      const sql = await fs.promises.readFile(filepath);
      const results = await this.execute<T>(sql.toString(), params[i] || []);
      res.push(results);
    }

    return res;
  }

  public async executeAllFiles<T = void>(
    directory: string,
    ext: string = ".sql",
    sqlPath: string = null
  ): Promise<T[][]> {
    sqlPath = sqlPath || this.sqlPath;
    const dirpath = sqlPath ? path.join(sqlPath, directory) : directory;
    const filenames = (await fs.promises.readdir(dirpath)).filter((filename) =>
      filename.endsWith(ext)
    );
    return await this.executeFiles(filenames, [], dirpath);
  }

  /**
   * Close the connection to the database.
   */
  public async close(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.closed) {
        this.pool.end(() => {
          this.closed = true;
          resolve();
        });
      }
    });
  }
}
