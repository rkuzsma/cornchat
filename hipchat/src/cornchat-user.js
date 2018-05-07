import log from './logger';
import AWS from 'aws-sdk';
import ApiToken from './api-token';
import Constants from './constants';

let _instance = null;

class CornChatUser {
  constructor() {
    if (!_instance) {
      log("CornChatUser: Initializing");
      _instance = this;
      this.listeners = [];
      this._currentAuthenticatedUser = {};
      this.addListener = this.addListener.bind(this);
      this.removeListener = this.removeListener.bind(this);
      this.onApiTokenChanged = this.onApiTokenChanged.bind(this);
      this.getApiToken = this.getApiToken.bind(this);
      this.setApiToken = this.setApiToken.bind(this);
      this.withAuthenticatedUser = this.withAuthenticatedUser.bind(this);
      this.authenticateUser = this.authenticateUser.bind(this);
      this.isAuthenticated = this.isAuthenticated.bind(this);
      this.currentAuthenticatedUser = this.currentAuthenticatedUser.bind(this);
      this.regenerateApiToken = this.regenerateApiToken.bind(this);
    }
    return _instance;
  }

  // Listen for onApiTokenChanged(prev, current)
  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(item => item !== listener);
  }

  onApiTokenChanged(prev, current) {
    this.listeners.forEach((listener) => {
      if (listener.onTagsChanged) {
        listener.onApiTokenChanged(prev, current);
      }
    });
  }

  getApiToken() {
    let token = window.localStorage.getItem("CORN_token");
    if (!token) {
      token = '';
    }
    return token;
  }

  setApiToken(apiToken) {
    const prevToken = this.getApiToken();
    window.localStorage.setItem("CORN_token", apiToken);
    this.onApiTokenChanged(prevToken, apiToken);
  }

  withAuthenticatedUser(fn) {
    if (this.isAuthenticated()) {
      return fn(null, this.currentAuthenticatedUser());
    }
    else {
      log("CornChatUser: (re)Authenticating user...");
      this.authenticateUser(this.getApiToken(), (err, user) => {
        if (err) {
          log("CornChatUser: Not authenticated. " + err);
          return fn(err, null);
        }
        log("CornChatUser: Authenticated user.")
        return fn(null, this.currentAuthenticatedUser());
      });
    }
  }

  authenticateUser(apiToken, fn) {
    if (!apiToken || apiToken === '') {
      log("CornChatUser: No API Token");
      return fn("No API Token", null);
    }
    ApiToken.loginWithApiToken(apiToken, (err, aws) => {
      try {
        if (err) {
          log("CornChatUser: Error authenticating with API Token: " + err);
          return fn(err, null);
        }
        this._currentAuthenticatedUser = {
          isAuthenticated: true,
          apiToken: apiToken,
          aws: aws,
          lastAuthenticatedAt: new Date().getTime()
        }
        return fn(null, this._currentAuthenticatedUser)
      }
      catch(err) {
        log("CornChatUser: Failed to authenticate user with API Token: " + err);
        this._currentAuthenticatedUser = {
          isAuthenticated: false,
          apiToken: apiToken
        }
        return fn(err, null);
      }
    });
  }

  isAuthenticated() {
    var user = this._currentAuthenticatedUser;
    return (user &&
            user.isAuthenticated &&
            (new Date().getTime() - user.lastAuthenticatedAt < Constants.authentication_timeout_ms));
  }

  currentAuthenticatedUser() {
    if (!this._currentAuthenticatedUser) {
      throw "No authenticated CornChat user";
    }
    return this._currentAuthenticatedUser;
  }

  regenerateApiToken(fn = function(err, token){}) {
    log("CornChatUser: regenerateApiToken");
    ApiToken.generateTokenForCurrentHipChatUser((err, data) => {
      if (!err) {
        var output = JSON.parse(data.Payload);
        if (output.created) {
          log("CornChatUser: Generated token");
          CornChatUser.setApiToken(output.apiToken);
          return fn(null, output.apiToken);
        }
      }
      log("CornChatUser: Failed to generate default API token. " + err);
      return fn(err, null);
    });
  }
}

export default new CornChatUser();
