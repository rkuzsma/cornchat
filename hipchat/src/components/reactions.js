import log from '../logger';
import PropTypes from 'prop-types';
import React from 'react';

class Reactions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.reactions) return null;

    return (<span className='CORN-reactions'>
        {JSON.stringify(this.props.reactions)}
      </span>
    );

    // const reactionItems = this.props.reactions.map((reaction) =>
    //   <Reaction
    //     reaction={reaction}
    //     key={reaction.emoji} />
    // );
    // return (
    //   <span className='CORN-reactions'>
    //     {reactionItems}
    //   </span>
    // )
  }
}

Reactions.propTypes = {
  reactions: PropTypes.object
};

export default Reactions;
