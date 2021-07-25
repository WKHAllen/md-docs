import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
import { DirectoryPageComponent } from './directory/directory-page.component';
import { DocumentComponent } from './document/document.component';
import { DocumentEditComponent } from './document/document-edit.component';
import { DocumentEditRequestComponent } from './document/document-edit-request.component';
import { SearchGroupsComponent } from './search/search-groups.component';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify/:verifyID', component: VerifyComponent },
  { path: 'password-reset', component: PasswordResetComponent },
  { path: 'password-reset/:resetID', component: PasswordResetComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'group', component: NewGroupComponent },
  { path: 'group/:groupID', component: GroupComponent },
  { path: 'directory/:directoryID', component: DirectoryPageComponent },
  { path: 'document/view/:documentID', component: DocumentComponent },
  { path: 'document/edit/:documentID', component: DocumentEditComponent },
  {
    path: 'document-edit/:documentEditID',
    component: DocumentEditRequestComponent,
  },
  { path: 'search', component: SearchGroupsComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
