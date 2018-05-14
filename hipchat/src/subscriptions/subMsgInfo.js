import gql from 'graphql-tag'

export default gql`
  subscription subMsgInfo {
    changedMsgInfo {
      mid
      tags {
        name
      }
      reactions
    }
  }
`
