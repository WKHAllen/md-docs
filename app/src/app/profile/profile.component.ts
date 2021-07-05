import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService, UserInfo } from './profile.service';
import { LoginRegisterService } from '../login-register/login-register.service';
import { GroupInfo } from '../group/group.service';
import { DocumentEditInfo } from '../document/document.service';
import { inputAppearance } from '../constants';

interface SetUsernameForm {
  username: string;
}

interface SetPasswordForm {
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'mdd-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public userInfo: UserInfo = {
    id: 0,
    username: '',
    email: '',
    image_id: '',
    join_time: 0,
  };
  public userGroupsOwned: GroupInfo[] = [];
  public userDocumentEditRequests: DocumentEditInfo[] = [];
  public userFavoriteUsers: UserInfo[] = [];
  public userFavoriteGroups: GroupInfo[] = [];
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
  public logoutEverywhereClicked: boolean = false;
  public setUsernameError: string = '';
  public setPasswordError: string = '';
  public logoutEverywhereError: string = '';
  public showUsernameSuccess: boolean = false;
  public showPasswordSuccess: boolean = false;
  public inputAppearance = inputAppearance;

  constructor(
    private profileService: ProfileService,
    private loginRegisterService: LoginRegisterService,
    private router: Router
  ) {}

  public async ngOnInit() {
    if (!this.loginRegisterService.loggedIn()) {
      this.router.navigate(['login'], { queryParams: { after: 'profile' } });
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
        this.userFavoriteUsers = userFavoriteUsers;
        this.gotUserFavoriteUsers = true;
      } catch (err) {
        this.userFavoriteUsersError = err;
      }

      try {
        const userFavoriteGroups =
          await this.profileService.getFavoriteGroups();
        this.userFavoriteGroups = userFavoriteGroups;
        this.gotUserFavoriteGroups = true;
      } catch (err) {
        this.userFavoriteGroupsError = err;
      }
    }
  }

  public async onSetUsername(form: SetUsernameForm) {
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

  public async onSetPassword(form: SetPasswordForm) {
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

  public async logoutEverywhere() {
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
}
