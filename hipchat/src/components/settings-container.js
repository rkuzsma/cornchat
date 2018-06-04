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
      isApplyMarkdown: this.getPersistedSetting("CORN_isApplyMarkdown", true)
    };
    this.toggleSettingsDialog = this.toggleSettingsDialog.bind(this);
    this.setIsApplyMarkdown = this.setIsApplyMarkdown.bind(this);
    this.handleChangeSettings = this.handleChangeSettings.bind(this);
  }

  getPersistedSetting(settingName, defaultValue) {
    let val = window.localStorage.getItem(settingName);
    log("SettingsContainer: getPersistedSetting: " + settingName + "=" + val);
    val = val === undefined ? defaultValue : val;
    log("SettingsContainer: getPersistedSetting: " + settingName + "=" + val);
    return val;
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

  toggleSettingsDialog() {
    this.setState({isShowSettings: !this.state.isShowSettings});
  }

  handleChangeSettings(newSettings) {
    log("SettingsContainer: handleChangeSettings:");
    console.dir(newSettings);
    if (newSettings.isApplyMarkdown !== undefined) {
      this.setIsApplyMarkdown(newSettings.isApplyMarkdown);
    }
  }

  render() {
    log("SettingsContainer: render() with:" + (this.state.isApplyMarkdown));
    return this.props.renderProp({
      onToggleSettingsDialog: this.toggleSettingsDialog,
      isShowSettings: this.state.isShowSettings,
      onChangeSettings: this.handleChangeSettings,
      settingValues: {
        isApplyMarkdown: this.state.isApplyMarkdown
      }
    });
  }
}

export default SettingsContainer;
