/**
 * Services for the favorite user table.
 * @packageDocumentation
 */

import { BaseService } from "./util";
import { User } from "./user";

/**
 * User architecture.
 */
export interface FavoriteUser {
  user_id: string;
  favorite_user_id: string;
  favorite_time: number;
}

/**
 * Favorite user services.
 */
export class FavoriteUserService extends BaseService {
  /**
   * Adds a user as a favorite.
   *
   * @param userID The user's ID.
   * @param favoriteUserID The ID of the user being favorited.
   * @returns The resulting record.
   */
  public async favoriteUser(
    userID: string,
    favoriteUserID: string
  ): Promise<FavoriteUser> {
    const favorite = await this.isFavorite(userID, favoriteUserID);

    if (!favorite) {
      return await this.create<FavoriteUser>({
        user_id: userID,
        favorite_user_id: favoriteUserID,
      });
    } else {
      return await this.getFavorite(userID, favoriteUserID);
    }
  }

  /**
   * Removes a user as a favorite.
   *
   * @param userID The user's ID.
   * @param favoriteUserID The ID of the user being unfavorited.
   */
  public async unfavoriteUser(
    userID: string,
    favoriteUserID: string
  ): Promise<void> {
    await this.deleteByFields({
      user_id: userID,
      favorite_user_id: favoriteUserID,
    });
  }

  /**
   * Returns whether or not a user is favorited by another user.
   *
   * @param userID The user's ID.
   * @param favoriteUserID The ID of the user in question.
   * @returns Whether or not the user is a favorite.
   */
  public async isFavorite(
    userID: string,
    favoriteUserID: string
  ): Promise<boolean> {
    const res = await this.getByFields<FavoriteUser>({
      user_id: userID,
      favorite_user_id: favoriteUserID,
    });
    return !!res;
  }

  /**
   * Gets the favorite record.
   *
   * @param userID The user's ID.
   * @param favoriteUserID The ID of the favorited user.
   * @returns The favorite record.
   */
  public async getFavorite(
    userID: string,
    favoriteUserID: string
  ): Promise<FavoriteUser> {
    return await this.getByFields<FavoriteUser>({
      user_id: userID,
      favorite_user_id: favoriteUserID,
    });
  }

  /**
   * Gets all users favorited by a user.
   *
   * @param userID The user's ID.
   * @returns All users favorited by the user.
   */
  public async getFavoriteUsers(userID: string): Promise<User[]> {
    const sql = `
      SELECT app_user.*
        FROM app_user
        JOIN favorite_user
          ON app_user.id = favorite_user.favorite_user_id
      WHERE favorite_user.user_id = ?;`;
    const params = [userID];
    const res = await this.dbm.execute<User>(sql, params);

    return res;
  }

  /**
   * Removes all of a user's favorite users.
   *
   * @param userID The user's ID.
   */
  public async unfavoriteAll(userID: string): Promise<void> {
    await this.deleteByFields({ user_id: userID });
  }
}
