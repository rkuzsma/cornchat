import log from '../logger';
import PropTypes from 'prop-types';
import Tag from './tag';
import React from 'react';

class Tags extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.tags) return null;
    const tagItems = this.props.tags.map((tag) =>
      <Tag
        tag={tag}
        key={tag.name}
        onFilterByTag={this.props.onFilterByTag} />
    );
    return (
      <span className='CORN-tags'>
        {tagItems}
      </span>
    )
  }
}

Tags.propTypes = {
  tags: PropTypes.array,
  onFilterByTag: PropTypes.func.isRequired
};

export default Tags;
