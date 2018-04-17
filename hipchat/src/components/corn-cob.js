import log from '../logger';
import PropTypes from 'prop-types';
import ThumbsUpButton from './thumbs-up-button';
import AddTagButton from './add-tag-button';
import Tags from './tags';
import React from 'react';

class CornCob extends React.Component {
  constructor(props) {
    super(props);
    this.handleThumbsUp = this.handleThumbsUp.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
  }

  handleThumbsUp() {
    this.props.onThumbsUp(this.props.msgId);
  }

  handleAddTag(tag) {
    this.props.onAddTag(tag, this.props.msgId);
  }

  render() {
    return(
      <div ref={this.cornCobRef}>
        <ThumbsUpButton onThumbsUp={this.handleThumbsUp} />
        <AddTagButton onAddTag={this.handleAddTag} />
        <Tags tags={this.props.tags} onFilterByTag={this.props.onFilterByTag} />
      </div>
    );
  }
}

CornCob.propTypes = {
  tags: PropTypes.object,
  onFilterByTag: PropTypes.func.isRequired,
  msgId: PropTypes.string,
  onAddTag: PropTypes.func.isRequired,
  onThumbsUp: PropTypes.func.isRequired
};

export default CornCob;
