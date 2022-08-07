/**
 * Services for the verify table.
 * @packageDocumentation
 */

import { BaseService, ServiceError, SortOrder } from "./util";
import { User } from "./user";

/**
 * Verify architecture.
 */
export interface Verify {
  id: string;
  email: string;
  create_time: number;
}

/**
 * Verify services.
 */
export class VerifyService extends BaseService {
  /**
   * Creates a verification record and returns the resulting record.
   *
   * @param email The email address of the user being verified.
   * @returns The resulting verification record.
   */
  public async createVerification(email: string): Promise<Verify> {
    const emailExists = await this.dbm.userService.userExistsForEmail(email);

    if (emailExists) {
      const verificationExists = await this.verificationExistsForEmail(email);

      if (!verificationExists) {
        return await this.create<Verify>({ email });
      } else {
        return await this.getVerificationForEmail(email);
      }
    } else {
      throw new ServiceError("Email does not exist");
    }
  }

  /**
   * Returns whether or not a verification record exists.
   *
   * @param verifyID The ID of the verification record.
   * @returns Whether or not the verification record exists.
   */
  public async verificationExists(verifyID: string): Promise<boolean> {
    const res = await this.getByID<Verify>(verifyID);
    return !!res;
  }

  /**
   * Returns whether or not a verification record exists for a given email address.
   *
   * @param verifyID The email address associated with the verification record.
   * @returns Whether or not the verification record exists for the given email address.
   */
  public async verificationExistsForEmail(email: string): Promise<boolean> {
    const res = await this.getByFields<Verify>({ email });
    return !!res;
  }

  /**
   * Returns a verification record.
   *
   * @param verifyID The ID of the verification record.
   * @returns The verification record.
   */
  public async getVerification(verifyID: string): Promise<Verify> {
    const res = await this.getByID<Verify>(verifyID);

    if (res) {
      return res;
    } else {
      throw new ServiceError("Verification record does not exist");
    }
  }

  /**
   * Returns a verification record given an email address.
   *
   * @param email The email address associated with the verification record.
   * @returns The verification record given an email address.
   */
  public async getVerificationForEmail(email: string): Promise<Verify> {
    const res = await this.getByFields<Verify>({ email });

    if (res) {
      return res;
    } else {
      throw new ServiceError(
        "Verification record does not exist for given email"
      );
    }
  }

  /**
   * Returns all verification records.
   *
   * @returns All verification records.
   */
  public async getVerifications(): Promise<Verify[]> {
    return await this.list<Verify>({
      fieldName: "create_time",
      sortOrder: SortOrder.ascending,
    });
  }

  /**
   * Returns the user who created the verification record.
   *
   * @param verifyID The ID of the verification record.
   * @returns The user who created the verification record.
   */
  public async getUserByVerification(verifyID: string): Promise<User> {
    const sql = `
      SELECT * FROM app_user WHERE email = (
        SELECT email FROM verify WHERE id = ?
      );`;
    const params = [verifyID];
    const res = await this.dbm.execute<User>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceError("User does not exist for given verify ID");
    }
  }

  /**
   * Deletes a verification record.
   *
   * @param verifyID The ID of the verification record.
   */
  public async deleteVerification(verifyID: string): Promise<void> {
    await this.deleteByID(verifyID);
  }

  /**
   * Delete a verification record and the corresponding user.
   *
   * @param verifyID A verification record's ID.
   */
  public async deleteUnverifiedUser(verifyID: string): Promise<void> {
    const valid = await this.verificationExists(verifyID);

    if (valid) {
      const verification = await this.getVerification(verifyID);
      const userExists = await this.dbm.userService.userExistsForEmail(
        verification.email
      );

      if (userExists) {
        const user = await this.getUserByVerification(verifyID);

        if (!user.verified) {
          await this.dbm.userService.deleteUser(user.id);
        }
      }

      await this.deleteVerification(verifyID);
    }
  }

  /**
   * Verifies a user's account and deletes the verification record.
   *
   * @param verifyID The ID of the verification record.
   */
  public async verifyUser(verifyID: string): Promise<void> {
    const valid = await this.verificationExists(verifyID);

    if (valid) {
      const user = await this.getUserByVerification(verifyID);
      await this.deleteVerification(verifyID);
      await this.dbm.userService.setVerified(user.id);
    } else {
      throw new ServiceError("Invalid verify ID");
    }
  }

  /**
   * Prunes all old verification records.
   */
  public async pruneVerifications(): Promise<void> {
    const sql = `DELETE FROM verify WHERE EXTRACT(EPOCH FROM NOW() - create_time) >= 3600;`;
    await this.dbm.execute(sql);
  }
}
