import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentService, DocumentInfo } from './document.service';
import { GroupService } from '../group/group.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { NewItemComponent } from '../new-item/new-item.component';
import { DocumentEditHelpComponent } from './document-edit-help.component';
import { inputAppearance } from '../constants';

@Component({
  selector: 'mdd-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss'],
})
export class DocumentEditComponent implements OnInit {
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
  public documentEditExists: boolean = true;
  public canViewDetails: boolean = false;
  public canEditDocuments: boolean = false;
  public canApproveDocumentEdits: boolean = false;
  public newContent: string = '';
  readonly inputAppearance = inputAppearance;
  @ViewChild('returnToDocumentDialog')
  returnToDocumentDialog!: ConfirmComponent;
  @ViewChild('requestDocumentEditDialog')
  requestDocumentEditDialog!: NewItemComponent;
  @ViewChild('helpDialog') helpDialog!: DocumentEditHelpComponent;

  constructor(
    private documentService: DocumentService,
    private groupService: GroupService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
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

        this.newContent = this.documentInfo.content;

        this.gotDetails = true;
      } catch (err) {
        if (err === 'You do not have permission to view this document') {
          this.canViewDetails = false;
          this.gotDetails = true;
        } else if (err === 'Document does not exist') {
          this.documentEditExists = false;
        } else {
          this.documentInfoError = err;
        }
      }
    });
  }

  public async openReturnToDocumentDialog(): Promise<void> {
    if (this.documentInfo.content === this.newContent) {
      await this.returnToDocument(true);
    } else {
      this.returnToDocumentDialog.openDialog();
    }
  }

  public async returnToDocument(confirmed: boolean): Promise<void> {
    if (confirmed) {
      await this.router.navigate(['document', 'view', this.documentID]);
    }
  }

  public openRequestDocumentEditDialog(): void {
    this.requestDocumentEditDialog.openDialog();
  }

  public async requestDocumentEdit(description: string): Promise<void> {
    if (description) {
      try {
        const documentEdit = await this.documentService.requestDocumentEdit(
          this.documentID,
          this.newContent,
          description
        );

        await this.router.navigate(['document-edit', documentEdit.id]);
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }

  public openHelpDialog(): void {
    this.helpDialog.openDialog();
  }
}
