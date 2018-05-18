import React from "react";
import PropTypes from 'prop-types';

class FlashMsg extends React.Component {
  static propTypes = {
    msg: PropTypes.string,
    className: PropTypes.string
  }

  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.msg) return null;
    return <div className={this.props.className}>{this.props.msg}</div>;
  }
}

export default FlashMsg;
