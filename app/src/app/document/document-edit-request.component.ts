import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  DocumentService,
  DocumentEditInfo,
  DocumentInfo,
} from './document.service';
import { GroupService } from '../group/group.service';
import { UserService, OtherUserInfo } from '../user/user.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { copyMessage } from '../util';

@Component({
  selector: 'mdd-document-edit-request',
  templateUrl: './document-edit-request.component.html',
  styleUrls: ['./document-edit-request.component.scss'],
})
export class DocumentEditRequestComponent implements OnInit {
  public documentEditID: string = '';
  public documentEditInfo: DocumentEditInfo = {
    id: '',
    document_id: '',
    editor_user_id: '',
    description: '',
    new_content: '',
    edit_request_time: 0,
  };
  public documentInfo: DocumentInfo = {
    id: '',
    creator_user_id: '',
    group_id: '',
    name: '',
    content: '',
    create_time: 0,
  };
  public documentEditor: OtherUserInfo = {
    id: '',
    username: '',
    join_time: 0,
  };
  public gotDetails: boolean = false;
  public documentEditInfoError: string = '';
  public documentEditRequestExists: boolean = true;
  public canViewDetails: boolean = false;
  public canApproveDocumentEdits: boolean = false;
  @ViewChild('approveEditsDialog') approveEditsDialog!: ConfirmComponent;
  @ViewChild('denyEditsDialog') denyEditsDialog!: ConfirmComponent;

  constructor(
    private documentService: DocumentService,
    private groupService: GroupService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      this.documentEditID = paramMap.get('documentEditID') || '';

      try {
        this.documentEditInfo = await this.documentService.getDocumentEdit(
          this.documentEditID
        );
        this.documentInfo = await this.documentService.getDocumentInfo(
          this.documentEditInfo.document_id
        );
        this.documentEditor = await this.userService.getSpecificUserInfo(
          this.documentEditInfo.editor_user_id
        );

        this.canViewDetails = await this.groupService.canViewGroupDetails(
          this.documentInfo.group_id
        );
        this.canApproveDocumentEdits =
          await this.groupService.canApproveGroupDocumentEdits(
            this.documentInfo.group_id
          );

        this.gotDetails = true;
      } catch (err) {
        if (
          err ===
          'You do not have permission to view this document edit request'
        ) {
          this.canViewDetails = false;
          this.gotDetails = true;
        } else if (err === 'Document edit request does not exist') {
          this.documentEditRequestExists = false;
        } else {
          this.documentEditInfoError = err;
        }
      }
    });
  }

  public openApproveEditsDialog(): void {
    this.approveEditsDialog.openDialog();
  }

  public async approveEdits(confirmed: boolean): Promise<void> {
    if (confirmed) {
      try {
        await this.documentService.approveEdits(this.documentEditID);

        await this.router.navigate([
          'document',
          'view',
          this.documentEditInfo.document_id,
        ]);
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }

  public openDenyEditsDialog(): void {
    this.denyEditsDialog.openDialog();
  }

  public async denyEdits(confirmed: boolean): Promise<void> {
    if (confirmed) {
      try {
        await this.documentService.denyEdits(this.documentEditID);

        await this.router.navigate([
          'document',
          'view',
          this.documentEditInfo.document_id,
        ]);
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }

  public copyEditRequestLink(): void {
    copyMessage(window.location.href);

    this.snackBar.open('Link copied to clipboard', undefined, {
      duration: 3000,
      panelClass: 'alert-panel-center',
    });
  }
}
