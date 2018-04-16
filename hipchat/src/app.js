import log from './logger';
import Logo from './components/logo';
import SettingsDialog from './components/settings-dialog';
import CornCobsContainer from './components/corn-cobs-container';
import TagFilter from './components/tag-filter';
import CornChatUser from './cornchat-user';
import React from "react";
import ReactDOM from "react-dom";

// The app's main run loop. App-Loader invokes the loop iteratively.
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowSettings: false,
      tagFilter: null
    };
    this.toggleSettingsDialog = this.toggleSettingsDialog.bind(this);
    this.onSettingsChanged = this.onSettingsChanged.bind(this);
    this.handleFilterByTag = this.handleFilterByTag.bind(this);
  }

  render() {
    log("App.render()");

    const LogoPortal = ({children}) => {
      const logoRootEl = function() {
        var logoRootEl = document.getElementById('CORN_logoRoot');
        if (logoRootEl) return logoRootEl;
        logoRootEl = $("<ul class='aui-nav'><div id='CORN_logoRoot'></div></ul>");
        var el = $('div.aui-header-primary');
        $(el).append(logoRootEl);
        return document.getElementById('CORN_logoRoot');
      };
      return ReactDOM.createPortal(
        children,
        logoRootEl()
      );
    };

    const SettingsDialogPortal = ({children}) => {
      const dialogRootEl = function() {
        var dialogRootEl = document.getElementById('CORN_dialogRoot');
        if (dialogRootEl) return dialogRootEl;
        dialogRootEl = $("<div><div id='CORN_dialogRoot'></div></div>");
        $('#hipchat').append(dialogRootEl, $('#hipchat')[0].childNodes[0]);
        return document.getElementById('CORN_dialogRoot');
      };
      return ReactDOM.createPortal(
        children,
        dialogRootEl()
      );
    };

    return (
      <div>
        <TagFilter tag={this.state.tagFilter} />
        <SettingsDialogPortal>
          <SettingsDialog
            onClose={this.toggleSettingsDialog}
            show={this.state.isShowSettings}
            token={this.state.apiToken}
            onSettingsChanged={this.onSettingsChanged} />
        </SettingsDialogPortal>
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

export default App;
