import log from '../logger';
import ReactDOM from "react-dom";
import Constants from '../constants';
import PropTypes from 'prop-types';
import MsgElementsStore from '../msg-elements-store';
import CornCobs from './corn-cobs';
import HipchatWindow from '../hipchat-window';

import { graphql } from 'react-apollo';
import { compose } from 'react-apollo';
import ListMsgInfosQuery from '../queries/listMsgInfos';
import SubMsgInfo from '../subscriptions/subMsgInfo';
import AddTagMutation from '../mutations/addTag';
import AddReactionMutation from '../mutations/addReaction';
import RemoveReactionMutation from '../mutations/removeReaction';

class CornCobsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roomId: '',
      hipchatUserId: ''
    }
    this.handleAddTag = this.handleAddTag.bind(this);
    this.handleToggleReaction = this.handleToggleReaction.bind(this);
  }

  handleToggleReaction(reaction, msgId) {
    const reactionData = {
      mid: msgId,
      room: this.state.roomId,
      emoji: reaction.emoji
    }
    const existingReaction = this.props.msgInfos.reactionsByMid[msgId];
    if (existingReaction &&
      existingReaction[reaction.emoji] &&
      existingReaction[reaction.emoji].distinctUsers[this.state.hipchatUserId]) {
        return this.props.mutateRemoveReaction({
          variables: {...reactionData},
          refetchQueries: [ { query: ListMsgInfosQuery }]
        });
    }
    else {
      return this.props.mutateAddReaction({
        variables: {...reactionData},
        refetchQueries: [ { query: ListMsgInfosQuery }]
      });
    }
  }

  handleAddTag(tag, msgId) {
    const tagData = {
      mid: msgId,
      room: this.state.roomId,
      name: tag.name
    }
    return this.props.mutateAddTag({
      variables: {...tagData},
      refetchQueries: [ { query: ListMsgInfosQuery }]
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

  componentDidMount() {
    this.setState({
      roomId: HipchatWindow.roomId(),
      hipchatUserId: HipchatWindow.userId()
    });
  }

  componentWillMount() {
    this.unsubscribe = this.props.subscribeToNewMsgInfo();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    if (this.props.data?.error) {
      log("CornCobsContainer: Error in graphql data: " + this.props.data.error);
      return null;
    }

    if (this.props.data?.loading) {
      log("CornCobsContainer: Loading data, not rendering yet.");
      return null;
    }

    let tags = {};
    let recentTagNames = [];
    let reactions = {};
    if (this.props.msgInfos) {
      tags = this.props.msgInfos.tagsByMid;
      recentTagNames = this.props.msgInfos.recentTagNames;
      reactions = this.props.msgInfos.reactionsByMid;
    }

    return (
      <CornCobs
        tags={tags}
        reactions={reactions}
        msgElements={this.props.msgElements}
        onFilterByTag={this.props.onFilterByTag}
        onToggleReaction={this.handleToggleReaction}
        onAddTag={this.handleAddTag}
        recentTagNames={recentTagNames}
        roomId={this.state.roomId} />
    );
  }
}

CornCobsContainer.propTypes = {
  onFilterByTag: PropTypes.func.isRequired,
  msgElements: PropTypes.array.isRequired
};


// Clean up the graphql data we get back into a more usable structure for CornCobs.
// Returns de-duped tags fetched from graphql, keyed off the msginfo mid, e.g.:
// Given props.data: {
//   listMsgInfos: {
//     items: [
//       null,
//       null,
//       {mid: "699a1266-c937-44d8-bf54-2fa40c59005c", tags: [{name: "Red"},{name: "Blue"}] },
//       {mid: "deadbeef-c937-44d8-bf54-bf54bf54bf54", tags: [{name: "Green"},{name: "Green"}] }
//     ]
//   }
// }
// Return:
// {
//  tagsByMid: {"699a1266-c937-44d8-bf54-2fa40c59005c": [{name: "Red"},{name: "Blue"}],
//              "deadbeef-c937-44d8-bf54-bf54bf54bf54": [{name: "Green"}] },
//  recentTagNames: ["Red", "Blue", "Green"]
// }
const mapResultsToProps = ({ data, ownProps }) => {
  let result = {
    tagsByMid: {},
    recentTagNames: [],
    reactionsByMid: {}
  }
  let tags = {};
  let reactions = {};
  let allDistinctTags = {};
  if (data && !data.loading && data.listMsgInfos) {
    data.listMsgInfos.items.forEach((midItem) => {
      if (midItem && midItem.mid) {

        // filter out duplicate tags
        const distinctTags = {};
        if (midItem.tags) {
          midItem.tags.forEach(tag => {
            distinctTags[tag.name] = tag;
            allDistinctTags[tag.name] = tag;
          });
        }
        tags[midItem.mid] = Object.values(distinctTags);

        // Compute totals of emoji reactions provided by each user.
        const distinctReactions = {};
        midItem.reactions?.forEach(reaction => {
          // See: resolvers/addReaction.yaml
          const [ emoji, userId ] = reaction.split("--")
          const distinctReaction = distinctReactions[emoji] || {
            distinctUsers: {},
            count: 0
          };
          distinctReaction.distinctUsers[userId] = 1;
          distinctReaction.count =
            Object.keys(distinctReaction.distinctUsers).length;
          distinctReactions[emoji] = distinctReaction;
        });
        reactions[midItem.mid] = distinctReactions;
      }
    });
    result.tagsByMid = tags,
    result.recentTagNames = Object.keys(allDistinctTags)
    result.reactionsByMid = reactions;
  }
  return result;
}

const getMids = function(msgElements) {
  return msgElements.map((item) => item.msgId)
}

// Populate this.props.data with GraphQL data
export default compose(
  graphql(AddTagMutation, { name: 'mutateAddTag' }),
  graphql(AddReactionMutation, { name: 'mutateAddReaction' }),
  graphql(RemoveReactionMutation, { name: 'mutateRemoveReaction' }),
  graphql(ListMsgInfosQuery, {
    // Specify input variables to the query:
    options: (ownProps) => ({
      fetchPolicy: 'cache-and-network',
      variables: {
        mids: getMids(ownProps.msgElements)
      }
    }),
    // Handle the response from GraphQL for ListMsgInfosQuery:
    props: (resultProps) => {
      return {
        loading: resultProps.data.loading,
        error: resultProps.data.error,
        // Convert GraphQL response to a nicer looking data structure:
        msgInfos: mapResultsToProps(resultProps),
        // Expose a subscription function to listen for updates:
        subscribeToNewMsgInfo: (params) => {
          resultProps.data.subscribeToMore({
            document: SubMsgInfo,
            updateQuery: (prev, current) => {
              let { subscriptionData: { data : { changedMsgInfo } } } = current;
              return {
                ...prev,
                listMsgInfos: {
                  __typename: 'MsgInfoList',
                  // Add the changed item into the items array
                  items: [changedMsgInfo, ...prev.listMsgInfos.items.filter(item => item?.mid !== changedMsgInfo.mid)]
                }
              }
            }
          });
        }
      }
    }
  })
)(CornCobsContainer);
