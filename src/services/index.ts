/**
 * Export all services.
 * @packageDocumentation
 */

import { DB } from "../db";

import { ImageService } from "./image";
import { UserService } from "./user";
import { SessionService } from "./session";
import { VerifyService } from "./verify";
import { PasswordResetService } from "./passwordReset";
import { FavoriteUserService } from "./favoriteUser";
import { PermissionService } from "./permission";
import { GroupService } from "./group";
import { GroupAccessService } from "./groupAccess";
import { FavoriteGroupService } from "./favoriteGroup";
import { DirectoryService } from "./directory";
import { DocumentService } from "./document";
import { DocumentEditService } from "./documentEdit";

export default class DatabaseManager {
  readonly db: DB;
  readonly imageService: ImageService;
  readonly userService: UserService;
  readonly sessionService: SessionService;
  readonly verifyService: VerifyService;
  readonly passwordResetService: PasswordResetService;
  readonly favoriteUserService: FavoriteUserService;
  readonly permissionService: PermissionService;
  readonly groupService: GroupService;
  readonly groupAccessService: GroupAccessService;
  readonly favoriteGroupService: FavoriteGroupService;
  readonly directoryService: DirectoryService;
  readonly documentService: DocumentService;
  readonly documentEditService: DocumentEditService;

  constructor(dbURL: string, max: number = 20, sqlPath: string = null) {
    this.db = new DB(dbURL, max, sqlPath);
    this.imageService = new ImageService(this, "image");
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
    this.favoriteGroupService = new FavoriteGroupService(
      this,
      "favorite_group"
    );
    this.directoryService = new DirectoryService(this, "directory");
    this.documentService = new DocumentService(this, "document");
    this.documentEditService = new DocumentEditService(this, "document_edit");
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
