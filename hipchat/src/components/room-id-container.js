import log from '../logger';
import HipchatWindow from '../hipchat-window';

class RoomIdContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roomId: null
    };
  }

  componentDidMount() {
    // Subscribe to the event channel for proper room updates
    this.roomChangedListener = (roomId) => {
      log("RoomIdContainer: Room ID changed: " + roomId);
      this.setState({roomId: roomId});
    }
    window.HC.AppDispatcher.addListener("after:updated:active_chat", this.roomChangedListener);

    // While HipChat is loading, we have to check a few times to initialize the room ID
    const initializeRoomId = () => {
      log("RoomIdContainer: Initialization poll");
      const roomId = HipchatWindow.roomId();
      if (roomId && roomId !== '') {
        log("RoomIdContainer: Room ID initialized: " + roomId);
        this.setState({roomId: roomId});
        window.clearInterval(this.roomIdInitializer);
      }
    }
    this.roomIdInitializer = window.setInterval(initializeRoomId, 500);
  }

  componentWillUnmount() {
    log("RoomIdContainer: Detaching listeners");
    window.HC.AppDispatcher.removeListener("after:updated:active_chat", this.roomChangedListener)
    window.clearInterval(this.roomIdInitializer);
  }

  render() {
    if (!this.state.roomId) {
      log("RoomIdContainer: No Room ID");
      return null;
    }

    const childrenWithExtraProp = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        roomId: this.state.roomId
      });
    });

    return childrenWithExtraProp;
  }
}

export default RoomIdContainer;
