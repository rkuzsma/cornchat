import log from '../logger';
import PropTypes from 'prop-types';
import Tag from './tag';

class Tags extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.tags) {
      log("No tags to render");
      return null;
    }
    const tagItems = this.props.tags.map((tag) =>
      <Tag
        tag={tag}
        onFilterByTag={this.props.onFilterByTag} />
    );
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
