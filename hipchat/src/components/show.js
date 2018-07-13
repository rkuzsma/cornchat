import log from '../logger';
import PropTypes from 'prop-types';

class Show extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    renderProp: PropTypes.func.isRequired
  }

  render() {
    if (!this.props.show) {
      return null;
    }

    return this.props.renderProp();
  }
}

export default Show;
