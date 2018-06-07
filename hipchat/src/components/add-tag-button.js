import log from '../logger';
import PropTypes from 'prop-types';
import AddTagDialog from './add-tag-dialog';
import AddTagDialogPortal from './add-tag-dialog-portal';
import React from 'react';

class AddTagButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowAddTagDialog: false,
      dialogOffsetTop: '-100px', // render off-screen until we know the button's position
      dialogOffsetLeft: '-100px'
    };
    this.toggleAddTagDialog = this.toggleAddTagDialog.bind(this);
    this.buttonRef = React.createRef();
    this.updateOffsets = this.updateOffsets.bind(this);
  }

  updateOffsets() {
    const offset = (el) => {
      const rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    }
    const btnOffset = offset(this.buttonRef.current);
    this.setState({
      dialogOffsetTop: btnOffset.top + 'px',
      dialogOffsetLeft: btnOffset.left + 'px'
    });
  }

  componentDidMount() {
    this.updateOffsets();
  }

  toggleAddTagDialog() {
    log("Toggle add dialog");
    this.updateOffsets();
    this.setState({
      isShowAddTagDialog: !this.state.isShowAddTagDialog
    });
  }

  render() {
    return (
      <span>
        <span ref={this.buttonRef} className='CORN-addTag' onClick={this.toggleAddTagDialog} title='Tag this message'>🏷️</span>
          <AddTagDialogPortal>
            <div style={{
                position: 'absolute',
                left: this.state.dialogOffsetLeft,
                top: this.state.dialogOffsetTop,
                zIndex: '2'}} >
              <AddTagDialog
                show={this.state.isShowAddTagDialog}
                onClose={this.toggleAddTagDialog}
                onAddTag={this.props.onAddTag}
                recentTagNames={this.props.recentTagNames} />
            </div>
          </AddTagDialogPortal>
      </span>
    );
  }
}

AddTagButton.propTypes = {
  onAddTag: PropTypes.func.isRequired,
  recentTagNames: PropTypes.array
};

export default AddTagButton;
