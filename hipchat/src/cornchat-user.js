import log from './logger';
import AWS from 'aws-sdk';
import ApiToken from './api-token';
import Constants from './constants';

let _currentAuthenticatedUser = {};

class CornChatUser {

  static getApiToken() {
    let token = window.localStorage.getItem("CORN_token");
    if (!token) {
      token = '';
    }
    return token;
  }

  static setApiToken(apiToken) {
    window.localStorage.setItem("CORN_token", apiToken);
  }

  static withAuthenticatedUser(fn) {
    if (this.isAuthenticated()) {
      fn(null, this.currentAuthenticatedUser());
    }
    else {
      log("CornChatUser: (re)Authenticating user...");
      this.authenticateUser(this.getApiToken(), (err, user) => {
        if (err) {
          log("CornChatUser: Not authenticated. " + err);
          fn(err, null);
          return;
        }
        log("CornChatUser: Authenticated user.")
        fn(null, this.currentAuthenticatedUser());
      });
    }
  }

  static authenticateUser(apiToken, fn) {
    if (!apiToken || apiToken === '') {
      log("CornChatUser: No API Token");
      throw("No API Token");
    }
    ApiToken.loginWithApiToken(apiToken, function(err, aws) {
      try {
        if (err) {
          log("CornChatUser: Error authenticating with API Token: " + err);
          throw(err);
        }
        _currentAuthenticatedUser = {
          isAuthenticated: true,
          apiToken: apiToken,
          aws: aws,
          lastAuthenticatedAt: new Date().getTime()
        }
        fn(null, _currentAuthenticatedUser)
      }
      catch(err) {
        log("CornChatUser: Failed to authenticate user with API Token: " + err);
        _currentAuthenticatedUser = {
          isAuthenticated: false,
          apiToken: apiToken
        }
        fn(err);
      }
    });
  }

  static isAuthenticated() {
    var user = _currentAuthenticatedUser;
    return (user &&
            user.isAuthenticated &&
            (new Date().getTime() - user.lastAuthenticatedAt < Constants.authentication_timeout_ms));
  }

  static currentAuthenticatedUser() {
    if (!_currentAuthenticatedUser) {
      throw "No authenticated CornChat user";
    }
    return _currentAuthenticatedUser;
  }
}

export default CornChatUser;
