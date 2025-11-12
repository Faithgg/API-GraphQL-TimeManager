const { gql } = require('apollo-server-express');

module.exports = gql`
  
  type Business {
    id: ID!
    name: String!
    description: String
    normal_employee_start_time: String
    created_at: String
    updated_at: String
  }

  type Query {
    businesses: [Business]
    business(id: ID!): Business
  }

  type Mutation {
    createBusiness(name: String!, description: String, normal_employee_start_time: String): Business
    updateBusiness(id: ID!, name: String, description: String, normal_employee_start_time: String): Business
    deleteBusiness(id: ID!): Boolean
  }
`;