import log from '../logger';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

// Render reactions below the associated msg line.
class ReactionsPortal extends React.Component {
  constructor(props) {
    super(props);
    this.reactionsRootEl = this.reactionsRootEl.bind(this);
  }

  render() {
    // The reactions portal element is already injected onto the page via CornCobPortal
    return ReactDOM.createPortal(this.props.children, this.reactionsRootEl());
  }

  reactionsRootEl() {
    return $(this.props.msgEl).find('div.CORN-reactions-portal')[0];
  }
}

ReactionsPortal.propTypes = {
  msgEl: PropTypes.object.isRequired
};

export default ReactionsPortal;
