import log from '../logger';
import React from 'react';
import MsgElementsStore from '../msg-elements-store';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';

let _instance = null;

// Keeps the HC Scrollable Messags View scroll position steady during renderings.
// Changing the HipChat msg elements at all could cause the DOM height to change,
// necessitating that we scroll the hipchat window to retain its original position.
class MsgElementAutoScroller {
  constructor() {
    if (!_instance) {
      log("MsgElementAutoScroller: Initializing");
      _instance = this;
      this.msgElementStore = new MsgElementsStore();
      this.attachedResizeSensors = [];
      this.reWatchMsgElements = this.reWatchMsgElements.bind(this);
      this.isMsgElementInsideTheFold = this.isMsgElementInsideTheFold.bind(this);
      this.msgElementStoreListener = {
        onElementsChanged: ((prevElements, currentElements) => {
          this.reWatchMsgElements();
        })
      };
      this.msgElementStore.addListener(this.msgElementStoreListener);
      this.reWatchMsgElements();
    }
    return _instance;
  }

  /*
  |---------------
  |  |-----------
  |  | msg 1
  |  |-----------
  ******************* ^^ scrolled outside box
  ******************* visible scrollbox region:
  |  |-----------
  |  | msg 2
  |  |-----------
  |  | msg 3
  |  |
  |  |-----------
  |  | msg 4
  ******************* ^^^ visible scrollbox region
  ******************* below "The Fold":
  |  |
  |  |-----------
  |  |-----------
  |  | msg 5
  |  |-----------
  |---------------
  Adding content into elements above (and on) the fold can shift other msgs down.
  Adding content into elements above the top of the visible scroll region does NOT shift elements down.
  Must auto-scroll to ensure that the bottom-most visible line always stays
  in the same position when new content is injected above it.
  e.g. "msg 4" should always appear as the bottom message.

  msgStatus.offsetTop:
    Number of pixels from the top of the hc-chat-row to this msg-status, including
    any padding or border or other messages in between.
    e.g. 100

  msgRow.offsetTop:
    Number of pixels from the top of the scrollbox region, including invisible area
    scrolled above the scrollbox view.
    This number is often bigger than the visible height of the scrollbox, because
    content can be scrolled far up.
    e.g. 1300

  msgRow.offsetHeight:
    Height of the row including any of its own padding.
    The sum of all the hc-chat-row offsetSeights equals the total scrollable height of the scrollbox.
  e.g. 200

  scrollBox.scrollTop + scrollbox.offsetHeight:
    Number of pixels scrolled from the top of the scrollbox to the bottom-most visible
    pixel of the scrollbox, including any scrolled area above the visible region.
  */
  isMsgElementInsideTheFold(msgEl) {
    var msgStatus = $(msgEl).closest('div.msg-status')[0];
    var msgRow = $(msgStatus).closest('div.hc-chat-row')[0];
    var scrollBox = $(msgRow).closest('div.hc-chat-scrollbox')[0];

    var topOfTheFold = scrollBox.scrollTop;
    var bottomOfTheFold = scrollBox.scrollTop + scrollBox.offsetHeight;
    var msgElOffsetTop = msgStatus.offsetTop + msgRow.offsetTop
    var msgElOffsetBottom = msgElOffsetTop + msgStatus.offsetHeight;
    return (msgElOffsetTop <= bottomOfTheFold && msgElOffsetBottom >= topOfTheFold);
  }

  reWatchMsgElements() {
    // Detach any previously attached sensors
    log("MsgElementAutoScroller: Detaching " + this.attachedResizeSensors.length + " ResizeSensors");
    this.attachedResizeSensors.forEach((sensor) => {
      sensor.detach();
    });

    log("MsgElementAutoScroller: Attaching " + this.msgElementStore.recentElements().length + " ResizeSensors");
    let sensors = [];
    this.msgElementStore.recentElements().forEach((item) => {
      var element = item.msgEl.closest('div.msg-status');
      if (!element.CORN_prevHeight) {
        element.CORN_prevHeight = element.offsetHeight;
        //log("MsgElementAutoScroller: Initialized prevHeight: " + element.CORN_prevHeight);
      }
      var sensor = new ResizeSensor(element, () => {
        var newHeight = element.offsetHeight;
        var diff = newHeight - element.CORN_prevHeight;
        element.CORN_prevHeight = newHeight;
        // Only account for elements that are visible in the hipchat view.
        if (diff != 0 && this.isMsgElementInsideTheFold(item.msgEl)) {
          //log("MsgElementAutoScroller: Resize " + diff);
          $('div.hc-chat-scrollbox')[0].scrollTop += diff;
        }
      });
      this.attachedResizeSensors = sensors;
    });
  }
}

export default MsgElementAutoScroller;
