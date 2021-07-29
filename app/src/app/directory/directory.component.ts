import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { DirectoryService, DirectoryInfo } from './directory.service';
import { DocumentService, DocumentInfo } from '../document/document.service';
import {
  GroupService,
  GroupInfo,
  PermissionType,
} from '../group/group.service';
import { ProfileService } from '../profile/profile.service';
import { LoginRegisterService } from '../login-register/login-register.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { NewItemComponent } from '../new-item/new-item.component';
import {
  EntityInfoComponent,
  EntityInfo,
} from '../entity-info/entity-info.component';
import { FileSizePipe } from '../pipes/file-size.pipe';
import { copyMessage } from '../util';

export interface SelectedDirectoryInfo {
  Name: string;
  Path: string;
  Created: number;
}

export interface SelectedDocumentInfo {
  Name: string;
  Size: number;
  Path: string;
  Created: number;
  Edited: number;
}

@Component({
  selector: 'mdd-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss'],
})
export class DirectoryComponent implements OnInit, OnChanges {
  @Input() public root: string = 'false';
  @Input() public groupID: string = '';
  @Input() public directoryID: string = '';
  public isRoot: boolean = false;
  public directoryInfo: DirectoryInfo | null = null;
  public directories: DirectoryInfo[] = [];
  public documents: DocumentInfo[] = [];
  public gotDetails: boolean = false;
  public directoryInfoError: string = '';
  public directoryExists: boolean = true;
  public groupInfo: GroupInfo = {
    id: '',
    owner_user_id: '',
    name: '',
    description: '',
    details_visible: false,
    searchable: false,
    edit_documents_permission_id: PermissionType.OwnerOnly,
    approve_edits_permission_id: PermissionType.OwnerOnly,
    create_time: 0,
  };
  public isGroupOwner: boolean = false;
  public selectedDirectory: DirectoryInfo = {
    id: '',
    name: '',
    group_id: '',
    depth: 0,
    create_time: 0,
  };
  public selectedDocument: DocumentInfo = {
    id: '',
    creator_user_id: '',
    group_id: '',
    name: '',
    content: '',
    create_time: 0,
  };
  public selectedDirectoryInfo: EntityInfo[] = [];
  public selectedDocumentInfo: EntityInfo[] = [];
  public loggedIn: boolean = false;
  @ViewChild('newDirectory') createDirectoryDialog!: NewItemComponent;
  @ViewChild('newDocument') createDocumentDialog!: NewItemComponent;
  @ViewChild('directoryInfoDialog') directoryInfoDialog!: EntityInfoComponent;
  @ViewChild('renameDirectoryDialog') renameDirectoryDialog!: NewItemComponent;
  @ViewChild('deleteDirectoryDialog') deleteDirectoryDialog!: ConfirmComponent;
  @ViewChild('documentInfoDialog') documentInfoDialog!: EntityInfoComponent;
  @ViewChild('renameDocumentDialog') renameDocumentDialog!: NewItemComponent;
  @ViewChild('deleteDocumentDialog') deleteDocumentDialog!: ConfirmComponent;

  constructor(
    private directoryService: DirectoryService,
    private documentService: DocumentService,
    private groupService: GroupService,
    private profileService: ProfileService,
    private loginRegisterService: LoginRegisterService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private fileSizePipe: FileSizePipe
  ) {}

  public async ngOnInit(): Promise<void> {
    this.loggedIn = this.loginRegisterService.loggedIn();
    this.isRoot = !this.root || this.root === 'true';

    try {
      if (this.isRoot) {
        this.directories = await this.groupService.getRootDirectories(
          this.groupID
        );
        this.documents = await this.groupService.getRootDocuments(this.groupID);
      } else {
        const group = await this.directoryService.getDirectoryGroup(
          this.directoryID
        );

        this.groupID = group.id;
        this.directoryInfo = await this.directoryService.getDirectoryInfo(
          this.directoryID
        );
        this.directories = await this.directoryService.getSubdirectories(
          this.directoryID
        );
        this.documents =
          await this.directoryService.getDocumentsWithinDirectory(
            this.directoryID
          );
      }

      this.groupInfo = await this.groupService.getGroupInfo(this.groupID);

      if (this.loggedIn) {
        const user = await this.profileService.getUserInfo();

        this.isGroupOwner = user.id === this.groupInfo.owner_user_id;
      }

      this.gotDetails = true;
    } catch (err) {
      if (err === 'Directory does not exist') {
        this.directoryExists = false;
      } else {
        this.directoryInfoError = err;
      }
    }
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    for (let propName in changes) {
      switch (propName) {
        case 'root':
          this.root = changes.root.currentValue;
          break;
        case 'groupID':
          this.groupID = changes.groupID.currentValue;
          break;
        case 'directoryID':
          this.directoryID = changes.directoryID.currentValue;
          break;
      }
    }

    await this.ngOnInit();
  }

  public newDirectoryDialog(): void {
    this.createDirectoryDialog.openDialog();
  }

