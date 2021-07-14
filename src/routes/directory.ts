/**
 * Directory routes.
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
 * The directory router.
 */
export const directoryRouter = Router();

// Creates a new directory
directoryRouter.post(
  "/create_directory",
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
      const directory = await dbm.directoryService.createDirectory(
        name,
        groupID,
        directoryID
      );

      respond(res, directory);
    } else {
      throw new ServiceError(
        "You do not have permission to create directories in this group"
      );
    }
  })
);

// Returns directory info
directoryRouter.get(
  "/get_directory_info",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const directoryID = getQueryParam(req, "directory_id", "string");

    const directory = await dbm.directoryService.getDirectory(directoryID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      directory.group_id
    );

    if (canView) {
      respond(res, directory);
    } else {
      throw new ServiceError(
        "You do not have permission to view this directory"
      );
    }
  })
);

// Renames a directory
directoryRouter.post(
  "/rename_directory",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const directoryID = getBodyParam(req, "directory_id", "string");
    const newName = getBodyParam(req, "new_name", "string");

    const group = await dbm.directoryService.getDirectoryGroup(directoryID);

    if (user.id === group.owner_user_id) {
      const directory = await dbm.directoryService.renameDirectory(
        directoryID,
        newName
      );

      respond(res, directory);
    } else {
      throw new ServiceError(
        "You do not have permission to rename this directory"
      );
    }
  })
);

// Returns the group a directory exists in
directoryRouter.get(
  "/get_directory_group",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const directoryID = getQueryParam(req, "directory_id", "string");

    const group = await dbm.directoryService.getDirectoryGroup(directoryID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      group.id
    );

    if (canView) {
      respond(res, group);
    } else {
      throw new ServiceError(
        "You do not have permission to view the group in which this directory exists"
      );
    }
  })
);

// Returns the parent directory
directoryRouter.get(
  "/get_parent_directory",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const directoryID = getQueryParam(req, "directory_id", "string");

    const group = await dbm.directoryService.getDirectoryGroup(directoryID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      group.id
    );

    if (canView) {
      const parentDirectory = await dbm.directoryService.getParentDirectory(
        directoryID
      );

      respond(res, parentDirectory);
    } else {
      throw new ServiceError(
        "You do not have permission to view this directory's parent directory"
      );
    }
  })
);

// Returns the subdirectories in a directory
directoryRouter.get(
  "/get_subdirectories",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const directoryID = getQueryParam(req, "directory_id", "string");

    const directory = await dbm.directoryService.getDirectory(directoryID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      directory.group_id
    );

    if (canView) {
      const subdirectories = await dbm.directoryService.getChildDirectories(
        directoryID
      );

      respond(res, subdirectories);
    } else {
      throw new ServiceError(
        "You do not have permission to view the subdirectories within this directory"
      );
    }
  })
);

// Returns the documents within a directory
directoryRouter.get(
  "/get_documents_within_directory",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const directoryID = getQueryParam(req, "directory_id", "string");

    const directory = await dbm.directoryService.getDirectory(directoryID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      directory.group_id
    );

    if (canView) {
      const childDocuments = await dbm.directoryService.getChildDocuments(
        directoryID
      );

      respond(res, childDocuments);
    } else {
      throw new ServiceError(
        "You do not have permission to view the documents within this directory"
      );
    }
  })
);

// Returns the full path to the directory
directoryRouter.get(
  "/get_directory_path",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const directoryID = getQueryParam(req, "directory_id", "string");

    const directory = await dbm.directoryService.getDirectory(directoryID);
    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      directory.group_id
    );

    if (canView) {
      const directoryPath = await dbm.directoryService.getDirectoryPath(
        directoryID
      );

      respond(res, directoryPath);
    } else {
      throw new ServiceError(
        "You do not have permission to view the full path to this directory"
      );
    }
  })
);

// Deletes a directory and all documents and directories within it
directoryRouter.post(
  "/delete_directory",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const directoryID = getBodyParam(req, "directory_id", "string");

    const group = await dbm.directoryService.getDirectoryGroup(directoryID);

    if (user.id === group.owner_user_id) {
      await dbm.directoryService.deleteDirectory(directoryID);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to delete this directory"
      );
    }
  })
);
