/**
 * Services for the user table.
 * @packageDocumentation
 */

import { BaseService, ServiceError, hashPassword, checkPassword } from "./util";
// TODO: use session service
// import { Session } from "./session";

/**
 * User architecture.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
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
    const usernameExists = await this.userExistsForUsername(username);
    const emailExists = await this.userExistsForEmail(email);
    if (usernameExists) {
      throw new ServiceError("Username is in use");
    } else if (emailExists) {
      throw new ServiceError("Email is in use");
    } else if (username.length < 3 || username.length > 63) {
      throw new ServiceError("Username must be between 3 and 63 characters");
    } else if (email.length < 5 || email.length > 63) {
      throw new ServiceError("Email must be between 5 and 63 characters");
    } else if (password.length < 8 || password.length > 255) {
      throw new ServiceError("Password must be between 8 and 255 characters");
    } else {
      const passwordHash = await hashPassword(password);
      return await this.create({ username, email, password: passwordHash });
    }
  }

  /**
   * Returns whether or not a user exists.
   *
   * @param userID The ID of the user.
   * @returns Whether or not the user exists.
   */
  public async userExists(userID: number): Promise<boolean> {
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
  public async getUser(userID: number): Promise<User> {
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
   * @param username The new username.
   * @returns The updated user record.
   */
  public async setUsername(userID: number, username: string): Promise<User> {
    const usernameExists = await this.userExistsForUsername(username);

    if (usernameExists) {
      throw new ServiceError("Username is in use");
    } else if (username.length < 3 || username.length > 63) {
      throw new ServiceError("Username must be between 3 and 63 characters");
    } else {
      return await this.updateByID(userID, { username });
    }
  }

  /**
   * Sets a user's email address.
   *
   * @param userID The ID of the user.
   * @param email The new email address.
   * @returns The updated user record.
   */
  public async setEmail(userID: number, email: string): Promise<User> {
    const emailExists = await this.userExistsForEmail(email);

    if (emailExists) {
      throw new ServiceError("Email is in use");
    } else if (email.length < 5 || email.length > 63) {
      throw new ServiceError("Email must be between 5 and 63 characters");
    } else {
      return await this.updateByID(userID, { email });
    }
  }

  /**
   * Sets a user's password.
   *
   * @param userID The ID of the user.
   * @param password The new password.
   * @returns The updated user record.
   */
  public async setPassword(userID: number, password: string): Promise<User> {
    if (password.length < 8 || password.length > 255) {
      throw new ServiceError("Password must be between 8 and 255 characters");
    } else {
      const passwordHash = await hashPassword(password);
      return await this.updateByID(userID, { password: passwordHash });
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
    userID: number,
    verified: boolean = true
  ): Promise<User> {
    return await this.updateByID(userID, { verified });
  }

  /**
   * Logs a user in and returns the new session.
   *
   * @param email The user's email address.
   * @param password The user's password.
   * @returns The new user session.
   */
  // public async login(email: string, password: string): Promise<Session> {}

  /**
   * Deletes a user.
   *
   * @param userID The ID of the user.
   */
  public async deleteUser(userID: number): Promise<void> {
    await this.deleteByID(userID);
  }
}
