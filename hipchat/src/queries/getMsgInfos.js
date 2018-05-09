import gql from 'graphql-tag'

export default gql`
  query getMsgInfos($mids: [ID!]) {
    getMsgInfos(mids: $mids) {
      mid
      tags {
        name
      }
    }
  }
`
