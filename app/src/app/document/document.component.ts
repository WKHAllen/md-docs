import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { DocumentService, DocumentInfo } from './document.service';
import { GroupService } from '../group/group.service';
import { ProfileService } from '../profile/profile.service';
import { LoginRegisterService } from '../login-register/login-register.service';
import { ConfirmComponent } from '../confirm/confirm.component';
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
  public canViewDetails: boolean = false;
  public canEditDocuments: boolean = false;
  public canApproveDocumentEdits: boolean = false;
  public visibleDocumentInfo: EntityInfo[] = [];
  public loggedIn: boolean = false;
  @ViewChild('documentInfoDialog') documentInfoDialog!: EntityInfoComponent;
  @ViewChild('deleteDocumentDialog') deleteDocumentDialog!: ConfirmComponent;

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

        this.canViewDetails = await this.groupService.canViewGroupDetails(
          this.documentInfo.group_id
        );
        this.canEditDocuments = await this.groupService.canEditGroupDocuments(
          this.documentInfo.group_id
        );
        this.canApproveDocumentEdits =
          await this.groupService.canApproveGroupDocumentEdits(
            this.documentInfo.group_id
          );

        if (this.loggedIn) {
          const user = await this.profileService.getUserInfo();
          const group = await this.documentService.getDocumentGroup(
            this.documentID
          );

          this.isGroupOwner = user.id === group.owner_user_id;
        }

        this.gotDetails = true;
      } catch (err) {
        if (err === 'You do not have permission to view this document') {
          this.canViewDetails = false;
          this.gotDetails = true;
        } else {
          this.documentInfoError = err;
        }
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

  public async openDeleteDocumentDialog(): Promise<void> {
    this.deleteDocumentDialog.openDialog();
  }

  public async deleteDocument(confirmed: boolean): Promise<void> {
    if (confirmed) {
      try {
        await this.documentService.deleteDocument(this.documentID);

        this.snackBar.open('Document deleted', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });

        if (this.documentInfo.directory_id) {
          await this.router.navigate([
            'directory',
            this.documentInfo.directory_id,
          ]);
        } else {
          await this.router.navigate(['group', this.documentInfo.group_id]);
        }
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }

  public copyDocumentLink(): void {
    copyMessage(window.location.href);

    this.snackBar.open('Link copied to clipboard', undefined, {
      duration: 3000,
      panelClass: 'alert-panel-center',
    });
  }
}
