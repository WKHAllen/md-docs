import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  DirectoryService,
  DirectoryInfo,
} from '../directory/directory.service';
import { DocumentInfo, DocumentService } from '../document/document.service';

@Component({
  selector: 'mdd-path',
  templateUrl: './path.component.html',
  styleUrls: ['./path.component.scss'],
})
export class PathComponent implements OnInit, OnChanges {
  @Input() public directoryID: string = '';
  @Input() public documentID: string = '';
  @Input() public root: string = 'false';
  @Input() public showCurrent: string = 'true';
  public isRoot: boolean = false;
  public showCurrentObject: boolean = true;
  public path: DirectoryInfo[] = [];
  public currentObject: DirectoryInfo | DocumentInfo | null = null;

  constructor(
    private directoryService: DirectoryService,
    private documentService: DocumentService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.isRoot = !this.root || this.root === 'true';
    this.showCurrentObject = !this.showCurrent || this.showCurrent === 'true';

    if (!this.isRoot) {
      if (this.directoryID) {
        this.path = await this.directoryService.getDirectoryPath(
          this.directoryID
        );
        this.currentObject = await this.directoryService.getDirectoryInfo(
          this.directoryID
        );
      } else if (this.documentID) {
        this.path = await this.documentService.getDocumentPath(this.documentID);
        this.currentObject = await this.documentService.getDocumentInfo(
          this.documentID
        );
      }
    }
  }

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    for (let propName in changes) {
      switch (propName) {
        case 'directoryID':
          this.directoryID = changes.directoryID.currentValue;
          break;
        case 'documentID':
          this.documentID = changes.documentID.currentValue;
          break;
        case 'root':
          this.root = changes.root.currentValue;
          break;
        case 'showCurrent':
          this.showCurrent = changes.showCurrent.currentValue;
          break;
      }
    }

    await this.ngOnInit();
  }
}
