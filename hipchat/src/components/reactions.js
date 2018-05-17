import log from '../logger';
import PropTypes from 'prop-types';
import React from 'react';
import Reaction from './reaction';

class Reactions extends React.Component {
  static propTypes = {
    reactions: PropTypes.object,
    onToggleReaction: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.reactions) return null;

    const reactionItems = Object.keys(this.props.reactions).map(emoji => {
      const reaction = this.props.reactions[emoji];
      return (
        <Reaction
          reaction={reaction}
          onToggleReaction={this.props.onToggleReaction}
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

export default Reactions;
