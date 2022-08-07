import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { inputAppearance } from '../constants';

interface DialogData {
  title: string;
  fieldName: string;
  value: string;
  doneButtonLabel: string;
}

@Component({
  selector: 'mdd-new-item',
  template: '',
})
export class NewItemComponent {
  @Input() title: string = 'New item';
  @Input() fieldName: string = 'Item name';
  @Input() value: string = '';
  @Input() doneButtonLabel: string = 'Create';
  @Input() width: string = '400px';
  @Output() close = new EventEmitter<string>();

  constructor(public dialog: MatDialog) {}

  public openDialog(): void {
    const dialogRef = this.dialog.open(NewItemDialogComponent, {
      width: this.width,
      data: {
        title: this.title,
        fieldName: this.fieldName,
        value: this.value,
        doneButtonLabel: this.doneButtonLabel,
      },
    });

    dialogRef.afterClosed().subscribe((value) => this.close.emit(value));
  }
}

@Component({
  selector: 'mdd-new-item-dialog',
  templateUrl: './new-item.component.html',
  styleUrls: ['./new-item.component.scss'],
})
export class NewItemDialogComponent {
  readonly inputAppearance = inputAppearance;

  constructor(
    public dialogRef: MatDialogRef<NewItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  public cancel(): void {
    this.dialogRef.close();
  }

  public done(): void {
    this.dialogRef.close(this.data.value);
  }
}
