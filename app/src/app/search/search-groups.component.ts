import { Component } from '@angular/core';
import { GroupService, GroupInfo } from '../group/group.service';
import { inputAppearance } from '../constants';

interface SearchGroupsForm {
  query: string;
}

@Component({
  selector: 'mdd-search-groups',
  templateUrl: './search-groups.component.html',
  styleUrls: ['./search-groups.component.scss'],
})
export class SearchGroupsComponent {
  public submittingSearch: boolean = false;
  public error: string = '';
  public results: GroupInfo[] = [];
  public hasSearched: boolean = false;
  readonly inputAppearance = inputAppearance;

  constructor(private groupService: GroupService) {}

  public async search(form: SearchGroupsForm): Promise<void> {
    this.error = '';
    this.submittingSearch = true;

    try {
      this.results = await this.groupService.searchGroups(form.query);
      this.hasSearched = true;
    } catch (err) {
      this.error = err;
    }

    this.submittingSearch = false;
  }
}
