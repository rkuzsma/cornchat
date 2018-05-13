import gql from 'graphql-tag'

export default gql`
  query listMsgInfos($mids: [ID!]) {
    listMsgInfos(mids: $mids) {
      items {
        mid
        tags {
          name
        }
        reactions {
          emoji
          userId
        }
      }
    }
  }
`
