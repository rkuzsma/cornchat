import log from '../logger';
import PropTypes from 'prop-types';
import Authenticate from '../authenticate';
import AWSAppSyncClient from "aws-appsync";

class CornChatUserContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired,
    hipchatUserId: PropTypes.number,
    hipchatOauthToken: PropTypes.string
  }

  constructor(props) {
    super(props);
    this.state = {
      prevHipchatOauthToken: props.hipchatOauthToken,
      appSyncClient: null,
      hipchatUserId: null,
      hipchatOauthToken: null,
      authError: null,
      loggingIn: false
    };
    this.login = this.login.bind(this);
    this.handleAuthenticationError = this.handleAuthenticationError.bind(this);
    this.appSyncClient = this.appSyncClient.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    log("CornChatUserContainer: getDerivedStateFromProps");
    // Store prevHipchatOauthToken in state so we can compare when props change.
    // Clear out any previously authenticated user.
    if (nextProps.hipchatOauthToken !== prevState.prevHipchatOauthToken) {
      log("CornChatUserContainer: getDerivedStateFromProps - different");
      return {
        prevHipchatOauthToken: nextProps.hipchatOauthToken,
        appSyncClient: null,
        hipchatUserId: null,
        hipchatOauthToken: null,
        authError: null
      };
    }

    // No state update necessary
    return null;
  }

  componentDidMount() {
    log("CornChatUserContainer: componentDidMount - login");
    this.login();
  }

  componentDidUpdate(prevProps, prevState) {
    log("CornChatUserContainer: componentDidUpdate");
    if (this.state.appSyncClient === null && this.state.authError === null && !this.state.loggingIn) {
      log("CornChatUserContainer: componentDidUpdate - login");
      this.login();
    }
  }

  handleAuthenticationError(err) {
    this.setState({
      appSyncClient: null,
      hipchatUserId: null,
      hipchatOauthToken: null,
      authError: err,
      loggingIn: false });
  }

  login() {
    const { hipchatUserId, hipchatOauthToken } = this.props;
    this.setState({ loggingIn: true });

    log("CornChatUserContainer: login");
    if (!hipchatUserId || hipchatUserId === '') {
      this.handleAuthenticationError("No Hipchat User ID");
      return;
    }

    if (!hipchatOauthToken || hipchatOauthToken === '') {
      this.handleAuthenticationError("No Hipchat Oauth Token");
      return;
    }

    const appSyncClient = this.appSyncClient();

    this.setState({
      appSyncClient: appSyncClient,
      hipchatUserId: this.props.hipchatUserId,
      hipchatOauthToken: this.props.hipchatOauthToken,
      authError: null,
      loggingIn: false
    });
  }

  appSyncClient() {
    log("!!!!!!!!!!!!!!!!!! appSyncClient")
    const { hipchatUserId, hipchatOauthToken } = this.props;

    const credentialsFunction = () => {
      return new Promise((resolve, reject) => {
        log("!!! credentialsFunction INVOKED");
        // TODO Find a better cache for the CORN_token than a window global!
        if (window.CORN_token != null) {
          log("!!! credentialsFunction: exists:");
          const waitForCreds = () => {
            if (!window.CORN_token.loading) {
              log("!!! got existing token");
              console.dir(window.CORN_token);
              resolve(window.CORN_token.creds);
            }
            else {
              log("!!! waiting for token");
              window.setTimeout(waitForCreds, 100);
            }
          }
          waitForCreds();
        }
        else {
          window.CORN_token = { loading: true };
          Authenticate.loginWithHipchatOauthToken(hipchatUserId, hipchatOauthToken, (err, creds) => {
            log("!!! credentialsFunction result:");
            console.dir(err);
            console.dir(creds);
            if (err) {
              return reject(err);
            }
            // aws.config.credentials.expireTime: Tue Jun 05 2018 17:24:47 GMT-0400 (EDT)
            const result = {
                loading: false,
                creds: creds,
                expires_at: new Date().getTime() + 60 * 1000 // Expire in 1 minute
            };
            window.CORN_token = result;
            console.dir(result);
            return resolve(result.creds);
          });
        }
      });
    }

    log("!!!!!!!!!!!!!! AWSAppSyncClient refreshing");
    try {
      return new AWSAppSyncClient({
        // We can support offline later...
        disableOffline: true,
        url: CORNCHAT_GRAPHQL_ENDPOINT_URL,
        region: CORNCHAT_AWS_REGION,
        auth: {
          // See: https://docs.aws.amazon.com/appsync/latest/devguide/security.html
          type: "AWS_IAM",
          credentials: credentialsFunction
        }
      });
    }
    catch(err) {
      log("AWSAppSyncClient refresh error: " + err);
    }
  }

  // TODO Keep user credentials refreshed every 50 minutes
  // i.e. ensure: (new Date().getTime() - user.lastAuthenticatedAt < Constants.authentication_timeout_ms))

  render() {
    log("CornChatUserContainer: render");
    if (this.state.appSyncClient || this.state.authError) {
      return this.props.renderProp({
        appSyncClient: this.state.appSyncClient,
        authError: this.state.authError
      });
    }
    else {
      // loading
      return null;
    }
  }
}

export default CornChatUserContainer;
