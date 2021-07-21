import { Component, Input } from '@angular/core';
import { ImageEntityType } from '../image/image.service';

@Component({
  selector: 'mdd-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent {
  @Input() imageID: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() imageEntityType: ImageEntityType = 'unknown';

  constructor() {}
}
