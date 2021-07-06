/**
 * Services for the favorite group table.
 * @packageDocumentation
 */

import { BaseService, ServiceError } from "./util";
import { Group } from "./group";

/**
 * Favorite group architecture.
 */
export interface FavoriteGroup {
  user_id: string;
  favorite_group_id: string;
  favorite_time: number;
}

/**
 * Favorite group services.
 */
export class FavoriteGroupService extends BaseService {
  /**
   * Adds a group as a favorite.
   *
   * @param userID The user's ID.
   * @param favoriteGroupID The ID of the group being favorited.
   * @returns The resulting record.
   */
  public async favoriteGroup(
    userID: string,
    favoriteGroupID: string
  ): Promise<FavoriteGroup> {
    const userExists = await this.dbm.userService.userExists(userID);

    if (userExists) {
      const favoriteGroupExists = await this.dbm.groupService.groupExists(
        favoriteGroupID
      );

      if (favoriteGroupExists) {
        const favorite = await this.isFavorite(userID, favoriteGroupID);

        if (!favorite) {
          return await this.create<FavoriteGroup>({
            user_id: userID,
            favorite_group_id: favoriteGroupID,
          });
        } else {
          return await this.getFavorite(userID, favoriteGroupID);
        }
      } else {
        throw new ServiceError("Group does not exist");
      }
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Removes a group as a favorite.
   *
   * @param userID The user's ID.
   * @param favoriteGroupID The ID of the group being unfavorited.
   */
  public async unfavoriteGroup(
    userID: string,
    favoriteGroupID: string
  ): Promise<void> {
    const userExists = await this.dbm.userService.userExists(userID);

    if (userExists) {
      const favoriteGroupExists = await this.dbm.groupService.groupExists(
        favoriteGroupID
      );

      if (favoriteGroupExists) {
        await this.deleteByFields({
          user_id: userID,
          favorite_group_id: favoriteGroupID,
        });
      } else {
        throw new ServiceError("Group does not exist");
      }
    } else {
      throw new ServiceError("User does not exist");
    }
  }

  /**
   * Returns whether or not a group is favorited by a user.
   *
   * @param userID The user's ID.
   * @param favoriteGroupID The ID of the group in question.
   * @returns Whether or not the group is a favorite.
   */
  public async isFavorite(
    userID: string,
    favoriteGroupID: string
  ): Promise<boolean> {
    const res = await this.getByFields<FavoriteGroup>({
      user_id: userID,
      favorite_group_id: favoriteGroupID,
    });
    return !!res;
  }

  /**
   * Gets the favorite record.
   *
   * @param userID The user's ID.
   * @param favoriteGroupID The ID of the favorited group.
   * @returns The favorite record.
   */
  public async getFavorite(
    userID: string,
    favoriteGroupID: string
  ): Promise<FavoriteGroup> {
    const res = await this.getByFields<FavoriteGroup>({
      user_id: userID,
      favorite_group_id: favoriteGroupID,
    });

    if (res) {
      return res;
    } else {
      throw new ServiceError("Group is not favorited");
    }
  }

  /**
   * Gets all groups favorited by a user.
   *
   * @param userID The user's ID.
   * @returns All groups favorited by the user.
   */
  public async getFavoriteGroups(userID: string): Promise<Group[]> {
    const sql = `
      SELECT app_group.*
        FROM app_group
        JOIN favorite_group
          ON app_group.id = favorite_group.favorite_group_id
      WHERE favorite_group.user_id = ?
      ORDER BY favorite_group.favorite_time ASC;`;
    const params = [userID];
    const res = await this.dbm.execute<Group>(sql, params);

    return res;
  }

  /**
   * Removes all of a user's favorite groups.
   *
   * @param userID The user's ID.
   */
  public async unfavoriteAll(userID: string): Promise<void> {
    await this.deleteByFields({ user_id: userID });
  }
}
