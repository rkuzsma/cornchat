import log from '../logger';
import PropTypes from 'prop-types';
import React from 'react';
import Reaction from './reaction';
import HipchatWindow from '../hipchat-window';

class Reactions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.reactions) return null;

    const reactionItems = Object.keys(this.props.reactions).map(emoji => {
      const reaction = this.props.reactions[emoji];
      return (
        <Reaction
          emoji={emoji}
          count={reaction.count}
          onToggleReaction={this.props.onToggleReaction}
          isMyReaction={!!reaction.distinctUsers[HipchatWindow.userId()]}
          key={emoji} />
      )
    });

    return (
      <span className='CORN-reactions'>
        {reactionItems}
      </span>
    )
  }
}

Reactions.propTypes = {
  reactions: PropTypes.object,
  onToggleReaction: PropTypes.func.isRequired
};

export default Reactions;
