import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filesize',
})
export class FileSizePipe implements PipeTransform {
  public transform(value: number): string {
    if (value < 1024) {
      return `${value} bytes`;
    } else if (value < Math.pow(1024, 2)) {
      return `${Math.floor(value / Math.pow(1024, 2))} KB`;
    } else if (value < Math.pow(1024, 3)) {
      return `${Math.floor(value / Math.pow(1024, 3))} MB`;
    } else {
      return `${Math.floor(value / Math.pow(1024, 4))} GB`;
    }
  }
}
