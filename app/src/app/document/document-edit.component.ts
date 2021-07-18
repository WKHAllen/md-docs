import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { DocumentService, DocumentInfo } from './document.service';
import { GroupService } from '../group/group.service';
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
  public canViewDetails: boolean = false;
  public canEditDocuments: boolean = false;
  public canApproveDocumentEdits: boolean = false;
  public newContent: string = '';
  public inputAppearance: MatFormFieldAppearance = inputAppearance;
  @ViewChild('helpDialog') helpDialog!: DocumentEditHelpComponent;

  constructor(
    private documentService: DocumentService,
    private groupService: GroupService,
    private activatedRoute: ActivatedRoute
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
        } else {
          this.documentInfoError = err;
        }
      }
    });
  }

  public openReturnToDocumentDialog(): void {}

  public async requestDocumentEdit(): Promise<void> {}

  public openHelpDialog(): void {
    this.helpDialog.openDialog();
  }
}