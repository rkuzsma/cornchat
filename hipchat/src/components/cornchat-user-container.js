import log from '../logger';
import PropTypes from 'prop-types';
import ApiToken from '../api-token';

class CornChatUserContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired,
    apiToken: PropTypes.string
  }

  constructor(props) {
    super(props);
    this.state = {
      prevApiToken: props.apiToken,
      authUser: null,
      authError: null,
      loggingIn: false
    };
    this.login = this.login.bind(this);
    this.handleAuthenticationError = this.handleAuthenticationError.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    log("CornChatUserContainer: getDerivedStateFromProps");
    // Store prevApiToken in state so we can compare when props change.
    // Clear out any previously authenticated user.
    if (nextProps.apiToken !== prevState.prevApiToken) {
      log("CornChatUserContainer: getDerivedStateFromProps - different");
      return {
        prevApiToken: nextProps.apiToken,
        authUser: null,
        authError: null
      };
    }

    // No state update necessary
    return null;
  }

  componentDidMount() {
    log("CornChatUserContainer: componentDidMount - login");
    this.login(this.props.apiToken);
  }

  componentDidUpdate(prevProps, prevState) {
    log("CornChatUserContainer: componentDidUpdate");
    if (this.state.authUser === null && this.state.authError === null && !this.state.loggingIn) {
      // At this point, we're in the "commit" phase, so it's safe to load the new data.
      log("CornChatUserContainer: componentDidUpdate - login");
      this.login(this.props.apiToken);
    }
  }

  componentWillMount() {
    // Auto-Login every 50 minutes to keep the Cognito session from expiring
    // TODO Consider moving to AWS Amplify library which now has federated
    // identity login support for Developer pools, and automatic cred refresh.
    const autoLogin = () => {
      log("CornChatUserContainer: Keeping session alive");
      this.login(this.props.apiToken);
    }
    const interval = 50 * 60 * 1000; // 50 minutes
    const timer = setInterval(autoLogin, interval);
    this.setState({timer});
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  handleAuthenticationError(err) {
    this.setState({ authUser: null, authError: err, loggingIn: false });
  }

  login(apiToken) {
    this.setState({ loggingIn: true });

    log("CornChatUserContainer: login");
    if (!apiToken || apiToken === '') {
      this.handleAuthenticationError("No API Token");
      return;
    }

    log("CornChatUserContainer: loginWithApiToken");
    ApiToken.loginWithApiToken(apiToken, (err, aws) => {
      try {
        if (err) {
          log("CornChatUser: Error authenticating with API Token: " + err);
          this.handleAuthenticationError(err);
          return;
        }

        this.setState({
          authUser: {
            isAuthenticated: true,
            apiToken: apiToken,
            aws: aws,
            lastAuthenticatedAt: new Date().getTime()
          },
          authError: null,
          loggingIn: false
        });
      }
      catch(err) {
        log("CornChatUser: Failed to authenticate user with API Token: " + err);
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
