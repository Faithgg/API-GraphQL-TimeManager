const { gql } = require('apollo-server-express');

module.exports = gql`
  enum Kind {
    employee
    manager
    business
    user
  }

  type User {
    id: ID!
    business_id: String
    google_id: String
    first_name: String
    last_name: String
    email: String!
    phone_number: String
    kind: Kind!
    created_at: String
    updated_at: String
  }

  type Query {
    me: User
    users: [User]
    user(id: ID!): User
    disconnectUser: Boolean
  }

  type Mutation {
    createUser(email: String!, first_name: String, last_name: String, phone_number: String, kind: Kind!, business_id: String, google_id: String): User
    addMemberToBusiness(userEmail: String!, businessId: String!): User
    removeMemberFromBusiness(userEmail: String!, businessId: String!): User
    updateUser(id: ID!, email: String, first_name: String, last_name: String, phone_number: String, kind: Kind, business_id: String, google_id: String): User
    deleteUser(id: ID!): Boolean
  }
`;
