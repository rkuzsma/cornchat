import log from '../logger';
import MsgElementsStore from '../msg-elements-store';
import PropTypes from 'prop-types';

class MsgElementsContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      msgElements: []
    }
    this.msgElementStore = new MsgElementsStore();
  }

  componentDidMount() {
    this.setState({
      msgElements: this.msgElementStore.recentElements()
    });
    this.msgElementStoreListener = {onElementsChanged: ((prevElements, currentElements) => {
      log("MsgElementsContainer: updating msgElements");
      this.setState({msgElements: currentElements});
    })};
    this.msgElementStore.addListener(this.msgElementStoreListener);
  }

  componentWillUnmount() {
    this.msgElementStore.removeListener(this.msgElementStoreListener);
  }

  render() {
    return this.props.renderProp({
      msgElements: this.state.msgElements
    });
  }
}

export default MsgElementsContainer;
