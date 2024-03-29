/**
 * Group routes.
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
import { PermissionType } from "../services/permission";

/**
 * The group router.
 */
export const groupRouter = Router();

// Creates a new group
groupRouter.post(
  "/create_group",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupName = getBodyParam(req, "name", "string");
    const groupDescription = getBodyParam(req, "description", "string");

    const group = await dbm.groupService.createGroup(
      user.id,
      groupName,
      groupDescription
    );

    respond(res, group);
  })
);

// Returns the group info
groupRouter.get(
  "/get_group_info",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const groupID = getQueryParam(req, "group_id", "string");

    const group = await dbm.groupService.getGroup(groupID);

    respond(res, group);
  })
);

// Returns the group creator
groupRouter.get(
  "/get_group_creator",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const groupID = getQueryParam(req, "group_id", "string");

    const groupCreator = await dbm.groupService.getGroupCreator(groupID);

    respond(res, {
      id: groupCreator.id,
      username: groupCreator.username,
      image_id: groupCreator.image_id,
      join_time: groupCreator.join_time,
    });
  })
);

// Returns the group owner
groupRouter.get(
  "/get_group_owner",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const groupID = getQueryParam(req, "group_id", "string");

    const groupOwner = await dbm.groupService.getGroupOwner(groupID);

    respond(res, {
      id: groupOwner.id,
      username: groupOwner.username,
      image_id: groupOwner.image_id,
      join_time: groupOwner.join_time,
    });
  })
);

// Sets the group's name
groupRouter.post(
  "/set_group_name",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const newName = getBodyParam(req, "new_name", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupService.setGroupName(groupID, newName);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to set this group's name"
      );
    }
  })
);

// Sets the group's description
groupRouter.post(
  "/set_group_description",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const newDescription = getBodyParam(req, "new_description", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupService.setGroupDescription(groupID, newDescription);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to set this group's description"
      );
    }
  })
);

// Sets the group's image
groupRouter.post(
  "/set_group_image",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const imageData = getBodyParam(req, "image_data", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupService.setGroupImage(groupID, imageData);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to set this group's image"
      );
    }
  })
);

// Deletes the group's image
groupRouter.post(
  "/delete_group_image",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupService.deleteGroupImage(groupID);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to delete this group's image"
      );
    }
  })
);

// Passes group ownership to another user
groupRouter.post(
  "/pass_group_ownership",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const newOwnerID = getBodyParam(req, "new_owner_id", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupService.passOwnership(groupID, newOwnerID);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to pass ownership of this group"
      );
    }
  })
);

// Sets the visibility of group details
groupRouter.post(
  "/set_details_visible",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const detailsVisible = getBodyParam(req, "details_visible", "boolean");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupService.setDetailsVisible(groupID, detailsVisible);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to set the detail visibility of this group"
      );
    }
  })
);

// Sets the searchability of the group
groupRouter.post(
  "/set_searchable",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const searchable = getBodyParam(req, "searchable", "boolean");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupService.setSearchable(groupID, searchable);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to set the searchability of this group"
      );
    }
  })
);

// Sets the group's edit permissions
groupRouter.post(
  "/set_edit_permissions",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const permissions = getBodyParam(
      req,
      "permissions",
      "string"
    ) as PermissionType;

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      if (Object.values(PermissionType).includes(permissions)) {
        await dbm.groupService.setEditPermissions(groupID, permissions);

        respond(res);
      } else {
        throw new ServiceError("Invalid permission type");
      }
    } else {
      throw new ServiceError(
        "You do not have permission to set edit permissions for this group"
      );
    }
  })
);

// Sets the group's approve edits permissions
groupRouter.post(
  "/set_approve_edits_permissions",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const permissions = getBodyParam(
      req,
      "permissions",
      "string"
    ) as PermissionType;

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      if (Object.values(PermissionType).includes(permissions)) {
        await dbm.groupService.setApproveEditsPermissions(groupID, permissions);

        respond(res);
      } else {
        throw new ServiceError("Invalid permission type");
      }
    } else {
      throw new ServiceError(
        "You do not have permission to set approve edits permissions for this group"
      );
    }
  })
);

// Grants a user access to a group
groupRouter.post(
  "/grant_group_access",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const userID = getBodyParam(req, "user_id", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupAccessService.grantAccess(groupID, userID);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to grant access to this group"
      );
    }
  })
);

// Revokes a user's access to a group
groupRouter.post(
  "/revoke_group_access",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const userID = getBodyParam(req, "user_id", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupAccessService.revokeAccess(groupID, userID);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to revoke access to this group"
      );
    }
  })
);

// Grants a user access to a group given the user's username
groupRouter.post(
  "/grant_group_access_by_username",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const username = getBodyParam(req, "username", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      const otherUser = await dbm.userService.getUserByUsername(username);
      await dbm.groupAccessService.grantAccess(groupID, otherUser.id);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to grant access to this group"
      );
    }
  })
);

