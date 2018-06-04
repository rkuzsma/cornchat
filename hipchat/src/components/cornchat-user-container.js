import log from '../logger';
import PropTypes from 'prop-types';
import Authenticate from '../authenticate';

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
      authUser: null,
      authError: null,
      loggingIn: false
    };
    this.login = this.login.bind(this);
    this.handleAuthenticationError = this.handleAuthenticationError.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    log("CornChatUserContainer: getDerivedStateFromProps");
    // Store prevHipchatOauthToken in state so we can compare when props change.
    // Clear out any previously authenticated user.
    if (nextProps.hipchatOauthToken !== prevState.prevHipchatOauthToken) {
      log("CornChatUserContainer: getDerivedStateFromProps - different");
      return {
        prevHipchatOauthToken: nextProps.hipchatOauthToken,
        authUser: null,
        authError: null
      };
    }

    // No state update necessary
    return null;
  }

  componentDidMount() {
    log("CornChatUserContainer: componentDidMount - login");
    this.login();

    // Auto-Login every 50 minutes to keep the Cognito session from expiring
    // TODO Consider moving to AWS Amplify library which now has federated
    // identity login support for Developer pools, and automatic cred refresh.
    const autoLogin = () => {
      log("CornChatUserContainer: Keeping session alive");
      this.login();
    }
    const interval = 50 * 60 * 1000; // 50 minutes
    const timer = setInterval(autoLogin, interval);
    this.setState({timer});
  }

  componentDidUpdate(prevProps, prevState) {
    log("CornChatUserContainer: componentDidUpdate");
    if (this.state.authUser === null && this.state.authError === null && !this.state.loggingIn) {
      log("CornChatUserContainer: componentDidUpdate - login");
      this.login();
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  handleAuthenticationError(err) {
    this.setState({ authUser: null, authError: err, loggingIn: false });
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

    log("CornChatUserContainer: loginWithHipchatOauthToken");
    Authenticate.loginWithHipchatOauthToken(hipchatUserId, hipchatOauthToken, (err, aws) => {
      try {
        if (err) {
          log("CornChatUser: Error authenticating with Hipchat Oauth Token: " + err);
          this.handleAuthenticationError(err);
          return;
        }

        this.setState({
          authUser: {
            isAuthenticated: true,
            hipchatUserId: hipchatUserId,
            aws: aws,
            lastAuthenticatedAt: new Date().getTime()
          },
          authError: null,
          loggingIn: false
        });
      }
      catch(err) {
        log("CornChatUser: Failed to authenticate user: " + err);
        this.handleAuthenticationError(err);
      }
    });
  }

  // TODO Keep user credentials refreshed every 50 minutes
  // i.e. ensure: (new Date().getTime() - user.lastAuthenticatedAt < Constants.authentication_timeout_ms))

  render() {
    log("CornChatUserContainer: render");
    if (this.state.authUser || this.state.authError) {
      return this.props.renderProp({
        authUser: this.state.authUser,
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
