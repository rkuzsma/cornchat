import log from '../logger';
import PropTypes from 'prop-types';
import Tag from './tag';

class Tags extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // TODO Here's where I left off. this.props.tags are correct, but we're not rendering them right?
    log("-------");
    log(JSON.stringify(this.props.tags));
    const tagItems = this.props.tags.map((tag) =>
      <Tag
        tag={tag}
        onFilterByTag={this.props.onFilterByTag} />
    );
    log("--");
    log(JSON.stringify(tagItems));
    return (
      <span>
        {tagItems}
      </span>
    )
  }
}

Tags.propTypes = {
  tags: PropTypes.object,
  onFilterByTag: PropTypes.func.isRequired
};

export default Tags;
