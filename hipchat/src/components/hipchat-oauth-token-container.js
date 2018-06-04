import log from '../logger';
import HipchatWindow from '../hipchat-window';
import PropTypes from 'prop-types';

class HipchatOauthTokenContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      hipchatOauthToken: null
    };
  }

  componentDidMount() {
    // While Hipchat is loading, we have to poll for the token
    // TODO Attach a listener to detect when user signs out of hipchat, too.
    const initializeHipchatOauthToken = () => {
      log("HipchatOauthTokenContainer: Initialization poll");
      const hipchatOauthToken = HipchatWindow.oauthToken();
      if (hipchatOauthToken && hipchatOauthToken !== 0) {
        log("HipchatOauthTokenContainer: Got a token");
        this.setState({
          hipchatOauthToken: hipchatOauthToken
        });
        window.clearInterval(this.hipchatOauthTokenInitializer);
      }
    }
    this.hipchatOauthTokenInitializer = window.setInterval(initializeHipchatOauthToken, 500);
  }

  componentWillUnmount() {
    window.clearInterval(this.hipchatOauthTokenInitializer);
  }

  render() {
    if (!this.state.hipchatOauthToken) {
      log("HipchatOauthTokenContainer: No token");
      return null;
    }

    return this.props.renderProp({ hipchatOauthToken: this.state.hipchatOauthToken });
  }
}

export default HipchatOauthTokenContainer;
