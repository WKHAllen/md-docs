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
