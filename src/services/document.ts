/**
 * Services for the document table.
 * @packageDocumentation
 */

import { BaseService, ServiceError } from "./util";
import { Group } from "./group";
import { Directory } from "./directory";

/**
 * The maximum number of documents per directory.
 */
const MAX_DOCUMENTS_PER_DIRECTORY = 64;

/**
 * Document architecture.
 */
export interface Document {
  id: string;
  creator_user_id: string;
  group_id: string;
  directory_id?: string;
  name: string;
  content: string;
  create_time: number;
  last_edit_time?: number;
  last_edit_user_id?: string;
}

/**
 * Document services.
 */
export class DocumentService extends BaseService {
  /**
   *
   * @param name The document name.
   * @param creatorUserID The ID of the user creating the document.
   * @param groupID The group's ID.
   * @param directoryID The ID of the containing directory, or undefined if root.
   * @returns The new document record.
   */
  public async createDocument(
    name: string,
    creatorUserID: string,
    groupID: string,
    directoryID?: string
  ): Promise<Document> {
    const creatorUserExists = await this.dbm.userService.userExists(
      creatorUserID
    );

    if (creatorUserExists) {
      const groupExists = await this.dbm.groupService.groupExists(groupID);

      if (groupExists) {
        if (!directoryID) {
          const documentsHere = await this.dbm.groupService.getRootDocuments(
            groupID
          );

          if (documentsHere.length < MAX_DOCUMENTS_PER_DIRECTORY) {
            return await this.create<Document>({
              creator_user_id: creatorUserID,
              group_id: groupID,
              name,
              content: "",
            });
          } else {
            throw new ServiceError(
              "Maximum number of documents reached in directory"
            );
          }
        } else {
          const directoryExists =
            await this.dbm.directoryService.directoryExists(directoryID);

          if (directoryExists) {
            const documentsHere =
              await this.dbm.directoryService.getChildDocuments(directoryID);

            if (documentsHere.length < MAX_DOCUMENTS_PER_DIRECTORY) {
              return await this.create<Document>({
                creator_user_id: creatorUserID,
                group_id: groupID,
                directory_id: directoryID,
                name,
                content: "",
              });
            } else {
              throw new ServiceError(
                "Maximum number of documents reached in directory"
              );
            }
          } else {
            throw new ServiceError("Directory does not exist");
          }
        }
      } else {
        throw new ServiceError("Group does not exist");
      }
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Returns whether or not the document exists.
   *
   * @param documentID The document's ID.
   * @returns Whether or not the document exists.
   */
  public async documentExists(documentID: string): Promise<boolean> {
    const res = await this.getByID<Document>(documentID);
    return !!res;
  }

  /**
   * Returns the document.
   *
   * @param documentID The document's ID.
   * @returns The document record.
   */
  public async getDocument(documentID: string): Promise<Document> {
    const res = await this.getByID<Document>(documentID);

    if (res) {
      return res;
    } else {
      throw new ServiceError("Document does not exist");
    }
  }

  /**
   * Renames the document.
   *
   * @param documentID The document's ID.
   * @param newName The new name of the document.
   * @returns The updated document record.
   */
  public async renameDocument(
    documentID: string,
    newName: string
  ): Promise<Document> {
    const documentExists = await this.documentExists(documentID);

    if (documentExists) {
      return await this.updateByID<Document>(documentID, { name: newName });
    } else {
      throw new ServiceError("Document does not exist");
    }
  }

  /**
   * Sets the document content.
   *
   * @param documentID The document's ID.
   * @param newContent The new document content.
   * @returns The updated document record.
   */
  public async setDocumentContent(
    documentID: string,
    newContent: string
  ): Promise<Document> {
    const documentExists = await this.documentExists(documentID);

    if (documentExists) {
      return await this.updateByID<Document>(documentID, {
        content: newContent,
      });
    } else {
      throw new ServiceError("Document does not exist");
    }
  }

  /**
   * Returns the group the document exists in.
   *
   * @param documentID The document's ID.
   * @returns The group the document exists in.
   */
  public async getDocumentGroup(documentID: string): Promise<Group> {
    const sql = `
      SELECT * FROM app_group WHERE id = (
        SELECT group_id FROM document WHERE id = ?
      );`;
    const params = [documentID];
    const res = await this.dbm.execute<Group>(sql, params);

    if (res.length === 1) {
      return res[0];
    } else {
      throw new ServiceError("Document does not exist");
    }
  }

  /**
   * Returns the directory containing the document.
   *
   * @param documentID The document's ID.
   * @returns The containing directory, or null if root.
   */
  public async getContainingDirectory(
    documentID: string
  ): Promise<Directory | null> {
    const documentExists = await this.documentExists(documentID);

    if (documentExists) {
      const sql = `
        SELECT * FROM directory WHERE id = (
          SELECT directory_id FROM document WHERE id = ?
        );`;
      const params = [documentID];
      const res = await this.dbm.execute<Directory>(sql, params);

      return res[0] || null;
    } else {
      throw new ServiceError("Document does not exist");
    }
  }

  /**
   * Deletes the document.
   *
   * @param documentID The document's ID.
   */
  public async deleteDocument(documentID: string): Promise<void> {
    await this.deleteByID(documentID);
  }
}
