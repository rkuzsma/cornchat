'use strict';

import log from '../logger';
import PropTypes from 'prop-types';
import TagsStore from '../tags-store';
import ThumbsUpButton from './thumbs-up-button';
import AddTagButton from './add-tag-button';
import Tags from './tags';

class CornCob extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags
    };
    this.handleAddTag = this.handleAddTag.bind(this);
  }


  render() {
    return(
      <div>
        <ThumbsUpButton onThumbsUp={this.props.onThumbsUp} />
        <AddTagButton onAddTag={this.props.onAddTag} />
        <Tags tags={tags} onFilterByTag={this.handleFilterByTag} />
      </div>
    );
  }
}

CornCob.propTypes = {
  tags: PropTypes.object,
  msgId: PropTypes.string,
  onAddTag: PropTypes.func.isRequired,
  onThumbsUp: PropTypes.func.isRequired
};

export default CornCob;
