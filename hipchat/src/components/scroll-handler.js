import {default as logger} from '../logger';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';

// Keeps the HC Scrollable Messags View scroll position steady during renderings.
// Changing the HipChat msg elements at all could cause the DOM height to change,
// necessitating that we scroll the hipchat window to retain its original position.
//
// Algorithm:
//  Remember the last position that the user scrolled the chat room.
//  Whenever the chat room height changes,
//  e.g. when a tag is added or a reaction is removed,
//  scroll the chat room to where the user last scrolled it.
//  If user scrolled to the bottom (or within a few pixels of bottom),
//  assume they always want the chat room scrolled to the bottom,
//  not to some other fixed position.
//
//  Also, when we first enter a new room, always scroll to the bottom. Our
//  msg elements rendering adds invisible 1px blue borders around all elements,
//  causing the bottom of the chat to scroll up a little for each msg.
//
// Caveats:
//  HipChat removes our chat room onscroll DOM handler after some small random
//  amount of time after we change rooms.
//  We setInterval() to force our onscroll handler back into the DOM tree.
//
// This handler doesn't depend on our CornChat state at all, it's purely
// a DOM manipulation.

const DEBUG_LOGGING = false;
const log = (msg) => {
  if (DEBUG_LOGGING) logger(msg);
}

class ScrollHandler extends React.Component {

  constructor(props) {
    super(props);
    this.getScrollBox = this.getScrollBox.bind(this);
    this.scrollHandler = this.scrollHandler.bind(this);
    this.resizeHandler = this.resizeHandler.bind(this);
    this.reconnectScrollHandler = this.reconnectScrollHandler.bind(this);
  }

  componentDidMount() {
    log("ScrollHandler attaching");
    this.attach();
  }
  componentWillUnmount() {
    log("ScrollHandler detaching");
    this.detach();
  }

  attach() {
    this.domWatcher = window.setInterval(this.reconnectScrollHandler, 1000);
  }

  detach() {
    window.clearInterval(this.domWatcher);

    log("ScrollHandler: Detaching scroll listener");
    const scrollBox = this.getScrollBox();
    if (scrollBox) {
      scrollBox.onscroll = null;
    }

    if (this.scrollBoxResizeSensor) {
      log("ScrollHandler: Detaching Resize Sensor");
      this.scrollBoxResizeSensor.detach();
    }
  }

  getScrollBox() {
    const box = $('div.hc-chat-scrollbox');
    return box.length == 1 ? box[0] : null;
  }

  reconnectScrollHandler() {
    const scrollBox = this.getScrollBox();
    if (!scrollBox) return;

    if (scrollBox.onscroll) {
      // Our listener is already attached
      return;
    }

    const hcMessagesDiv = $('div.hc-messages')[0];
    if (!hcMessagesDiv) {
      return;
    }

    log("ScrollHandler: (re)Attaching scroll listener");
    scrollBox.onscroll = this.scrollHandler;
    this.scrollHandler();

    if (this.scrollBoxResizeSensor) {
      log("ScrollHandler: Detaching Resize Sensor");
      this.scrollBoxResizeSensor.detach();
    }

    log("ScrollHandler: Attaching Resize Sensor");
    this.scrollBoxResizeSensor = new ResizeSensor(hcMessagesDiv, () => {
      var newHeight = hcMessagesDiv.offsetHeight;
      var diff = newHeight - hcMessagesDiv.CORN_prevHeight;
      hcMessagesDiv.CORN_prevHeight = newHeight;
      log("ScrollHandler: Scrollbox Resized");
      window.setTimeout(this.resizeHandler, 100);
    });

    log("ScrollHandler: First time initializing this room; scrolling to bottom.");
    scrollBox.scrollTop = scrollBox.scrollHeight;
  }

  scrollHandler() {
    const scrollBox = this.getScrollBox();
    if (!scrollBox) return;
    const diffToBottom = scrollBox.scrollHeight - (scrollBox.scrollTop + scrollBox.offsetHeight);
    log("ScrollHandler: scrolled, diffToBottom=" + diffToBottom);
    // Assume < 30 pixels from bottom means user intends to be at the bottom of chat.
    if (diffToBottom < 30) {
      if (!this.snapToBottom) {
        log("ScrollHandler: User scrolled to bottom");
        this.snapToBottom = true;
      }
    }
    else {
      log("ScrollHandler: User scrolled to " + scrollBox.scrollTop);
      this.snapToBottom = false;
      this.snapToCoordinate = scrollBox.scrollTop;
    }
  }

  resizeHandler() {
    const scrollBox = this.getScrollBox();
    if (!scrollBox) return;
    if (this.snapToBottom) {
      log("ScrollHandler SNAP TO BOTTOM");
      scrollBox.scrollTop = scrollBox.scrollHeight;
    }
    else {
      log("ScrollHandler: SNAP TO " + this.snapToCoordinate);
      scrollBox.scrollTop = this.snapToCoordinate;
    }
  }

  render() {
    return null;
  }
}

export default ScrollHandler;
