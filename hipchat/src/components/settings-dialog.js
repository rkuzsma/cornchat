import log from '../logger';
import React from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

class SettingsDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onSettingsChanged: PropTypes.func.isRequired,
    show: PropTypes.bool,
    settingValues: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      isApplyMarkdown: props.settingValues.isApplyMarkdown
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleSubmit(event) {
    log("SettingsDialog: handleSubmit");
    event.preventDefault();
    this.props.onSettingsChanged({
      isApplyMarkdown: this.state.isApplyMarkdown
    });
    this.props.onClose();
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    log("Setting " + name +" to " + value);
    this.setState({
      [name]: value
    });
  }

  render() {
    if(!this.props.show) {
      return null;
    }

    return (
      <div className="CORN-dialog" id="CORN_logoDialog">
        <div>
          <div className="CORN-clearfix">
            <h1 className="CORN-dialog-heading">CornChat Settings</h1>
            <span className="CORN-dialog-x" onClick={this.handleSubmit}>x</span>
          </div>
          <hr/>
          <form>
            <label>
              <input name="isApplyMarkdown" type="checkbox" checked={this.state.isApplyMarkdown} onChange={this.handleInputChange} size="35" />
              Apply Markdown Formatting to Messages
            </label>
            <p/>
            <button className="CORN-button-default" onClick={this.handleSubmit}>Close</button>
          </form>
        </div>
      </div>
    );
  }
}

export default SettingsDialog;
