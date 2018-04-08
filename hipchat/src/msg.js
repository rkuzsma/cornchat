import React from "react";
import PropTypes from 'prop-types';

class Msg extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.msg) return null;
    return <div className={this.props.className}>{this.props.msg}</div>;
  }
}

Msg.propTypes = {
  msg: PropTypes.string,
  className: PropTypes.string
};

export default Msg;
