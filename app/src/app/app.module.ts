import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';

import { HeaderComponent } from './header/header.component';
import { IndexComponent } from './index/index.component';
import { LoginComponent } from './login-register/login.component';
import { LogoutComponent } from './login-register/logout.component';
import { RegisterComponent } from './login-register/register.component';
import { VerifyComponent } from './verify/verify.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { NotFoundComponent } from './error/not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { NewGroupComponent } from './group/new-group.component';
import { GroupComponent } from './group/group.component';
import { DirectoryComponent } from './directory/directory.component';
import { DirectoryPageComponent } from './directory/directory-page.component';
import { DocumentComponent } from './document/document.component';
import { DocumentEditComponent } from './document/document-edit.component';
import {
  ConfirmComponent,
  ConfirmDialogComponent,
} from './confirm/confirm.component';
import {
  NewItemComponent,
  NewItemDialogComponent,
} from './new-item/new-item.component';
import {
  EntityInfoComponent,
  EntityInfoDialogComponent,
} from './entity-info/entity-info.component';
import {
  DocumentEditHelpComponent,
  DocumentEditHelpDialogComponent,
} from './document/document-edit-help.component';
import { PathComponent } from './path/path.component';

import { FileSizePipe } from './pipes/file-size.pipe';

function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();
  const linkRenderer = renderer.link;

  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    const hrefURL = new URL(href || '');

    if (href && hrefURL.host !== window.location.host) {
      return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
    } else if (href && hrefURL.host === window.location.host) {
      return html.replace(/^<a href=".*"/, `<a href="${hrefURL.pathname}"`);
    } else {
      return html;
    }
  };

  return {
    renderer,
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    IndexComponent,
    LoginComponent,
    LogoutComponent,
    RegisterComponent,
    VerifyComponent,
    PasswordResetComponent,
    NotFoundComponent,
    ProfileComponent,
    NewGroupComponent,
    GroupComponent,
    DirectoryComponent,
    DirectoryPageComponent,
    DocumentComponent,
    DocumentEditComponent,
    ConfirmComponent,
    ConfirmDialogComponent,
    NewItemComponent,
    NewItemDialogComponent,
    EntityInfoComponent,
    EntityInfoDialogComponent,
    DocumentEditHelpComponent,
    DocumentEditHelpDialogComponent,
    PathComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    BrowserAnimationsModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
  ],
  providers: [DatePipe, FileSizePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
