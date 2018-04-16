import log from '../logger';
import TagsStore from '../tags-store';
import ReactDOM from "react-dom";
import CornCobs from './corn-cobs';
import Constants from '../constants';
import PropTypes from 'prop-types';

class CornCobsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: {}
    }
  }

  componentDidMount() {
    // Poll for new tags for any visibile chat messages on the page
    // TODO Consider implementing a last-updated-at timestamp cache bust at the room level
    window.setInterval(() => {
      log("Calling fetchTags");
      TagsStore.fetchTags(this.findVisibleMsgIds(), (err, tags) => {
        if (err) {
          log("Error in fetchMsgTags: " + err);
          tags = {};
        }
        this.setState({tags: tags});
      });
    }, Constants.tag_fetch_loop_interval);
  }

  findVisibleMsgIds() {
    var tags = {};
    var msgDivs = $('div.msg-line');
    var concatenated_ids = '';
    var random = 0;
    const msgIdsFromMsgDivs = function(msgDivs) {
      return _.reduce(msgDivs, function(res, msgDiv) {
        var msgId = $(msgDiv).data('mid');
        if (msgId) {
          res[msgId] = msgId;
        }
        return res;
      }, {});
    }
    var res = msgIdsFromMsgDivs(msgDivs);
    return res;
  }

  render() {
    return (<CornCobs
      tags={this.state.tags}
      onFilterByTag={this.props.onFilterByTag} />);
  }
}

CornCobsContainer.propTypes = {
  onFilterByTag: PropTypes.func.isRequired
};

export default CornCobsContainer;
