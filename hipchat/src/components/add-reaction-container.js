import { graphql } from 'react-apollo';
import AddReactionMutation from '../mutations/addReaction';
import AddReactionButton from'./add-reaction-button';
import PropTypes from 'prop-types';

class AddReactionContainer extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddReaction = this.handleAddReaction.bind(this);
  }

  handleAddReaction(reaction) {
    const reactionData = {
      mid: this.props.msgId,
      room: this.props.roomId,
      emoji: reaction.emoji
    }
    return this.props.mutate({
      variables: {...reactionData}
      // CornCobsContainer mutation subscriber will watch for updates,
      // so it's overkill to refetch queries or update the cache here.
    });
  }

  render() {
    return <AddReactionButton onAddReaction={this.handleAddReaction} />
  }
}

AddReactionContainer.propTypes = {
  msgId: PropTypes.string.isRequired,
  roomId: PropTypes.string.isRequired
};

export default graphql(AddReactionMutation)(AddReactionContainer);
