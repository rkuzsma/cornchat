import log from '../logger';
import PropTypes from 'prop-types';
import MsgInfoStore from '../msg-info-store';
import {Typeahead} from 'react-typeahead';

class AddTagDialog extends React.Component {
  constructor(props) {
    super(props);
    this.msgInfoStore = new MsgInfoStore();
    this.state = {
      tagName: ''
    };
    this.handleTagNameChange = this.handleTagNameChange.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleOptionSelected = this.handleOptionSelected.bind(this);
  }

  handleTagNameChange(event) {
    this.setState({tagName: event.target.value});
  }

  handleOptionSelected(option) {
    alert(option);
  }

  handleAddTag() {
    this.props.onAddTag({
      name: this.state.tagName
    });
    this.props.onClose();
  }

  handleKeyUp(e) {
    if (e.key === 'Enter') this.handleAddTag();
    else if (e.key === 'Escape') this.props.onClose();
  }

  render() {
    if(!this.props.show) {
      return null;
    }

    return (
      <div className='CORN-addTagDialog' onKeyUp={this.handleKeyUp} >
        <form>
          <Typeahead
            options={this.props.recentTagNames}
            maxVisible={2}
            value={this.state.tagName}
            onOptionSelected={this.handleOptionSelected}
            onChange={this.handleTagNameChange}
            showOptionsWhenEmpty={true}
            allowCustomValues={true}
            inputProps={{autoFocus:true}}
            customClasses={{
              typeahead: "topcoat-list",
              input: "topcoat-text-input",
              results: "topcoat-list__container",
              listItem: "topcoat-list__item",
              token: "topcoat-button",
              customAdd: "topcoat-addme"
            }}
          />
          <br/>
          <br/>
          <br/>
          <input type='button' value='Add Tag' default='true' onClick={this.handleAddTag} />
          <input type='button' value='x' cancel='true' onClick={this.props.onClose} /><br/>
        </form>
      </div>
    );
  }
}

AddTagDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  show: PropTypes.bool,
  recentTagNames: PropTypes.array
};

export default AddTagDialog;