  public async createDirectory(directoryName: string): Promise<void> {
    if (directoryName) {
      try {
        await this.directoryService.createDirectory(
          directoryName,
          this.groupID,
          this.directoryID || undefined
        );

        this.snackBar.open('Directory created', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });

        if (this.isRoot) {
          this.directories = await this.groupService.getRootDirectories(
            this.groupID
          );
        } else {
          this.directories = await this.directoryService.getSubdirectories(
            this.directoryID
          );
        }
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }

  public newDocumentDialog(): void {
    this.createDocumentDialog.openDialog();
  }

  public async createDocument(documentName: string): Promise<void> {
    if (documentName) {
      try {
        await this.documentService.createDocument(
          documentName,
          this.groupID,
          this.directoryID || undefined
        );

        this.snackBar.open('Document created', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });

        if (this.isRoot) {
          this.documents = await this.groupService.getRootDocuments(
            this.groupID
          );
        } else {
          this.documents =
            await this.directoryService.getDocumentsWithinDirectory(
              this.directoryID
            );
        }
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }

  public copyDirectoryLink(): void {
    copyMessage(window.location.href);

    this.snackBar.open('Link copied to clipboard', undefined, {
      duration: 3000,
      panelClass: 'alert-panel-center',
    });
  }

  public async viewDirectoryInfo(directoryID: string): Promise<void> {
    this.selectedDirectory = await this.directoryService.getDirectoryInfo(
      directoryID
    );

    const directoryInfo = await this.directoryService.getDirectoryInfo(
      directoryID
    );
    const directoryPath = await this.directoryService.getDirectoryPath(
      directoryID
    );
    const directoryPathStr = directoryPath
      .map((directory) => directory.name)
      .join('/');

    this.selectedDirectoryInfo = [
      { key: 'Name', value: directoryInfo.name },
      {
        key: 'Path',
        value: `${directoryPathStr ? '/' : ''}${directoryPathStr}/${
          directoryInfo.name
        }`,
      },
      {
        key: 'Created',
        value: this.datePipe.transform(directoryInfo.create_time),
      },
    ];

    setTimeout(() => {
      this.directoryInfoDialog.openDialog();
    }, 100);
  }

  public async openRenameDirectoryDialog(directoryID: string): Promise<void> {
    this.selectedDirectory = await this.directoryService.getDirectoryInfo(
      directoryID
    );

    setTimeout(() => {
      this.renameDirectoryDialog.openDialog();
    }, 100);
  }

  public async renameDirectory(newName: string): Promise<void> {
    if (newName) {
      try {
        await this.directoryService.renameDirectory(
          this.selectedDirectory.id,
          newName
        );

        this.snackBar.open('Directory renamed', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });

        if (this.isRoot) {
          this.directories = await this.groupService.getRootDirectories(
            this.groupID
          );
        } else {
          this.directories = await this.directoryService.getSubdirectories(
            this.directoryID
          );
        }
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }

  public async openDeleteDirectoryDialog(directoryID: string): Promise<void> {
    this.selectedDirectory = await this.directoryService.getDirectoryInfo(
      directoryID
    );

    setTimeout(() => {
      this.deleteDirectoryDialog.openDialog();
    }, 100);
  }

  public async deleteDirectory(confirmed: boolean): Promise<void> {
    if (confirmed) {
      try {
        await this.directoryService.deleteDirectory(this.selectedDirectory.id);

        this.snackBar.open('Directory deleted', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });

        if (this.isRoot) {
          this.directories = await this.groupService.getRootDirectories(
            this.groupID
          );
        } else {
          this.directories = await this.directoryService.getSubdirectories(
            this.directoryID
          );
        }
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }

  public async viewDocumentInfo(documentID: string): Promise<void> {
    this.selectedDocument = await this.documentService.getDocumentInfo(
      documentID
    );

    const documentInfo = await this.documentService.getDocumentInfo(documentID);
    const documentPath = await this.documentService.getDocumentPath(documentID);
    const documentPathStr = documentPath
      .map((document) => document.name)
      .join('/');

    this.selectedDocumentInfo = [
      { key: 'Name', value: documentInfo.name },
      {
        key: 'Size',
        value: this.fileSizePipe.transform(documentInfo.content.length),
      },
      {
        key: 'Path',
        value: `${documentPathStr ? '/' : ''}${documentPathStr}/${
          documentInfo.name
        }`,
      },
      {
        key: 'Created',
        value: this.datePipe.transform(documentInfo.create_time),
      },
      {
        key: 'Edited',
        value: documentInfo.last_edit_time
          ? this.datePipe.transform(documentInfo.last_edit_time)
          : 'never',
      },
    ];

    setTimeout(() => {
      this.documentInfoDialog.openDialog();
    }, 100);
  }

  public async openRenameDocumentDialog(documentID: string): Promise<void> {
    this.selectedDocument = await this.documentService.getDocumentInfo(
      documentID
    );

    setTimeout(() => {
      this.renameDocumentDialog.openDialog();
    }, 100);
  }

  public async renameDocument(newName: string): Promise<void> {
    if (newName) {
      try {
        await this.documentService.renameDocument(
          this.selectedDocument.id,
          newName
        );

        this.snackBar.open('Document renamed', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });

        if (this.isRoot) {
          this.documents = await this.groupService.getRootDocuments(
            this.groupID
          );
        } else {
          this.documents =
            await this.directoryService.getDocumentsWithinDirectory(
              this.directoryID
            );
        }
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }

  public async openDeleteDocumentDialog(documentID: string): Promise<void> {
    this.selectedDocument = await this.documentService.getDocumentInfo(
      documentID
    );

    setTimeout(() => {
      this.deleteDocumentDialog.openDialog();
    }, 100);
  }

  public async deleteDocument(confirmed: boolean): Promise<void> {
    if (confirmed) {
      try {
        await this.documentService.deleteDocument(this.selectedDocument.id);

        this.snackBar.open('Document deleted', undefined, {
          duration: 3000,
          panelClass: 'alert-panel-center',
        });

        if (this.isRoot) {
          this.documents = await this.groupService.getRootDocuments(
            this.groupID
          );
        } else {
          this.documents =
            await this.directoryService.getDocumentsWithinDirectory(
              this.directoryID
            );
        }
      } catch (err) {
        this.snackBar.open(`Error: ${err}`, undefined, {
          duration: 5000,
          panelClass: 'alert-panel-center',
        });
      }
    }
  }
}
