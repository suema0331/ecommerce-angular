/** Okta.com
 * provides a cloud based authorization server and platform
 * When developing code with OAuth2, OpenID Connect and JWT
 * Okta provides SDKs for Angular, Java etc
 * SDK(software development kit) is a high-level ob abstraction
 * AUthentication / Authorization / User Management
 * includes login/sign-in widgets can customize look+feel
 *  */

export default {
  // setting for OpenId
  oidc: {
    clientId: '0oa4wr4nu6MMMZwkH5d7', // from okta clientID
    issuer: 'https://dev-71825216.okta.com/oauth2/default', // from okta domain
    redirectUri: 'http://localhost:4200/login/callback',
    scopes: ['openid', 'profile', 'email'], // scopes provide access to information about a user
    // openid: requires for authentication requests
    // profile: user's first name, last name, phone etc
    // email: user's email address
  },
};
