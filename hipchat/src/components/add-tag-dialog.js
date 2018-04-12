'use strict';

import log from '../logger';
import PropTypes from 'prop-types';

class AddTagDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tagName: ''
    };
    this.handleTagNameChange = this.handleTagNameChange.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
  }

  handleTagNameChange(event) {
    this.setState({tagName: event.target.value});
  }

  handleAddTag() {
    this.props.onAddTag({
      name: this.state.tagName
    });
    this.props.onClose();
  }

  render() {
    if(!this.props.show) {
      return null;
    }

    return (
      <div className='CORN-addTagDialog'>
        <form>
          <input type='text' size='4' value={this.state.tagName} onChange={this.handleTagNameChange} />
          <input type='button' value='tag' default='true' onClick={this.handleAddTag} />
          <input type='button' value='x' cancel='true' onClick={this.props.onClose} /><br/>
        </form>
      </div>
    );
  }
}

AddTagDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  show: PropTypes.bool
};

export default AddTagDialog;
