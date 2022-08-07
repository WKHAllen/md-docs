import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

interface DialogData {
  title: string;
  confirmMessage: string;
}

@Component({
  selector: 'mdd-confirm',
  template: '',
})
export class ConfirmComponent {
  @Input() title: string = 'Confirm';
  @Input() confirmMessage: string = 'Are you sure?';
  @Input() width: string = '400px';
  @Output() close = new EventEmitter<boolean>();

  constructor(public dialog: MatDialog) {}

  public openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: this.width,
      data: { title: this.title, confirmMessage: this.confirmMessage },
    });

    dialogRef
      .afterClosed()
      .subscribe((confirmed) => this.close.emit(confirmed));
  }
}

@Component({
  selector: 'mdd-confirm-dialog',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
}
