'use strict';

import log from './logger';
import AWS from 'aws-sdk';
import ApiToken from './api-token';
import Constants from './constants';

export default {
  authenticateUser: function(apiToken, fn) {
    ApiToken.loginWithApiToken(apiToken, function(err, aws) {
      try {
        if (err) {
          log("Error authenticating with API Token: " + err);
          throw(err);
        }
        window.CORN_globalState.currentAuthenticatedUser = {
          isAuthenticated: true,
          apiToken: apiToken,
          aws: aws,
          lastAuthenticatedAt: new Date().getTime()
        }
        fn(null, window.CORN_globalState.currentAuthenticatedUser)
      }
      catch(err) {
        log("Failed to authenticate user with API Token: " + err);
        window.CORN_globalState.currentAuthenticatedUser = {
          isAuthenticated: false,
          apiToken: apiToken
        }
        fn(err);
      }
    });
  },

  isAuthenticated: function() {
    var user = window.CORN_globalState.currentAuthenticatedUser;
    return (user &&
            user.isAuthenticated &&
            (new Date().getTime() - user.lastAuthenticatedAt < Constants.authentication_timeout_ms));
  },

  currentAuthenticatedUser: function() {
    if (!window.CORN_globalState.currentAuthenticatedUser) {
      throw "No authenticated CornChat user";
    }
    return window.CORN_globalState.currentAuthenticatedUser;
  }
}
