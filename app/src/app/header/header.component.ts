import { Component, OnInit } from '@angular/core';
import { LoginRegisterService } from '../login-register/login-register.service';

@Component({
  selector: 'mdd-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public loggedIn: boolean = false;

  constructor(private loginRegisterService: LoginRegisterService) {}

  public ngOnInit(): void {
    this.loggedIn = this.loginRegisterService.loggedIn();
    this.loginRegisterService.loggedInChange.subscribe(
      (loggedIn) => (this.loggedIn = loggedIn)
    );
  }
}
