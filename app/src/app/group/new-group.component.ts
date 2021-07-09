import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from './group.service';
import { inputAppearance } from '../constants';

interface NewGroupForm {
  name: string;
  description: string;
}

@Component({
  selector: 'mdd-new-group',
  templateUrl: './new-group.component.html',
  styleUrls: ['./new-group.component.scss'],
})
export class NewGroupComponent {
  public submittingNewGroup: boolean = false;
  public errors: string[] = [];
  readonly inputAppearance = inputAppearance;

  constructor(private groupService: GroupService, private router: Router) {}

  public async onCreateGroup(form: NewGroupForm): Promise<void> {
    this.errors = [];

    if (form.name.length < 1 || form.name.length > 255) {
      this.errors.push('Group name must be between 1 and 255 characters');
    }
    if (form.description.length > 1023) {
      this.errors.push(
        'Group description must be no more than 1023 characters'
      );
    }

    if (this.errors.length === 0) {
      this.submittingNewGroup = true;

      try {
        const group = await this.groupService.createGroup(
          form.name,
          form.description
        );
        await this.router.navigate(['group', group.id]);
      } catch (err) {
        this.submittingNewGroup = false;
        this.errors.push(err);
      }
    }
  }
}
