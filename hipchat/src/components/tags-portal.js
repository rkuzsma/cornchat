import log from '../logger';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

// Render tags above a specific msg line for which the tag is related.
class TagsPortal extends React.Component {
  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.tagsRootEl(this.props.msgEl)
    );
  }

  componentDidMount() {
    this.afterHeight = $(this.props.msgEl)[0].parentElement.offsetHeight;
    const difference = this.afterHeight - this.beforeHeight;
    $('div.hc-chat-scrollbox')[0].scrollTop += difference;
  }

  tagsRootEl(msgEl) {
    // The tags portal element is injected onto the page via CornCobPortal
    return $(msgEl).find('div.CORN-tags-portal')[0];
  }
}


TagsPortal.propTypes = {
  msgEl: PropTypes.object.isRequired
};

export default TagsPortal;
