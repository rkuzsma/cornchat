import log from '../logger';
import ReactDOM from "react-dom";
import Constants from '../constants';
import PropTypes from 'prop-types';
import MsgElementsStore from '../msg-elements-store';
import MsgInfoStore from '../msg-info-store';
import CornCobs from './corn-cobs';

class CornCobsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      msgElements: [],
      tags: {},
      thumbs: {},
      recentTagNames: []
    }
    this.msgElementStore = new MsgElementsStore();
    this.msgInfoStore = new MsgInfoStore();
    this.handleThumbsUp = this.handleThumbsUp.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
  }

  handleThumbsUp(msgId) {
    this.msgInfoStore.incrementThumbs(msgId, (err, data) => {
      if (err) {
        log("Error incrementing counter: " + err);
        alert('Error incrementing counter in CornChat');
      }
      else {
        log("Incremented thumbs counter for msgId " + msgId + ". result: " + data);
      }
    });
  }

  handleAddTag(tag, msgId) {
    this.msgInfoStore.storeTag(msgId, tag.name, (err, data) => {
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
      msgElements: this.msgElementStore.recentElements(),
      tags: this.msgInfoStore.recentTags(),
      recentTagNames: Object.keys(this.msgInfoStore.recentDistinctTagsByName()),
      thumbs: this.msgInfoStore.recentThumbs()
    });
    this.msgElementStoreListener = {onElementsChanged: ((prevElements, currentElements) => {
      log("CornCobsContainer: updating msgElements");
      this.setState({msgElements: currentElements});
    })};
    this.msgInfoStoreListener = {
      onTagsChanged: ((prev, current) => {
        log("CornCobsContainer: updating tags");
        this.setState({
          tags: current,
          recentTagNames: Object.keys(this.msgInfoStore.recentDistinctTagsByName())
        });
      }),
      onThumbsChanged: ((prev, current) => {
        log("CornCobsContainer: updating thumbs");
        this.setState({
          thumbs: current
        });
      })
    };
    this.msgElementStore.addListener(this.msgElementStoreListener);
    this.msgInfoStore.addListener(this.msgInfoStoreListener);
  }

  componentWillUnmount() {
    this.msgElementStore.removeListener(this.msgElementStoreListener);
    this.msgInfoStore.removeListener(this.msgInfoStoreListener);
  }

  render() {
    return (<CornCobs
      tags={this.state.tags}
      thumbs={this.state.thumbs}
      msgElements={this.state.msgElements}
      onFilterByTag={this.props.onFilterByTag}
      onThumbsUp={this.handleThumbsUp}
      onAddTag={this.handleAddTag}
      recentTagNames={this.state.recentTagNames} />);
  }
}

CornCobsContainer.propTypes = {
  onFilterByTag: PropTypes.func.isRequired
};

export default CornCobsContainer;
