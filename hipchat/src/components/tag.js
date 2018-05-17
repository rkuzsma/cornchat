import log from '../logger';
import PropTypes from 'prop-types';

class Tag extends React.Component {
  constructor(props) {
    super(props);
    this.handleClickTag = this.handleClickTag.bind(this);
  }

  handleClickTag() {
    this.props.onClickTag(this.props.tag);
  }

  render() {
    return (
      <div className='CORN-tag' onClick={this.handleClickTag}>{this.props.tag.name}</div>
    );
  }
}

Tag.propTypes = {
  tag: PropTypes.object,
  onClickTag: PropTypes.func.isRequired
};

export default Tag;
