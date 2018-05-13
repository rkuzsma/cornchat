import gql from 'graphql-tag'

export default gql`
  query getMsgInfo($mid: String!) {
    getMsgInfo(mid: $mid) {
      mid
      tags {
        name
      }
      reactions {
        emoji
      }
    }
  }
`
