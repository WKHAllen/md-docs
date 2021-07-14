/**
 * Document routes.
 * @packageDocumentation
 */

import { Router } from "express";
import {
  getDBM,
  getLoggedInUser,
  getQueryParam,
  getBodyParam,
  respond,
  wrapRoute,
} from "./util";
import { ServiceError } from "../services/util";

/**
 * The document router.
 */
export const documentRouter = Router();

// Creates a new document
documentRouter.post(
  "/create_document",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const name = getBodyParam(req, "name", "string");
    const groupID = getBodyParam(req, "group_id", "string");
    const directoryIDParam = getBodyParam(req, "directory_id", "string");
    const directoryID =
      directoryIDParam === "null" || directoryIDParam === "undefined"
        ? undefined
        : directoryIDParam;

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      const document = await dbm.documentService.createDocument(
        name,
        user.id,
        groupID,
        directoryID
      );

      respond(res, document);
    } else {
      throw new ServiceError(
        "You do not have permission to create documents in this group"
      );
    }
  })
);

// Returns document info
documentRouter.get(
  "/get_document_info",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const documentID = getQueryParam(req, "document_id", "string");

    const document = await dbm.documentService.getDocument(documentID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      document.group_id
    );

    if (canView) {
      respond(res, document);
    } else {
      throw new ServiceError(
        "You do not have permission to view this document"
      );
    }
  })
);

// Renames a document
documentRouter.post(
  "/rename_document",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const documentID = getBodyParam(req, "document_id", "string");
    const newName = getBodyParam(req, "new_name", "string");

    const group = await dbm.documentService.getDocumentGroup(documentID);

    if (user.id === group.owner_user_id) {
      const document = await dbm.documentService.renameDocument(
        documentID,
        newName
      );

      respond(res, document);
    } else {
      throw new ServiceError(
        "You do not have permission to rename this document"
      );
    }
  })
);

// Returns the group a document exists in
documentRouter.get(
  "/get_document_group",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const documentID = getQueryParam(req, "document_id", "string");

    const group = await dbm.documentService.getDocumentGroup(documentID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      group.id
    );

    if (canView) {
      respond(res, group);
    } else {
      throw new ServiceError(
        "You do not have permission to view the group in which this document exists"
      );
    }
  })
);

// Returns the directory containing a document
documentRouter.get(
  "/get_directory_containing_document",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const documentID = getQueryParam(req, "document_id", "string");

    const group = await dbm.documentService.getDocumentGroup(documentID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      group.id
    );

    if (canView) {
      const containingDirectory =
        await dbm.documentService.getContainingDirectory(documentID);

      respond(res, containingDirectory);
    } else {
      throw new ServiceError(
        "You do not have permission to view the directory in which this document exists"
      );
    }
  })
);

// Returns all edit requests for a document
documentRouter.get(
  "/get_document_edit_requests",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const documentID = getQueryParam(req, "document_id", "string");

    const group = await dbm.documentService.getDocumentGroup(documentID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      group.id
    );

    if (canView) {
      const containingDirectory = await dbm.documentService.getEditRequests(
        documentID
      );

      respond(res, containingDirectory);
    } else {
      throw new ServiceError(
        "You do not have permission to view the edit requests for this document"
      );
    }
  })
);

// Returns the full path to the document
documentRouter.get(
  "/get_document_path",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const documentID = getQueryParam(req, "document_id", "string");

    const document = await dbm.documentService.getDocument(documentID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      document.group_id
    );

    if (canView) {
      const documentPath = await dbm.documentService.getDocumentPath(
        documentID
      );

      respond(res, documentPath);
    } else {
      throw new ServiceError(
        "You do not have permission to view the full path to this document"
      );
    }
  })
);

// Deletes a document
documentRouter.post(
  "/delete_document",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const documentID = getBodyParam(req, "document_id", "string");

    const group = await dbm.documentService.getDocumentGroup(documentID);

    if (user.id === group.owner_user_id) {
      await dbm.documentService.deleteDocument(documentID);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to delete this document"
      );
    }
  })
);

