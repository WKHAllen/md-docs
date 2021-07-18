import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

interface DialogData {
  title: string;
  info: any;
}

@Component({
  selector: 'mdd-document-edit-help',
  template: '',
})
export class DocumentEditHelpComponent {
  @Input() width: string = '400px';
  @Output() close = new EventEmitter();

  constructor(public dialog: MatDialog) {}

  public openDialog(): void {
    const dialogRef = this.dialog.open(DocumentEditHelpDialogComponent, {
      width: this.width,
    });

    dialogRef.afterClosed().subscribe(() => this.close.emit());
  }
}

@Component({
  selector: 'mdd-document-edit-help-dialog',
  templateUrl: './document-edit-help.component.html',
  styleUrls: ['./document-edit-help.component.scss'],
})
export class DocumentEditHelpDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DocumentEditHelpDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  public closeDialog(): void {
    this.dialogRef.close();
  }
}
