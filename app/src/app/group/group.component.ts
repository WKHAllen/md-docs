import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { inputAppearance } from '../constants';
import { ConfirmComponent } from '../confirm/confirm.component';

interface GiveAccessViaSearchForm {
  username: string;
}

interface PassOwnershipForm {
  newOwner: string;
}

interface FavoriteUsersInfo extends OtherUserInfo {
  hasAccess: boolean;
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
  public usersWithAccess: OtherUserInfo[] = [];
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
  public showGiveAccessViaSearchSuccess: boolean = false;
  public inputAppearance = inputAppearance;
  public permissionNames = permissionNames;
  public loggedIn: boolean = false;
  @ViewChild(ConfirmComponent) deleteConfirmDialog!: ConfirmComponent;

  constructor(
    private groupService: GroupService,
    private loginRegisterService: LoginRegisterService,
    private profileService: ProfileService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  public async ngOnInit() {
    this.loggedIn = this.loginRegisterService.loggedIn();

    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.groupID = paramMap.get('groupID') || '';

      try {
        this.groupInfo = await this.groupService.getGroupInfo(this.groupID);
        this.groupName = this.groupInfo.name;
        this.groupDescription = this.groupInfo.description;

        if (this.loggedIn) {
          const user = await this.profileService.getUserInfo();

          this.isGroupOwner = user.id === this.groupInfo.owner_user_id;

          this.canViewDetails = await this.groupService.canViewGroupDetails(
            this.groupID
          );
          this.canEditDocuments = await this.groupService.canEditGroupDocuments(
            this.groupID
          );
          this.canApproveDocumentEdits =
            await this.groupService.canApproveGroupDocumentEdits(this.groupID);

          if (this.canViewDetails) {
            this.groupCreator = await this.groupService.getGroupCreator(
              this.groupID
            );
            this.groupOwner = await this.groupService.getGroupOwner(
              this.groupID
            );
            this.usersWithAccess = await this.groupService.getUsersWithAccess(
              this.groupID
            );
            this.gotDetails = true;

            this.editRequests =
              await this.groupService.getGroupDocumentEditRequests(
                this.groupID
              );
            this.gotEditRequests = true;
          }

          if (this.isGroupOwner) {
            this.favoriteUsers = (
              await this.profileService.getFavoriteUsers()
            ).map((favoriteUser) => ({
              ...favoriteUser,
              hasAccess: this.usersWithAccess.some(
                (user) => user.id === favoriteUser.id
              ),
            }));
          }
        }
      } catch (err) {
        this.groupInfoError = err;
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
      this.usersWithAccess = await this.groupService.getUsersWithAccess(
        this.groupID
      );
      this.showGiveAccessViaSearchSuccess = true;

      setTimeout(() => {
        this.showGiveAccessViaSearchSuccess = false;
      }, 3000);
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
    this.usersWithAccess = await this.groupService.getUsersWithAccess(
      this.groupID
    );
    this.favoriteUsers = (await this.profileService.getFavoriteUsers()).map(
      (favoriteUser) => ({
        ...favoriteUser,
        hasAccess: this.usersWithAccess.some(
          (user) => user.id === favoriteUser.id
        ),
      })
    );
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
}