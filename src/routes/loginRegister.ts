/**
 * Login and registration routes.
 * @packageDocumentation
 */

import { Router } from "express";
import {
  getDBM,
  getHostname,
  getSessionID,
  setSessionID,
  deleteSessionID,
  getLoggedInUser,
  getBodyParam,
  respond,
  wrapRoute,
} from "./util";
import { sendFormattedEmail } from "../emailer";

/**
 * The login and registration router.
 */
export const loginRegisterRouter = Router();

// Registers an account
loginRegisterRouter.post(
  "/register",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const username = getBodyParam(req, "username", "string");
    const email = getBodyParam(req, "email", "string");
    const password = getBodyParam(req, "password", "string");

    const user = await dbm.userService.createUser(username, email, password);
    const verification = await dbm.verifyService.createVerification(email);

    sendFormattedEmail(email, "Verify Account", "verify", {
      url: getHostname(req),
      verify_id: verification.id,
    });

    respond(res);
  })
);

// Logs in using email and password
loginRegisterRouter.post(
  "/login",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const email = getBodyParam(req, "email", "string");
    const password = getBodyParam(req, "password", "string");

    const session = await dbm.userService.login(email, password);
    setSessionID(res, session.id);

    respond(res);
  })
);

// Logs out
loginRegisterRouter.post(
  "/logout",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const sessionID = getSessionID(req);

    if (sessionID) {
      await dbm.sessionService.deleteSession(sessionID);
      deleteSessionID(res);
    }

    respond(res);
  })
);

// Logs out everywhere, removing all sessions
loginRegisterRouter.post(
  "/logout_everywhere",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const user = await getLoggedInUser(req);

    await dbm.sessionService.deleteUserSessions(user.id);
    deleteSessionID(res);

    respond(res);
  })
);
