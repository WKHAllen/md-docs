import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  GroupService,
  GroupInfo,
  PermissionType,
  permissionNames,
} from './group.service';
import { LoginRegisterService } from '../login-register/login-register.service';
import { ProfileService } from '../profile/profile.service';
import { OtherUserInfo } from '../user/user.service';
import { DocumentEditInfo } from '../document/document.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { inputAppearance, acceptImageTypes } from '../constants';

interface GiveAccessViaSearchForm {
  username: string;
}

interface PassOwnershipForm {
  newOwner: string;
}

interface FavoriteUsersInfo extends OtherUserInfo {
  hasAccess: boolean;
}

interface FavoriteUserInfo extends OtherUserInfo {
  favorite: boolean;
}

@Component({
  selector: 'mdd-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
})
export class GroupComponent implements OnInit {
  public groupID: string = '';
  public groupInfo: GroupInfo = {
    id: '',
    creator_user_id: '',
    owner_user_id: '',
    name: '',
    description: '',
    details_visible: false,
    searchable: false,
    edit_documents_permission_id: PermissionType.OwnerOnly,
    approve_edits_permission_id: PermissionType.OwnerOnly,
    create_time: 0,
  };
  public groupName: string = '';
  public groupDescription: string = '';
  public groupInfoError: string = '';
  public groupExists: boolean = true;
  public isGroupOwner: boolean = false;
  public canViewDetails: boolean = false;
  public canEditDocuments: boolean = false;
  public canApproveDocumentEdits: boolean = false;
  public groupCreator: OtherUserInfo | null = null;
  public groupOwner: OtherUserInfo = {
    id: '',
    username: '',
    image_id: '',
    join_time: 0,
  };
  public usersWithAccess: FavoriteUserInfo[] = [];
  public gotDetails: boolean = false;
  public editRequests: DocumentEditInfo[] = [];
  public gotEditRequests: boolean = false;
  public favoriteUsers: FavoriteUsersInfo[] = [];
  public submittingGeneralConfigForm: boolean = false;
  public submittingVisibilityForm: boolean = false;
  public submittingSearchabilityForm: boolean = false;
  public submittingPermissionsForm: boolean = false;
  public submittingGiveAccessViaSearch: boolean = false;
  public submittingPassOwnershipForm: boolean = false;
  public generalConfigErrors: string[] = [];
  public setVisibilityError: string = '';
  public setSearchabilityError: string = '';
  public setPermissionsError: string = '';
  public giveAccessViaSearchError: string = '';
  public passOwnershipError: string = '';
  public groupIsFavorite: boolean = false;
  public groupOwnerIsFavorite: boolean = false;
  public groupCreatorIsFavorite: boolean = false;
  public permissionNames = permissionNames;
  public loggedIn: boolean = false;
  readonly inputAppearance = inputAppearance;
  readonly acceptImageTypes = acceptImageTypes;
  @ViewChild(ConfirmComponent) deleteConfirmDialog!: ConfirmComponent;

