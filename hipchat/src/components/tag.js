import log from '../logger';
import PropTypes from 'prop-types';

class Tag extends React.Component {
  constructor(props) {
    super(props);
    this.handleFilterByTag = this.handleFilterByTag.bind(this);
  }

  handleFilterByTag(event) {
    this.props.onFilterByTag(this.props.tag);
  }

  render() {
    return (
      <span className='CORN-tag' onClick={this.handleFilterByTag}>
        <span>
          {this.props.tag.name}
        </span>
      </span>
    );
  }
}

Tag.propTypes = {
  tag: PropTypes.object,
  onFilterByTag: PropTypes.func.isRequired
};

export default Tag;
