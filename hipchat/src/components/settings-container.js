import log from '../logger';
import PropTypes from 'prop-types';

class SettingsContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      isShowSettings: false,
      // All the settings:
      isApplyMarkdown: this.getBooleanPersistedSetting("CORN_isApplyMarkdown", true),
      enableCornChat: this.getBooleanPersistedSetting("CORN_enableCornChat", true)
    };
    this.toggleSettingsDialog = this.toggleSettingsDialog.bind(this);
    this.getPersistedSetting = this.getPersistedSetting.bind(this);
    this.getBooleanPersistedSetting = this.getBooleanPersistedSetting.bind(this);
    this.setIsApplyMarkdown = this.setIsApplyMarkdown.bind(this);
    this.setEnableCornChat = this.setEnableCornChat.bind(this);
    this.handleChangeSettings = this.handleChangeSettings.bind(this);
  }

  getPersistedSetting(settingName, defaultValue) {
    let val = window.localStorage.getItem(settingName);
    log("SettingsContainer: getPersistedSetting: " + settingName + "=" + val);
    val = (val === undefined || val === null) ? defaultValue : val;
    log("SettingsContainer: getPersistedSetting: " + settingName + "=" + val);
    return val;
  }

  getBooleanPersistedSetting(settingName, defaultValue) {
    const val = this.getPersistedSetting(settingName, defaultValue);
    return (val === "true" || val === true);
  }

  persistSetting(settingName, val) {
    log("SettingsContainer: persistSetting(" + settingName + "," + val + ")");
    window.localStorage.setItem(settingName, val);
  }

  setIsApplyMarkdown(isApplyMarkdown) {
    log("SettingsContainer: setIsApplyMarkdown: " + isApplyMarkdown);
    this.persistSetting("CORN_isApplyMarkdown", isApplyMarkdown);
    this.setState({ isApplyMarkdown: isApplyMarkdown });
  }

  setEnableCornChat(enableCornChat) {
    log("SettingsContainer: setEnableCornChat: " + enableCornChat);
    this.persistSetting("CORN_enableCornChat", enableCornChat);
    this.setState({ enableCornChat: enableCornChat });
  }

  toggleSettingsDialog() {
    this.setState({isShowSettings: !this.state.isShowSettings});
  }

  handleChangeSettings(newSettings) {
    log("SettingsContainer: handleChangeSettings:");
    console.dir(newSettings);
    if (newSettings.isApplyMarkdown !== undefined) {
      this.setIsApplyMarkdown(newSettings.isApplyMarkdown);
    }
    if (newSettings.enableCornChat !== undefined) {
      this.setEnableCornChat(newSettings.enableCornChat);
    }
  }

  render() {
    return this.props.renderProp({
      onToggleSettingsDialog: this.toggleSettingsDialog,
      isShowSettings: this.state.isShowSettings,
      onChangeSettings: this.handleChangeSettings,
      settingValues: {
        isApplyMarkdown: this.state.isApplyMarkdown,
        enableCornChat: this.state.enableCornChat
      }
    });
  }
}

export default SettingsContainer;
