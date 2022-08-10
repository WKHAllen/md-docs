/**
 * Utilities for routes.
 * @packageDocumentation
 */

import { Request, Response, NextFunction } from "express";
import DatabaseManager from "../services";
import { ServiceError } from "../services/util";
import { User } from "../services/user";

/**
 * Cookie maximum age.
 */
export const cookieAge = 33 * 365.242 * 24 * 60 * 60 * 1000;

/**
 * A standard JSON response object.
 */
export interface StandardResponse<T = undefined> {
  res?: T;
  error?: string;
}

/**
 * A standard success response.
 */
export const successResponse: StandardResponse = {};

/**
 * Get the database manager.
 *
 * @param req Request object.
 */
export function getDBM(req: Request): DatabaseManager {
  return req.app.get("dbm") as DatabaseManager;
}

/**
 * Get the hostname of a request.
 *
 * @param req Request object.
 */
export function getHostname(req: Request): string {
  return `${req.protocol}://${req.get("host")}`;
}

/**
 * Get the session ID cookie.
 *
 * @param req Request object.
 * @returns The session ID.
 */
export function getSessionID(req: Request): string {
  return req.cookies.sessionID;
}

/**
 * Set the session ID cookie.
 *
 * @param res Response object.
 * @param sessionID A session ID.
 */
export function setSessionID(res: Response, sessionID: string): void {
  res.cookie("sessionID", sessionID, {
    maxAge: cookieAge,
  });
}

/**
 * Delete the session ID cookie.
 *
 * @param res Response object.
 */
export function deleteSessionID(res: Response): void {
  res.clearCookie("sessionID");
}

/**
 * Get the currently logged in user's ID.
 *
 * @param req Request object.
 * @param throwOnNoUser Whether or not to throw an error when the user is not logged in.
 * @returns The user's ID.
 */
export async function getLoggedInUser(
  req: Request,
  throwOnNoUser: boolean = true
): Promise<User | null> {
  const dbm = getDBM(req);

  const sessionID = getSessionID(req);

  if (sessionID) {
    const user = await dbm.sessionService.getUserBySessionID(sessionID);
    return user;
  } else {
    if (throwOnNoUser) {
      throw new ServiceError("Not logged in");
    } else {
      return null;
    }
  }
}

/**
 * Query parameter type names
 */
type QueryParamTypeName = "boolean" | "number" | "string";

/**
 * Query parameter type name types
 */
type QueryParamType<T> = T extends "boolean"
  ? boolean
  : T extends "number"
  ? number
  : T extends "string"
  ? string
  : never;

/**
 * Returns the requested parameter, throwing errors when it doesn't exist.
 *
 * @param paramValue The value of the parameter.
 * @param paramName The name of the parameter.
 * @param paramType The type of the parameter.
 * @returns The requested parameter.
 */
function getParam<T extends QueryParamTypeName>(
  paramValue: string,
  paramName: string,
  paramType: T
): QueryParamType<T> {
  if (paramValue === undefined) {
    throw new ServiceError(`Missing query parameter '${paramName}'`);
  } else {
    switch (paramType) {
      case "boolean":
        if (typeof paramValue === "boolean") {
          return paramValue;
        } else {
          if (paramValue === "true") {
            return true as QueryParamType<T>;
          } else if (paramValue === "false") {
            return false as QueryParamType<T>;
          } else {
            throw new ServiceError(
              `Expected boolean value for query parameter '${paramName}'`
            );
          }
        }
      case "number":
        const numberParamValue = parseFloat(paramValue);
        if (!isNaN(numberParamValue)) {
          return numberParamValue as QueryParamType<T>;
        } else {
          throw new ServiceError(
            `Expected number value for query parameter '${paramName}'`
          );
        }
      case "string":
        return paramValue as QueryParamType<T>;
      default:
        throw new Error("Unexpected query param type");
    }
  }
}

/**
 * Returns the requested query parameter, throwing errors when it doesn't exist.
 *
 * @param req The request object.
 * @param paramName The name of the parameter.
 * @param paramType The type of the parameter.
 * @returns The requested query parameter.
 */
export function getQueryParam<T extends QueryParamTypeName>(
  req: Request,
  paramName: string,
  paramType: T
): QueryParamType<T> {
  const paramValue = req.query[paramName] as string;
  return getParam(paramValue, paramName, paramType);
}

/**
 * Returns the requested body parameter, throwing errors when it doesn't exist.
 *
 * @param req The request object.
 * @param paramName The name of the parameter.
 * @param paramType The type of the parameter.
 * @returns The requested body parameter.
 */
export function getBodyParam<T extends QueryParamTypeName>(
  req: Request,
  paramName: string,
  paramType: T
): QueryParamType<T> {
  const paramValue = req.body[paramName] as string;
  return getParam(paramValue, paramName, paramType);
}

/**
 * Respond to a request.
 *
 * @param obj Response object.
 */
export function respond<T = undefined>(res: Response, obj?: T): void {
  res.json({
    res: obj,
  });
}

/**
 * Respond to a request with an error.
 *
 * @param res Response object.
 * @param error Error message.
 */
export function respondError(res: Response, error: string): void {
  res.json({
    error,
  });
}

/**
 * A route controller function.
 */
type Controller = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void>;

/**
 * Wrap an asynchronous route controller in a try/catch block.
 *
 * @param route The route controller.
 * @returns The wrapped route controller.
 */
export function wrapRoute(route: Controller): Controller {
  return async (req: Request, res: Response, next?: NextFunction) => {
    try {
      await route(req, res, next);
    } catch (err) {
      if (err instanceof ServiceError) {
        respondError(res, err.message);
      } else {
        next(err);
      }
    }
  };
}
