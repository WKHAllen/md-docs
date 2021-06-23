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
 * Initialize the database.
 *
 * @param dbm The database manager.
 */
export default async function initDB(
  dbm: DatabaseManager,
  prune: boolean = true
): Promise<void> {
  const tables = [
    // "user",
    // "poll",
    // "poll_option",
    // "poll_vote",
    // "session",
    // "verify",
    // "password_reset",
  ];
  dbm.db.executeFiles(tables.map((table) => `init/${table}.sql`));

  if (prune) {
    setInterval(async () => {
      // TODO: prune verification and password reset records
      // await dbm.verifyService.pruneVerifications();
      // await dbm.passwordResetService.prunePasswordResets();
    }, PRUNE_INTERVAL);
  }
}
