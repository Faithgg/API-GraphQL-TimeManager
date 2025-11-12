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

let oneUser = {
      email: `testuser${Math.floor(Math.random() * 10000)}@example.com`,
      first_name: 'Test',
      last_name: 'User',
      kind: "user",
      phone_number: '1234567890',
    };
let me = null;
    
const memberEmail =  `newmember${Math.floor(Math.random() * 10000)}@example.com`;

describe('GraphQL API Tests', () => {


  beforeAll( bearerToken = async () => {
    return await getBearerToken();
  }, 30000);

  test('Creer un nouvel utilisateur ex', async () => {
    const mutation = `
      mutation {
        createUser(email: "${oneUser.email}", first_name: "${oneUser.first_name}", last_name: "${oneUser.last_name}", phone_number: "${oneUser.phone_number}", kind: ${oneUser.kind}) {
          id
          email
          first_name
          last_name
          phone_number
          kind
        }
      }
    `;

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    return request(endpoint, mutation, {}, headers).then(data => {
      oneUser.id = data.createUser.id;
            
      expect(data.createUser).toBeDefined();
      expect(data.createUser.id).toBeTruthy();
      expect(data.createUser.email).toBe(oneUser.email);
      expect(data.createUser.first_name).toBe(oneUser.first_name);
      expect(data.createUser.last_name).toBe(oneUser.last_name);
      expect(data.createUser.kind).toBe(oneUser.kind);
    });
  });

  test('Récupérer un utilisateur par ID', async () => {
    const userId = oneUser.id;
    const query = `
      query {
        user(id: "${userId}") {
          id
          email
          first_name
          last_name
          phone_number
          kind
        }
      }
    `;

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    return request(endpoint, query, {}, headers).then(data => {
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(userId);
      expect(data.user.email).toBe(oneUser.email);
      expect(data.user.first_name).toBe(oneUser.first_name);
      expect(data.user.last_name).toBe(oneUser.last_name);
      expect(data.user.phone_number).toBe(oneUser.phone_number);
      expect(data.user.kind).toBe(oneUser.kind);
    });
  });

  test('Récupérer l\'utilisateur actuel', async () => {
    const query = `
      query {
        me {
          id
          email
          first_name
          last_name
          phone_number
          kind
          created_at
          updated_at
        }
      }
    `;

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    return request(endpoint, query, {}, headers).then(data => {
      me = data.me;
      
      expect(data.me).toBeDefined();
      expect(data.me.id).toBeTruthy();
    });
  });

  test('Requête non authentifiée', async () => {
    const query = `
      query {
        me {
          id
        }
      }
    `;

    return expect(request(endpoint, query).then(data => {
      expect(data.me).toBeDefined();
      expect(data.me.id).toBeTruthy();
    })).rejects.toThrow();
  });

  test('Récupérer tous les utilisateurs', async () => {
    const query = `
      query {
        users {
          id
          email
          first_name
          last_name
          phone_number
          kind
        }
      }
    `;

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    return request(endpoint, query, {}, headers).then(data => {
      expect(data.users).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
    });
  });

  test('Update an existing user', async () => {

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    const businessMutation = `
      mutation {
        createBusiness(name: "Un autre Test Business${Math.floor(Math.random() * 10000)}", description: "A business for testing", normal_employee_start_time: "09:00:00") {
          id
        }
      }
    `;

    const businessData = await request(endpoint, businessMutation, {}, headers);
    oneUser.business_id = businessData.createBusiness.id;

    const makeMeBusinessAccountMutation = `
      mutation {
        updateUser(
          id: "${me.id}",
          business_id: "${oneUser.business_id}",
          kind: business
        ) {
          id
          kind
        }
      }
    `;
    await request(endpoint, makeMeBusinessAccountMutation, {}, headers);
    

    const mutation = `
      mutation {
        updateUser(id: "${oneUser.id}", first_name: "Updated Name", kind: business, business_id: "${oneUser.business_id}") {
          id
          email
          first_name
          last_name
          phone_number
          kind
        }
      }
    `;

    return request(endpoint, mutation, {}, headers).then(data => {
      console.log("update user ");
      console.log(data.updateUser);
      expect(data.updateUser).toBeDefined();
      expect(data.updateUser.id).toBe(oneUser.id);
      expect(data.updateUser.first_name).toBe("Updated Name");
    });
  });

  test('Add user to business', async () => {

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    const mutation = `
      mutation {
        addMemberToBusiness(userEmail: "${memberEmail}", businessId: "${oneUser.business_id}") {
          id
          email
          first_name
          last_name
          phone_number
          kind
          business_id
        }
      }
    `;

    return request(endpoint, mutation, {}, headers).then(data => {
      expect(data.addMemberToBusiness).toBeDefined();
      expect(data.addMemberToBusiness.email).toBe(memberEmail);
      expect(data.addMemberToBusiness.business_id).toBe(oneUser.business_id);
    });
  });

  test('Remove user from business', async () => {

    const mutation = `
      mutation {
        removeMemberFromBusiness(userEmail: "${memberEmail}", businessId: "${oneUser.business_id}") {
          id
          email
          first_name
          last_name
          phone_number
          kind
          business_id
        }
      }
    `;

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    return request(endpoint, mutation, {}, headers).then(data => {
      expect(data.removeMemberFromBusiness).toBeDefined();
      expect(data.removeMemberFromBusiness.email).toBe(memberEmail);
      expect(data.removeMemberFromBusiness.business_id).toBeNull();
    });
  });

  test('Delete an existing user', async () => {
    const mutation = `
      mutation {
        deleteUser(id: "${oneUser.id}")
      }
    `;

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    return request(endpoint, mutation, {}, headers).then(data => {
      expect(data.deleteUser).toBe(true);
    });
  });

  test('Disconnect user', async () => {
    const mutation = `
      query {
        disconnectUser
      }
    `;

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    return request(endpoint, mutation, {}, headers).then(data => {
      expect(data.disconnectUser).toBe(true);
    });
  });

  afterAll(() => {
    admin.auth().revokeRefreshTokens(uid);
  });
});