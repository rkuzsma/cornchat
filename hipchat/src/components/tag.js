import log from '../logger';
import PropTypes from 'prop-types';

class Tag extends React.Component {
  constructor(props) {
    super(props);
    this.handleFilterByTag = this.handleFilterByTag.bind(this);
  }

  handleFilterByTag(event) {
    alert('clicked');
    this.props.onFilterByTag(this.props.tag);
  }

  render() {
    return (
      <span className='CORN-tag' onClick={this.handleFilterByTag}>
        {this.props.tag.name}
      </span>
    );
  }
}

Tag.propTypes = {
  tag: PropTypes.object,
  onFilterByTag: PropTypes.func.isRequired
};

export default Tag;
