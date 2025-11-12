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

let oneBusiness = {
  name: `Business ${Math.floor(Math.random() * 10000)}`,
  description: 'Business for ID test',
  normal_employee_start_time: '08:30:00'
  };

describe('GraphQL API Tests', () => {

  beforeAll( bearerToken = async () => {
    return await getBearerToken();
  }, 30000);

  test('Créer un business', async () => {
    
    const mutation = `
    mutation {
      createBusiness(
      name: "${oneBusiness.name}",
      description: "${oneBusiness.description}",
      normal_employee_start_time: "${oneBusiness.normal_employee_start_time}",
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

    return request(endpoint, mutation, {}, headers).then(data => {
      oneBusiness.id = data.createBusiness.id;
      expect(data.createBusiness).toBeDefined();
      expect(data.createBusiness.id).toBeTruthy();
      expect(data.createBusiness.name).toBe(oneBusiness.name);
      expect(data.createBusiness.description).toBe(oneBusiness.description);
      expect(data.createBusiness.normal_employee_start_time).toBe(oneBusiness.normal_employee_start_time);
    }).finally(() => {
            console.log("Finished 'createBusiness' mutation test");
    });
    });
  
 test('Récupérer un business par ID', async () => {
    const query = `
    query {
      business(id: "${oneBusiness.id}") {
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

    return request(endpoint, query, {}, headers).then(data => {
      expect(data.business).toBeDefined();
      expect(data.business.id).toBe(oneBusiness.id);
      expect(data.business.name).toBe(oneBusiness.name);
      expect(data.business.normal_employee_start_time).toBe(oneBusiness.normal_employee_start_time);
    });
  });

  test('Récupérer tous les business', async () => {
      const query = `query {
        businesses {
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

    return request(endpoint, query, {}, headers).then(data => {
      expect(data.businesses).toBeDefined();
      expect(Array.isArray(data.businesses)).toBe(true);
      if (data.businesses.length > 0) {
      expect(data.businesses[0]).toHaveProperty('id');
      expect(data.businesses[0]).toHaveProperty('name');
      expect(data.businesses[0]).toHaveProperty('description');
      expect(data.businesses[0]).toHaveProperty('normal_employee_start_time');
      }
    });
  }
);

test('Update an existing business', async () => {
  const mutation = `
    mutation {
      updateBusiness(
        id: "${oneBusiness.id}",
        name: "Updated Business Name",
        description: "Updated Description",
        normal_employee_start_time: "09:00:00"
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

  return request(endpoint, mutation, {}, headers).then(data => {
    expect(data.updateBusiness).toBeDefined();
    expect(data.updateBusiness.id).toBe(oneBusiness.id);
    expect(data.updateBusiness.name).toBe("Updated Business Name");
    expect(data.updateBusiness.description).toBe("Updated Description");
    expect(data.updateBusiness.normal_employee_start_time).toBe("09:00:00");
  });
});

  test('Delete a business', async () => {
    const mutation = `
      mutation {
        deleteBusiness(id: "${oneBusiness.id}")
      }
    `;

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    return request(endpoint, mutation, {}, headers).then(data => {
      expect(data.deleteBusiness).toBe(true);
    });
  });


    afterAll(() => {
      admin.auth().revokeRefreshTokens(uid);
    });
});
