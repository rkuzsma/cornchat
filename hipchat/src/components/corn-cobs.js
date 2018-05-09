import log from '../logger';
import React from "react";
import ReactDOM from "react-dom";
import CornCob from './corn-cob';
import CornCobPortal from './corn-cob-portal';
import Constants from '../constants';
import PropTypes from 'prop-types';

class CornCobs extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.msgElements) return null;

    const cobs = this.props.msgElements.map((item) =>
      <CornCobPortal msgEl={item.msgEl} key={item.msgId} >
        <CornCob
          tags={this.props.tags[item.msgId]}
          onFilterByTag={this.props.onFilterByTag}
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

CornCobs.propTypes = {
  tags: PropTypes.object.isRequired,
  thumbs: PropTypes.object.isRequired,
  msgElements: PropTypes.object.isRequired,
  onFilterByTag: PropTypes.func.isRequired,
  onThumbsUp: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  recentTagNames: PropTypes.array,
  roomId: PropTypes.string.isRequired
};

export default CornCobs;
