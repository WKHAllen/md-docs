/**
 * Services for the user table.
 * @packageDocumentation
 */

import { BaseService, ServiceError, hashPassword, checkPassword } from "./util";
// TODO: use session service
// import { Session } from "./session";

/**
 * User architecture.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  verified: boolean;
  join_time: number;
}

/**
 * User services.
 */
export class UserService extends BaseService {}
