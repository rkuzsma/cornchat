import log from '../logger';
import PropTypes from 'prop-types';
import AddTagDialog from './add-tag-dialog';

class AddTagButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowAddTagDialog: false
    };
    this.toggleAddTagDialog = this.toggleAddTagDialog.bind(this);
  }

  toggleAddTagDialog() {
    this.setState({
      isShowAddTagDialog: !this.state.isShowAddTagDialog
    });
  }

  render() {
    return (
      <span>
        <span className='CORN-addTag' onClick={this.toggleAddTagDialog}>+</span>
        <AddTagDialog
          show={this.state.isShowAddTagDialog}
          onClose={this.toggleAddTagDialog}
          onAddTag={this.props.onAddTag} />
      </span>
    );
  }
}

AddTagButton.propTypes = {
  onAddTag: PropTypes.func.isRequired,
};

export default AddTagButton;
