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
 * Provides information on an error.
 *
 * @param stmt The SQL statement.
 * @param params The query parameters.
 * @param res The query response.
 * @param err The error thrown.
 */
function logError(stmt: string, params: any[], res: any, err: Error) {
  const msg = `\n\n######### ERROR #########\n\n\nStatement:\n${stmt}\n\nParameters:\n${params}\n\nResponse:\n${res}\n\nError:\n${err}`;
  console.error(msg);
}

/**
 * Transforms question mark query param indicators.
 *
 * @param stmt The SQL statement.
 * @returns The query with transformed parameters.
 */
function transformParams(stmt: string): string {
  let paramCount = 0;
  while (stmt.includes("?")) {
    stmt = stmt.replace("?", `$${++paramCount}`);
  }
  return stmt;
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

    stmt = transformParams(stmt);

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

    stmts = stmts.map(transformParams);

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
    const stmt = transformParams(sql.toString());
    const res = await this.execute<T>(stmt, params);
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
      const stmt = transformParams(sql.toString());
      const results = await this.execute<T>(stmt, params[i] || []);
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
