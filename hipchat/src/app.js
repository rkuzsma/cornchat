import './assets/cornchat.css';
import './assets/highlightjs.9.12.0.min.css';

import log from './logger';
import LogoPortal from './components/logo-portal';
import Logo from './components/logo';
import SettingsDialog from './components/settings-dialog';
import MsgElementsContainer from './components/msg-elements-container';
import MsgInfosContainer from './components/msg-infos-container';
import CornCobsContainer from './components/corn-cobs-container';
import CornChatUser from './cornchat-user';
import React from "react";
import ReactDOM from "react-dom";
import ApiToken from './api-token';
import { hot } from 'react-hot-loader';
import ScrollHandler from './scroll-handler';
import HipchatUserIdContainer from './components/hipchat-user-id-container';
import RoomIdContainer from './components/room-id-container';
import TagFilterContainer from './components/tag-filter-container';
import TagFilter from './components/tag-filter';
import CornCobs from './components/corn-cobs';
import MsgsDecorator from './components/msgs-decorator';
import MarkdownDecorator from './components/markdown-decorator';

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
    this.scrollHandler = new ScrollHandler;
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
    this.scrollHandler.attach();
  }

  componentWillUnmount() {
    CornChatUser.removeListener(this.cornChatUserListener);
    this.scrollHandler.detach();
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
                <HipchatUserIdContainer
                  renderProp={({ hipchatUserId }) => (
                    <RoomIdContainer
                      renderProp={({ roomId }) => (
                        <MsgElementsContainer
                          renderProp={({ msgElements }) => (
                            <div>
                              <MsgsDecorator
                                msgElements={msgElements}
                                decorators={[MarkdownDecorator]}
                              />
                              <MsgInfosContainer
                                msgElements={msgElements}
                                hipchatUserId={hipchatUserId}
                                renderProp={({ msgInfos }) => (
                                  <TagFilterContainer
                                    msgElements={msgElements}
                                    tags={msgInfos.tagsByMid}
                                    renderProp={({ onToggleFilterByTag, onClearTagFilter, currentlyFilteredTag }) => (
                                      <div>
                                        <TagFilter
                                          onToggleFilterByTag={onToggleFilterByTag}
                                          onClearTagFilter={onClearTagFilter}
                                          currentlyFilteredTag={currentlyFilteredTag}
                                        />
                                        <CornCobsContainer
                                          roomId={roomId}
                                          renderProp={({ onToggleReaction, onAddTag }) => (
                                            <CornCobs
                                              msgElements={msgElements}
                                              onToggleFilterByTag={onToggleFilterByTag}
                                              onToggleReaction={onToggleReaction}
                                              onAddTag={onAddTag}
                                              tagsByMid={msgInfos.tagsByMid}
                                              recentTagNames={msgInfos.recentTagNames}
                                              reactionsByMid={msgInfos.reactionsByMid}
                                              roomId={roomId} />
                                          )}
                                        ></CornCobsContainer>
                                      </div>
                                    )}
                                  ></TagFilterContainer>
                                )}
                              ></MsgInfosContainer>
                            </div>
                          )}
                        ></MsgElementsContainer>
                      )}
                    ></RoomIdContainer>
                  )}
                ></HipchatUserIdContainer>
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
