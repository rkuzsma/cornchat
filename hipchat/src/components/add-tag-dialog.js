import log from '../logger';
import PropTypes from 'prop-types';
import { Creatable } from 'react-select';
import 'react-select/dist/react-select.css';
import ClickOutside from 'react-click-outside';

class AddTagDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tagName: ''
    };
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleOptionSelected = this.handleOptionSelected.bind(this);
    this.clickOutside = this.clickOutside.bind(this);
  }

  clickOutside() {
    this.props.onClose();
  }

  handleOptionSelected(option) {
    const selectedTagName = option.value;
    if (selectedTagName !== '') {
      this.setState({tagName: selectedTagName});
      this.props.onAddTag({
        name: selectedTagName
      });
      this.props.onClose();
    }
  }

  handleKeyUp(e) {
    if (e.key === 'Escape') this.props.onClose();
  }

  render() {
    if(!this.props.show) {
      return null;
    }

    return (
      <div className='CORN-addTagDialog' onKeyUp={this.handleKeyUp} >
        <ClickOutside onClickOutside={this.clickOutside}>
          <div>
            <Creatable
              className='CORN-Select is-clearable is-searchable Select--single'
              placeholder='Add a tag...'
              options={this.props.recentTagNames.map((tagName) => { return {value: tagName, label: tagName} })}
              value={this.state.tagName}
              onChange={this.handleOptionSelected}
              autoFocus={true}
            />
          </div>
        </ClickOutside>
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
