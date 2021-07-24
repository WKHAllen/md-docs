/**
 * Services for the image table.
 * @packageDocumentation
 */

import {
  BaseService,
  ServiceError,
  shrinkImageBase64,
  MAX_IMAGE_SIZE,
} from "./util";

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
    const imageData = await shrinkImageBase64(data);

    if (imageData.length < MAX_IMAGE_SIZE) {
      return await this.create<Image>({ data: imageData });
    } else {
      throw new ServiceError("Image is too large");
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
    const imageData = await shrinkImageBase64(newData);

    if (imageData.length < MAX_IMAGE_SIZE) {
      const imageExists = await this.imageExists(imageID);

      if (imageExists) {
        return await this.updateByID<Image>(imageID, { data: imageData });
      } else {
        throw new ServiceError("Image does not exist");
      }
    } else {
      throw new ServiceError("Image is too large");
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
