/**
 * Services for the password reset table.
 * @packageDocumentation
 */

import { BaseService, ServiceError } from "./util";
import { User } from "./user";

/**
 * Password reset architecture.
 */
export interface PasswordReset {
  id: string;
  email: string;
  create_time: number;
}

/**
 * Password reset services.
 */
export class PasswordResetService extends BaseService {
  /**
   * Creates a password reset record and returns the resulting record.
   *
   * @param email The email address of the user requesting the password reset.
   * @returns The password reset record.
   */
  public async createPasswordReset(email: string): Promise<PasswordReset> {
    const passwordResetExists = await this.passwordResetExists(email);

    if (!passwordResetExists) {
      return await this.create<PasswordReset>({ email });
    } else {
      return await this.getPasswordResetForEmail(email);
    }
  }

  /**
   * Returns whether or not a password reset record exists.
   *
   * @param passwordResetID The ID of thhe password reset record.
   * @returns Whether or not a password reset record exists.
   */
  public async passwordResetExists(passwordResetID: string): Promise<boolean> {
    const res = await this.getByID<PasswordReset>(passwordResetID);
    return !!res;
  }

  /**
   * Returns whether or not a password reset record exists given an email address.
   *
   * @param email The email address associated with the password reset record.
   * @returns Whether or not a password reset record exists for the given email address.
   */
  public async passwordResetExistsForEmail(email: string): Promise<boolean> {
    const res = await this.getByFields<PasswordReset>({ email });
    return !!res;
  }

  /**
   * Returns a password reset record.
   *
   * @param passwordResetID The ID of the password reset record.
   * @returns The password reset record.
   */
  public async getPasswordReset(
    passwordResetID: string
  ): Promise<PasswordReset> {
    const res = await this.getByID<PasswordReset>(passwordResetID);

    if (res) {
      return res;
    } else {
      throw new ServiceError("Password reset record does not exist");
    }
  }

  /**
   * Returns a password reset record given an email address.
   *
   * @param email The email address associated with the password reset record.
   * @returns The password reset record for the given email address.
   */
  public async getPasswordResetForEmail(email: string): Promise<PasswordReset> {
    const res = await this.getByFields<PasswordReset>({ email });

    if (res) {
      return res;
    } else {
      throw new ServiceError(
        "Password reset record does not exist for given email"
      );
    }
  }

  /**
   * Returns all password reset records.
   *
   * @returns All password reset records.
   */
  public async getPasswordResets(): Promise<PasswordReset[]> {
    return await this.list<PasswordReset>();
  }

  /**
   * Returns the user who created a password reset record.
   *
   * @param passwordResetID The ID of the password reset record.
   * @returns The user who created the password reset record.
   */
  public async getUserByPasswordReset(passwordResetID: string): Promise<User> {
    const sql = `
      SELECT * FROM app_user WHERE email = (
        SELECT email FROM password_reset WHERE id = $1
      );
    `;
    const params = [passwordResetID];
    const res = await this.dbm.execute<User>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceError("User does not exist for given password reset ID");
    }
  }

  /**
   * Deletes a password reset record.
   *
   * @param passwordResetID The ID of the password reset record.
   */
  public async deletePasswordReset(passwordResetID: string): Promise<void> {
    await this.deleteByID(passwordResetID);
  }

  /**
   * Resets a user's password and deletes thhe password reset record.
   *
   * @param passwordResetID The ID of the password reset record.
   * @param newPassword The user's new password.
   */
  public async resetPassword(
    passwordResetID: string,
    newPassword: string
  ): Promise<void> {
    const valid = await this.passwordResetExists(passwordResetID);

    if (valid) {
      const user = await this.getUserByPasswordReset(passwordResetID);
      await this.deletePasswordReset(passwordResetID);
      await this.dbm.userService.setPassword(user.id, newPassword);
    } else {
      throw new ServiceError("Invalid password reset ID");
    }
  }

  /**
   * Prunes all old password reset records.
   */
  public async prunePasswordResets(): Promise<void> {
    const sql = `DELETE FROM password_reset WHERE EXTRACT(EPOCH FROM NOW() - create_time) >= 3600;`;
    await this.dbm.execute(sql);
  }
}
