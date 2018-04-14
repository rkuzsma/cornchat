import log from '../logger';
import PropTypes from 'prop-types';

class ThumbsUpButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <span className='CORN-addTag' onClick={this.props.onThumbsUp}>👍</span>
    );
  }
}

ThumbsUpButton.propTypes = {
  onThumbsUp: PropTypes.func.isRequired,
};

export default ThumbsUpButton;
