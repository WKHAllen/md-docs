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
  ];
  await dbm.db.executeFiles(tables.map((table) => `init/${table}.sql`));

  if (prune) {
    await pruneRecords(dbm);

    setInterval(async () => {
      await pruneRecords(dbm);
    }, PRUNE_INTERVAL);
  }
}
