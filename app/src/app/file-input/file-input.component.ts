import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mdd-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
})
export class FileInputComponent implements OnInit {
  @Input() buttonLabel: string = 'Choose file';
  @Input() acceptTypes: string[] = [];
  @Output() fileChange = new EventEmitter<string>();
  public acceptTypesString: string = '*';

  public ngOnInit(): void {
    if (this.acceptTypes) {
      this.acceptTypesString = this.acceptTypes.join(', ');
    }
  }

  public onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;

    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (evt) => {
        if (evt.target?.result) {
          this.fileChange.emit(evt.target.result as string);
        }
      };

      reader.readAsBinaryString(file);
    }
  }
}
