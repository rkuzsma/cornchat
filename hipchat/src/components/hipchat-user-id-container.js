import log from '../logger';
import HipchatWindow from '../hipchat-window';
import PropTypes from 'prop-types';

class HipchatUserIdContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      hipchatUserId: null
    };
  }

  componentDidMount() {
    // While Hipchat is loading, we have to poll for their user id
    // TODO Attach a listener to detect when user signs out of hipchat, too.
    const initializeHipchatUserId = () => {
      log("HipchatUserIdContainer: Initialization poll");
      const hipchatUserId = HipchatWindow.userId();
      if (hipchatUserId && hipchatUserId !== 0) {
        log("HipchatUserIdContainer: Hipchat User ID initialized: " + hipchatUserId);
        this.setState({
          hipchatUserId: hipchatUserId
        });
        window.clearInterval(this.hipchatUserIdInitializer);
      }
    }
    this.hipchatUserIdInitializer = window.setInterval(initializeHipchatUserId, 500);
  }

  componentWillUnmount() {
    window.clearInterval(this.hipchatUserIdInitializer);
  }

  render() {
    if (!this.state.hipchatUserId) {
      log("HipchatUserIdContainer: No Hipchat User ID");
      return null;
    }

    return this.props.renderProp({ hipchatUserId: this.state.hipchatUserId });
  }
}

export default HipchatUserIdContainer;
