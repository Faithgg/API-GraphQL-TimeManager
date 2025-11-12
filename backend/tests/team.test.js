const { request } = require('graphql-request');
const dotenv = require("dotenv")
const admin = require('firebase-admin');

dotenv.config({ path: "./.env" })

const PORT = process.env.PORT || 4000 ;
const API_KEY = process.env.FIREBASE_API_KEY;
const FIREBASE_API_URL = process.env.FIREBASE_API_URL;
let bearerToken = null;

const endpoint = `http://localhost:${PORT}/graphql`;

const serviceAccount = require("../"+process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
const uid = 'ci-runner';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});



const getBearerToken = async () => {
  try {
    const customToken = await admin.auth().createCustomToken(uid);

    const res = await fetch(`${FIREBASE_API_URL}/accounts:signInWithCustomToken?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    });
    const data = await res.json();
    bearerToken = data.idToken;
  } catch (err) {
    console.error('ERR', err);
  }
};

let business = {
  name: `Business ${Math.floor(Math.random() * 10000)}`,
  description: 'Business Example for Team test',
  normal_employee_start_time: '08:30:00'
  };

let testTeamManager = {
      email: `testTeamManager.${Math.floor(Math.random() * 10000)}@example.com`,
      first_name: 'Test',
      last_name: 'User',
      kind: "user",
      phone_number: '1234567891',
    };
let testTeamMember1 = {
      email: `testTeamMember1.${Math.floor(Math.random() * 10000)}@example.com`,
      first_name: 'MemberTest1',
      last_name: 'User',
      kind: "employee",
      phone_number: '1234567892',
    };
let testTeamMember2 = {
      email: `testTeamMember2.${Math.floor(Math.random() * 10000)}@example.com`,
      first_name: 'MemberTest2',
      last_name: 'User',
      kind: "employee",
      phone_number: '1234567893',
    };
let team = {
    business_id: null,
    name: `Équipe ${Math.floor(Math.random() * 10000)} Test`,
    description: 'Équipe créée pour les tests',
    manager_id: null
};

let businessAccount = null;

describe('GraphQL API Tests', () => {


  beforeAll( bearerToken = async () => {
    return await getBearerToken();
  }, 30000);

  test ('Créer une équipe', async () => {
    // Create Business
    const createBusinessMutation = `
    mutation {
      createBusiness(
      name: "${business.name}",
      description: "${business.description}",
      normal_employee_start_time: "${business.normal_employee_start_time}",
      ) {
      id
      name
      description
      normal_employee_start_time
      }
    }
    `;

    const headers = {
    Authorization: `Bearer ${bearerToken}`,
    };

    const businessData = await request(endpoint, createBusinessMutation, {}, headers);
    business.id = businessData.createBusiness.id;
    team.business_id = business.id;
    testTeamManager.business_id = business.id;
    testTeamMember1.business_id = business.id;
    testTeamMember2.business_id = business.id;


    const meQuery = `
      query {
        me {
          business_id
          first_name
          last_name
          id
          google_id
          created_at
          updated_at
          kind
        }
      }
    `;

    const meData = await request(endpoint, meQuery, {}, headers);
    businessAccount = meData.me;    

    makeMeBusinessAccountMutation = `
      mutation {
        updateUser(
          id: "${businessAccount.id}",
          business_id: "${business.id}",
          kind: business
        ) {
          business_id
          first_name
          last_name
          id
          google_id
          created_at
          updated_at
          kind
        }
      }
    `;
    const meDoneData = await request(endpoint, makeMeBusinessAccountMutation, {}, headers);
    console.log("meDone", meDoneData.updateUser);
    businessAccount = meDoneData.updateUser;
    // Create Team Manager
    const createManagerMutation = `
      mutation {
        createUser(email: "${testTeamManager.email}", first_name: "${testTeamManager.first_name}", last_name: "${testTeamManager.last_name}", phone_number: "${testTeamManager.phone_number}", kind: ${testTeamManager.kind}) {
          id
          email
        }
      }
    `;

    const managerData = await request(endpoint, createManagerMutation, {}, headers);
    testTeamManager.id = managerData.createUser.id;
    team.manager_id = testTeamManager.id;

    const createTeamMutation = `
      mutation {
        createTeam(
          name: "${team.name}",
          description: "${team.description}",
          business_id: "${team.business_id}",
          manager_id: "${team.manager_id}",
        ) {
            id,
            name,
            description,
            business_id,
            manager_id,
            created_at,
            update_at
        }
      }
    `;

    return request(endpoint, createTeamMutation, {}, headers).then(data => {
      expect(data.createTeam).toBeDefined();
      expect(data.createTeam.name).toBe(team.name);
      expect(data.createTeam.description).toBe(team.description);
      expect(data.createTeam.manager_id).toBe(testTeamManager.id);
      expect(data.createTeam.business_id).toBe(business.id);
      team.id = data.createTeam.id;
    });
  });

  test('Récupérer une équipe par ID', async () => {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    const getTeamQuery = `
      query {
        team(id: "${team.id}") {
          id,
          name,
          description,
          business_id,
          manager_id,
        }
      }
    `;

    return request(endpoint, getTeamQuery, {}, headers).then(data => {
      expect(data.team).toBeDefined();
      expect(data.team.id).toBe(team.id);
      expect(data.team.name).toBe(team.name);
    });
  });

  test ('Récupérer les équipes', async () => {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    const getTeamsQuery = `
      query {
        teams {
          id,
          name,
          description,
          business_id,
          manager_id,
        }
      }
    `;

    return request(endpoint, getTeamsQuery, {}, headers).then(data => {
      expect(data.teams).toBeDefined();
      expect(Array.isArray(data.teams)).toBe(true);
    });
  });

  test ('Récupérer les équipes d\'une entreprise', async () => {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    const getBusinessTeamsQuery = `
      query {
        businessTeams(business_id: "${business.id}") {
          id,
          name,
          description,
          business_id,
          manager_id,
        }
      }
    `;

    return request(endpoint, getBusinessTeamsQuery, {}, headers).then(data => {
      expect(data.businessTeams).toBeDefined();
      expect(Array.isArray(data.businessTeams)).toBe(true);
    });
  });

  test ('Ajouter des membres à l\'équipe', async () => {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };
    // Create Team Member 1
    const createMember1Mutation = `
      mutation {
        createUser(email: "${testTeamMember1.email}", first_name: "${testTeamMember1.first_name}", last_name: "${testTeamMember1.last_name}", phone_number: "${testTeamMember1.phone_number}", kind: ${testTeamMember1.kind}, business_id: "${testTeamMember1.business_id}") {
          id
          email
        }
      }
    `;

    const member1Data = await request(endpoint, createMember1Mutation, {}, headers);
    testTeamMember1.id = member1Data.createUser.id;

    // Create Team Member 2
    const createMember2Mutation = `
      mutation {
        createUser(email: "${testTeamMember2.email}", first_name: "${testTeamMember2.first_name}", last_name: "${testTeamMember2.last_name}", phone_number: "${testTeamMember2.phone_number}", kind: ${testTeamMember2.kind}, business_id: "${testTeamMember2.business_id}") {
          id
          email
        }
      }
    `;

    const member2Data = await request(endpoint, createMember2Mutation, {}, headers);
    testTeamMember2.id = member2Data.createUser.id;

    // Add Members to Team
    const addMember1ToTeamMutation = `
      mutation {
        addMemberToTeam(teamId: "${team.id}", userId: "${testTeamMember1.id}") {
          id
          team_id
          member_id
        }
      }
    `;

    const addMember2ToTeamMutation = `
      mutation {
        addMemberToTeam(teamId: "${team.id}", userId: "${testTeamMember2.id}") {
          id
          team_id
          member_id
        }
      }
    `;

    await request(endpoint, addMember1ToTeamMutation, {}, headers);
    return request(endpoint, addMember2ToTeamMutation, {}, headers).then(data => {
      expect(data.addMemberToTeam).toBeDefined();
      expect(data.addMemberToTeam.team_id).toBe(team.id);
      expect(data.addMemberToTeam.member_id).toBe(testTeamMember2.id);
    });
  });

  test ('Récupérer les membres de l\'équipe', async () => {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    const getTeamMembersQuery = `
      query {
        teamMembers(teamId: "${team.id}") {
          id
          email
          first_name
          last_name
        }
      }
    `;

    return request(endpoint, getTeamMembersQuery, {}, headers).then(data => {
      expect(data.teamMembers).toBeDefined();
      expect(Array.isArray(data.teamMembers)).toBe(true);
      const member1 = data.teamMembers.find(m => m.id === testTeamMember1.id);
      const member2 = data.teamMembers.find(m => m.id === testTeamMember2.id);
      expect(member1).toBeDefined();
      expect(member1.email).toBe(testTeamMember1.email);
      expect(member2).toBeDefined();
      expect(member2.email).toBe(testTeamMember2.email);
    });
  });

  test ('Supprimer un membre de l\'équipe', async () => {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    const removeMember1FromTeamMutation = `
      mutation {
        removeMemberFromTeam(teamId: "${team.id}", userId: "${testTeamMember1.id}")
      }
    `;
    return request(endpoint, removeMember1FromTeamMutation, {}, headers).then(data => {
      expect(data.removeMemberFromTeam).toBe(true);
    });
  });

  test ('Supprimer une équipe', async () => {
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    const deleteTeamMutation = `
      mutation {
        deleteTeam(id: "${team.id}")
      }
    `;

    return request(endpoint, deleteTeamMutation, {}, headers).then(data => {
      expect(data.deleteTeam).toBe(true);
    });
  });

  afterAll(() => {
    admin.auth().revokeRefreshTokens(uid);
  });
});