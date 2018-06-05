import log from '../logger';
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types';

import { graphql } from 'react-apollo';
import ListMsgInfosQuery from '../queries/listMsgInfos';
import SubMsgInfo from '../subscriptions/subMsgInfo';

// AWS DynamoDB only allows BatchGetItem of at most 100 items at a time.
// Therefore, we fetch all MsgInfo records in batches of 100.
const MAX_DYNAMO_DB_ITEMS=100;

class MsgInfosContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired,
    msgElements: PropTypes.array.isRequired,
    hipchatUserId: PropTypes.number.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillUnmount() {
    log("MsgInfosContainer: unsubscribe");
    this.unsubscribe();
  }

  componentDidMount() {
    log("MsgInfosContainer: componentDidMount");
    this.unsubscribe = this.props.subscribeToNewMsgInfo();
  }

  componentDidUpdate(prevProps, prevState) {
    log("MsgInfosContainer: componentDidUpdate");

    if (!this.props.loading) {
      // Check if there are any new HipChat messages to fetch

      const currentMids = msgIds(this.props.msgElements);
      const alreadyFetchedMids = this.props.msgInfos.allDistinctMids;
      const midsQueuedForFetch = this.state.midsQueuedForFetch || {};
      const newMids = currentMids.filter((mid) => (!alreadyFetchedMids[mid] && !midsQueuedForFetch[mid]));
      if (newMids.length > 0) {
        newMids.forEach((mid) => midsQueuedForFetch[mid] = true);
        this.setState({ midsQueuedForFetch: midsQueuedForFetch });

        let cursor = 0;
        while(true) {
          const someMids = newMids.slice(cursor, cursor + MAX_DYNAMO_DB_ITEMS);
          if (someMids.length == 0) return;
          log("MsgInfosContainer: fetchMoreMsgInfos: " + cursor + " to " + (cursor + MAX_DYNAMO_DB_ITEMS));
          cursor += MAX_DYNAMO_DB_ITEMS;
          this.props.fetchMoreMsgInfos(someMids);
        }
      }
    }
  }

  render() {
    log("MsgInfosContainer.render() " + (this.props.msgInfos?.allMids?.length) + " mids");

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

    return this.props.renderProp({
      msgInfos: this.props.msgInfos
    });
  }
}

const emptyMsgInfos = () => {
  return {
    allMids: [],
    allDistinctMids: {},
    tagsByMid: {},
    reactionsByMid: {},
    allDistinctTags: {},
    recentTagNames: []
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
//
// This method merges new data onto an existingMsgInfos props
// Warning: existingMsgInfos is mutated in place to avoid the overhead of a copy.
// Callers should use the returned result and not their mutated existingMsgInfos.
const mapResultsToProps = (data, existingMsgInfos, hipchatUserId) => {
  let { allMids, allDistinctMids, tagsByMid, reactionsByMid, allDistinctTags, recentTagNames } =
   (existingMsgInfos || emptyMsgInfos());

   log("MsgInfosContainer: mapResultsToProps called; existingMsgInfos:");
   console.dir(existingMsgInfos);

  if (data && !data.loading && data.listMsgInfos) {
    data.listMsgInfos.items.forEach((midItem) => {
      if (midItem && midItem.mid) {
        allDistinctMids[midItem.mid] = true;

        // filter out duplicate tags
        const distinctTags = {};
        if (midItem.tags) {
          midItem.tags.forEach(tag => {
            distinctTags[tag.name] = tag;
            allDistinctTags[tag.name] = tag;
          });
        }
        tagsByMid[midItem.mid] = Object.values(distinctTags);

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
          distinctReaction.isMyReaction = (userId == hipchatUserId);
          distinctReaction.distinctUsers[userId] = 1;
          distinctReaction.count =
            Object.keys(distinctReaction.distinctUsers).length;
          distinctReactions[emoji] = distinctReaction;
        });
        reactionsByMid[midItem.mid] = distinctReactions;
      }
    });
    recentTagNames = Object.keys(allDistinctTags);
    allMids = Object.keys(allDistinctMids);
  }
  const result = {
    allMids: allMids,
    allDistinctMids: allDistinctMids,
    tagsByMid: tagsByMid,
    reactionsByMid: reactionsByMid,
    allDistinctTags: allDistinctTags,
    recentTagNames: recentTagNames
  }
  log("MsgInfosContainer: mapResultsToProps result:");
  console.dir(result);
  return result;
}

const someMids = function(msgElements, cursor) {
  return msgElements
    .slice(cursor, cursor + MAX_DYNAMO_DB_ITEMS)
    .map((item) => item.msgId);
}

const msgIds = (msgElements) => {
  return msgElements.map((item) => item.msgId);
}

// Populate this.props.data with GraphQL data
export default graphql(ListMsgInfosQuery, {
    // Specify input variables to the query:
    options: (ownProps) => ({
      fetchPolicy: 'cache-and-network',
      variables: {
        mids: someMids(ownProps.msgElements, 0)
      }
    }),
    // Handle the response from GraphQL for ListMsgInfosQuery:
    props: (resultProps) => {
      log("!!!! graphql:");
      console.dir(resultProps);
      return {
        loading: resultProps.data.loading,
        error: resultProps.data.error,
        // Convert GraphQL response to a nicer looking data structure:
        msgInfos: mapResultsToProps(
          resultProps.data,
          resultProps.ownProps.msgInfos,
          resultProps.ownProps.hipchatUserId
        ),
        // Expose a subscription function to listen for updates:
        subscribeToNewMsgInfo: (params) => {
          log("MsgInfosContainer: subscribeToNewMsgInfo");
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
        },
        // Expose a function to fetch more msgInfos (paging for > 100 items)
        fetchMoreMsgInfos: (midsToFetch) => {
          log("MsgInfosContainer: fetchMoreMsgInfos for " + midsToFetch.length + " mids");
          if (midsToFetch.length === 0) {
            return null;
          }
          return resultProps.data.fetchMore({
            query: ListMsgInfosQuery,
            variables: { mids: midsToFetch },
            updateQuery: (previousResult, { fetchMoreResult }) => {
              log("MsgInfosContainer: fetchMoreMsgInfos: updateQuery with " + fetchMoreResult.listMsgInfos.items.length + " more results");
              const mergedItems = [
                ...previousResult.listMsgInfos.items,
                ...fetchMoreResult.listMsgInfos.items,
              ];
              const mergedResult = Object.assign({}, previousResult, {
                listMsgInfos: {
                  items: mergedItems,
                  __typename: "MsgInfoList"
                }
              });
              return mergedResult;
            }
          });
        }
      }
    }
})(MsgInfosContainer);
