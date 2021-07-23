/**
 * Image routes.
 * @packageDocumentation
 */

import { Router } from "express";
import { getDBM, wrapRoute } from "./util";

/**
 * The image router.
 */
export const imageRouter = Router();

// Returns image data
imageRouter.get(
  "/:imageID",
  wrapRoute(async (req, res, next) => {
    const dbm = getDBM(req);
    const imageID = req.params.imageID;

    const imageExists = await dbm.imageService.imageExists(imageID);

    if (imageExists) {
      const image = await dbm.imageService.getImage(imageID);
      const imageData = Buffer.from(image.data, "base64");

      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": imageData.length,
      });
      res.end(imageData);
    } else {
      next();
    }
  })
);
