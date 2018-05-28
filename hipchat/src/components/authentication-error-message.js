import log from '../logger';
import ErrorPortal from './error-portal';
import PropTypes from 'prop-types';

// Presentational component for showing the error when a user fails to authenticate.
class AuthenticationErrorMessage extends React.Component {
  static propTypes = {
    authError: PropTypes.any.isRequired
  }

  render() {
    if (!this.props.authError) {
      return null;
    }
    return (
      <ErrorPortal><div>Authentication Failure: {this.props.authError}</div></ErrorPortal>
    );
  }
}

export default AuthenticationErrorMessage;
