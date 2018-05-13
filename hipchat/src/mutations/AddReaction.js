import gql from 'graphql-tag'

export default gql`
  mutation addReaction(
    $mid: ID!,
    $room: String!,
    $emoji: String!
  ) {
     addReaction(mid: $mid,
                 room: $room,
                 emoji: $emoji) {
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
`
