import log from './logger';
import Logo from './components//logo';
import SettingsDialog from './components/settings-dialog';
import CornCobs from './components/corn-cobs';
import CornChatUser from './cornchat-user';
import React from "react";
import ReactDOM from "react-dom";

// The app's main run loop. App-Loader invokes the loop iteratively.
class App extends React.Component {
  constructor(props) {
    super(props);
    window.CORN_globalState = {};
    this.state = {
      isShowSettings: false,
      apiToken: window.localStorage.getItem("CORN_token")
    };
    this.toggleSettingsDialog = this.toggleSettingsDialog.bind(this);
    this.onSettingsChanged = this.onSettingsChanged.bind(this);
  }

  render() {

    try {

      const withAuthenticatedUser = (fn) => {
        if (CornChatUser.isAuthenticated()) {
          fn();
        }
        else {
          log("AppLoop: (re)Authenticating user...");
          CornChatUser.authenticateUser(this.state.apiToken, (err, user) => {
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

      const cornCobsRootEl = function() {
        var cornCobsRootEl = document.getElementById('CORN_cornCobsRootEl');
        if (cornCobsRootEl) return cornCobsRootEl;
        cornCobsRootEl = $("<div id='CORN_cornCobsRootEl'></div>");
        $('#hipchat').append(cornCobsRootEl, $('#hipchat')[0].childNodes[0]);
        return document.getElementById('CORN_cornCobsRootEl');
      }

      withAuthenticatedUser(() => {
        ReactDOM.render(<Logo onClick={this.toggleSettingsDialog} />, logoRootEl());
        ReactDOM.render(<CornCobs />, cornCobsRootEl());
      });

      // Keep user authenticated
      window.setInterval(function() {
        withAuthenticatedUser(function() { /* no-op */ });
      }, 10000);
    }
    catch(err) {
      log("Error rendering app: " + err);
      log(err.stack);
    }
    return null;
  }

  toggleSettingsDialog() {
    this.state.isShowSettings = !this.state.isShowSettings;
    renderSettingsDialog();
  }

  onSettingsChanged(newSettings) {
    const apiToken = newSettings.token;
    this.setState({ apiToken: apiToken });
    window.localStorage.setItem("CORN_token", apiToken);

    // TODO Does settings get rendered TWICE when the token changes?
    renderSettingsDialog();
  }

  dialogRootEl() {
    var dialogRootEl = document.getElementById('CORN_dialogRoot');
    if (dialogRootEl) return dialogRootEl;
    dialogRootEl = $("<div id='CORN_dialogRoot'></div>");
    $('#hipchat').append(dialogRootEl, $('#hipchat')[0].childNodes[0]);
    return document.getElementById('CORN_dialogRoot');
  }

  renderSettingsDialog() {
    ReactDOM.render(<SettingsDialog
      onClose={this.toggleSettingsDialog}
      show={this.state.isShowSettings}
      token={this.state.apiToken}
      onSettingsChanged={this.onSettingsChanged} />, dialogRootEl());
  }
}

export default App;
