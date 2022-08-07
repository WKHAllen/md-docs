import { Component, Input } from '@angular/core';

@Component({
  selector: 'mdd-does-not-exist',
  templateUrl: './does-not-exist.component.html',
  styleUrls: ['./does-not-exist.component.scss'],
})
export class DoesNotExistComponent {
  @Input() name: string = 'page';
  @Input() homeNav: boolean = true;
}
