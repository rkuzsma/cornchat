import log from '../logger';
import ErrorPortal from './error-portal';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.handleError = this.handleError.bind(this);
  }

  componentDidCatch(error, info) {
    this.handleError(error, info);
  }

  handleError(error, info) {
    this.setState({ error: error });
    log("ErrorBoundary: ERROR: " + error);
    if (info) log("ErrorBoundary: INFO: " + info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <ErrorPortal>ERROR: {this.state.error}</ErrorPortal>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
