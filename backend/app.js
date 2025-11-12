const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const path = require('path');
const dotenv = require("dotenv")
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const { loadFilesSync } = require('@graphql-tools/load-files');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const admin = require('firebase-admin');

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);


dotenv.config({ path: ".env" })

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const typeDefs = mergeTypeDefs(loadFilesSync(path.join(__dirname, 'graphql/schemas')));
const resolvers = mergeResolvers(loadFilesSync(path.join(__dirname, 'graphql/resolvers')));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const statusPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ response, context }) {
        if (context.statusCode) {
          response.http.status = context.statusCode;
        }
      },
    };
  },
};


async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split(' ')[1];
        let user = null;
        if (token) {
          try {
            user = await admin.auth().verifyIdToken(token);
          } catch (error) {
            console.error('Erreur de vérification du token Firebase:', error);
          }
        }
        return { prisma, req, user, statusCode: 200 }; 
      },
    plugins: [statusPlugin],
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur prêt sur http://localhost:${PORT}/graphql`);
  });
}

startServer();
