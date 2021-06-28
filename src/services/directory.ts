/**
 * Services for the directory table.
 * @packageDocumentation
 */

import { BaseService, ServiceError, SortOrder } from "./util";
import { Group } from "./group";
import { Document } from "./document";

/**
 * The maximum number of directories per directory.
 */
const MAX_DIRECTORIES_PER_DIRECTORY = 64;

/**
 * The maximum directory depth.
 */
const MAX_DIRECTORY_DEPTH = 16;

/**
 * The maximum length of a directory name.
 */
const DIRECTORY_NAME_MAX_LENGTH = 255;

/**
 * Directory architecture.
 */
export interface Directory {
  id: string;
  name: string;
  group_id: string;
  parent_directory_id?: string;
  depth: number;
  create_time: number;
}

/**
 * Directory services.
 */
export class DirectoryService extends BaseService {
  /**
   * Creates a new directory.
   *
   * @param name The directory name.
   * @param groupID The group's ID.
   * @param parentDirectoryID The ID of the parent directory, or undefined if root.
   * @returns The new directory record.
   */
  public async createDirectory(
    name: string,
    groupID: string,
    parentDirectoryID?: string
  ): Promise<Directory> {
    if (name.length > 0 && name.length <= DIRECTORY_NAME_MAX_LENGTH) {
      const groupExists = await this.dbm.groupService.groupExists(groupID);

      if (groupExists) {
        if (!parentDirectoryID) {
          const directoriesHere =
            await this.dbm.groupService.getRootDirectories(groupID);

          if (directoriesHere.length < MAX_DIRECTORIES_PER_DIRECTORY) {
            return await this.create<Directory>({ name, group_id: groupID });
          } else {
            throw new ServiceError(
              "Maximum number of directories reached in directory"
            );
          }
        } else {
          const parentDirectory = await this.getDirectory(parentDirectoryID);

          if (parentDirectory) {
            if (parentDirectory.depth + 1 < MAX_DIRECTORY_DEPTH) {
              const directoriesHere =
                await this.dbm.directoryService.getChildDirectories(
                  parentDirectoryID
                );

              if (directoriesHere.length < MAX_DIRECTORIES_PER_DIRECTORY) {
                return await this.create<Directory>({
                  name,
                  group_id: groupID,
                  parent_directory_id: parentDirectoryID,
                  depth: parentDirectory.depth + 1,
                });
              } else {
                throw new ServiceError(
                  "Maximum number of directories reached in directory"
                );
              }
            } else {
              throw new ServiceError("Maximum directory depth reached");
            }
          } else {
            throw new ServiceError("Parent directory does not exist");
          }
        }
      } else {
        throw new ServiceError("Group does not exist");
      }
    } else {
      throw new ServiceError(
        `Directory name must be between 1 and ${DIRECTORY_NAME_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Returns whether or not the directory exists.
   *
   * @param directoryID The directory's ID.
   * @returns Whether or not the directory exists.
   */
  public async directoryExists(directoryID: string): Promise<boolean> {
    const res = await this.getByID<Directory>(directoryID);
    return !!res;
  }

  /**
   * Returns the directory.
   *
   * @param directoryID The directory's ID.
   * @returns The directory record.
   */
  public async getDirectory(directoryID: string): Promise<Directory> {
    const res = await this.getByID<Directory>(directoryID);

    if (res) {
      return res;
    } else {
      throw new ServiceError("Directory does not exist");
    }
  }

  /**
   * Renames the directory.
   *
   * @param directoryID The directory's ID.
   * @param newName The new name of the directory.
   * @returns The updated directory record.
   */
  public async renameDirectory(
    directoryID: string,
    newName: string
  ): Promise<Directory> {
    if (newName.length > 0 && newName.length <= DIRECTORY_NAME_MAX_LENGTH) {
      const directoryExists = await this.directoryExists(directoryID);

      if (directoryExists) {
        return await this.updateByID<Directory>(directoryID, { name: newName });
      } else {
        throw new ServiceError("Directory does not exist");
      }
    } else {
      throw new ServiceError(
        `Directory name must be between 1 and ${DIRECTORY_NAME_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Returns the group the directory exists in.
   *
   * @param directoryID The directory's ID.
   * @returns The group the directory exists in.
   */
  public async getDirectoryGroup(directoryID: string): Promise<Group> {
    const sql = `
      SELECT * FROM app_group WHERE id = (
        SELECT group_id FROM directory WHERE id = ?
      );`;
    const params = [directoryID];
    const res = await this.dbm.execute<Group>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceError("Directory does not exist");
    }
  }

  /**
   * Returns the parent directory.
   *
   * @param directoryID The directory's ID.
   * @returns The parent directory, or null if root.
   */
  public async getParentDirectory(
    directoryID: string
  ): Promise<Directory | null> {
    const directoryExists = await this.directoryExists(directoryID);

    if (directoryExists) {
      const sql = `
        SELECT * FROM directory WHERE id = (
          SELECT parent_directory_id FROM directory WHERE id = ?
        );`;
      const params = [directoryID];
      const res = await this.dbm.execute<Directory>(sql, params);

      return res[0] || null;
    } else {
      throw new ServiceError("Directory does not exist");
    }
  }

  /**
   * Returns the subdirectories in the directory.
   *
   * @param directoryID The directory's ID.
   * @returns The subdirectories in the directory.
   */
  public async getChildDirectories(directoryID: string): Promise<Directory[]> {
    const directoryExists = await this.directoryExists(directoryID);

    if (directoryExists) {
      return await this.listByFields<Directory>(
        { parent_directory_id: directoryID },
        { fieldName: "name", sortOrder: SortOrder.ascending }
      );
    } else {
      throw new ServiceError("Directory does not exist");
    }
  }

  /**
   * Returns the documents in the directory.
   *
   * @param directoryID The directory's ID.
   * @returns The documents in the directory.
   */
  public async getChildDocuments(directoryID: string): Promise<Document[]> {
    const directoryExists = await this.directoryExists(directoryID);

    if (directoryExists) {
      const sql = `
        SELECT * FROM document
        WHERE directory_id = ?
        ORDER BY name ASC;`;
      const params = [directoryID];
      return await this.dbm.execute<Document>(sql, params);
    } else {
      throw new ServiceError("Directory does not exist");
    }
  }

  /**
   * Deletes a directory and all child directories and documents.
   *
   * @param directoryID The directory's ID.
   */
  public async deleteDirectory(directoryID: string): Promise<void> {
    await this.deleteByID(directoryID);
  }
}
