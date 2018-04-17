import log from '../logger';
import TagsStore from '../tags-store';
import ReactDOM from "react-dom";
import CornCobs from './corn-cobs';
import Constants from '../constants';
import PropTypes from 'prop-types';
import MsgElementsStore from '../msg-elements-store';

class CornCobsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: {},
      msgElements: []
    }
    this.msgStore = new MsgElementsStore();
    this.tagStore = new TagsStore();
    this.handleThumbsUp = this.handleThumbsUp.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
  }

  handleThumbsUp(msgId) {
    alert('TODO: Save a +1 for msg ' + msgId)
  }

  handleAddTag(tag, msgId) {
    this.tagStore.storeTag(msgId, tag.name, (err, data) => {
      if (err) {
        log("Error storing tag: " + err);
        alert('Error storing tag in CornChat');
      }
      else {
        log("Stored tag " + tag.name + " for msgId " + msgId + ". id: " + data);
      }
    });
  }


  componentDidMount() {
    this.setState({
      msgElements: this.msgStore.recentElements(),
      tags: this.tagStore.recentTags()
    });
    this.msgStoreListener = {onElementsChanged: ((prevElements, currentElements) => {
      log("CornCobsContainer: updating msgElements");
      this.setState({msgElements: currentElements});
    })};
    this.tagStoreListener = {onTagsChanged: ((prevTags, currentTags) => {
      log("CornCobsContainer: updating tags");
      this.setState({tags: currentTags});
    })};
    this.msgStore.addListener(this.msgStoreListener);
    this.tagStore.addListener(this.tagStoreListener);
  }

  componentWillUnmount() {
    this.msgStore.removeListener(this.msgStoreListener);
    this.tagStore.removeListener(this.tagStoreListener);
  }

  render() {
    return (<CornCobs
      tags={this.state.tags}
      msgElements={this.state.msgElements}
      onFilterByTag={this.props.onFilterByTag}
      onThumbsUp={this.handleThumbsUp}
      onAddTag={this.handleAddTag} />);
  }
}

CornCobsContainer.propTypes = {
  onFilterByTag: PropTypes.func.isRequired
};

export default CornCobsContainer;
