import log from '../logger';
import PropTypes from 'prop-types';
import TagsStore from '../tags-store';
import ThumbsUpButton from './thumbs-up-button';
import AddTagButton from './add-tag-button';
import Tags from './tags';

class CornCob extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <ThumbsUpButton onThumbsUp={this.props.onThumbsUp} />
        <AddTagButton onAddTag={this.props.onAddTag} />
        <Tags tags={this.props.tags} onFilterByTag={this.props.onFilterByTag} />
      </div>
    );
  }
}

CornCob.propTypes = {
  tags: PropTypes.object,
  onAddTag: PropTypes.func.isRequired,
  onThumbsUp: PropTypes.func.isRequired,
  onFilterByTag: PropTypes.func.isRequired
};

export default CornCob;
