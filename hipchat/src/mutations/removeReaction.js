import gql from 'graphql-tag'

// We include "room" as a parameter here purely for the GraphQL Mutation
// to detect when anything about a room has mutated.
// The resolver on the back end doesn't actually need the room.
export default gql`
  mutation removeReaction(
    $mid: ID!,
    $room: String!,
    $emoji: String!
  ) {
     removeReaction(mid: $mid,
                 room: $room,
                 emoji: $emoji) {
       mid
       tags {
         name
       }
       reactions
     }
  }
`
