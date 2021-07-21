import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';

export type ImageEntityType = 'user' | 'group' | 'unknown';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private groupService: GroupService
  ) {}

  public async getImageID(entityID: string, entityType: ImageEntityType) {
    switch (entityType) {
      case 'user':
        return this.getUserImageID(entityID);
      case 'group':
        return this.getGroupImageID(entityID);
      case 'unknown':
        return '';
    }
  }

  public async getUserImageID(userID: string): Promise<string | undefined> {
    const user = await this.userService.getSpecificUserInfo(userID);
    return user.image_id;
  }

  public async getGroupImageID(groupID: string): Promise<string | undefined> {
    const group = await this.groupService.getGroupInfo(groupID);
    return group.image_id;
  }
}
