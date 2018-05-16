import './assets/cornchat.css';
import log from './logger';
import LogoPortal from './components/logo-portal';
import Logo from './components/logo';
import SettingsDialog from './components/settings-dialog';
import MsgElementsContainer from './components/msg-elements-container';
import CornCobsContainer from './components/corn-cobs-container';
import CornChatUser from './cornchat-user';
import React from "react";
import ReactDOM from "react-dom";
import ApiToken from './api-token';
import { hot } from 'react-hot-loader';
import MsgElementAutoScroller from './components/msg-element-auto-scroller';
import RoomIdContainer from './components/room-id-container';

// Importing `isomorphic-unfetch` due to `apollo-link-http` raising
// a warning of not having `fetch` globally available.
// @see https://github.com/apollographql/apollo-link/issues/493
// Also prevents "resolveClient not an error" when disableOffline=false
// @see // https://github.com/awslabs/aws-mobile-appsync-sdk-js/pull/96/files#r186038406
import 'isomorphic-unfetch';
import { createHttpLink } from 'apollo-link-http';

import AWSAppSyncClient from "aws-appsync";
import { Rehydrated } from 'aws-appsync-react';
import { ApolloProvider } from 'react-apollo';

// The app's main run loop. App-Loader invokes the loop iteratively.
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowSettings: false,
      apiToken: '',
      client: null,
      isFirstTime: true
    };
    this.toggleSettingsDialog = this.toggleSettingsDialog.bind(this);
    this.onSettingsChanged = this.onSettingsChanged.bind(this);
    this.refreshAppSyncClient = this.refreshAppSyncClient.bind(this);
    this.handleApiTokenChanged = this.handleApiTokenChanged.bind(this);
    this.cornChatUserListener = {
      onApiTokenChanged: this.handleApiTokenChanged
    }

  // TODO Move this to ComponentDidMount because React could error if trying to setState
  // before a component is actually mounted:
    // Activate the Msg Element Resizer watcher so it gets notified first whenever
    // new msg elements are added to the chat room.
    new MsgElementAutoScroller();
  }

  componentDidMount() {
    CornChatUser.addListener(this.cornChatUserListener);
    if (this.state.isFirstTime && (CornChatUser.getApiToken() === '')) {
      log("No saved API token for first time user. Generating a default API token.");
      CornChatUser.regenerateApiToken();
    }
    else {
      this.handleApiTokenChanged(this.state.apiToken, CornChatUser.getApiToken());
    }
    this.setState({isFirstTime: false});
  }

  componentWillUnmount() {
    CornChatUser.removeListener(this.cornChatUserListener);
  }

  render() {
    log("App.render()");

    const LogoAndSettings = (
      <div>
        <LogoPortal>
          <Logo onClick={this.toggleSettingsDialog} />
        </LogoPortal>
        <div>
          <SettingsDialog
            onClose={this.toggleSettingsDialog}
            show={this.state.isShowSettings}
            token={this.state.apiToken}
            onSettingsChanged={this.onSettingsChanged} />
        </div>
      </div>
    );

    if (this.state.client == null || this.state.apiToken == null) {
      return LogoAndSettings;
    }
    else {
      return (
        <div>
          {LogoAndSettings}
          <ApolloProvider client={this.state.client}>
            <Rehydrated>
              <div>
                <RoomIdContainer>
                  <MsgElementsContainer>
                    <CornCobsContainer />
                  </MsgElementsContainer>
                </RoomIdContainer>
              </div>
            </Rehydrated>
          </ApolloProvider>
        </div>
       );
     }
  }

  refreshAppSyncClient() {
    log("AWSAppSyncClient refreshing");
    CornChatUser.withAuthenticatedUser((err, authUser) => {
      if (err) {
        log("AWSAppSyncClient refresh failed, authentication error: " + err);
        return;
      }
      try {
        var client = new AWSAppSyncClient({
          // We can support offline later...
          disableOffline: true,
          url: CORNCHAT_GRAPHQL_ENDPOINT_URL,
          region: CORNCHAT_AWS_REGION,
          auth: {
            // See: https://docs.aws.amazon.com/appsync/latest/devguide/security.html
            type: "AWS_IAM",
            credentials: authUser.aws.config.credentials
          }
        });
        this.setState({client: client});
      }
      catch(err) {
        log("AWSAppSyncClient refresh error: " + err);
      }
    });
  }

  handleApiTokenChanged(prev, current) {
    if (this.state.apiToken !== current) {
      this.setState({apiToken: current});
      this.refreshAppSyncClient();
    }
  }

  toggleSettingsDialog() {
    this.setState({isShowSettings: !this.state.isShowSettings});
  }

  onSettingsChanged(newSettings) {
    const apiToken = newSettings.token;
    CornChatUser.setApiToken(apiToken);
  }


}

export default hot(module)(App);
