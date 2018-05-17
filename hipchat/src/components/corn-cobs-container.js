import log from '../logger';
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';
import CornCobs from './corn-cobs';

import { graphql } from 'react-apollo';
import { compose } from 'react-apollo';

import AddTagMutation from '../mutations/addTag';
import AddReactionMutation from '../mutations/addReaction';
import RemoveReactionMutation from '../mutations/removeReaction';

class CornCobsContainer extends React.Component {
  static propTypes = {
    roomId: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    this.handleToggleReaction = this.handleToggleReaction.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
  }

  handleToggleReaction(reaction, msgId) {
    const reactionData = {
      mid: msgId,
      room: this.props.roomId,
      emoji: reaction.emoji
    }
    if (reaction.isMyReaction) {
      return this.props.mutateRemoveReaction({
        variables: {...reactionData},
        // Not required, because we have a subscription:
        // refetchQueries: [ {
        //    query: ListMsgInfosQuery,
        //    variables: {
        //      mids: [msgId]
        //    }
        // } ]
      });
    }
    else {
      return this.props.mutateAddReaction({
        variables: {...reactionData},
        // Not required, because we have a subscription:
        // refetchQueries: [ {
        //    query: ListMsgInfosQuery,
        //    variables: {
        //      mids: [msgId]
        //    }
        // } ]
      });
    }
  }

  handleAddTag(tag, msgId) {
    const tagData = {
      mid: msgId,
      room: this.props.roomId,
      name: tag.name
    }
    log("handleAddTag: " + JSON.stringify(tagData));
    return this.props.mutateAddTag({
      variables: {...tagData},
      refetchQueries: [ {
         query: ListMsgInfosQuery,
         variables: {
           mids: [msgId]
         }
      } ]
      // Overkill for this app, but if desired, we could
      // update the client state without re-querying:
      // optimisticResponse: {
      //   __typename: 'Mutation',
      //   addTag: { ...tagData,  __typename: 'MsgInfo' }
      // },
      // update: (proxy, updates) => {
      //   const data = proxy.readQuery({ query: ListMsgInfosQuery });
      //   const updatedMsgInfo = updates.data.addTag;
      //   data.listMsgInfo.items.push(updatedMsgInfo);
      //   proxy.writeQuery({ query: ListMsgInfosQuery, data });
      // }
    });
  }

  render() {
    const myProps = {
      onAddTag: this.handleAddTag,
      onToggleReaction: this.handleToggleReaction
    }
    return this.props.renderProp(myProps);
  }
}

// Populate this.props.data with GraphQL data
export default compose(
  graphql(AddTagMutation, { name: 'mutateAddTag' }),
  graphql(AddReactionMutation, { name: 'mutateAddReaction' }),
  graphql(RemoveReactionMutation, { name: 'mutateRemoveReaction' })
)(CornCobsContainer);
