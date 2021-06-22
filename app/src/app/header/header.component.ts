import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mdd-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public loggedIn: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
