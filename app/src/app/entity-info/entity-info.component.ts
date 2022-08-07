import {
  Component,
  OnChanges,
  SimpleChanges,
  Inject,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

interface DialogData {
  title: string;
  info: any;
}

export interface EntityInfo {
  key: string;
  value: any;
}

@Component({
  selector: 'mdd-entity-info',
  template: '',
})
export class EntityInfoComponent implements OnChanges {
  @Input() title: string = 'Info';
  @Input() info: EntityInfo[] = [];
  @Input() width: string = '400px';
  @Output() close = new EventEmitter();

  constructor(public dialog: MatDialog) {}

  public openDialog(): void {
    const dialogRef = this.dialog.open(EntityInfoDialogComponent, {
      width: this.width,
      data: { title: this.title, info: this.info },
    });

    dialogRef.afterClosed().subscribe(() => this.close.emit());
  }

  public ngOnChanges(changes: SimpleChanges): void {
    for (let propName in changes) {
      switch (propName) {
        case 'title':
          this.title = changes.title.currentValue;
          break;
        case 'info':
          this.info = changes.info.currentValue;
          break;
      }
    }
  }
}

@Component({
  selector: 'mdd-entity-info-dialog',
  templateUrl: './entity-info.component.html',
  styleUrls: ['./entity-info.component.scss'],
})
export class EntityInfoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EntityInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  public closeDialog(): void {
    this.dialogRef.close();
  }
}
