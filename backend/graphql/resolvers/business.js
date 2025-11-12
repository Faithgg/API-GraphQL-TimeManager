const BusinessController = require('../../src/controllers/business');
const { getAuthUser } = require('../../src/services/auth');

module.exports = {
    Query: {
        businesses: async (_, __, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await BusinessController.getBusinesses(authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        business: async (_, { id }, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await BusinessController.getBusiness(id, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
    },

    Mutation: {
        createBusiness: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await BusinessController.createBusiness(args, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        updateBusiness: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await BusinessController.updateBusiness(args.id, args, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        deleteBusiness: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await BusinessController.deleteBusiness(args.id, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        addMemberToBusiness: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await BusinessController.addMemberToBusiness(args, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
    },
};