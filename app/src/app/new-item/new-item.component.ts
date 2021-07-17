import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { inputAppearance } from '../constants';

interface DialogData {
  title: string;
  fieldName: string;
  doneButtonLabel: string;
}

@Component({
  selector: 'mdd-new-item',
  template: '',
})
export class NewItemComponent {
  @Input() title: string = 'New item';
  @Input() fieldName: string = 'Item name';
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
  public value: string = '';
  public inputAppearance: MatFormFieldAppearance = inputAppearance;

  constructor(
    public dialogRef: MatDialogRef<NewItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  public cancel(): void {
    this.dialogRef.close();
  }

  public done(): void {
    this.dialogRef.close(this.value);
  }
}
