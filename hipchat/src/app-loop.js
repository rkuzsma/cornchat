'use strict';

import log from './logger';
import Logo from './logo';
import SettingsDialog from './settings-dialog';
import CornLoop from './corn-loop';
import CornChatUser from './cornchat-user';
import ReactDOM from "react-dom";

// The app's main run loop. App-Loader invokes the loop iteratively.
export default function runOneLoop() {
  try {
    if (module.hot) { // run with "npm run start:dev" to enable
      log("Hot Module Replacement enabled");
      module.hot.accept();
    }

    log("3");

    // For sharing state across components that must be rendered into
    // different root elements.
    const initGlobalStateOnce = function() {
      if (!window.CORN_globalState) {
        window.CORN_globalState = {
          isShowSettings: false,
          isLogoRendered: false
        }
      }
    }

    const withAuthenticatedUser = function(fn) {
      if (CornChatUser.isAuthenticated()) {
        fn();
      }
      else {
        log("AppLoop: (re)Authenticating user...");
        CornChatUser.authenticateUser(getCornToken(), function(err, user) {
          if (err) {
            log("AppLoop: Not authenticated. " + err);
            return;
          }
          log("AppLoop: Authenticated user.")
          fn();
        });
      }
    }

    const logoRootEl = function() {
      var logoRootEl = document.getElementById('CORN_logoRoot');
      if (logoRootEl) return logoRootEl;
      logoRootEl = $("<ul class='aui-nav'><div id='CORN_logoRoot'></div></ul>");
      var el = $('div.aui-header-primary');
      log("CORN: Rendering logo root into " + el);
      $(el).append(logoRootEl);
      return document.getElementById('CORN_logoRoot');
    }

    const dialogRootEl = function() {
      var dialogRootEl = document.getElementById('CORN_dialogRoot');
      if (dialogRootEl) return dialogRootEl;
      dialogRootEl = $("<div id='CORN_dialogRoot'></div>");
      $('#hipchat').append(dialogRootEl, $('#hipchat')[0].childNodes[0]);
      return document.getElementById('CORN_dialogRoot');
    }

    const toggleSettingsDialog = function() {
      window.CORN_globalState.isShowSettings = !window.CORN_globalState.isShowSettings;
      renderSettingsDialog();
    }

    const onSettingsChanged = function(newSettings) {
      setCornToken(newSettings.token);
      renderSettingsDialog();
    }

    const renderLogoOnce = function() {
      if (!window.CORN_globalState.isLogoRendered) {
        ReactDOM.render(<Logo onClick={toggleSettingsDialog} />, logoRootEl());
        window.CORN_globalState.isLogoRendered = true;
      }
    }

    const getCornToken = function() {
      return window.localStorage.getItem("CORN_token");
    }

    const setCornToken = function(token) {
      window.localStorage.setItem("CORN_token", token);
    }

    const renderSettingsDialog = function() {
      ReactDOM.render(<SettingsDialog
        onClose={toggleSettingsDialog}
        show={window.CORN_globalState.isShowSettings}
        token={getCornToken()}
        onSettingsChanged={onSettingsChanged} />, dialogRootEl());
    }

    initGlobalStateOnce();

    withAuthenticatedUser(function() {
      renderLogoOnce();
    //  CornLoop();
    });
  }
  catch(err) {
    log("ERROR: " + err + err.stack);
  }
}
