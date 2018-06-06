import log from '../logger';
import ErrorPortal from './error-portal';
import PropTypes from 'prop-types';

// Handle showing an error when a user fails to authenticate.
class AuthenticationErrorHandler extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired
  }

  state = {
    authError: null
  }

  handleAuthenticationError(authError) {
    this.setState({ authError: authError });
  }

  render() {
    if (!this.state.authError) {
      return this.props.renderProp({
        onAuthenticationError: this.handleAuthenticationError
      });
    }
    else {
      return (
        <ErrorPortal><div>Authentication Failure: {this.state.authError}</div></ErrorPortal>
      );
    }
  }
}

export default AuthenticationErrorHandler;
