import log from '../logger';
import PropTypes from 'prop-types';
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import AddReactionPortal from './add-reaction-portal';
import ClickOutside from 'react-click-outside';

class AddReactionButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowAddReactionDialog: false
    };
    this.toggleAddReactionDialog = this.toggleAddReactionDialog.bind(this);
    this.handlePickEmoji = this.handlePickEmoji.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.clickOutside = this.clickOutside.bind(this);
  }

  clickOutside() {
    this.setState({
      isShowAddReactionDialog: false
    });
  }

  handleKeyUp(e) {
    if (e.key === 'Escape') {
      this.setState({
        isShowAddReactionDialog: false
      });
    }
  }

  toggleAddReactionDialog() {
    this.setState({
      isShowAddReactionDialog: !this.state.isShowAddReactionDialog
    });
  }

  handlePickEmoji(emoji) {
    this.toggleAddReactionDialog();
    this.props.onAddReaction({
      emoji: emoji.id
    });
  }

  render() {
    const dialog = this.state.isShowAddReactionDialog ?
      (
        <div>
          <AddReactionPortal>
            <div onKeyUp={this.handleKeyUp} style={{
              position: 'absolute',
              left: (document.body.offsetWidth - 336 - 100) + 'px',
              top: '20px',
              zIndex: '2'}} >
              <ClickOutside onClickOutside={this.clickOutside}>
                <Picker
                  autoFocus='true'
                  set='emojione'
                  onSelect={this.handlePickEmoji}
                  title='Add Your Reaction'
                  emoji='point_up' />
              </ClickOutside>
            </div>
          </AddReactionPortal>
        </div>
      )
      : null;
    return (
      <span>
        <span className='CORN-addTag' onClick={this.toggleAddReactionDialog} title="React to this message">🌽</span>
        {dialog}
      </span>
    );
  }
}

AddReactionButton.propTypes = {
  onAddReaction: PropTypes.func.isRequired
};

export default AddReactionButton;
