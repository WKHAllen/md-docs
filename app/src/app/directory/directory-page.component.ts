import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mdd-directory-page',
  templateUrl: './directory-page.component.html',
})
export class DirectoryPageComponent implements OnInit {
  public directoryID: string = '';

  constructor(private activatedRoute: ActivatedRoute) {}

  public ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      this.directoryID = paramMap.get('directoryID') || '';
    });
  }
}
