import log from '../logger';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

// Render tags above a specific msg line for which the tag is related.
class TagsPortal extends React.Component {
  constructor(props) {
    super(props);
    this.tagsRootEl = this.tagsRootEl.bind(this);
  }

  render() {
    // The tags portal element is already injected onto the page via CornCobPortal
    return ReactDOM.createPortal(this.props.children, this.tagsRootEl());
  }

  tagsRootEl() {
    return $(this.props.msgEl).find('div.CORN-tags-portal')[0];
  }
}


TagsPortal.propTypes = {
  msgEl: PropTypes.object.isRequired
};

export default TagsPortal;
