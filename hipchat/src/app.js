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
import Constants from './constants';

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
      tagFilter: null,
      apiToken: CornChatUser.getApiToken(),
      client: null
    };
    this.toggleSettingsDialog = this.toggleSettingsDialog.bind(this);
    this.onSettingsChanged = this.onSettingsChanged.bind(this);
    this.handleFilterByTag = this.handleFilterByTag.bind(this);

// TODO Move this to ComponentDidMount because React could error if trying to setState
// before a component is actually mounted:

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

  componentDidMount() {

    CornChatUser.withAuthenticatedUser((err, authUser) => {
      if (err) {
        log("AWSAppSyncClient init failed, authentication error: " + err);
      }
      try {
        log("Initializing AWSAppSyncClient");
        var client = new AWSAppSyncClient({
          disableOffline: false,
          url: Constants.graphql_endpoint,
          region: Constants.aws_region,
          auth: {
            // See: https://docs.aws.amazon.com/appsync/latest/devguide/security.html
            type: "AWS_IAM",
            credentials: authUser.aws.config.credentials
          }
        });
        this.setState({client: client});
      }
      catch(err) {
        log("AWSAppSyncClient init error: " + err);
      }
    });
  }

  render() {
    log("App.render()");
    if (this.state.client == null) return null;

    return (
      <ApolloProvider client={this.state.client}>
        <Rehydrated>

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

        </Rehydrated>
      </ApolloProvider>
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
