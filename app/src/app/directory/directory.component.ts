import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DirectoryService, DirectoryInfo } from './directory.service';
import { DocumentService, DocumentInfo } from '../document/document.service';
import { GroupService } from '../group/group.service';
import { copyMessage } from '../util';

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

  constructor(
    private directoryService: DirectoryService,
    private documentService: DocumentService,
    private groupService: GroupService,
    private snackBar: MatSnackBar
  ) {}

  public async ngOnInit(): Promise<void> {
    this.isRoot = !this.root || this.root === 'true';

    try {
      if (this.isRoot) {
        this.directories = await this.groupService.getRootDirectories(
          this.groupID
        );
        this.documents = await this.groupService.getRootDocuments(this.groupID);
      } else {
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

      this.gotDetails = true;
    } catch (err) {
      this.directoryInfoError = err;
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

  public newDirectoryDialog(): void {}

  public async createDirectory(): Promise<void> {}

  public newDocumentDialog(): void {}

  public async createDocument(): Promise<void> {}

  public copyDirectoryLink(): void {
    copyMessage(window.location.href);

    this.snackBar.open('Link copied to clipboard', undefined, {
      duration: 3000,
      panelClass: 'alert-panel-center',
    });
  }
}
