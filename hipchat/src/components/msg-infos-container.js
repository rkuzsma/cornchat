import log from '../logger';
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';

import { graphql } from 'react-apollo';
import ListMsgInfosQuery from '../queries/listMsgInfos';
import SubMsgInfo from '../subscriptions/subMsgInfo';

class MsgInfosContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired,
    msgElements: PropTypes.array.isRequired,
    hipchatUserId: PropTypes.number.isRequired
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    log("MsgInfosContainer: subscribeToNewMsgInfo");
    this.unsubscribe = this.props.subscribeToNewMsgInfo();
  }

  componentWillUnmount() {
    log("MsgInfosContainer: unsubscribe");
    this.unsubscribe();
  }

  render() {
    log("MsgInfosContainer.render()");

    if (this.props.error) {
      log("MsgInfosContainer: Error in graphql data: " + JSON.stringify(this.props.error));
      return null;
    }

    if (this.props.loading) {
      log("MsgInfosContainer: Loading data, not rendering yet.");
      return null;
    }

    if (!this.props.msgInfos) {
      log("MsgInfosContainer: No Info yet.");
      return null;
    }

    log("MsgInfosContainer.render() this.props.msgInfos.reactionsByMid.length=" + Object.values(this.props.msgInfos.reactionsByMid).length);
    return this.props.renderProp({
      msgInfos: this.props.msgInfos
    });
  }
}

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
          distinctReaction.emoji = emoji;
          distinctReaction.isMyReaction = (userId == ownProps.hipchatUserId);
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
  let mids = [''];
  if (msgElements && msgElements.length > 0) {
    mids = msgElements.map((item) => item.msgId);
  }
  return mids;
}

// Populate this.props.data with GraphQL data
export default graphql(ListMsgInfosQuery, {
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
          return resultProps.data.subscribeToMore({
            document: SubMsgInfo,
            updateQuery: (prev, current) => {
              log("MsgInfosContainer: updateQuery");
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
})(MsgInfosContainer);
