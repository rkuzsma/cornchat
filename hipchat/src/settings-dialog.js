import log from './logger';
import React from "react";
import ReactDOM from "react-dom";
import constants from './constants';
import utils from './utils';
import PropTypes from 'prop-types';

class SettingsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: props.token
    };

    this.handleTokenChange = this.handleTokenChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleTokenChange(event) {
    this.setState({token: event.target.value});
  }

  handleSubmit(event) {
    this.props.onSettingsChanged({
      token: this.state.token
    });
    this.props.onClose();
    event.preventDefault();
  }


  render() {
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    const launchLearnMore = function() {
      utils.openExternalWindow(constants.learn_more_url);
    }

    const launchGenerateToken = function() {
      utils.openExternalWindow(constants.create_account_url);
    }

    return (
      <div className="CORN-dialog" id="CORN_logoDialog">
        <div>
          <div className="CORN-clearfix">
            <h1 className="CORN-dialog-heading">CornChat Settings</h1>
            <span className="CORN-dialog-x" onClick={this.props.onClose}>x</span>
          </div>
          <hr/>

          <form onSubmit={this.handleSubmit}>
            <label>
              CornChat API Token:
              <input type="text" value={this.state.token} onChange={this.handleTokenChange} />
              <button className="CORN-button" onClick={launchGenerateToken}>Generate</button>
            </label>
            <p/>
            <input className="CORN-button" type="submit" value="Save" />
          </form>
          <p>&nbsp;</p>
          <p><i>Why does CornChat require a token?</i></p>
          <p>CornChat stores message tags on its own server. The token prevents abuse. Learn more at the <a onClick={launchLearnMore}>CornChat GitHub page</a></p>
        </div>
      </div>
    );
  }
}

SettingsDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSettingsChanged: PropTypes.func.isRequired,
  show: PropTypes.bool,
  token: PropTypes.string
};

export default SettingsDialog;
