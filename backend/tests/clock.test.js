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

let me = null;

let clock = {
    date : "2025-10-12T09:00:00.000Z",
    start: "2025-10-12T10:49:14.693Z",
    end: "2025-10-12T17:30:14.693Z",
    status: "on_time"
};

describe('GraphQL API Tests', () => {


  beforeAll( bearerToken = async () => {
    return await getBearerToken();
  }, 30000);

  test('Pointer à l\'arrivée', async () => {

    const meQuery = `
      query {
        me {
          id
          email
          first_name
          last_name
          kind
          business_id
        }
      }
    `;
    
    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };
    
    const response = await request(endpoint, meQuery, {}, headers);
    me = response.me;

    const setClockMutation = `
      mutation {
        setClock(employee_id: "${me.id}", date: "${clock.date}", start: "${clock.start}", status: ${clock.status}) {
          id
          date       
          start      
          end        
          employee_id
          status     
        }
      }
    `;

    return request(endpoint, setClockMutation, {}, headers).then(data => {
      expect(data.setClock).toBeDefined();
      expect(data.setClock.id).toBeTruthy();
      expect(data.setClock.employee_id).toBe(me.id);
      const clockDate = new Date(Number(data.setClock.date));
      const clockStart = new Date(Number(data.setClock.start));
      expect(clockDate.toISOString()).toBe(clock.date);
      expect(clockStart.toISOString()).toBe(clock.start);
      expect(data.setClock.status).toBe("late");
    });
  });

  test('Pointer au départ', async () => {

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };
    
    const setClockMutation = `
      mutation {
        setClock(employee_id: "${me.id}", date: "${clock.date}", end: "${clock.end}") {
          id
          date       
          start      
          end        
          employee_id
          status     
        }
      }
    `;

    return request(endpoint, setClockMutation, {}, headers).then(data => {
      expect(data.setClock).toBeDefined();
      expect(data.setClock.id).toBeTruthy();
      expect(data.setClock.employee_id).toBe(me.id);
      const clockDate = new Date(Number(data.setClock.date));
      const clockEnd = new Date(Number(data.setClock.end));
      expect(clockDate.toISOString()).toBe(clock.date);
      expect(clockEnd.toISOString()).toBe(clock.end);
    });
  });
  test('Récupérer les pointages de l\'employé', async () => {

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };
    
    const employeeClockPointedQuery = `
      query {
        employeeClockPointed(employee_id: "${me.id}") {
          id
          date       
          start      
          end        
          employee_id
          status     
        }
      }
    `;

    return request(endpoint, employeeClockPointedQuery, {}, headers).then(data => {
      expect(data.employeeClockPointed).toBeDefined();
      expect(data.employeeClockPointed.length).toBeGreaterThan(0);
    });
  });

  test('Générer un rapport journalier', async () => {

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };
    
    const daylyReportQuery = `
      query {
        daylyReport(date: "${clock.date}", employee_id: "${me.id}") {
          id
          date       
          start      
          end        
          employee_id
          status     
        }
      }
    `;

    return request(endpoint, daylyReportQuery, {}, headers).then(data => {
      expect(data.daylyReport).toBeDefined();
      expect(data.daylyReport.length).toBeGreaterThan(0);
    });
  });

  test('Générer un rapport par période', async () => {

    const headers = {
      Authorization: `Bearer ${bearerToken}`,
    };

    const reportByPeriodQuery = `
      query {
        reportByPeriod(start_date: "${clock.start}", end_date: "${clock.end}", employee_id: "${me.id}") {
          id
          date       
          start      
          end        
          employee_id
          status     
        }
      }
    `;

    return request(endpoint, reportByPeriodQuery, {}, headers).then(data => {
      expect(data.reportByPeriod).toBeDefined();
      expect(data.reportByPeriod.length).toBeGreaterThan(0);
    });
  });

  afterAll(() => {
    admin.auth().revokeRefreshTokens(uid);
  });
});