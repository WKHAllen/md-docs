/**
 * Services for the group access table.
 * @packageDocumentation
 */

import { BaseService, ServiceError } from "./util";
import { User } from "./user";

/**
 * Group access architecture.
 */
export interface GroupAccess {
  group_id: string;
  user_id: string;
  access_grant_time: number;
}

/**
 * Group access services.
 */
export class GroupAccessService extends BaseService {
  /**
   * Grants a user access to a group.
   *
   * @param groupID The group's ID.
   * @param userID The user's ID.
   * @returns The new group access record.
   */
  public async grantAccess(
    groupID: string,
    userID: string
  ): Promise<GroupAccess> {
    const groupExists = await this.dbm.groupService.groupExists(groupID);

    if (groupExists) {
      const userExists = await this.dbm.userService.userExists(userID);

      if (userExists) {
        const hasAccess = this.hasAccess(groupID, userID);

        if (!hasAccess) {
          return await this.create<GroupAccess>({
            group_id: groupID,
            user_id: userID,
          });
        } else {
          return await this.getAccessRecord(groupID, userID);
        }
      } else {
        throw new ServiceError("User does not exist");
      }
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Returns whether or not a user has access to a group.
   *
   * @param groupID The group's ID.
   * @param userID The user's ID.
   * @returns Whether or not the user has access to the group.
   */
  public async hasAccess(groupID: string, userID: string): Promise<boolean> {
    const res = await this.getByFields<GroupAccess>({
      group_id: groupID,
      user_id: userID,
    });
    return !!res;
  }

  /**
   * Revokes a user's access to the group.
   *
   * @param groupID The group's ID.
   * @param userID The user's ID.
   */
  public async revokeAccess(groupID: string, userID: string): Promise<void> {
    await this.deleteByFields({ group_id: groupID, user_id: userID });
  }

  /**
   * Returns the group access record for a user.
   *
   * @param groupID The group's ID.
   * @param userID The user's ID.
   * @returns The group access record for the user.
   */
  public async getAccessRecord(
    groupID: string,
    userID: string
  ): Promise<GroupAccess> {
    return await this.getByFields<GroupAccess>({
      group_id: groupID,
      user_id: userID,
    });
  }

  /**
   * Returns all users who have access to a group.
   *
   * @param groupID The group's ID.
   * @returns All users who have access to the group.
   */
  public async usersWithAccess(groupID: string): Promise<User[]> {
    const groupExists = await this.dbm.groupService.groupExists(groupID);

    if (groupExists) {
      const sql = `
        SELECT app_user.*
          FROM app_user
          JOIN group_access
            ON app_user.id = group_access.user_id
        WHERE group_access.group_id = ?;`;
      const params = [groupID];
      return await this.dbm.execute<User>(sql, params);
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Revokes all access to the group.
   *
   * @param groupID The group's ID.
   */
  public async revokeAllAccess(groupID: string): Promise<void> {
    await this.deleteByFields({ group_id: groupID });
  }
}
