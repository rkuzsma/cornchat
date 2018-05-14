import log from '../logger';
import PropTypes from 'prop-types';
import React from 'react';
import Reaction from './reaction';

class Reactions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.reactions) return null;

    const reactionItems = Object.keys(this.props.reactions).map(emoji =>
      <Reaction
        emoji={emoji}
        count={this.props.reactions[emoji].count}
        onToggleReaction={this.props.onToggleReaction}
        key={emoji} />
    );
    
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
