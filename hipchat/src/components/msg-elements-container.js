import log from '../logger';
import MsgElementsStore from '../msg-elements-store';
import PropTypes from 'prop-types';

class MsgElementsContainer extends React.Component {
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
    const childrenWithExtraProp = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        msgElements: this.state.msgElements,
        roomId: this.props.roomId
      });
    });

    return childrenWithExtraProp;
  }
}

MsgElementsContainer.propTypes = {
  roomId: PropTypes.string
};

export default MsgElementsContainer;
