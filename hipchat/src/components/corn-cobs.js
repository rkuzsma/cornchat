import log from '../logger';
import React from "react";
import ReactDOM from "react-dom";
import CornCob from './corn-cob';
import CornCobPortal from './corn-cob-portal';
import Constants from '../constants';
import PropTypes from 'prop-types';

class CornCobs extends React.Component {
  static propTypes = {
    msgElements: PropTypes.array.isRequired,
    onToggleFilterByTag: PropTypes.func.isRequired,
    onToggleReaction: PropTypes.func.isRequired,
    onAddTag: PropTypes.func.isRequired,
    tagsByMid: PropTypes.object.isRequired,
    recentTagNames: PropTypes.array.isRequired,
    reactionsByMid: PropTypes.object.isRequired,
    roomId: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.msgElements) return null;

    const cobs = this.props.msgElements.map((item) =>
      <CornCobPortal msgEl={item.msgEl} key={item.msgId} >
        <CornCob
          tags={this.props.tagsByMid[item.msgId]}
          reactions={this.props.reactionsByMid[item.msgId]}
          onToggleFilterByTag={this.props.onToggleFilterByTag}
          onToggleReaction={this.props.onToggleReaction}
          onAddTag={this.props.onAddTag}
          msgId={item.msgId}
          msgEl={item.msgEl}
          recentTagNames={this.props.recentTagNames}
          roomId={this.props.roomId} />
      </CornCobPortal>
    );
    return cobs;
  }
}

export default CornCobs;
