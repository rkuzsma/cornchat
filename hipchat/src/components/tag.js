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
      <div className='CORN-tag' onClick={this.handleFilterByTag}>{this.props.tag.name}</div>
    );
  }
}

Tag.propTypes = {
  tag: PropTypes.object,
  onFilterByTag: PropTypes.func.isRequired
};

export default Tag;