// Requests to edit a document's content
documentRouter.post(
  "/request_document_edit",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const documentID = getBodyParam(req, "document_id", "string");
    const newContent = getBodyParam(req, "new_content", "string");
    const description = getBodyParam(req, "description", "string");

    const group = await dbm.documentService.getDocumentGroup(documentID);
    const canEdit = await dbm.permissionService.canEditDocuments(
      user.id,
      group.id
    );

    if (canEdit) {
      const documentEdit = await dbm.documentEditService.createDocumentEdit(
        documentID,
        user.id,
        newContent,
        description
      );

      respond(res, documentEdit);
    } else {
      throw new ServiceError(
        "You do not have permission to request to edit this document"
      );
    }
  })
);

// Returns a document edit record
documentRouter.get(
  "/get_document_edit",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const documentEditID = getQueryParam(req, "document_edit_id", "string");

    const document = await dbm.documentEditService.getDocumentEditDocument(
      documentEditID
    );
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      document.group_id
    );

    if (canView) {
      const documentEdit = await dbm.documentEditService.getDocumentEdit(
        documentEditID
      );

      respond(res, documentEdit);
    } else {
      throw new ServiceError(
        "You do not have permission to view this document edit request"
      );
    }
  })
);

// Returns the user who requested a document edit
documentRouter.get(
  "/get_document_editor",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const documentEditID = getQueryParam(req, "document_edit_id", "string");

    const document = await dbm.documentEditService.getDocumentEditDocument(
      documentEditID
    );
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      document.group_id
    );

    if (canView) {
      const documentEditor = await dbm.documentEditService.getDocumentEditor(
        documentEditID
      );

      respond(res, documentEditor);
    } else {
      throw new ServiceError(
        "You do not have permission to view the user who requested this document edit"
      );
    }
  })
);

// Returns the group the document edit request exists in
documentRouter.get(
  "/get_document_edit_group",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const documentEditID = getQueryParam(req, "document_edit_id", "string");

    const group = await dbm.documentEditService.getDocumentEditGroup(
      documentEditID
    );
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      group.id
    );

    if (canView) {
      respond(res, group);
    } else {
      throw new ServiceError(
        "You do not have permission to view the group this document edit request exists in"
      );
    }
  })
);

// Returns the document for which edits have been requested
documentRouter.get(
  "/get_document_edit_document",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const documentEditID = getQueryParam(req, "document_edit_id", "string");

    const document = await dbm.documentEditService.getDocumentEditDocument(
      documentEditID
    );
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      document.group_id
    );

    if (canView) {
      respond(res, document);
    } else {
      throw new ServiceError(
        "You do not have permission to view the document this edit request is for"
      );
    }
  })
);

// Approves edits on a document
documentRouter.post(
  "/approve_edits",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const documentEditID = getBodyParam(req, "document_edit_id", "string");

    const group = await dbm.documentEditService.getDocumentEditGroup(
      documentEditID
    );
    const canApproveEdits = await dbm.permissionService.canApproveEdits(
      user.id,
      group.id
    );

    if (canApproveEdits) {
      await dbm.documentEditService.approveEdits(documentEditID);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to approve edits on this document"
      );
    }
  })
);

// Denies edits on a document
documentRouter.post(
  "/deny_edits",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const documentEditID = getBodyParam(req, "document_edit_id", "string");

    const group = await dbm.documentEditService.getDocumentEditGroup(
      documentEditID
    );
    const canApproveEdits = await dbm.permissionService.canApproveEdits(
      user.id,
      group.id
    );

    if (canApproveEdits) {
      await dbm.documentEditService.denyEdits(documentEditID);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to deny edits on this document"
      );
    }
  })
);

// Deletes a document edit record
documentRouter.post(
  "/delete_document_edit_request",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const documentEditID = getBodyParam(req, "document_edit_id", "string");

    const documentEdit = await dbm.documentEditService.getDocumentEdit(
      documentEditID
    );

    if (user.id === documentEdit.editor_user_id) {
      await dbm.documentEditService.deleteDocumentEdit(documentEditID);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to delete this document edit request"
      );
    }
  })
);