  constructor(
    private groupService: GroupService,
    private loginRegisterService: LoginRegisterService,
    private profileService: ProfileService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  public async ngOnInit() {
    this.loggedIn = this.loginRegisterService.loggedIn();

    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.groupID = paramMap.get('groupID') || '';

      try {
        this.groupInfo = await this.groupService.getGroupInfo(this.groupID);
        this.groupName = this.groupInfo.name;
        this.groupDescription = this.groupInfo.description;
        this.groupIsFavorite = await this.profileService.groupIsFavorite(
          this.groupID
        );

        this.canViewDetails = await this.groupService.canViewGroupDetails(
          this.groupID
        );
        this.canEditDocuments = await this.groupService.canEditGroupDocuments(
          this.groupID
        );
        this.canApproveDocumentEdits =
          await this.groupService.canApproveGroupDocumentEdits(this.groupID);

        if (this.loggedIn) {
          const user = await this.profileService.getUserInfo();

          this.isGroupOwner = user.id === this.groupInfo.owner_user_id;

          if (this.canViewDetails) {
            this.groupCreator = await this.groupService.getGroupCreator(
              this.groupID
            );
            this.groupOwner = await this.groupService.getGroupOwner(
              this.groupID
            );

            this.groupOwnerIsFavorite =
              await this.profileService.userIsFavorite(this.groupOwner.id);

            if (this.groupCreator) {
              this.groupCreatorIsFavorite =
                await this.profileService.userIsFavorite(this.groupCreator.id);
            }

            this.updateUsersWithAccess();

            this.gotDetails = true;

            this.editRequests =
              await this.groupService.getGroupDocumentEditRequests(
                this.groupID
              );
            this.gotEditRequests = true;
          }
        }
      } catch (err) {
        if (err === 'Group does not exist') {
          this.groupExists = false;
        } else {
          this.groupInfoError = err;
        }
      }
    });
  }

  public async onSetGeneralConfig(): Promise<void> {
    this.generalConfigErrors = [];

    if (this.groupName.length < 1 || this.groupName.length > 255) {
      this.generalConfigErrors.push(
        'Group name must be between 1 and 255 characters'
      );
    }
    if (this.groupDescription.length > 1023) {
      this.generalConfigErrors.push(
        'Group description must be no more than 1023 characters'
      );
    }

    if (this.generalConfigErrors.length === 0) {
      this.submittingGeneralConfigForm = true;

      try {
        await this.groupService.setGroupName(this.groupID, this.groupName);
        await this.groupService.setGroupDescription(
          this.groupID,
          this.groupDescription
        );

        this.groupInfo = await this.groupService.getGroupInfo(this.groupID);
      } catch (err) {
        this.generalConfigErrors.push(err);
      }

      this.submittingGeneralConfigForm = false;
    }
  }

  public async onSetVisibility(): Promise<void> {
    this.setVisibilityError = '';
    this.submittingVisibilityForm = true;

    try {
      await this.groupService.setDetailsVisible(
        this.groupID,
        this.groupInfo.details_visible
      );
    } catch (err) {
      this.setVisibilityError = err;
    }

    this.submittingVisibilityForm = false;
  }

  public async onSetSearchability(): Promise<void> {
    this.setSearchabilityError = '';
    this.submittingSearchabilityForm = true;

    try {
      await this.groupService.setSearchable(
        this.groupID,
        this.groupInfo.searchable
      );
    } catch (err) {
      this.setSearchabilityError = err;
    }

    this.submittingSearchabilityForm = false;
  }

  public async onSetPermissions(): Promise<void> {
    this.setPermissionsError = '';
    this.submittingPermissionsForm = true;

    try {
      await this.groupService.setEditPermissions(
        this.groupID,
        this.groupInfo.edit_documents_permission_id
      );
      await this.groupService.setApproveEditsPermissions(
        this.groupID,
        this.groupInfo.approve_edits_permission_id
      );
    } catch (err) {
      this.setPermissionsError = err;
    }

    this.submittingPermissionsForm = false;
  }

  public async onGiveAccessViaSearch(
    form: GiveAccessViaSearchForm
  ): Promise<void> {
    this.giveAccessViaSearchError = '';
    this.submittingGiveAccessViaSearch = true;

    try {
      await this.groupService.grantGroupAccessByUsername(
        this.groupID,
        form.username
      );
      this.submittingGiveAccessViaSearch = false;

      this.updateUsersWithAccess();

      this.snackBar.open('Access granted', undefined, {
        duration: 3000,
        panelClass: 'alert-panel-center',
      });
    } catch (err) {
      this.submittingGiveAccessViaSearch = false;
      this.giveAccessViaSearchError = err;
    }
  }

  public async onRevokeAccess(userID: string): Promise<void> {
    await this.groupService.revokeGroupAccess(this.groupID, userID);
    await this.updateUsersWithAccess();
  }

  public async onGrantAccess(userID: string): Promise<void> {
    await this.groupService.grantGroupAccess(this.groupID, userID);
    await this.updateUsersWithAccess();
  }

  private async updateUsersWithAccess(): Promise<void> {
    const usersWithAccess = await this.groupService.getUsersWithAccess(
      this.groupID
    );
    this.usersWithAccess = usersWithAccess.map((user) => ({
      ...user,
      favorite: this.favoriteUsers.some(
        (favoriteUser) => user.id === favoriteUser.id
      ),
    }));

    const favoriteUsers = await this.profileService.getFavoriteUsers();
    this.favoriteUsers = favoriteUsers.map((favoriteUser) => ({
      ...favoriteUser,
      hasAccess: this.usersWithAccess.some(
        (user) => user.id === favoriteUser.id
      ),
    }));

    this.usersWithAccess = usersWithAccess.map((user) => ({
      ...user,
      favorite: this.favoriteUsers.some(
        (favoriteUser) => user.id === favoriteUser.id
      ),
    }));
  }

  public async onPassOwnership(form: PassOwnershipForm): Promise<void> {
    this.passOwnershipError = '';

    if (!form.newOwner) {
      this.passOwnershipError =
        'Please select a user to give group ownership to';
    }

    if (!this.passOwnershipError) {
      this.submittingPassOwnershipForm = true;

      try {
        await this.groupService.passGroupOwnership(this.groupID, form.newOwner);
        await this.router.navigateByUrl('/', { skipLocationChange: true });
        await this.router.navigate(['group', this.groupID]);
      } catch (err) {
        this.submittingPassOwnershipForm = false;
        this.passOwnershipError = err;
      }
    }
  }

  public deleteGroupConfirmation(): void {
    this.deleteConfirmDialog.openDialog();
  }

  public async onDeleteGroup(confirmed: boolean): Promise<void> {
    if (confirmed) {
      await this.groupService.deleteGroup(this.groupID);
      await this.router.navigate(['/']);
    }
  }

  public async setGroupImage(imageData: string): Promise<void> {
    const b64Image = btoa(imageData);

    try {
      await this.groupService.setGroupImage(this.groupID, b64Image);
      this.groupInfo = await this.groupService.getGroupInfo(this.groupID);

      (document.getElementById('group-image') as HTMLImageElement).src +=
        '?' + new Date().getTime();
    } catch (err) {
      this.snackBar.open(`Error: ${err}`, undefined, {
        duration: 5000,
        panelClass: 'alert-panel-center',
      });
    }
  }

  public async deleteGroupImage(): Promise<void> {
    try {
      await this.groupService.deleteGroupImage(this.groupID);
      this.groupInfo = await this.groupService.getGroupInfo(this.groupID);

      (document.getElementById('group-image') as HTMLImageElement).src +=
        '?' + new Date().getTime();
    } catch (err) {
      this.snackBar.open(`Error: ${err}`, undefined, {
        duration: 5000,
        panelClass: 'alert-panel-center',
      });
    }
  }

  public async toggleFavoriteGroup(): Promise<void> {
    try {
      if (this.groupIsFavorite) {
        await this.profileService.unfavoriteGroup(this.groupID);
      } else {
        await this.profileService.favoriteGroup(this.groupID);
      }

      this.groupIsFavorite = !this.groupIsFavorite;
    } catch (err) {
      this.snackBar.open(`Error: ${err}`, undefined, {
        duration: 5000,
        panelClass: 'alert-panel-center',
      });
    }
  }

  public async toggleFavoriteOwner(): Promise<void> {
    try {
      if (this.groupOwnerIsFavorite) {
        await this.profileService.unfavoriteUser(this.groupOwner.id);
      } else {
        await this.profileService.favoriteUser(this.groupOwner.id);
      }

      this.groupOwnerIsFavorite = !this.groupOwnerIsFavorite;

      await this.updateUsersWithAccess();
    } catch (err) {
      this.snackBar.open(`Error: ${err}`, undefined, {
        duration: 5000,
        panelClass: 'alert-panel-center',
      });
    }
  }

  public async toggleFavoriteCreator(): Promise<void> {
    try {
      if (this.groupCreator) {
        if (this.groupCreatorIsFavorite) {
          await this.profileService.unfavoriteUser(this.groupCreator.id);
        } else {
          await this.profileService.favoriteUser(this.groupCreator.id);
        }

        this.groupCreatorIsFavorite = !this.groupCreatorIsFavorite;

        await this.updateUsersWithAccess();
      }
    } catch (err) {
      this.snackBar.open(`Error: ${err}`, undefined, {
        duration: 5000,
        panelClass: 'alert-panel-center',
      });
    }
  }

  public async toggleFavoriteUser(userID: string): Promise<void> {
    const favoriteUsers = await this.profileService.getFavoriteUsers();
    this.favoriteUsers = favoriteUsers.map((favoriteUser) => ({
      ...favoriteUser,
      hasAccess: this.usersWithAccess.some(
        (user) => user.id === favoriteUser.id
      ),
    }));

    const usersWithAccessIndex = this.usersWithAccess.findIndex(
      (user) => user.id === userID
    );

    if (this.usersWithAccess[usersWithAccessIndex].favorite) {
      await this.profileService.unfavoriteUser(userID);
    } else {
      await this.profileService.favoriteUser(userID);
    }

    this.usersWithAccess[usersWithAccessIndex].favorite =
      !this.usersWithAccess[usersWithAccessIndex].favorite;

    if (userID === this.groupOwner.id) {
      this.groupOwnerIsFavorite = !this.groupOwnerIsFavorite;
    }

    if (userID === this.groupCreator?.id) {
      this.groupCreatorIsFavorite = !this.groupCreatorIsFavorite;
    }
  }
}
