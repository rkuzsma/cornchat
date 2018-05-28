import './assets/cornchat.css';
import './assets/highlightjs.9.12.0.min.css';

import React from "react";
import ReactDOM from "react-dom";
import { hot } from 'react-hot-loader';

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

import log from './logger';

import ErrorBoundary from './components/error-boundary';
import SettingsContainer from './components/settings-container';
import SettingsDialog from './components/settings-dialog';
import LogoPortal from './components/logo-portal';
import Logo from './components/logo';
import AuthenticationErrorMessage from './components/authentication-error-message';
import CornChatUserContainer from './components/cornchat-user-container';
import MsgElementsContainer from './components/msg-elements-container';
import MsgInfosContainer from './components/msg-infos-container';
import CornCobsContainer from './components/corn-cobs-container';
import HipchatUserIdContainer from './components/hipchat-user-id-container';
import RoomIdContainer from './components/room-id-container';
import TagFilterContainer from './components/tag-filter-container';
import TagFilter from './components/tag-filter';
import CornCobs from './components/corn-cobs';
import MsgsDecorator from './components/msgs-decorator';
import MarkdownDecorator from './components/markdown-decorator';

import ScrollHandler from './scroll-handler';

// The app's main run loop. App-Loader invokes the loop iteratively.
class App extends React.Component {
  constructor(props) {
    super(props);
    this.appSyncClient = this.appSyncClient.bind(this);
    this.scrollHandler = new ScrollHandler;
  }

  componentDidMount() {
    this.scrollHandler.attach();
  }

  componentWillUnmount() {
    this.scrollHandler.detach();
  }

  render() {
    log("App.render()");

    return (
      <ErrorBoundary>
        <SettingsContainer
          renderProp={({ onToggleSettingsDialog, isShowSettings, onChangeSettings, settings }) => (
            <div>
              <LogoPortal>
                <Logo onClick={onToggleSettingsDialog} />
              </LogoPortal>
              <div>
                <SettingsDialog
                  onClose={onToggleSettingsDialog}
                  show={isShowSettings}
                  token={settings.apiToken}
                  onSettingsChanged={onChangeSettings} />
              </div>
              <CornChatUserContainer
                apiToken={settings.apiToken}
                renderProp={({ authUser, authError }) => {
                  if (authError) {
                    return ( <AuthenticationErrorMessage authError={authError} /> );
                  }
                  if (!authUser) {
                    return null;
                  }
                  return (
                    <ApolloProvider client={this.appSyncClient(authUser)}>
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
                                              renderProp={({ onToggleFilterByTag, currentlyFilteredTag }) => (
                                                <div>
                                                  <TagFilter
                                                    onToggleFilterByTag={onToggleFilterByTag}
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
                  );
                }}
              ></CornChatUserContainer>
            </div>
          )}
        ></SettingsContainer>
      </ErrorBoundary>
    );
  }

  appSyncClient(authUser) {
    log("AWSAppSyncClient refreshing");
    try {
      return new AWSAppSyncClient({
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
    }
    catch(err) {
      log("AWSAppSyncClient refresh error: " + err);
    }
  }
}

export default hot(module)(App);
