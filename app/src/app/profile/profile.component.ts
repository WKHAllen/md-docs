import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService, UserInfo } from './profile.service';
import { LoginRegisterService } from '../login-register/login-register.service';
import { GroupInfo } from '../group/group.service';
import { DocumentEditInfo } from '../document/document.service';
import { OtherUserInfo } from '../user/user.service';
import { inputAppearance, acceptImageTypes } from '../constants';

interface SetUsernameForm {
  username: string;
}

interface SetPasswordForm {
  password: string;
  confirmPassword: string;
}

interface AddFavoriteUserForm {
  username: string;
}

interface FavoriteUserInfo extends OtherUserInfo {
  favorite: boolean;
}

interface FavoriteGroupInfo extends GroupInfo {
  favorite: boolean;
}

@Component({
  selector: 'mdd-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public userInfo: UserInfo = {
    id: '',
    username: '',
    email: '',
    image_id: '',
    join_time: 0,
  };
  public userGroupsOwned: GroupInfo[] = [];
  public userDocumentEditRequests: DocumentEditInfo[] = [];
  public userFavoriteUsers: FavoriteUserInfo[] = [];
  public userFavoriteGroups: FavoriteGroupInfo[] = [];
  public newUsername: string = '';
  public gotUserInfo: boolean = false;
  public gotUserPolls: boolean = false;
  public gotUserGroupsOwned: boolean = false;
  public gotUserDocumentEditRequests: boolean = false;
  public gotUserFavoriteUsers: boolean = false;
  public gotUserFavoriteGroups: boolean = false;
  public userInfoError: string = '';
  public userGroupsOwnedError: string = '';
  public userDocumentEditRequestsError: string = '';
  public userFavoriteUsersError: string = '';
  public userFavoriteGroupsError: string = '';
  public submittingUsernameForm: boolean = false;
  public submittingPasswordForm: boolean = false;
  public submittingAddFavoriteUserForm: boolean = false;
  public logoutEverywhereClicked: boolean = false;
  public setUsernameError: string = '';
  public setPasswordError: string = '';
  public logoutEverywhereError: string = '';
  public addFavoriteUserError: string = '';
  public showUsernameSuccess: boolean = false;
  public showPasswordSuccess: boolean = false;
  public showAddFavoriteUserSuccess: boolean = false;
  public togglingFavoriteGroup: boolean = false;
  public hidePassword: boolean = true;
  public hideConfirmPassword: boolean = true;
  readonly inputAppearance = inputAppearance;
  readonly acceptImageTypes = acceptImageTypes;

  constructor(
    private profileService: ProfileService,
    private loginRegisterService: LoginRegisterService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  public async ngOnInit(): Promise<void> {
    if (!this.loginRegisterService.loggedIn()) {
      await this.router.navigate(['login'], {
        queryParams: { after: 'profile' },
      });
    } else {
      try {
        const userInfo = await this.profileService.getUserInfo();
        this.userInfo = userInfo;
        this.newUsername = userInfo.username;
        this.gotUserInfo = true;
      } catch (err) {
        this.userInfoError = err;
      }

      try {
        const userGroupsOwned = await this.profileService.getGroupsOwned();
        this.userGroupsOwned = userGroupsOwned;
        this.gotUserGroupsOwned = true;
      } catch (err) {
        this.userGroupsOwnedError = err;
      }

      try {
        const userDocumentEditRequests =
          await this.profileService.getDocumentEditRequests();
        this.userDocumentEditRequests = userDocumentEditRequests;
        this.gotUserDocumentEditRequests = true;
      } catch (err) {
        this.userDocumentEditRequestsError = err;
      }

      try {
        const userFavoriteUsers = await this.profileService.getFavoriteUsers();
        this.userFavoriteUsers = userFavoriteUsers.map((favoriteUser) => ({
          ...favoriteUser,
          favorite: true,
        }));
        this.gotUserFavoriteUsers = true;
      } catch (err) {
        this.userFavoriteUsersError = err;
      }

      try {
        const userFavoriteGroups =
          await this.profileService.getFavoriteGroups();
        this.userFavoriteGroups = userFavoriteGroups.map((favoriteGroup) => ({
          ...favoriteGroup,
          favorite: true,
        }));
        this.gotUserFavoriteGroups = true;
      } catch (err) {
        this.userFavoriteGroupsError = err;
      }
    }
  }

  public async onSetUsername(form: SetUsernameForm): Promise<void> {
    this.setUsernameError = '';

    if (form.username === this.userInfo.username) {
      return;
    }
    if (form.username.length < 3 || form.username.length > 63) {
      this.setUsernameError = 'Username must be between 3 and 63 characters';
    }

    if (!this.setUsernameError) {
      this.submittingUsernameForm = true;

      try {
        await this.profileService.setUsername(form.username);
        this.submittingUsernameForm = false;
        this.ngOnInit();
        this.showUsernameSuccess = true;

        setTimeout(() => {
          this.showUsernameSuccess = false;
        }, 3000);
      } catch (err) {
        this.submittingUsernameForm = false;
        this.setUsernameError = err;
      }
    }
  }

  public async onSetPassword(form: SetPasswordForm): Promise<void> {
    this.setPasswordError = '';

    if (form.password.length < 8 || form.password.length > 255) {
      this.setPasswordError = 'Password must be at least 8 characters';
    }
    if (form.password !== form.confirmPassword) {
      this.setPasswordError = 'Passwords do not match';
    }

    if (!this.setPasswordError) {
      this.submittingPasswordForm = true;

      try {
        await this.profileService.setPassword(form.password);

        this.submittingPasswordForm = false;
        this.showPasswordSuccess = true;

        setTimeout(() => {
          this.showPasswordSuccess = false;
        }, 3000);
      } catch (err) {
        this.submittingPasswordForm = false;
        this.setPasswordError = err;
      }
    }
  }

  public async logoutEverywhere(): Promise<void> {
    this.logoutEverywhereError = '';
    this.logoutEverywhereClicked = true;

    try {
      await this.loginRegisterService.logoutEverywhere();
      await this.router.navigate(['/']);
    } catch (err) {
      this.logoutEverywhereClicked = false;
      this.logoutEverywhereError = err;
    }
  }

  public async toggleFavoriteUser(userID: string): Promise<void> {
    const favoriteUserIndex = this.userFavoriteUsers.findIndex(
      (favoriteUser) => favoriteUser.id === userID
    );

    if (this.userFavoriteUsers[favoriteUserIndex].favorite) {
      await this.profileService.unfavoriteUser(userID);
      this.userFavoriteUsers[favoriteUserIndex].favorite = false;
    } else {
      await this.profileService.favoriteUser(userID);
      this.userFavoriteUsers[favoriteUserIndex].favorite = true;
    }
  }

  public async onAddFavoriteUser(form: AddFavoriteUserForm): Promise<void> {
    this.addFavoriteUserError = '';
    this.submittingAddFavoriteUserForm = true;

    try {
      await this.profileService.favoriteUserByUsername(form.username);
      this.submittingAddFavoriteUserForm = false;
      await this.ngOnInit();
      this.showAddFavoriteUserSuccess = true;

      setTimeout(() => {
        this.showAddFavoriteUserSuccess = false;
      }, 3000);
    } catch (err) {
      this.submittingAddFavoriteUserForm = false;
      this.addFavoriteUserError = err;
    }
  }

  public async toggleFavoriteGroup(groupID: string): Promise<void> {
    this.togglingFavoriteGroup = true;

    const favoriteGroupIndex = this.userFavoriteGroups.findIndex(
      (favoriteGroup) => favoriteGroup.id === groupID
    );

    if (this.userFavoriteGroups[favoriteGroupIndex].favorite) {
      await this.profileService.unfavoriteGroup(groupID);
      this.userFavoriteGroups[favoriteGroupIndex].favorite = false;
    } else {
      await this.profileService.favoriteGroup(groupID);
      this.userFavoriteGroups[favoriteGroupIndex].favorite = true;
    }

    this.togglingFavoriteGroup = false;
  }

  public async setUserImage(imageData: string): Promise<void> {
    if (imageData.length < 262144) {
      const b64Image = btoa(imageData);

      try {
        await this.profileService.setUserImage(b64Image);

        (document.getElementById('user-image') as HTMLImageElement).src +=
          '?' + new Date().getTime();
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    } else {
      this.snackBar.open('Error: image must be less than 256 KB', undefined, {
        duration: 5000,
        panelClass: 'alert-panel-center',
      });
    }
  }
}
