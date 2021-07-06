/**
 * Services for the user table.
 * @packageDocumentation
 */

import { BaseService, ServiceError, hashPassword, checkPassword } from "./util";
import { Session } from "./session";
import { Group } from "./group";
import { DocumentEdit } from "./documentEdit";

/**
 * The minimum length of a user's username.
 */
export const USER_USERNAME_MIN_LENGTH = 3;

/**
 * The maximum length of a user's username.
 */
export const USER_USERNAME_MAX_LENGTH = 63;

/**
 * The minimum length of a user's email.
 */
export const USER_EMAIL_MIN_LENGTH = 5;

/**
 * The maximum length of a user's email address.
 */
export const USER_EMAIL_MAX_LENGTH = 63;

/**
 * The minimum length of a user's password.
 */
export const USER_PASSWORD_MIN_LENGTH = 8;

/**
 * The maximum length of a user's password.
 */
export const USER_PASSWORD_MAX_LENGTH = 255;

/**
 * User architecture.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  image_id?: string;
  verified: boolean;
  join_time: number;
}

/**
 * User services.
 */
export class UserService extends BaseService {
  /**
   * Creates a user and returns the resulting record.
   *
   * @param username The user's username.
   * @param email The user's email.
   * @param password The user's password.
   * @returns The new user record.
   */
  public async createUser(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    if (
      username.length >= USER_USERNAME_MIN_LENGTH &&
      username.length <= USER_USERNAME_MAX_LENGTH
    ) {
      if (
        email.length >= USER_EMAIL_MIN_LENGTH &&
        email.length <= USER_EMAIL_MAX_LENGTH
      ) {
        if (
          password.length >= USER_PASSWORD_MIN_LENGTH &&
          password.length <= USER_PASSWORD_MAX_LENGTH
        ) {
          const usernameExists = await this.userExistsForUsername(username);

          if (!usernameExists) {
            const emailExists = await this.userExistsForEmail(email);

            if (!emailExists) {
              const passwordHash = await hashPassword(password);

              return await this.create<User>({
                username,
                email,
                password: passwordHash,
              });
            } else {
              throw new ServiceError("Email is already in use");
            }
          } else {
            throw new ServiceError("Username is already in use");
          }
        } else {
          throw new ServiceError(
            `Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters`
          );
        }
      } else {
        throw new ServiceError(
          `Email must be between ${USER_EMAIL_MIN_LENGTH} and ${USER_EMAIL_MAX_LENGTH} characters`
        );
      }
    } else {
      throw new ServiceError(
        `Username must be between ${USER_USERNAME_MIN_LENGTH} and ${USER_USERNAME_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Returns whether or not a user exists.
   *
   * @param userID The ID of the user.
   * @returns Whether or not the user exists.
   */
  public async userExists(userID: string): Promise<boolean> {
    const res = await this.getByID<User>(userID);
    return !!res;
  }

  /**
   * Returns whether or not a user exists given a username.
   *
   * @param username The username of the user.
   * @returns Whether or not the user exists.
   */
  public async userExistsForUsername(username: string): Promise<boolean> {
    const res = await this.getByFields<User>({ username });
    return !!res;
  }

  /**
   * Returns whether or not a user exists given an email address.
   *
   * @param email The email of the user.
   * @returns Whether or not the user exists.
   */
  public async userExistsForEmail(email: string): Promise<boolean> {
    const res = await this.getByFields<User>({ email });
    return !!res;
  }

  /**
   * Returns a user.
   *
   * @param userID The ID of the user.
   * @returns The user record.
   */
  public async getUser(userID: string): Promise<User> {
    const res = await this.getByID<User>(userID);

    if (res) {
      return res;
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Returns a user given a username.
   *
   * @param username The username of the user.
   * @returns Whether or not the user exists.
   */
  public async getUserByUsername(username: string): Promise<User> {
    const res = await this.getByFields<User>({ username });

    if (res) {
      return res;
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Returns a user given an email address.
   *
   * @param email The email of the user.
   * @returns Whether or not the user exists.
   */
  public async getUserByEmail(email: string): Promise<User> {
    const res = await this.getByFields<User>({ email });

    if (res) {
      return res;
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Sets a user's username.
   *
   * @param userID The ID of the user.
   * @param newUsername The new username.
   * @returns The updated user record.
   */
  public async setUsername(userID: string, newUsername: string): Promise<User> {
    if (
      newUsername.length >= USER_USERNAME_MIN_LENGTH &&
      newUsername.length <= USER_USERNAME_MAX_LENGTH
    ) {
      const userExists = await this.userExists(userID);

      if (userExists) {
        const usernameExists = await this.userExistsForUsername(newUsername);

        if (!usernameExists) {
          return await this.updateByID<User>(userID, { username: newUsername });
        } else {
          throw new ServiceError("Username is already in use");
        }
      } else {
        throw new ServiceError("User does not exist");
      }
    } else {
      throw new ServiceError(
        `Username must be between ${USER_USERNAME_MIN_LENGTH} and ${USER_USERNAME_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Sets a user's email address.
   *
   * @param userID The ID of the user.
   * @param newEmail The new email address.
   * @returns The updated user record.
   */
  public async setEmail(userID: string, newEmail: string): Promise<User> {
    if (
      newEmail.length >= USER_EMAIL_MIN_LENGTH &&
      newEmail.length <= USER_EMAIL_MAX_LENGTH
    ) {
      const userExists = await this.userExists(userID);

      if (userExists) {
        const emailExists = await this.userExistsForEmail(newEmail);

        if (!emailExists) {
          return await this.updateByID<User>(userID, { email: newEmail });
        } else {
          throw new ServiceError("Email is already in use");
        }
      } else {
        throw new ServiceError("User does not exist");
      }
    } else {
      throw new ServiceError(
        `Email must be between ${USER_EMAIL_MIN_LENGTH} and ${USER_EMAIL_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Sets a user's password.
   *
   * @param userID The ID of the user.
   * @param newPassword The new password.
   * @returns The updated user record.
   */
  public async setPassword(userID: string, newPassword: string): Promise<User> {
    if (
      newPassword.length >= USER_PASSWORD_MIN_LENGTH &&
      newPassword.length <= USER_PASSWORD_MAX_LENGTH
    ) {
      const userExists = await this.userExists(userID);

      if (userExists) {
        const passwordHash = await hashPassword(newPassword);

        return await this.updateByID<User>(userID, { password: passwordHash });
      } else {
        throw new ServiceError("User does not exist");
      }
    } else {
      throw new ServiceError(
        `Password must be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Sets a user's verified status.
   *
   * @param userID The ID of the user.
   * @param verified The new verified status.
   * @returns The updated user record.
   */
  public async setVerified(
    userID: string,
    verified: boolean = true
  ): Promise<User> {
    const userExists = await this.userExists(userID);

    if (userExists) {
      return await this.updateByID<User>(userID, { verified });
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Logs a user in and returns the new session.
   *
   * @param email The user's email address.
   * @param password The user's password.
   * @returns The new user session.
   */
  public async login(email: string, password: string): Promise<Session> {
    const userExists = await this.userExistsForEmail(email);

    if (userExists) {
      const user = await this.getUserByEmail(email);
      const passwordMatch = await checkPassword(password, user.password);

      if (passwordMatch) {
        const session = await this.dbm.sessionService.createSession(user.id);
        return session;
      } else {
        throw new ServiceError("Invalid login");
      }
    } else {
      throw new ServiceError("Invalid login");
    }
  }

  /**
   * Returns all groups a user owns.
   *
   * @param userID The ID of the user.
   * @returns All groups the user owns.
   */
  public async getUserGroupsOwned(userID: string): Promise<Group[]> {
    const userExists = await this.userExists(userID);

    if (userExists) {
      const sql = `
        SELECT app_group.*
          FROM app_group
          JOIN app_user
            ON app_group.owner_user_id = app_user.id
        WHERE app_user.id = ?
        ORDER BY app_group.create_time ASC;`;
      const params = [userID];
      return await this.dbm.execute<Group>(sql, params);
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Returns all document edit requests made by a user.
   *
   * @param userID The ID of the user.
   * @returns All document edit requests made by the user.
   */
  public async getUserDocumentEditRequests(
    userID: string
  ): Promise<DocumentEdit[]> {
    const userExists = await this.userExists(userID);

    if (userExists) {
      const sql = `
        SELECT document_edit.*
          FROM document_edit
          JOIN app_user
            ON document_edit.editor_user_id = app_user.id
        WHERE app_user.id = ?
        ORDER BY document_edit.edit_request_time ASC;`;
      const params = [userID];
      return await this.dbm.execute<DocumentEdit>(sql, params);
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Returns all documents with edit requests made by a user.
   *
   * @param userID The ID of the user.
   * @returns All documents with edit requests made by the user.
   */
  public async getUserDocumentEditRequestDocuments(
    userID: string
  ): Promise<DocumentEdit[]> {
    const userExists = await this.userExists(userID);

    if (userExists) {
      const sql = `
        SELECT document.*
          FROM document_edit
          JOIN document
            ON document_edit.document_id = document.id
          JOIN app_user
            ON document_edit.editor_user_id = app_user.id
        WHERE app_user.id = ?
        ORDER BY document_edit.edit_request_time ASC;`;
      const params = [userID];
      return await this.dbm.execute<DocumentEdit>(sql, params);
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Deletes a user.
   *
   * @param userID The ID of the user.
   */
  public async deleteUser(userID: string): Promise<void> {
    await this.deleteByID(userID);
  }

  /**
   * Prunes all old unverified accounts.
   */
  public async pruneUnverifiedUsers(): Promise<void> {
    const sql = `DELETE FROM app_user WHERE verified = FALSE AND EXTRACT(EPOCH FROM NOW() - join_time) >= 3600;`;
    await this.dbm.execute(sql);
  }
}
