import log from '../logger';
import PropTypes from 'prop-types';
import React from 'react';
import { Emoji } from 'emoji-mart'

class Reaction extends React.Component {
  static propTypes = {
    reaction: PropTypes.object.isRequired,
    onToggleReaction: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.handleToggleReaction = this.handleToggleReaction.bind(this);
  }

  handleToggleReaction(event) {
    this.props.onToggleReaction(this.props.reaction);
  }

  render() {
    const { emoji, count, isMyReaction } = this.props.reaction;
    const title = isMyReaction ? "Withdraw your Reaction" : "Echo this Reaction"
    return (
      <div className='CORN-reaction' onClick={this.handleToggleReaction} title={title}>
        <Emoji emoji={emoji} set='emojione' size={16} />
        <span className='CORN-reaction-count'>{count}</span>
      </div>
    );
  }
}

export default Reaction;
