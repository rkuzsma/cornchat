import log from '../logger';
import PropTypes from 'prop-types';
import ApiToken from '../api-token';

class SettingsContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      isShowSettings: false,
      isFirstTime: true,
      // All the settings:
      apiToken: window.localStorage.getItem("CORN_token") || ''
    };
    this.toggleSettingsDialog = this.toggleSettingsDialog.bind(this);
    this.setApiToken = this.setApiToken.bind(this);
    this.handleChangeSettings = this.handleChangeSettings.bind(this);
  }

  setApiToken(apiToken) {
    window.localStorage.setItem("CORN_token", apiToken);
    this.setState({ apiToken: apiToken });
  }

  componentDidMount() {
    if (this.state.isFirstTime && (this.state.apiToken === '')) {
      log("SettingsContainer: No saved API token for first time user. Generating a default API token.");
      ApiToken.generateTokenForCurrentHipChatUser((err, data) => {
        if (err) {
          log("SettingsContainer: Failed to generate default API token. " + err);
          return;
        }
        var output = JSON.parse(data.Payload);
        if (output.created) {
          log("SettingsContainer: Generated token");
          this.setApiToken(output.apiToken);
        }
      });
    }
    this.setState({isFirstTime: false});
  }

  toggleSettingsDialog() {
    this.setState({isShowSettings: !this.state.isShowSettings});
  }

  handleChangeSettings(newSettings) {
    if (newSettings.token) {
      this.setApiToken(newSettings.token);
    }
  }

  render() {
    return this.props.renderProp({
      onToggleSettingsDialog: this.toggleSettingsDialog,
      isShowSettings: this.state.isShowSettings,
      onChangeSettings: this.handleChangeSettings,
      settings: {
        apiToken: this.state.apiToken
      }
    });
  }
}

export default SettingsContainer;
