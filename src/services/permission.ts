/**
 * Services for the permission table.
 * @packageDocumentation
 */

import { BaseService, ServiceError } from "./util";

/**
 * Permission architecture.
 */
export interface Permission {
  id: string;
  name: string;
}

/**
 * Permission types.
 */
export enum PermissionType {
  Anyone = "ANYONE",
  ThoseWithAccess = "THOSE_WITH_ACCESS",
  OwnerOnly = "OWNER_ONLY",
}

/**
 * Permission services.
 */
export class PermissionService extends BaseService {
  /**
   * Gets all permission options.
   *
   * @returns All permission options.
   */
  public async getPermissionOptions(): Promise<Permission[]> {
    return await this.list<Permission>();
  }

  /**
   * Gets the name of the permission option.
   *
   * @param permissionID The permission ID.
   * @returns Theh name of the permission option.
   */
  public async getPermissionName(permissionID: string): Promise<string> {
    const res = await this.getByID<Permission>(permissionID);

    if (res) {
      return res.name;
    } else {
      throw new ServiceError("Permission option does not exist");
    }
  }

  /**
   * Returns whether or not the permission option is valid.
   *
   * @param permissionID The permission ID.
   * @returns Whether or not the permission option is valid.
   */
  public async validPermission(permissionID: string): Promise<boolean> {
    const res = await this.getByID<Permission>(permissionID);
    return !!res;
  }

  /**
   * Returns whether or not a user can view a group's details.
   *
   * @param userID The user's ID.
   * @param groupID The group's ID.
   * @returns Whether or not the user can view the group's details.
   */
  public async canViewGroupDetails(
    userID: string,
    groupID: string
  ): Promise<boolean> {
    const userExists = await this.dbm.userService.userExists(userID);

    if (userExists) {
      const group = await this.dbm.groupService.getGroup(groupID);

      if (group.details_visible) {
        return true;
      } else {
        if (group.owner_user_id === userID) {
          return true;
        } else {
          return this.dbm.groupAccessService.hasAccess(groupID, userID);
        }
      }
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Returns whether or not a user can make edits to documents within a group.
   *
   * @param userID The user's ID.
   * @param groupID The group's ID.
   * @returns Whether or not the user can make edits to documents within the group.
   */
  public async canEditDocuments(
    userID: string,
    groupID: string
  ): Promise<boolean> {
    const userExists = await this.dbm.userService.userExists(userID);

    if (userExists) {
      const group = await this.dbm.groupService.getGroup(groupID);

      if (group.owner_user_id === userID) {
        return true;
      } else {
        switch (group.edit_documents_permission_id) {
          case PermissionType.Anyone:
            return true;
          case PermissionType.ThoseWithAccess:
            return await this.dbm.groupAccessService.hasAccess(groupID, userID);
          case PermissionType.OwnerOnly:
            return false;
          default:
            return false;
        }
      }
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Returns whether or not a user can approve edit requests within a group.
   *
   * @param userID The user's ID.
   * @param groupID The group's ID.
   * @returns Whether or not the user can approve edit requests within the group.
   */
  public async canApproveEdits(
    userID: string,
    groupID: string
  ): Promise<boolean> {
    const userExists = await this.dbm.userService.userExists(userID);

    if (userExists) {
      const group = await this.dbm.groupService.getGroup(groupID);

      if (group.owner_user_id === userID) {
        return true;
      } else {
        switch (group.approve_edits_permission_id) {
          case PermissionType.Anyone:
            return true;
          case PermissionType.ThoseWithAccess:
            return await this.dbm.groupAccessService.hasAccess(groupID, userID);
          case PermissionType.OwnerOnly:
            return false;
          default:
            return false;
        }
      }
    } else {
      throw new ServiceError("User does not exist");
    }
  }
}
