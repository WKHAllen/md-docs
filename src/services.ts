/**
 * Export all services.
 * @packageDocumentation
 */

import { DB } from "./db";

import { UserService } from "./services/user";
import { SessionService } from "./services/session";
import { VerifyService } from "./services/verify";
import { PasswordResetService } from "./services/passwordReset";
import { FavoriteUserService } from "./services/favoriteUser";
import { PermissionService } from "./services/permission";
import { GroupService } from "./services/group";
import { GroupAccessService } from "./services/groupAccess";

export default class DatabaseManager {
  readonly db: DB;
  readonly userService: UserService;
  readonly sessionService: SessionService;
  readonly verifyService: VerifyService;
  readonly passwordResetService: PasswordResetService;
  readonly favoriteUserService: FavoriteUserService;
  readonly permissionService: PermissionService;
  readonly groupService: GroupService;
  readonly groupAccessService: GroupAccessService;

  constructor(dbURL: string, max: number = 20, sqlPath: string = null) {
    this.db = new DB(dbURL, max, sqlPath);
    this.userService = new UserService(this, "app_user");
    this.sessionService = new SessionService(this, "session");
    this.verifyService = new VerifyService(this, "verify");
    this.passwordResetService = new PasswordResetService(
      this,
      "password_reset"
    );
    this.favoriteUserService = new FavoriteUserService(this, "favorite_user");
    this.permissionService = new PermissionService(this, "permission");
    this.groupService = new GroupService(this, "app_group");
    this.groupAccessService = new GroupAccessService(this, "group_access");
  }

  public async execute<T = void>(
    stmt: string,
    params: any[] = []
  ): Promise<T[]> {
    return await this.db.execute(stmt, params);
  }

  public async executeFile<T = void>(
    filename: string,
    params: any[] = []
  ): Promise<T[]> {
    return await this.db.executeFile<T>(filename, params);
  }

  public async close() {
    await this.db.close();
  }
}
