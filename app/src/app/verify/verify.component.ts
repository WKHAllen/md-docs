import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VerifyService } from './verify.service';

@Component({
  selector: 'mdd-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {
  public verifySuccess: boolean = false;
  public error: string = '';

  constructor(
    private verifyService: VerifyService,
    private activatedRoute: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(async (paramMap) => {
      const verifyID = paramMap.get('verifyID');

      if (verifyID === null) {
        this.error = 'Missing value for verifyID';
      } else {
        try {
          await this.verifyService.verifyAccount(verifyID);
          this.verifySuccess = true;
        } catch (err) {
          this.error = err;
        }
      }
    });
  }
}
