import './assets/cornchat.css';
import log from './logger';
import LogoPortal from './components/logo-portal';
import Logo from './components/logo';
import SettingsDialog from './components/settings-dialog';
import CornCobsContainer from './components/corn-cobs-container';
import TagFilter from './components/tag-filter';
import CornChatUser from './cornchat-user';
import React from "react";
import ReactDOM from "react-dom";
import ApiToken from './api-token';
import { hot } from 'react-hot-loader';
import MsgElementAutoScroller from './components/msg-element-auto-scroller';

// The app's main run loop. App-Loader invokes the loop iteratively.
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowSettings: false,
      tagFilter: null,
      apiToken: CornChatUser.getApiToken()
    };
    this.toggleSettingsDialog = this.toggleSettingsDialog.bind(this);
    this.onSettingsChanged = this.onSettingsChanged.bind(this);
    this.handleFilterByTag = this.handleFilterByTag.bind(this);

    // Activate the Msg Element Resizer watcher so it gets notified first whenever
    // new msg elements are added to the chat room.
    new MsgElementAutoScroller();

    // For first time users, generate a token right off the bat
    if (CornChatUser.getApiToken() === '') {
      log("No saved API token. Generating a default API token.");
      ApiToken.generateTokenForCurrentHipChatUser((err, data) => {
        if (!err) {
          var output = JSON.parse(data.Payload);
          if (output.created) {
            log("Generated token");
            CornChatUser.setApiToken(output.apiToken);
            return;
          }
        }
        log("Failed to generate default API token. " + err);
      });
    }
  }

  render() {
    log("App.render()");

    return (
      <div>
        <TagFilter tag={this.state.tagFilter} />
        <div>
          <SettingsDialog
            onClose={this.toggleSettingsDialog}
            show={this.state.isShowSettings}
            token={this.state.apiToken}
            onSettingsChanged={this.onSettingsChanged} />
        </div>
        <LogoPortal>
          <Logo onClick={this.toggleSettingsDialog} />
        </LogoPortal>
        <CornCobsContainer onFilterByTag={this.handleFilterByTag} />
      </div>
    );
  }

  toggleSettingsDialog() {
    this.setState({isShowSettings: !this.state.isShowSettings});
  }

  onSettingsChanged(newSettings) {
    const apiToken = newSettings.token;
    CornChatUser.setApiToken(apiToken);
  }

  handleFilterByTag(tag) {
    this.setState({ tagFilter: this.state.tagFilter === tag ? null : tag });
  }

}

export default hot(module)(App);
