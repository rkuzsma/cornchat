import log from '../logger';
import PropTypes from 'prop-types';
import React from 'react';

class ThumbsUpButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleThumbsUp = this.handleThumbsUp.bind(this);
    this.state = {
      isSaving: false
    }
  }

  handleThumbsUp() {
    this.setState({isSaving: true});
    this.props.onThumbsUp();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return({isSaving: false});
  }

  render() {
    if (this.state.isSaving) {
      return (
        <span className='CORN-addTag'>
          <span className="saving"><span>.</span><span>.</span><span>.</span></span>
        </span>
      );
    }
    else {
      return (
        <span className='CORN-addTag' onClick={this.handleThumbsUp}>👍 {this.props.thumbs}</span>
      );
    }
  }
}

ThumbsUpButton.propTypes = {
  onThumbsUp: PropTypes.func.isRequired,
  thumbs: PropTypes.string
};

export default ThumbsUpButton;
