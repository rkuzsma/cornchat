import log from '../logger';
import ReactDOM from "react-dom";
import Constants from '../constants';
import PropTypes from 'prop-types';
import MsgElementsStore from '../msg-elements-store';
import CornCobs from './corn-cobs';
import HipchatWindow from '../hipchat-window';

import GetMsgInfosQuery from '../queries/getMsgInfos';
import { graphql } from 'react-apollo';
import AddTagMutation from '../mutations/addTag';
import { compose } from 'react-apollo';

class CornCobsContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roomId: ''
    }
    this.handleAddTag = this.handleAddTag.bind(this);
    this.distinctTagsByMid = this.distinctTagsByMid.bind(this);
    this.recentTagNames = this.recentTagNames.bind(this);
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
        /*const data = proxy.readQuery({ query: GetMsgInfoQuery });
        data.listMsgInfo.items.push(newReaction);
        proxy.writeQuery({ query: GetMsgInfoQuery, data });*/
      }
    });
  }

  componentDidMount() {
    this.setState({
      roomId: HipchatWindow.roomId()
    });
  }

  componentWillUnmount() {
  }

  // Returns de-duped tags fetched from graphql, keyed off the msginfo mid, e.g.:
  // Given this.props.data: {
  //   getMsgInfos: [
  //     null,
  //     null,
  //     {mid: "699a1266-c937-44d8-bf54-2fa40c59005c", tags: [{name: "Red"},{name: "Blue"}] },
  //     {mid: "deadbeef-c937-44d8-bf54-bf54bf54bf54", tags: [{name: "Green"},{name: "Green"}] }
  //   ]
  // }
  // Return:
  // {"699a1266-c937-44d8-bf54-2fa40c59005c": [{name: "Red"},{name: "Blue"}],
  //  "deadbeef-c937-44d8-bf54-bf54bf54bf54": [{name: "Green"}] } }
  distinctTagsByMid() {
    let tags = {};
    if (this.props.data && this.props.data.getMsgInfos) {
      this.props.data.getMsgInfos.forEach((midItem) => {
        if (midItem && midItem.mid && midItem.tags) {
          // filter out duplicate tags
          const distinctTags = {};
          if (midItem.tags) {
            midItem.tags.forEach(tag => {
              distinctTags[tag.name] = tag;
            });
          }
          tags[midItem.mid] = Object.values(distinctTags);
        }
      });
    }
    return tags;
  }

  // returns e.g.: ["Red", "Blue", "Green"]
  recentTagNames() {
    const distinctTags = {};
    Object.values(this.distinctTagsByMid()).forEach(tagsArray => {
      tagsArray.forEach(tag => distinctTags[tag.name] = tag);
    });
    return Object.keys(distinctTags);
  }

  render() {
    if (this.props.data.error) {
      log("CornCobsContainer: Error in graphql data: " + this.props.data.error);
      return;
    }

    let tags = {};
    let recentTagNames = [];
    if (!this.props.data.loading) {
      tags = this.distinctTagsByMid();
      recentTagNames = this.recentTagNames();
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

// Populate this.props.data
export default compose(
  graphql(GetMsgInfosQuery, {
    options: (ownProps) => ({
      fetchPolicy: 'cache-and-network',
      variables: {
        // TODO Prevent err "Keys can't be empty"
        mids: ownProps.msgElements.map((item) => item.msgId)
      }
    })
  }),
  graphql(AddTagMutation)
)(CornCobsContainer);
