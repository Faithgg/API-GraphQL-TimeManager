const UserController = require('../../src/controllers/users');
const { getAuthUser } = require('../../src/services/auth');

module.exports = {
  Query: {
    me: async (_, __, context) => {
        const authUser = await getAuthUser(context.user);
        try {
        return await UserController.getMe(authUser);
      } catch (error) {
        context.statusCode = error.extensions?.http?.status || 500;
        throw error;
      }
    },
    users: async (_, __, context) => {
      const authUser = await getAuthUser(context.user);
      try {
        return await UserController.getUsers(authUser);
      } catch (error) {
        context.statusCode = error.extensions?.http?.status || 500;
        throw error;
      }
    },
    user: async (_, { id }, context) => {
        const authUser = await getAuthUser(context.user);
        try {
        return await UserController.getUser(id, authUser);
      } catch (error) {
        context.statusCode = error.extensions?.http?.status || 500;
        throw error;
      }
    },
    disconnectUser: async (_, __, context) => {
      const authUser = await getAuthUser(context.user);
      try {
        return await UserController.disconnectUser(authUser);
      } catch (error) {
        context.statusCode = error.extensions?.http?.status || 500;
        throw error;
      }
  },
},

  Mutation: {
    createUser: async (_, args, context) => {
        const authUser = await getAuthUser(context.user);
        try {
        return await UserController.createUser(args, authUser);
      } catch (error) {
        context.statusCode = error.extensions?.http?.status || 500;
        throw error;
      }
    },
    updateUser: async (_, args, context) => {
      const authUser = await getAuthUser(context.user);
      try {
        return await UserController.updateUser(args.id, args, authUser);
      } catch (error) {
        context.statusCode = error.extensions?.http?.status || 500;
        throw error;
      }
    },
    deleteUser: async (_, args, context) => {
      const authUser = await getAuthUser(context.user);
      try {
        return await UserController.deleteUser(args.id, authUser);
      } catch (error) {
        context.statusCode = error.extensions?.http?.status || 500;
        throw error;
      }
    },
    addMemberToBusiness: async (_, args, context) => {
      const authUser = await getAuthUser(context.user);
      try {
        return await UserController.addMemberToBusiness(args, authUser);
      } catch (error) {
        context.statusCode = error.extensions?.http?.status || 500;
        throw error;
      }
    },
    removeMemberFromBusiness: async (_, args, context) => {
      const authUser = await getAuthUser(context.user);
      try {
        return await UserController.removeMemberFromBusiness(args, authUser);
      } catch (error) {
        context.statusCode = error.extensions?.http?.status || 500;
        throw error;
      }
    },
  },
};