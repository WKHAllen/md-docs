/**
 * Services for the group table.
 * @packageDocumentation
 */

import { BaseService, ServiceError } from "./util";
import { User } from "./user";
import { Directory } from "./directory";
import { Document } from "./document";
import { DocumentEdit } from "./documentEdit";

/**
 * The maximum number of groups a user can create.
 */
export const MAX_GROUPS_PER_USER = 64;

/**
 * The maximum length of a group name.
 */
export const GROUP_NAME_MAX_LENGTH = 255;

/**
 * The maximum length of a group description.
 */
export const GROUP_DESCRIPTION_MAX_LENGTH = 1023;

/**
 * Group architecture.
 */
export interface Group {
  id: string;
  creator_user_id?: string;
  owner_user_id: string;
  name: string;
  description: string;
  details_visible: boolean;
  searchable: boolean;
  edit_documents_permission_id: string;
  approve_edits_permission_id: string;
  image_id?: string;
  create_time: number;
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
 * Group services.
 */
export class GroupService extends BaseService {
  /**
   * Creates a new group.
   *
   * @param creatorUserID The ID of the user creating the group.
   * @param groupName The name of the new group.
   * @param groupDescription The group description.
   * @returns The new group record.
   */
  public async createGroup(
    creatorUserID: string,
    groupName: string,
    groupDescription: string = ""
  ): Promise<Group> {
    if (groupName.length > 0 && groupName.length <= GROUP_NAME_MAX_LENGTH) {
      const userExists = await this.dbm.userService.userExists(creatorUserID);

      if (groupDescription.length <= GROUP_DESCRIPTION_MAX_LENGTH) {
        if (userExists) {
          const userGroups = await this.dbm.userService.getUserGroupsOwned(
            creatorUserID
          );

          if (userGroups.length < MAX_GROUPS_PER_USER) {
            return await this.create<Group>({
              creator_user_id: creatorUserID,
              owner_user_id: creatorUserID,
              name: groupName,
              description: groupDescription,
              edit_documents_permission_id: PermissionType.ThoseWithAccess,
              approve_edits_permission_id: PermissionType.OwnerOnly,
            });
          } else {
            throw new ServiceError("Maximum number of groups reached for user");
          }
        } else {
          throw new ServiceError("User does not exist");
        }
      } else {
        throw new ServiceError(
          `Group description must be no more than ${GROUP_DESCRIPTION_MAX_LENGTH} characters`
        );
      }
    } else {
      throw new ServiceError(
        `Group name must be between 1 and ${GROUP_NAME_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Returns whether or not a group exists.
   *
   * @param groupID The group's ID.
   * @returns Whether or not the group exists.
   */
  public async groupExists(groupID: string): Promise<boolean> {
    const res = await this.getByID<Group>(groupID);
    return !!res;
  }

  /**
   * Returns the group.
   *
   * @param groupID The group's ID.
   * @returns The group record.
   */
  public async getGroup(groupID: string): Promise<Group> {
    const res = await this.getByID<Group>(groupID);

    if (res) {
      return res;
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Returns the user who created the group.
   *
   * @param groupID The group's ID.
   * @returns The group's creator.
   */
  public async getGroupCreator(groupID: string): Promise<User | null> {
    const sql = `
      SELECT * FROM app_user WHERE id = (
        SELECT creator_user_id FROM app_group WHERE id = ?
      );`;
    const params = [groupID];
    const res = await this.dbm.execute<User>(sql, params);

    if (res.length === 1) {
      return res[0] || null;
    } else {
      throw new ServiceError("Group or group creator does not exist");
    }
  }

  /**
   * Returns the user who currently owns the group.
   *
   * @param groupID The group's ID.
   * @returns The group's current owner.
   */
  public async getGroupOwner(groupID: string): Promise<User> {
    const sql = `
      SELECT * FROM app_user WHERE id = (
        SELECT owner_user_id FROM app_group WHERE id = ?
      );
    `;
    const params = [groupID];
    const res = await this.dbm.execute<User>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Sets the group's name.
   *
   * @param groupID The group's ID.
   * @param newName The new group name.
   * @returns The updated group record.
   */
  public async setGroupName(groupID: string, newName: string): Promise<Group> {
    if (newName.length > 0 && newName.length <= GROUP_NAME_MAX_LENGTH) {
      const groupExists = await this.groupExists(groupID);

      if (groupExists) {
        return await this.updateByID<Group>(groupID, { name: newName });
      } else {
        throw new ServiceError("Group does not exist");
      }
    } else {
      throw new ServiceError(
        `Group name must be between 1 and ${GROUP_NAME_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Sets the group's description.
   *
   * @param groupID The group's ID.
   * @param newDescription The new group description.
   * @returns The updated group record.
   */
  public async setGroupDescription(
    groupID: string,
    newDescription: string
  ): Promise<Group> {
    if (newDescription.length <= GROUP_DESCRIPTION_MAX_LENGTH) {
      const groupExists = await this.groupExists(groupID);

      if (groupExists) {
        return await this.updateByID<Group>(groupID, {
          description: newDescription,
        });
      } else {
        throw new ServiceError("Group does not exist");
      }
    } else {
      throw new ServiceError(
        `Group description must be no more than ${GROUP_DESCRIPTION_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Passes ownership of the group to a new user.
   *
   * @param groupID The group's ID.
   * @param newOwnerID The ID of the new group owner.
   * @returns The updated group record.
   */
  public async passOwnership(
    groupID: string,
    newOwnerID: string
  ): Promise<Group> {
    const groupExists = await this.groupExists(groupID);

    if (groupExists) {
      const newOwnerExists = await this.dbm.userService.userExists(newOwnerID);

      if (newOwnerExists) {
        const userGroups = await this.dbm.userService.getUserGroupsOwned(
          newOwnerID
        );

        if (userGroups.length < MAX_GROUPS_PER_USER) {
          return await this.updateByID<Group>(groupID, {
            owner_user_id: newOwnerID,
          });
        } else {
          throw new ServiceError("Maximum number of groups reached for user");
        }
      } else {
        throw new ServiceError("New owner user does not exist");
      }
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Sets the visibility of group details.
   *
   * @param groupID The group's ID.
   * @param detailsVisible Whether or not the group details should be visible.
   * @returns The updated group record.
   */
  public async setDetailsVisible(
    groupID: string,
    detailsVisible: boolean
  ): Promise<Group> {
    const groupExists = await this.groupExists(groupID);

    if (groupExists) {
      return await this.updateByID<Group>(groupID, {
        details_visible: detailsVisible,
      });
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Sets the searchability of the group.
   *
   * @param groupID The group's ID.
   * @param searchable Whether or not the group should be searchable.
   * @returns The updated group record.
   */
  public async setSearchable(
    groupID: string,
    searchable: boolean
  ): Promise<Group> {
    const groupExists = await this.groupExists(groupID);

    if (groupExists) {
      return await this.updateByID<Group>(groupID, { searchable });
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Sets the group's edit permissions.
   *
   * @param groupID The group's ID.
   * @param permissions The new edit permissions.
   * @returns The updated group record.
   */
  public async setEditPermissions(
    groupID: string,
    permissions: PermissionType
  ): Promise<Group> {
    const groupExists = await this.groupExists(groupID);

    if (groupExists) {
      return await this.updateByID<Group>(groupID, {
        edit_documents_permission_id: permissions,
      });
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Sets the group's approve edits permissions.
   *
   * @param groupID The group's ID.
   * @param permissions The new approve edits permissions.
   * @returns The updated group record.
   */
  public async setApproveEditsPermissions(
    groupID: string,
    permissions: PermissionType
  ): Promise<Group> {
    const groupExists = await this.groupExists(groupID);

    if (groupExists) {
      return await this.updateByID<Group>(groupID, {
        approve_edits_permission_id: permissions,
      });
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Returns the directories in the root of the group.
   *
   * @param groupID The group's ID.
   * @returns The root directories.
   */
  public async getRootDirectories(groupID: string): Promise<Directory[]> {
    const groupExists = await this.groupExists(groupID);

    if (groupExists) {
      const sql = `
        SELECT directory.*
          FROM directory
          JOIN app_group
            ON directory.group_id = app_group.id
        WHERE app_group.id = ?
          AND directory.parent_directory_id = NULL
        ORDER BY directory.name ASC;`;
      const params = [groupID];
      return await this.dbm.execute<Directory>(sql, params);
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Returns the documents in the root of the group.
   *
   * @param groupID The group's ID.
   * @returns The root documents.
   */
  public async getRootDocuments(groupID: string): Promise<Document[]> {
    const groupExists = await this.groupExists(groupID);

    if (groupExists) {
      const sql = `
        SELECT document.*
          FROM document
          JOIN app_group
            ON document.group_id = app_group.id
        WHERE app_group.id = ?
          AND document.directory_id = NULL
        ORDER BY document.name ASC;`;
      const params = [groupID];
      return await this.dbm.execute<Document>(sql, params);
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Returns all edit requests for documents within the group.
   *
   * @param groupID The group's ID.
   * @returns All edit requests for documents within the group.
   */
  public async getGroupDocumentEditRequests(
    groupID: string
  ): Promise<DocumentEdit[]> {
    const groupExists = await this.groupExists(groupID);

    if (groupExists) {
      const sql = `
        SELECT document_edit.*
          FROM document_edit
          JOIN document
            ON document_edit.document_id = document.id
          JOIN app_group
            ON document.group_id = app_group.id
        WHERE app_group.id = ?
        ORDER BY document_edit.edit_request_time ASC;`;
      const params = [groupID];
      return await this.dbm.execute<DocumentEdit>(sql, params);
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Returns all documents with edit requests within the group.
   *
   * @param groupID The group's ID.
   * @returns All documents with edit requests within the group.
   */
  public async getGroupDocumentEditRequestDocuments(
    groupID: string
  ): Promise<DocumentEdit[]> {
    const groupExists = await this.groupExists(groupID);

    if (groupExists) {
      const sql = `
        SELECT document.*
          FROM document_edit
          JOIN document
            ON document_edit.document_id = document.id
          JOIN app_group
            ON document.group_id = app_group.id
        WHERE app_group.id = ?
        ORDER BY document_edit.edit_request_time ASC;`;
      const params = [groupID];
      return await this.dbm.execute<DocumentEdit>(sql, params);
    } else {
      throw new ServiceError("Group does not exist");
    }
  }

  /**
   * Deletes a group.
   *
   * @param groupID The group's ID.
   */
  public async deleteGroup(groupID: string): Promise<void> {
    await this.deleteByID(groupID);
  }
}
