const { gql } = require('apollo-server-express');

module.exports = gql`
    type Team {
        id: ID!
        name: String!
        description: String
        business_id: ID
        manager_id: ID
        created_at: String
        update_at: String
    }

    type TeamMember {
        id: ID!
        team_id: ID!
        member_id: ID!
        joined_at: String
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
        teams: [Team]
        team(id: ID!): Team
        teamMembers(teamId: ID!): [User]
        businessTeams(business_id: ID!): [Team]
    }

    type Mutation {
        createTeam(business_id: ID!, name: String!, description: String, manager_id: ID!): Team
        updateTeam(id: ID!, business_id: ID, name: String, description: String, manager_id: ID): Team
        addMemberToTeam(teamId: ID!, userId: ID!): TeamMember
        removeMemberFromTeam(teamId: ID!, userId: ID!): Boolean
        deleteTeam(id: ID!): Boolean
    }
`;
