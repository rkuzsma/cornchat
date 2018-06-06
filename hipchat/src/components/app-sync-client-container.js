import log from '../logger';
import PropTypes from 'prop-types';
import Authenticate from '../authenticate';
import AWSAppSyncClient from "aws-appsync";

// Provides an AWSAppSyncClient that authenticates with federated developer credentials
// against the user's HipChat OAuth token. An AWS lambda validates the HipChat OAuth
// token and returns a Cognito token using getOpenIdTokenForDeveloperIdentity.
// The Cognito token is pre-configured in AWS with permissions to invoke GraphQL APIs.
//
// When clients such as Apollo GraphQL ask AWSAppSyncClient's AuthLink for credentials,
// the credentials function will refresh the credentials just-in-time.
// The credentials function authenticates with the current hipchatOAuthToken prop.
//
// Authentication errors only manifest when clients like apollo graphql invoke
// AppSyncClient.auth.credentials to fetch creds to use for a request.
// Clients handle auth errors themselves; there is no need to provide affordance
// for errors at this container component level.
class AppSyncClientContainer extends React.Component {
  static propTypes = {
    hipchatUserId: PropTypes.number.isRequired,
    hipchatOauthToken: PropTypes.string.isRequired,
    renderProp: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    // The AppSyncClient instance itself never changes.
    // We don't need to put AppSyncClient in the state; it's a class member.
    this.appSyncClient = new AWSAppSyncClient({
      // We can support offline later...
      disableOffline: true,
      url: CORNCHAT_GRAPHQL_ENDPOINT_URL,
      region: CORNCHAT_AWS_REGION,
      auth: {
        // See: https://docs.aws.amazon.com/appsync/latest/devguide/security.html
        type: "AWS_IAM",
        credentials: credentialsFunctionForProps(props)
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.hipchatOauthToken !== this.props.hipchatOauthToken) {
      // No need to trigger a state change; just swap out the underlying credentials function
      this.appSyncClient.auth.credentials = credentialsFunctionForProps(this.props);
    }
  }

  render() {
    return this.props.renderProp({
      appSyncClient: this.appSyncClient
    });
  }
}

// AppSyncClient invokes this returned function anytime someone asks for creds.
const credentialsFunctionForProps = function(props) {
  const { hipchatUserId, hipchatOauthToken } = props;
  const state = { NEEDS_AUTHENTICATION: 0, AUTHENTICATING: 1, ERROR: 2, AUTHENTICATED: 3 }
  let wrappedCreds = {
    state: state.NEEDS_AUTHENTICATION,
    err: null,
    creds: null
  }
  return function() {
    return new Promise((resolve, reject) => {
      const waitForCreds = () => {
        switch (wrappedCreds.state) {
          case state.NEEDS_AUTHENTICATION:
            wrappedCreds.state = state.AUTHENTICATING;
            Authenticate.loginWithHipchatOauthToken(hipchatUserId, hipchatOauthToken, (err, creds) => {
              log("AppSyncClientContainer: Authenticated");
              if (err) {
                wrappedCreds.state = state.ERROR;
                wrappedCreds.err = err;
                wrappedCreds.creds = null;
                return reject(err);
              }
              else {
                wrappedCreds.state = state.AUTHENTICATED;
                wrappedCreds.err = null;
                wrappedCreds.creds = creds;
                // We could honor Cognito's returned expireTime (default is 1 hour), e.g.:
                //  aws.config.credentials.expireTime: Tue Jun 05 2018 17:24:47 GMT-0400 (EDT)
                // But we want to be more aggressive to give us some buffer, so hard-code 50 minutes:
                wrappedCreds.expiresAt = new Date().getTime() + (50 * 60 * 1000);
                return resolve(creds);
              }
            });
            return;

          case state.AUTHENTICATING:
            window.setTimeout(waitForCreds, 100);
            return;

          case state.ERROR:
            log("AppSyncClientContainer: Authentication error: " + err);
            return reject(wrappedCreds.err);

          case state.AUTHENTICATED:
            if (wrappedCreds.expiresAt < new Date().getTime()) {
              log("AppSyncClientContainer: Refreshing expired credentials");
              wrappedCreds.state = state.NEEDS_AUTHENTICATION;
              window.setTimeout(waitForCreds, 0);
              return;
            }
            return resolve(wrappedCreds.creds);
        }
      }
      waitForCreds();
    });
  }
}

export default AppSyncClientContainer;
