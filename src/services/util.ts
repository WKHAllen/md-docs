/**
 * Utilities for services.
 * @packageDocumentation
 */

import DatabaseManager from "../services";
import * as bcrypt from "bcrypt";

/**
 * Number of salt rounds to use when hashing passwords.
 */
const SALT_ROUNDS = 12;

/**
 * Get the current timestamp.
 *
 * @returns The timestamp in seconds.
 */
export function getTime(): number {
  return Math.floor(new Date().getTime() / 1000);
}

/**
 * Map of fields to values
 */
interface FieldMap {
  [fieldName: string]: any;
}

/**
 * Query order by options
 */
export enum OrderBy {
  ascending = "ASC",
  descending = "DESC",
}

/**
 * Order options
 */
interface OrderOptions {
  fieldName: string;
  sortOrder: OrderBy;
}

/**
 * Base service class.
 */
export abstract class BaseService {
  readonly dbm: DatabaseManager;
  readonly tableName: string;

  constructor(dbm: DatabaseManager, tableName: string) {
    this.dbm = dbm;
    this.tableName = tableName;
  }

  /**
   * Create a new record in the table.
   *
   * @param fields Field values to create in the new record.
   * @returns The new record.
   */
  protected async create<T>(fields: FieldMap): Promise<T> {
    const sql = `
      INSERT INTO ${this.tableName} (
        ${Object.keys(fields).join(", ")}
      ) VALUES (
        ${Object.values(fields).map((_) => "?")}
      ) RETURNING *;`;
    const params = Object.values(fields);

    const res = await this.dbm.execute<T>(sql, params);
    return res[0];
  }

  /**
   * Get a record in the table by ID.
   *
   * @param id The record's ID.
   * @returns The record with the given ID.
   */
  protected async getByID<T>(id: any): Promise<T> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?;`;
    const params = [id];

    const res = await this.dbm.execute<T>(sql, params);
    return res[0];
  }

  /**
   * Get a record by field values.
   *
   * @param fields Fields to query by.
   * @returns The first record matching the field values.
   */
  protected async getByFields<T>(fields: FieldMap): Promise<T> {
    const sql = `
      SELECT * FROM ${this.tableName} WHERE
      ${Object.keys(fields)
        .map((fieldName) => `${fieldName} = ?`)
        .join(" AND ")};`;
    const params = Object.values(fields);

    const res = await this.dbm.execute<T>(sql, params);
    return res[0];
  }

  /**
   * Get a record using a custom where clause.
   *
   * @param whereClause The where clause to use in the SQL query.
   * @param params The query parameters.
   * @returns The first record from the resulting set.
   */
  protected async getCustom<T>(
    whereClause: string,
    params: any[] = []
  ): Promise<T> {
    const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause};`;

