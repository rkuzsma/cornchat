import gql from 'graphql-tag'

export default gql`
  mutation addTag(
    $mid: ID!,
    $room: String!,
    $name: String!
  ) {
     addTag(mid: $mid,
             room: $room,
             name: $name) {
       mid
       tags {
         name
       }
       reactions
     }
  }
`
