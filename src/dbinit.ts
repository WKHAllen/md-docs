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
  // TODO: prune verification and password reset records
  // await dbm.verifyService.pruneVerifications();
  // await dbm.passwordResetService.prunePasswordResets();
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
  const tables = ["user", "session", "verify", "password_reset"];
  await dbm.db.executeFiles(tables.map((table) => `init/${table}.sql`));

  if (prune) {
    await pruneRecords(dbm);

    setInterval(async () => {
      await pruneRecords(dbm);
    }, PRUNE_INTERVAL);
  }
}
