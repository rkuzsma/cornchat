import log from '../logger';
import PropTypes from 'prop-types';
import Tag from './tag';
import React from 'react';

class Tags extends React.Component {
  static propTypes = {
    tags: PropTypes.array,
    onClickTag: PropTypes.func.isRequired
  }
  
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.tags) return null;
    const tagItems = this.props.tags.map((tag) =>
      <Tag
        tag={tag}
        key={tag.name}
        onClickTag={this.props.onClickTag} />
    );
    return (
      <span className='CORN-tags'>
        {tagItems}
      </span>
    )
  }
}

export default Tags;
