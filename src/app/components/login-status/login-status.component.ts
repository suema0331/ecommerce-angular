import { Component, OnInit, Inject } from '@angular/core';
// import { OktaAuthStateService } from '@okta/okta-angular';
// import { OktaAuthService } from '@okta/okta-angular';
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.scss'],
})
export class LoginStatusComponent implements OnInit {
  isAuthenticated: boolean | undefined = false;
  userFullName: string | undefined;

  constructor(
    private oktaAuthService: OktaAuthStateService,
    @Inject(OKTA_AUTH) public oktaAuth: OktaAuth // @Injectで 暗黙的な依存関係に対する具体的な実装を提供
  ) // @Injectの引数にDIトークンを渡すと、マッチしたProviderからインスタンスを注入される
  {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    // this.oktaAuthService.$authenticationState.subscribe(
    //   (result) => {
    //     this.isAuthenticated = result;
    //     this.getUserDetails();
    //   }
    // );
    this.oktaAuthService.authState$.subscribe((result) => {
      this.isAuthenticated = result.isAuthenticated;
      this.getUserDetails();
    });
  }
  getUserDetails() {
    if (this.isAuthenticated) {
      // Fetch the logged in user details (user's claims)
      // user full name is exposed as a property name
      this.oktaAuth.getUser().then((res) => {
        this.userFullName = res.name;
      });
    }
  }

  logout() {
    // Terminates the session with Okta and removes current tokens.
    this.oktaAuth.signOut();
  }
}
