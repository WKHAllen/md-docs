/**
 * Export all services.
 * @packageDocumentation
 */

import { DB } from "./db";

export default class DatabaseManager {
  readonly db: DB;

  constructor(dbURL: string, max: number = 20, sqlPath: string = null) {
    this.db = new DB(dbURL, max, sqlPath);
  }

  public async execute<T = void>(
    stmt: string,
    params: any[] = []
  ): Promise<T[]> {
    return await this.db.execute(stmt, params);
  }

  public async executeFile<T = void>(
    filename: string,
    params: any[] = []
  ): Promise<T[]> {
    return await this.db.executeFile<T>(filename, params);
  }

  public async close() {
    await this.db.close();
  }
}
