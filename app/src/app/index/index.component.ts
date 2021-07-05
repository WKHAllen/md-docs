import { Component, OnInit } from '@angular/core';
import { LoginRegisterService } from '../login-register/login-register.service';

@Component({
  selector: 'mdd-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  public loggedIn: boolean = false;

  constructor(private loginRegisterService: LoginRegisterService) {}

  public ngOnInit() {
    this.loggedIn = this.loginRegisterService.loggedIn();
  }
}
