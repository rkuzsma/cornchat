import gql from 'graphql-tag'

export default gql`
  query getMsgInfo($mid: ID!) {
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
