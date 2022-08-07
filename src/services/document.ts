/**
 * Services for the document table.
 * @packageDocumentation
 */

import { BaseService, ServiceError } from "./util";
import { Group } from "./group";
import { Directory } from "./directory";
import { DocumentEdit } from "./documentEdit";

/**
 * The maximum number of documents per directory.
 */
export const MAX_DOCUMENTS_PER_DIRECTORY = 64;

/**
 * The maximum length of a document name.
 */
export const DOCUMENT_NAME_MAX_LENGTH = 255;

/**
 * The maximum length of a document's content.
 */
export const DOCUMENT_CONTENT_MAX_LENGTH = 65535;

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
   * Creates a new document.
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
    if (name.length > 0 && name.length <= DOCUMENT_NAME_MAX_LENGTH) {
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
            const directory = await this.dbm.directoryService.getDirectory(
              directoryID
            );

            if (directory.group_id === groupID) {
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
              throw new ServiceError("Directory does not exist in this group");
            }
          }
        } else {
          throw new ServiceError("Group does not exist");
        }
      } else {
        throw new ServiceError("User does not exist");
      }
    } else {
      throw new ServiceError(
        `Document name must be between 1 and ${DOCUMENT_NAME_MAX_LENGTH} characters`
      );
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
    if (newName.length > 0 && newName.length <= DOCUMENT_NAME_MAX_LENGTH) {
      const documentExists = await this.documentExists(documentID);

      if (documentExists) {
        return await this.updateByID<Document>(documentID, { name: newName });
      } else {
        throw new ServiceError("Document does not exist");
      }
    } else {
      throw new ServiceError(
        `Document name must be between 1 and ${DOCUMENT_NAME_MAX_LENGTH} characters`
      );
    }
  }

  /**
   * Edits the document content.
   *
   * @param documentID The document's ID.
   * @param editorUserID The document editor's ID.
   * @param newContent The new document content.
   * @returns The updated document record.
   */
  public async editDocument(
    documentID: string,
    editorUserID: string,
    newContent: string
  ): Promise<Document> {
    if (newContent.length <= DOCUMENT_CONTENT_MAX_LENGTH) {
      const documentExists = await this.documentExists(documentID);

      if (documentExists) {
        const editorUserExists = await this.dbm.userService.userExists(
          editorUserID
        );

        if (editorUserExists) {
          const sql = `
            UPDATE document
              SET content = ?,
                  last_edit_time = NOW(),
                  last_edit_user_id = ?
            WHERE id = ?
            RETURNING *;`;
          const params = [newContent, editorUserID, documentID];
          const res = await this.dbm.execute<Document>(sql, params);

          return res[0];
        } else {
          throw new ServiceError("Editor user does not exist");
        }
      } else {
        throw new ServiceError("Document does not exist");
      }
    } else {
      throw new ServiceError(
        `Document content must be no more than ${DOCUMENT_CONTENT_MAX_LENGTH} characters`
      );
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
   * Returns all edit requests for a document.
   *
   * @param documentID The document's ID.
   * @returns All edit requests for document.
   */
  public async getEditRequests(documentID: string): Promise<DocumentEdit[]> {
    const documentExists = await this.documentExists(documentID);

    if (documentExists) {
      const sql = `
        SELECT document_edit.*
          FROM document_edit
          JOIN document
            ON document_edit.document_id = document.id
        WHERE document.id = ?
        ORDER BY document_edit.edit_request_time ASC;`;
      const params = [documentID];
      return await this.dbm.execute<DocumentEdit>(sql, params);
    } else {
      throw new ServiceError("Document does not exist");
    }
  }

  /**
   * Returns a document's full path as a list of parent directories.
   *
   * @param documentID The document's ID.
   * @returns The full path to the document as a list of parent directories.
   */
  public async getDocumentPath(documentID: string): Promise<Directory[]> {
    const documentExists = await this.documentExists(documentID);

    if (documentExists) {
      let path: Directory[] = [];
      let nextParent = await this.getContainingDirectory(documentID);

      while (nextParent) {
        path.unshift(nextParent);
        nextParent = await this.dbm.directoryService.getParentDirectory(
          nextParent.id
        );
      }

      return path;
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
