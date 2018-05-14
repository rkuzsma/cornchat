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
    const count = this.props.count > 1 ? `+${this.props.count}` : '';
    return (
      <div className='CORN-reaction' onClick={this.handleToggleReaction}>
        <Emoji emoji={this.props.emoji} set='emojione' size={16} />
        {count}
      </div>
    );
  }
}

Reaction.propTypes = {
  emoji: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  onToggleReaction: PropTypes.func.isRequired
};

export default Reaction;
