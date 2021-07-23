/**
 * Services for the image table.
 * @packageDocumentation
 */

import { BaseService, ServiceError } from "./util";

/**
 * The maximum size of an image.
 */
export const MAX_IMAGE_SIZE = 349525; // 2^18 * log(256, 64)

/**
 * Image architecture.
 */
export interface Image {
  id: string;
  data: string;
  create_time: number;
}

/**
 * Image services.
 */
export class ImageService extends BaseService {
  /**
   * Creates an image in the database.
   *
   * @param data The image data.
   * @returns The new image record.
   */
  public async createImage(data: string): Promise<Image> {
    if (data.length < MAX_IMAGE_SIZE) {
      return await this.create<Image>({ data });
    } else {
      throw new ServiceError(
        `Image must be no more than ${MAX_IMAGE_SIZE / 1024} KB`
      );
    }
  }

  /**
   * Returns whether or not an image exists.
   *
   * @param imageID The image's ID.
   * @returns Whether or not the image exists.
   */
  public async imageExists(imageID: string): Promise<boolean> {
    const res = await this.getByID<Image>(imageID);
    return !!res;
  }

  /**
   * Returns the image.
   *
   * @param imageID The image's ID.
   * @returns The image.
   */
  public async getImage(imageID: string): Promise<Image> {
    const res = await this.getByID<Image>(imageID);

    if (res) {
      return res;
    } else {
      throw new ServiceError("Image does not exist");
    }
  }

  /**
   * Sets an image's data.
   *
   * @param imageID The image's ID.
   * @param newData The new image data.
   * @returns The updated image.
   */
  public async setImageData(imageID: string, newData: string): Promise<Image> {
    if (newData.length < MAX_IMAGE_SIZE) {
      const imageExists = await this.imageExists(imageID);

      if (imageExists) {
        return await this.updateByID<Image>(imageID, { data: newData });
      } else {
        throw new ServiceError("Image does not exist");
      }
    } else {
      throw new ServiceError(
        `Image must be no more than ${MAX_IMAGE_SIZE / 1024} KB`
      );
    }
  }

  /**
   * Deletes an image.
   *
   * @param imageID The image's ID.
   */
  public async deleteImage(imageID: string): Promise<void> {
    await this.deleteByID(imageID);
  }
}
