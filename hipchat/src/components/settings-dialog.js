import log from '../logger';
import React from "react";
import ReactDOM from "react-dom";
import Constants from '../constants';
import Utils from '../utils';
import PropTypes from 'prop-types';
import ApiToken from '../api-token';
import Msg from './msg';

class SettingsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: props.token,
      errorMsg: '',
      statusMsg: '',
      successMsg: '',
      successMsgExpiry: null
    };

    this.handleTokenChange = this.handleTokenChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleStatus = this.handleStatus.bind(this);
    this.generateToken = this.generateToken.bind(this);
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

  handleError(errorMsg) {
    this.setState({errorMsg: errorMsg});
  }

  handleStatus(statusMsg) {
    this.setState({statusMsg: statusMsg});
  }

  handleSuccess(successMsg) {
    log(`handleSuccess(${successMsg})`);
    this.setState({successMsg: successMsg});
    // Clear the success message in 5s
    if (this.state.successMsgExpiry) {
      log(`handleSuccess: clearTimeout`);
      window.clearTimeout(this.state.successMsgExpiry);
    }
    log(`handleSuccess: setTimeout`);
    var expiry = window.setTimeout(() => {
      log(`handleSuccess: timeout reached, resetting successMsg`);
      this.setState({successMsg: ''});
    }, 5000);
    this.setState({successMsgExpiry: expiry});
  }

  generateToken() {
    var email = prompt("Please enter your e-mail address:", "");
    if (email == null || email == "") {
        return;
    }

    this.handleError("");
    this.handleSuccess("");
    this.handleStatus(`Generating token for ${email}. Please wait...`);
    ApiToken.generateToken(email, (err, data) => {
      this.handleStatus("");
      if (err) {
        log("Error generating token: " + err);
        this.handleError("Unexpected error generating API token.");
      }
      else {
        var output = JSON.parse(data.Payload);
        if (output.created) {
          log("Generated token " + output.apiToken);
          this.handleSuccess("Generated a token.");
          this.handleTokenChange({target: { value: output.apiToken} });
        } else {
          log("API Token not generated.");
          this.handleError("Unexpected error generating API token.");
        }
      }
    });
  }

  render() {
    // Render nothing if the "show" prop is false
    if(!this.props.show) {
      return null;
    }

    const launchLearnMore = function() {
      Utils.openExternalWindow(Constants.learn_more_url);
    }

    return (
      <div className="CORN-dialog" id="CORN_logoDialog">
        <div>
          <div className="CORN-clearfix">
            <h1 className="CORN-dialog-heading">CornChat Settings</h1>
            <span className="CORN-dialog-x" onClick={this.props.onClose}>x</span>
          </div>
          <hr/>
          <Msg className="CORN-error" msg={this.state.errorMsg} />
          <Msg className="CORN-success" msg={this.state.successMsg} />
          <Msg className="CORN-info" msg={this.state.statusMsg} />
          <form>
            <label>
              CornChat API Token:<br/>
              <input type="text" value={this.state.token} onChange={this.handleTokenChange} size="35" />
              <button className="CORN-button" onClick={this.generateToken}>Generate</button>
            </label>
            <p/>
            <button className="CORN-button-default" onClick={this.handleSubmit}>Save</button>
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
