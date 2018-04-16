import log from '../logger';
import React from "react";
import PropTypes from 'prop-types';

class TagFilter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.tag) {
      log('TODO: filter by tag: ' + this.props.tag.name)
    }
    else {
      log('TODO: clear filter');
    }

    return null;
  }
}

TagFilter.propTypes = {
  tag: PropTypes.object
};

export default TagFilter;
