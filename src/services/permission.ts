/**
 * Services for the permission table.
 * @packageDocumentation
 */

import { BaseService } from "./util";

/**
 * Permission architecture.
 */
export interface Permission {
  id: string;
  name: string;
}

/**
 * Permission services.
 */
export class PermissionService extends BaseService {
  /**
   * Gets all permission options.
   *
   * @returns All permission options.
   */
  public async getPermissionOptions(): Promise<Permission[]> {
    return await this.list<Permission>();
  }

  /**
   * Gets the name of the permission option.
   *
   * @param permissionID The permission ID.
   * @returns Theh name of the permission option.
   */
  public async getPermissionName(permissionID: string): Promise<string> {
    const res = await this.getByID<Permission>(permissionID);
    return res.name;
  }

  /**
   * Returns whether or not the permission option is valid.
   *
   * @param permissionID The permission ID.
   * @returns Whether or not the permission option is valid.
   */
  public async validPermission(permissionID: string): Promise<boolean> {
    const res = await this.getByID<Permission>(permissionID);
    return !!res;
  }
}
