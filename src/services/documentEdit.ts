/**
 * Services for the document edit table.
 * @packageDocumentation
 */

import { BaseService, ServiceError } from "./util";
import { User } from "./user";
import { Group } from "./group";
import { Document } from "./document";

/**
 * The maximum number of documents edit requests per user.
 */
const MAX_DOCUMENT_EDITS_PER_USER = 64;

/**
 * Document edit architecture.
 */
export interface DocumentEdit {
  id: string;
  document_id: string;
  editor_user_id: string;
  new_content: string;
  edit_request_time: number;
}

/**
 * Document edit services.
 */
export class DocumentEditService extends BaseService {
  /**
   * Creates a new document edit request.
   *
   * @param documentID The document's ID.
   * @param editorUserID The ID of the user requesting the edit.
   * @param newContent The new document content.
   * @returns The new document edit request.
   */
  public async createDocumentEdit(
    documentID: string,
    editorUserID: string,
    newContent: string
  ): Promise<DocumentEdit> {
    const documentExists = await this.dbm.documentService.documentExists(
      documentID
    );

    if (documentExists) {
      const editorUserExists = await this.dbm.userService.userExists(
        editorUserID
      );

      if (editorUserExists) {
        return await this.create<DocumentEdit>({
          document_id: documentID,
          editor_user_id: editorUserID,
          new_content: newContent,
        });
      } else {
        throw new ServiceError("Editor user does not exist");
      }
    } else {
      throw new ServiceError("Document does not exist");
    }
  }

  /**
   * Returns whether or not the document edit request exists.
   *
   * @param documentEditID The document edit ID.
   * @returns Whether or not the document edit request exists.
   */
  public async documentEditExists(documentEditID: string): Promise<boolean> {
    const res = await this.getByID<DocumentEdit>(documentEditID);
    return !!res;
  }

  /**
   * Returns the document edit record.
   *
   * @param documentEditID The document edit ID.
   * @returns The document edit record.
   */
  public async getDocumentEdit(documentEditID: string): Promise<DocumentEdit> {
    const res = await this.getByID<DocumentEdit>(documentEditID);

    if (res) {
      return res;
    } else {
      throw new ServiceError("Document edit request does not exist");
    }
  }

  /**
   * Returns the user requesting the document edit.
   *
   * @param documentEditID The document edit ID.
   * @returns The user requesting the document edit.
   */
  public async getDocumentEditor(documentEditID: string): Promise<User> {
    const documentEditExists = await this.documentEditExists(documentEditID);

    if (documentEditExists) {
      const sql = `
        SELECT * FROM app_user WHERE id = (
          SELECT editor_user_id FROM document_edit WHERE id = ?
        );`;
      const params = [documentEditID];
      const res = await this.dbm.execute<User>(sql, params);

      return res[0];
    } else {
      throw new ServiceError("Document edit request does not exist");
    }
  }

  /**
   * Returns the group the document edit exists in.
   *
   * @param documentEditID The document edit ID.
   * @returns The group the document edit exists in.
   */
  public async getDocumentEditGroup(documentEditID: string): Promise<Group> {
    const documentEditExists = await this.documentEditExists(documentEditID);

    if (documentEditExists) {
      const sql = `
        SELECT * FROM app_group WHERE id = (
          SELECT group_id FROM document WHERE id = (
            SELECT document_id FROM document_edit WHERE id = ?
          )
        );`;
      const params = [documentEditID];
      const res = await this.dbm.execute<Group>(sql, params);

      return res[0];
    } else {
      throw new ServiceError("Document edit request does not exist");
    }
  }

  /**
   * Returns the document for which edits are requested.
   *
   * @param documentEditID The document edit ID.
   * @returns The document for which edits are requested.
   */
  public async getDocumentEditDocument(
    documentEditID: string
  ): Promise<Document> {
    const documentEditExists = await this.documentEditExists(documentEditID);

    if (documentEditExists) {
      const sql = `
        SELECT * FROM document WHERE id = (
          SELECT document_id FROM document_edit WHERE id = ?
        );`;
      const params = [documentEditID];
      const res = await this.dbm.execute<Document>(sql, params);

      return res[0];
    } else {
      throw new ServiceError("Document edit request does not exist");
    }
  }

  /**
   * Approves edits on the document.
   *
   * @param documentEditID The document edit ID.
   */
  public async approveEdits(documentEditID: string): Promise<void> {
    const documentEditExists = await this.documentEditExists(documentEditID);

    if (documentEditExists) {
      const documentEdit = await this.getDocumentEdit(documentEditID);

      await this.dbm.documentService.editDocument(
        documentEdit.id,
        documentEdit.editor_user_id,
        documentEdit.new_content
      );
      await this.deleteDocumentEdit(documentEditID);
    } else {
      throw new ServiceError("Document edit request does not exist");
    }
  }

  /**
   * Denies edits on the document.
   *
   * @param documentEditID The document edit ID.
   */
  public async denyEdits(documentEditID: string): Promise<void> {
    const documentEditExists = await this.documentEditExists(documentEditID);

    if (documentEditExists) {
      await this.deleteDocumentEdit(documentEditID);
    } else {
      throw new ServiceError("Document edit request does not exist");
    }
  }

  /**
   * Deletes the document edit record.
   *
   * @param documentEditID The document edit ID.
   */
  public async deleteDocumentEdit(documentEditID: string): Promise<void> {
    await this.deleteByID(documentEditID);
  }
}