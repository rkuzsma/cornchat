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

class CornCobsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roomId: ''
    }
    this.handleAddTag = this.handleAddTag.bind(this);
  }

  handleAddTag(tag, msgId) {
    const tagData = {
      mid: msgId,
      room: this.state.roomId,
      name: tag.name
    }
    // TODO Error handling
    return this.props.mutate({
      variables: {...tagData},
      optimisticResponse: {
        __typename: 'Mutation',
        addTag: { ...tagData,  __typename: 'Tag' }
      },
      update: (proxy, { data: { newReaction } }) => {
        // TODO
        /*const data = proxy.readQuery({ query: ListMsgInfosQuery });
        data.listMsgInfo.items.push(newReaction);
        proxy.writeQuery({ query: ListMsgInfosQuery, data });*/
      }
    });
  }

  componentDidMount() {
    this.setState({
      roomId: HipchatWindow.roomId()
    });
  }

  componentWillMount() {
    log("subscribing!!!!!!!!!!!!!!");
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

    log("!!! render() props:");
    console.dir(this.props);

    let tags = {};
    let recentTagNames = [];
    if (this.props.msgInfos) {
      log("!!!Got msgInfos");
      tags = this.props.msgInfos.tagsByMid;
      recentTagNames = this.props.msgInfos.recentTagNames;
    }
    else {
      log("!!! No MsgInfos");
    }

    return (
      <CornCobs
        tags={tags}
        msgElements={this.props.msgElements}
        onFilterByTag={this.props.onFilterByTag}
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
    recentTagNames: []
  }
  let tags = {};
  let allDistinctTags = {};
  if (data && !data.loading && data.listMsgInfos) {
    data.listMsgInfos.items.forEach((midItem) => {
      if (midItem && midItem.mid && midItem.tags) {
        // filter out duplicate tags
        const distinctTags = {};
        if (midItem.tags) {
          midItem.tags.forEach(tag => {
            distinctTags[tag.name] = tag;
            allDistinctTags[tag.name] = tag;
          });
        }
        tags[midItem.mid] = Object.values(distinctTags);
      }
    });
    result.tagsByMid = tags,
    result.recentTagNames = Object.keys(allDistinctTags)
  }
  return result;
}

const getMids = function(msgElements) {
  return msgElements.map((item) => item.msgId)
}

// Populate this.props.data
export default compose(
  graphql(AddTagMutation),
  graphql(ListMsgInfosQuery, {
    props: (resultProps) => {
      console.log("props func:");
      console.dir(resultProps);
      return {
        loading: resultProps.data.loading,
        error: resultProps.data.error,
        msgInfos: mapResultsToProps(resultProps),
        subscribeToNewMsgInfo: (params) => {
          resultProps.data.subscribeToMore({
            document: SubMsgInfo,
            updateQuery: (prev, current) => {
              // { subscriptionData: { data : { changedMsgInfo } } }
              log("UPDATE_QUERY!!!");
              console.dir(current);
              return {
                ...prev,
                listMsgInfos: {
                  __typename: 'MsgInfoList',
                  // Add the changed item into the items array
                  items: [changedMsgInfo, ...prev.listMsgInfos.items.filter(item => item.mid !== changedMsgInfo.mid)]
                }
              }
            }
          });
        }
      }
    },
    options: (ownProps) => ({
      fetchPolicy: 'cache-and-network',
      variables: {
        mids: getMids(ownProps.msgElements)
      }
    })
  })
)(CornCobsContainer);
