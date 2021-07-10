import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService, GroupInfo, PermissionType } from './group.service';
import { LoginRegisterService } from '../login-register/login-register.service';
import { ProfileService } from '../profile/profile.service';

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
  public groupInfoError: string = '';
  public isGroupOwner: boolean = false;
  public loggedIn: boolean = false;

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

        if (this.loggedIn) {
          const user = await this.profileService.getUserInfo();

          this.isGroupOwner = user.id === this.groupInfo.owner_user_id;
        }
      } catch (err) {
        this.groupInfoError = err;
      }
    });
  }
}
