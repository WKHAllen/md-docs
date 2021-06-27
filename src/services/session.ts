/**
 * Services for the session table.
 * @packageDocumentation
 */

import { BaseService, ServiceError, SortOrder } from "./util";
import { User } from "./user";

/**
 * The maximum number of sessions per user.
 */
const NUM_USER_SESSIONS: number = 4;

/**
 * Session architecture.
 */
export interface Session {
  id: string;
  user_id: string;
  create_time: number;
}

/**
 * Session services.
 */
export class SessionService extends BaseService {
  /**
   * Creates a user session and returns the resulting record.
   *
   * @param userID The ID of the user creating the session.
   * @returns The session record.
   */
  public async createSession(userID: string): Promise<Session> {
    const res = await this.create<Session>({ user_id: userID });
    await this.deleteOldUserSessions(userID);
    return res;
  }

  /**
   * Returns whether or not a session exists.
   *
   * @param sessionID The ID of the session.
   * @returns Whether or not the session exists.
   */
  public async sessionExists(sessionID: string): Promise<boolean> {
    const res = await this.getByID<Session>(sessionID);
    return !!res;
  }

  /**
   * Returns a user session record.
   *
   * @param sessionID The ID of the session.
   * @returns The user session record.
   */
  public async getSession(sessionID: string): Promise<Session> {
    const res = await this.getByID<Session>(sessionID);

    if (res) {
      return res;
    } else {
      throw new ServiceError("Session does not exist");
    }
  }

  /**
   * Returns the user associated with a session.
   *
   * @param sessionID The ID of the session.
   * @returns The user associated with the session.
   */
  public async getUserBySessionID(sessionID: string): Promise<User> {
    const sql = `
      SELECT * FROM app_user WHERE id = (
        SELECT user_id FROM session WHERE id = ?
      );
    `;
    const params = [sessionID];
    const res = await this.dbm.execute<User>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceError("User or session does not exist");
    }
  }

  /**
   * Returns all sessions associated with a user.
   *
   * @param userID The ID of the user.
   * @returns The sessions associated with the user.
   */
  public async getUserSessions(userID: string): Promise<Session[]> {
    const res = await this.listByFields<Session>(
      { user_id: userID },
      { fieldName: "create_time", sortOrder: SortOrder.ascending }
    );
    return res;
  }

  /**
   * Deletes a user session.
   *
   * @param sessionID The ID of the session.
   */
  public async deleteSession(sessionID: string): Promise<void> {
    await this.deleteByID(sessionID);
  }

  /**
   * Deletes all sessions associated with a user.
   *
   * @param userID The ID of the user.
   */
  public async deleteUserSessions(userID: string): Promise<void> {
    await this.deleteByFields({ user_id: userID });
  }

  /**
   * Deletes all old user sessions.
   *
   * @param userID The ID of the user.
   */
  public async deleteOldUserSessions(userID: string): Promise<void> {
    const sql = `
      DELETE FROM session
        WHERE user_id = ?
        AND id NOT IN (
          SELECT id FROM session
            WHERE user_id = ?
            ORDER BY create_time DESC
            LIMIT ?
      );
    `;
    const params = [userID, userID, NUM_USER_SESSIONS];
    await this.dbm.execute(sql, params);
  }
}
