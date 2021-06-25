/**
 * Database initializer.
 * @packageDocumentation
 */

import DatabaseManager from "./services";

/**
 * How often to prune records.
 */
const PRUNE_INTERVAL: number = 60 * 1000;

/**
 * Prune records from the database.
 *
 * @param dbm The database manager.
 */
async function pruneRecords(dbm: DatabaseManager): Promise<void> {
  await dbm.verifyService.pruneVerifications();
  await dbm.passwordResetService.prunePasswordResets();
  await dbm.userService.pruneUnverifiedUsers();
}

/**
 *
 * @param dbm The database manager.
 * @param table The table to populate.
 * @param values Values to be inserted into the table.
 */
export async function populateTable<T>(
  dbm: DatabaseManager,
  table: string,
  values: T[]
): Promise<void> {
  const rows = await dbm.execute<any>(`SELECT * FROM ${table};`);

  if (rows.length === 0) {
    const columns = Object.keys(values[0]).join(", ");
    const queryValues = values
      .map(
        (row) =>
          `(${Object.values(row)
            .map((value) => `'${value}'`)
            .join(", ")})`
      )
      .join(", ");

    const sql = `INSERT INTO ${table} (${columns}) VALUES ${queryValues};`;
    await dbm.execute(sql);
  }
}

/**
 * Initialize the database.
 *
 * @param dbm The database manager.
 */
export default async function initDB(
  dbm: DatabaseManager,
  prune: boolean = true
): Promise<void> {
  const tables = [
    "user",
    "session",
    "verify",
    "password_reset",
    "favorite_user",
    "permission",
    "group",
    "group_access",
    "document",
    "document_edit",
    "directory",
  ];
  await dbm.db.executeFiles(tables.map((table) => `init/${table}.sql`));

  await populateTable(dbm, "permission", [
    { id: "ANYONE", name: "Anyone" },
    { id: "THOSE_WITH_ACCESS", name: "Those with access" },
    { id: "OWNER_ONLY", name: "Owner only" },
  ]);

  if (prune) {
    await pruneRecords(dbm);

    setInterval(async () => {
      await pruneRecords(dbm);
    }, PRUNE_INTERVAL);
  }
}
