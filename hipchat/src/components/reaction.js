import log from '../logger';
import PropTypes from 'prop-types';
import { Emoji } from 'emoji-mart'

class Reaction extends React.Component {
  constructor(props) {
    super(props);
    this.handleToggleReaction = this.handleToggleReaction.bind(this);
  }

  handleToggleReaction(event) {
    this.props.onToggleReaction({emoji: this.props.emoji});
  }

  render() {
    const count = this.props.count;
    const title = this.props.isMyReaction ? "Withdraw your Reaction" : "Echo this Reaction"
    return (
      <div className='CORN-reaction' onClick={this.handleToggleReaction} title={title}>
        <Emoji emoji={this.props.emoji} set='emojione' size={16} />
        <span className='CORN-reaction-count'>{count}</span>
      </div>
    );
  }
}

Reaction.propTypes = {
  emoji: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  onToggleReaction: PropTypes.func.isRequired,
  isMyReaction: PropTypes.bool
};

export default Reaction;
