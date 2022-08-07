/**
 * User routes.
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

/**
 * The user router.
 */
export const userRouter = Router();

// Returns a user's details
userRouter.get(
  "/get_user_info",
  wrapRoute(async (req, res) => {
    const user = await getLoggedInUser(req);

    respond(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      image_id: user.image_id,
      join_time: user.join_time,
    });
  })
);

// Returns a specified user's details
userRouter.get(
  "/get_specific_user_info",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const userID = getQueryParam(req, "user_id", "string");

    const user = await dbm.userService.getUser(userID);

    respond(res, {
      id: user.id,
      username: user.username,
      image_id: user.image_id,
      join_time: user.join_time,
    });
  })
);

// Sets a user's username
userRouter.post(
  "/set_username",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const newUsername = getBodyParam(req, "new_username", "string");

    await dbm.userService.setUsername(user.id, newUsername);

    respond(res);
  })
);

// Sets a user's password
userRouter.post(
  "/set_password",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const newPassword = getBodyParam(req, "new_password", "string");

    await dbm.userService.setPassword(user.id, newPassword);

    respond(res);
  })
);

// Sets a user's image
userRouter.post(
  "/set_user_image",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const imageData = getBodyParam(req, "image_data", "string");

    await dbm.userService.setUserImage(user.id, imageData);

    respond(res);
  })
);

// Deletes a user's image
userRouter.post(
  "/delete_user_image",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);

    await dbm.userService.deleteUserImage(user.id);

    respond(res);
  })
);

// Gets all groups owned by the user
userRouter.get(
  "/get_user_groups_owned",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);

    const groupsOwned = await dbm.userService.getUserGroupsOwned(user.id);

    respond(res, groupsOwned);
  })
);

// Gets all groups the user has access to
userRouter.get(
  "/get_user_groups_with_access",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);

    const groupsWithAccess = await dbm.userService.getUserGroupsWithAccess(
      user.id
    );

    respond(res, groupsWithAccess);
  })
);

// Gets all document edit requests made by the user
userRouter.get(
  "/get_user_document_edit_requests",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);

    const documentEditRequests =
      await dbm.userService.getUserDocumentEditRequests(user.id);

    respond(res, documentEditRequests);
  })
);

// Favorites a user
userRouter.post(
  "/favorite_user",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const favoriteUserID = getBodyParam(req, "favorite_user_id", "string");

    await dbm.favoriteUserService.favoriteUser(user.id, favoriteUserID);

    respond(res);
  })
);

// Unfavorites a user
userRouter.post(
  "/unfavorite_user",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const favoriteUserID = getBodyParam(req, "favorite_user_id", "string");

    await dbm.favoriteUserService.unfavoriteUser(user.id, favoriteUserID);

    respond(res);
  })
);

// Favorites a user given the user's username
userRouter.post(
  "/favorite_user_by_username",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const favoriteUserUsername = getBodyParam(
      req,
      "favorite_user_username",
      "string"
    );

    const favoriteUser = await dbm.userService.getUserByUsername(
      favoriteUserUsername
    );
    await dbm.favoriteUserService.favoriteUser(user.id, favoriteUser.id);

    respond(res);
  })
);

// Unfavorites a user given the user's username
userRouter.post(
  "/unfavorite_user_by_username",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const favoriteUserUsername = getBodyParam(
      req,
      "favorite_user_username",
      "string"
    );

    const favoriteUser = await dbm.userService.getUserByUsername(
      favoriteUserUsername
    );
    await dbm.favoriteUserService.unfavoriteUser(user.id, favoriteUser.id);

    respond(res);
  })
);

// Returns whether or not a user is favorited
userRouter.get(
  "/user_is_favorite",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const favoriteUserID = getQueryParam(req, "favorite_user_id", "string");

    const isFavorite = await dbm.favoriteUserService.isFavorite(
      user.id,
      favoriteUserID
    );

    respond(res, isFavorite);
  })
);

// Gets all favorited users
userRouter.get(
  "/get_favorite_users",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);

    const favoriteUsers = await dbm.favoriteUserService.getFavoriteUsers(
      user.id
    );

    const users = favoriteUsers.map((user) => ({
      id: user.id,
      username: user.username,
      image_id: user.image_id,
      join_time: user.join_time,
    }));

    respond(res, users);
  })
);

// Favorites a group
userRouter.post(
  "/favorite_group",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const favoriteGroupID = getBodyParam(req, "favorite_group_id", "string");

    await dbm.favoriteGroupService.favoriteGroup(user.id, favoriteGroupID);

    respond(res);
  })
);

// Unfavorites a group
userRouter.post(
  "/unfavorite_group",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const favoriteGroupID = getBodyParam(req, "favorite_group_id", "string");

    await dbm.favoriteGroupService.unfavoriteGroup(user.id, favoriteGroupID);

    respond(res);
  })
);

// Returns whether or not a group is favorited
userRouter.get(
  "/group_is_favorite",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);
    const favoriteGroupID = getQueryParam(req, "favorite_group_id", "string");

    const isFavorite = await dbm.favoriteGroupService.isFavorite(
      user.id,
      favoriteGroupID
    );

    respond(res, isFavorite);
  })
);

// Gets all favorited groups
userRouter.get(
  "/get_favorite_groups",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);

    const favoriteGroups = await dbm.favoriteGroupService.getFavoriteGroups(
      user.id
    );

    respond(res, favoriteGroups);
  })
);
