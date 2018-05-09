import log from '../logger';
import PropTypes from 'prop-types';
import AddTagButton from './add-tag-button';
import Tags from './tags';
import TagsPortal from './tags-portal';
import React from 'react';
import AddReactionContainer from './add-reaction-container';

class CornCob extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddTag = this.handleAddTag.bind(this);
    this.state = {
      isSavingTags: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return({isSavingTags: false});
  }

  handleThumbsUp() {
    this.props.onThumbsUp(this.props.msgId);
  }

  handleAddTag(tag) {
    this.setState({isSavingTags: true});
    this.props.onAddTag(tag, this.props.msgId);
  }

  render() {

    const addTagButton = this.state.isSavingTags ? (
      <span className="saving"><span>.</span><span>.</span><span>.</span></span>
    ) : (
      <AddTagButton onAddTag={this.handleAddTag} recentTagNames={this.props.recentTagNames} />
    );

    return(
      <div ref={this.cornCobRef}>
        <AddReactionContainer msgId={this.props.msgId} roomId={this.props.roomId} />
        {addTagButton}
        <TagsPortal msgEl={this.props.msgEl}>
          <Tags msgEl={this.props.msgEl} tags={this.props.tags} onFilterByTag={this.props.onFilterByTag} />
        </TagsPortal>
      </div>
    );
  }
}

CornCob.propTypes = {
  tags: PropTypes.array,
  onFilterByTag: PropTypes.func.isRequired,
  msgId: PropTypes.string.isRequired,
  msgEl: PropTypes.object.isRequired,
  onAddTag: PropTypes.func.isRequired,
  recentTagNames: PropTypes.array,
  roomId: PropTypes.string.isRequired
};

export default CornCob;
