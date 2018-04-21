import React from "react";
import PropTypes from 'prop-types';
import cornImage from '../assets/cornchat-logo-32x32-notext.png';

class Logo extends React.Component {
  render() {
    return (
      <div onClick={this.props.onClick} className="CORN-logo">
        <img src={cornImage} height="32" width="32" /> CornChat
      </div>
    );
  }
}

Logo.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default Logo;
