const { gql } = require('apollo-server-express');

module.exports = gql`
  
    enum ClockStatus {
        on_time
        late
        absent
    }

    type Clock {
        id: ID!
        date: String
        start: String
        end: String
        employee_id: ID!
        status: ClockStatus
        created_at: String
        updated_at: String
    }

    type Query {
        employeeClockPointed(employee_id: ID!): [Clock]
        daylyReport(date: String!, employee_id: ID!): [Clock]
        reportByPeriod(start_date: String!, end_date: String!, employee_id: ID!): [Clock]
    }

    type Mutation {
        setClock(employee_id: ID!, date: String!, start: String, end: String, status: ClockStatus): Clock
    }
`;
