import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { DocumentService, DocumentInfo } from './document.service';
import { GroupService } from '../group/group.service';
import { ProfileService } from '../profile/profile.service';
import { LoginRegisterService } from '../login-register/login-register.service';
import {
  EntityInfoComponent,
  EntityInfo,
} from '../entity-info/entity-info.component';
import { FileSizePipe } from '../pipes/file-size.pipe';
import { copyMessage } from '../util';

@Component({
  selector: 'mdd-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnInit {
  public documentID: string = '';
  public documentInfo: DocumentInfo = {
    id: '',
    creator_user_id: '',
    group_id: '',
    name: '',
    content: '',
    create_time: 0,
  };
  public gotDetails: boolean = false;
  public documentInfoError: string = '';
  public isGroupOwner: boolean = false;
  public canEditDocuments: boolean = false;
  public visibleDocumentInfo: EntityInfo[] = [];
  public loggedIn: boolean = false;
  @ViewChild('documentInfoDialog') documentInfoDialog!: EntityInfoComponent;

  constructor(
    private documentService: DocumentService,
    private groupService: GroupService,
    private loginRegisterService: LoginRegisterService,
    private profileService: ProfileService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private fileSizePipe: FileSizePipe
  ) {}

  public ngOnInit(): void {
    this.loggedIn = this.loginRegisterService.loggedIn();

    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.documentID = paramMap.get('documentID') || '';

      try {
        this.documentInfo = await this.documentService.getDocumentInfo(
          this.documentID
        );

        if (this.loggedIn) {
          const user = await this.profileService.getUserInfo();
          const group = await this.documentService.getDocumentGroup(
            this.documentID
          );

          this.isGroupOwner = user.id === group.owner_user_id;

          this.canEditDocuments = await this.groupService.canEditGroupDocuments(
            this.documentInfo.group_id
          );
        }

        this.gotDetails = true;
      } catch (err) {
        this.documentInfoError = err;
      }
    });
  }

  public async viewDocumentInfo(): Promise<void> {
    const documentPath = await this.documentService.getDocumentPath(
      this.documentID
    );
    const documentPathStr = documentPath
      .map((document) => document.name)
      .join('/');

    this.visibleDocumentInfo = [
      { key: 'Name', value: this.documentInfo.name },
      {
        key: 'Size',
        value: this.fileSizePipe.transform(this.documentInfo.content.length),
      },
      {
        key: 'Path',
        value: `${documentPathStr ? '/' : ''}${documentPathStr}/${
          this.documentInfo.name
        }`,
      },
      {
        key: 'Created',
        value: this.datePipe.transform(this.documentInfo.create_time),
      },
      {
        key: 'Edited',
        value: this.documentInfo.last_edit_time
          ? this.datePipe.transform(this.documentInfo.last_edit_time)
          : 'never',
      },
    ];

    setTimeout(() => {
      this.documentInfoDialog.openDialog();
    }, 100);
  }

  public async deleteDocument(): Promise<void> {}

  public copyDocumentLink(): void {
    copyMessage(window.location.href);

    this.snackBar.open('Link copied to clipboard', undefined, {
      duration: 3000,
      panelClass: 'alert-panel-center',
    });
  }
}
