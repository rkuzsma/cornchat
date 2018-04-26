import log from '../logger';
import PropTypes from 'prop-types';
import ThumbsUpButton from './thumbs-up-button';
import AddTagButton from './add-tag-button';
import Tags from './tags';
import TagsPortal from './tags-portal';
import React from 'react';
import AddReactionButton from './add-reaction-button';

class CornCob extends React.Component {
  constructor(props) {
    super(props);
    this.handleThumbsUp = this.handleThumbsUp.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
    this.handleAddReaction = this.handleAddReaction.bind(this);
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

  handleAddReaction(reaction) {
    alert('Add reaction:' + reaction);
  }

  render() {

    const addTagButton = this.state.isSavingTags ? (
      <span className="saving"><span>.</span><span>.</span><span>.</span></span>
    ) : (
      <AddTagButton onAddTag={this.handleAddTag} recentTagNames={this.props.recentTagNames} />
    );

    return(
      <div ref={this.cornCobRef}>
        <AddReactionButton onAddReaction={this.handleAddReaction} />
        <ThumbsUpButton onThumbsUp={this.handleThumbsUp} thumbs={this.props.thumbs} />
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
  thumbs: PropTypes.string,
  onFilterByTag: PropTypes.func.isRequired,
  msgId: PropTypes.string,
  msgEl: PropTypes.object,
  onAddTag: PropTypes.func.isRequired,
  onThumbsUp: PropTypes.func.isRequired,
  recentTagNames: PropTypes.array
};

export default CornCob;