    const res = await this.dbm.execute<T>(sql, params);
    return res[0];
  }

  /**
   * List all records in the table.
   *
   * @param orderOptions Options for ordering the results.
   * @returns All records, ordered if applicable.
   */
  protected async list<T>(orderOptions?: OrderOptions): Promise<T[]> {
    const orderClause = orderOptions
      ? ` ORDER BY ${orderOptions.fieldName} ${orderOptions.sortOrder}`
      : "";
    const sql = `SELECT * FROM ${this.tableName}${orderClause};`;

    const res = await this.dbm.execute<T>(sql);
    return res;
  }

  /**
   * List all records matching provided query values.
   *
   * @param fields Fields to query by.
   * @param orderOptions Options for ordering the results.
   * @returns All records matching the provided query values, ordered if applicable.
   */
  protected async listByFields<T>(
    fields: FieldMap,
    orderOptions?: OrderOptions
  ): Promise<T[]> {
    const orderClause = orderOptions
      ? ` ORDER BY ${orderOptions.fieldName} ${orderOptions.sortOrder}`
      : "";
    const sql = `
      SELECT * FROM ${this.tableName} WHERE
      ${Object.keys(fields)
        .map((fieldName) => `${fieldName} = ?`)
        .join(" AND ")}
      ${orderClause};`;
    const params = Object.values(fields);

    const res = await this.dbm.execute<T>(sql, params);
    return res;
  }

  /**
   * List all records using a custom where clause.
   *
   * @param whereClause The where clause to use in the SQL query.
   * @param orderOptions Options for ordering the results.
   * @param params The query parameters.
   * @returns All records from the resulting set.
   */
  protected async listCustom<T>(
    whereClause: string,
    orderOptions?: OrderOptions,
    params: any[] = []
  ): Promise<T[]> {
    const orderClause = orderOptions
      ? ` ORDER BY ${orderOptions.fieldName} ${orderOptions.sortOrder}`
      : "";
    const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}${orderClause};`;

    const res = await this.dbm.execute<T>(sql, params);
    return res;
  }

  /**
   * Update a record in the table by ID.
   *
   * @param id The record's ID.
   * @param fieldValues The updated field values.
   * @returns The updated record.
   */
  protected async updateByID<T>(id: any, fieldValues: FieldMap): Promise<T> {
    const sql = `
      UPDATE ${this.tableName} SET
      ${Object.keys(fieldValues)
        .map((fieldName) => `${fieldName} = ?`)
        .join(", ")}
      WHERE id = ?
      RETURNING *;`;
    const params = [...Object.values(fieldValues), id];

    const res = await this.dbm.execute<T>(sql, params);
    return res[0];
  }

  /**
   * Update records matching provided query values.
   *
   * @param fields Fields to query by.
   * @param fieldValues The updated field values.
   * @returns The updated records.
   */
  protected async updateByFields<T>(
    fields: FieldMap,
    fieldValues: FieldMap
  ): Promise<T[]> {
    const sql = `
      UPDATE ${this.tableName} SET
      ${Object.keys(fieldValues)
        .map((fieldName) => `${fieldName} = ?`)
        .join(", ")}
      WHERE
      ${Object.keys(fields)
        .map((fieldName) => `${fieldName} = ?`)
        .join(" AND ")}
      RETURNING *;`;
    const params = [...Object.values(fieldValues), ...Object.values(fields)];

    const res = await this.dbm.execute<T>(sql, params);
    return res;
  }

  /**
   * Update records using a custom where clause.
   *
   * @param whereClause The where clause to use in the SQL query.
   * @param fieldValues The updated field values.
   * @param params The query parameters.
   * @returns The updated records.
   */
  protected async updateCustom<T>(
    whereClause: string,
    fieldValues: FieldMap,
    params: any[] = []
  ): Promise<T[]> {
    const sql = `
      UPDATE ${this.tableName} SET
      ${Object.keys(fieldValues)
        .map((fieldName) => `${fieldName} = ?`)
        .join(", ")}
      WHERE ${whereClause}
      RETURNING *;`;
    params = [...Object.values(fieldValues), ...params];

    const res = await this.dbm.execute<T>(sql, params);
    return res;
  }

  /**
   * Delete a record in the table by ID.
   *
   * @param id The record's ID.
   */
  protected async deleteByID(id: any): Promise<void> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?;`;
    const params = [id];

    await this.dbm.execute(sql, params);
  }

  /**
   * Delete records matching provided query values.
   *
   * @param fields Fields to query by.
   */
  protected async deleteByFields(fields: FieldMap): Promise<void> {
    const sql = `
      DELETE FROM ${this.tableName} WHERE
      ${Object.keys(fields)
        .map((fieldName) => `${fieldName} = ?`)
        .join(" AND ")}`;
    const params = Object.values(fields);

    await this.dbm.execute(sql, params);
  }

  /**
   * Delete records using a custom where clause.
   *
   * @param whereClause The where clause to use in the SQL query.
   * @param params The query parameters.
   */
  protected async deleteCustom(
    whereClause: string,
    params: any[] = []
  ): Promise<void> {
    const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause};`;

    await this.dbm.execute(sql, params);
  }
}

/**
 * Custom error type for services.
 */
export class ServiceError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

/**
 * Hash a password.
 *
 * @param password The password.
 * @param rounds The number of salt rounds for bcrypt to use.
 * @returns The hashed password.
 */
export async function hashPassword(
  password: string,
  rounds: number = SALT_ROUNDS
): Promise<string> {
  return await bcrypt.hash(password, rounds);
}

/**
 * Check if passwords match.
 *
 * @param password The password.
 * @param hash The hashed password.
 * @returns Whether or not the password and hash match.
 */
export async function checkPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
