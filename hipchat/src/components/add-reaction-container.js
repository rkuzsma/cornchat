import { graphql } from 'react-apollo';
import AddReactionMutation from '../mutations/AddReaction';
import GetMsgInfoQuery from '../queries/GetMsgInfo';
import AddReactionButton from'./add-reaction-button';
import PropTypes from 'prop-types';

const withReactionMutation = graphql(AddReactionMutation);

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
      variables: {...reactionData},
      optimisticResponse: {
        __typename: 'Mutation',
        addReaction: { ...reactionData,  __typename: 'Reaction' }
      },
      update: (proxy, { data: { newReaction } }) => {
        // TODO
        /*const data = proxy.readQuery({ query: GetMsgInfoQuery });
        data.listMsgInfo.items.push(newReaction);
        proxy.writeQuery({ query: GetMsgInfoQuery, data });*/
      }
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

export default withReactionMutation(AddReactionContainer);
