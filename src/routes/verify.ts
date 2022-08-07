/**
 * Verification routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { getDBM, getBodyParam, respond, wrapRoute } from "./util";

/**
 * The verification router.
 */
export const verificationRouter = Router();

// Verifies a user's account
verificationRouter.post(
  "/verify_account",
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);
    const verifyID = getBodyParam(req, "verify_id", "string");

    await dbm.verifyService.verifyUser(verifyID);

    respond(res);
  })
);
