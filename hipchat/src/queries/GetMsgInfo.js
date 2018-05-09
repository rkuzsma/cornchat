import gql from 'graphql-tag'

export default gql`
  query getMsgInfo($mid: String!) {
    getMsgInfo(mid: $mid) {
      mid
      reactions {
        emoji
      }
      tags {
        name
      }
    }
  }
`