// Revokes a user's access to a group given the user's username
groupRouter.post(
  "/revoke_group_access_by_username",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");
    const username = getBodyParam(req, "username", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      const otherUser = await dbm.userService.getUserByUsername(username);
      await dbm.groupAccessService.revokeAccess(groupID, otherUser.id);

      respond(res);
    } else {
      throw new ServiceError(
        "You do not have permission to revoke access to this group"
      );
    }
  })
);

// Returns whether or not the user has access to a group
groupRouter.get(
  "/has_group_access",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const groupID = getQueryParam(req, "group_id", "string");

    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      groupID
    );

    if (canView) {
      const hasAccess = await dbm.groupAccessService.hasAccess(
        groupID,
        user?.id
      );

      respond(res, hasAccess);
    } else {
      throw new ServiceError(
        "You do not have permission to view access for this group"
      );
    }
  })
);

// Returns all users who have access to a group
groupRouter.get(
  "/get_users_with_access",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const groupID = getQueryParam(req, "group_id", "string");

    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      groupID
    );

    if (canView) {
      const usersWithAccess = await dbm.groupAccessService.usersWithAccess(
        groupID
      );

      const users = usersWithAccess.map((userWithAccess) => ({
        id: userWithAccess.id,
        username: userWithAccess.username,
        image_id: userWithAccess.image_id,
        join_time: userWithAccess.join_time,
      }));

      respond(res, users);
    } else {
      throw new ServiceError(
        "You do not have permission to view access for this group"
      );
    }
  })
);

// Returns all edit requests for documents within the group
groupRouter.get(
  "/get_group_document_edit_requests",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const groupID = getQueryParam(req, "group_id", "string");

    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      groupID
    );

    if (canView) {
      const editRequests = await dbm.groupService.getGroupDocumentEditRequests(
        groupID
      );

      respond(res, editRequests);
    } else {
      throw new ServiceError(
        "You do not have permission to view document edit requests for this group"
      );
    }
  })
);

// Returns all documents with edit requests within the group
groupRouter.get(
  "/get_group_document_edit_request_documents",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const groupID = getQueryParam(req, "group_id", "string");

    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      groupID
    );

    if (canView) {
      const editRequestDocuments =
        await dbm.groupService.getGroupDocumentEditRequestDocuments(groupID);

      respond(res, editRequestDocuments);
    } else {
      throw new ServiceError(
        "You do not have permission to view document edit request documents for this group"
      );
    }
  })
);

// Returns the directories in the root of the group
groupRouter.get(
  "/get_root_directories",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const groupID = getQueryParam(req, "group_id", "string");

    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      groupID
    );

    if (canView) {
      const rootDirectories = await dbm.groupService.getRootDirectories(
        groupID
      );

      respond(res, rootDirectories);
    } else {
      throw new ServiceError(
        "You do not have permission to view the directories in the root of this group"
      );
    }
  })
);

// Returns the documents in the root of the group
groupRouter.get(
  "/get_root_documents",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const groupID = getQueryParam(req, "group_id", "string");

    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      groupID
    );

    if (canView) {
      const rootDocuments = await dbm.groupService.getRootDocuments(groupID);

      respond(res, rootDocuments);
    } else {
      throw new ServiceError(
        "You do not have permission to view the documents in the root of this group"
      );
    }
  })
);

// Returns whether or not the current user can view a group's details
groupRouter.get(
  "/can_view_group_details",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const groupID = getQueryParam(req, "group_id", "string");

    const canView = await dbm.permissionService.canViewGroupDetails(
      user?.id,
      groupID
    );

    respond(res, canView);
  })
);

// Returns whether or not the current user can edit a group's documents
groupRouter.get(
  "/can_edit_group_documents",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const groupID = getQueryParam(req, "group_id", "string");

    const canEdit = await dbm.permissionService.canEditDocuments(
      user?.id,
      groupID
    );

    respond(res, canEdit);
  })
);

// Returns whether or not the current user can approve a group's document edit requests
groupRouter.get(
  "/can_approve_group_document_edits",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req, false);
    const groupID = getQueryParam(req, "group_id", "string");

    const canApproveEdits = await dbm.permissionService.canApproveEdits(
      user?.id,
      groupID
    );

    respond(res, canApproveEdits);
  })
);

// Deletes a group
groupRouter.post(
  "/delete_group",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const groupID = getBodyParam(req, "group_id", "string");

    const group = await dbm.groupService.getGroup(groupID);

    if (user.id === group.owner_user_id) {
      await dbm.groupService.deleteGroup(groupID);

      respond(res);
    } else {
      throw new ServiceError("You do not have permission to delete this group");
    }
  })
);

// Searches for groups
groupRouter.get(
  "/search_groups",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const query = getQueryParam(req, "query", "string");

    const results = await dbm.groupService.searchGroups(query);

    respond(res, results);
  })
);
