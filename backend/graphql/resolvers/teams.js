const { getAuthUser } = require('../../src/services/auth');
const TeamController = require('../../src/controllers/teams');

module.exports = {
    Query: {
        teams: async (_, __, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await TeamController.getTeams(authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        team: async (_, { id }, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await TeamController.getTeam(id, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        businessTeams: async (_, { business_id }, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await TeamController.getBusinessTeams(business_id, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        teamMembers: async (_, { teamId }, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await TeamController.getTeamMembers(teamId, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
    },

    Mutation: {
        createTeam: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await TeamController.createTeam(args, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        updateTeam: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await TeamController.updateTeam(args.id, args, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        deleteTeam: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await TeamController.deleteTeam(args.id, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        addMemberToTeam: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await TeamController.addMemberToTeam(args, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        removeMemberFromTeam: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await TeamController.removeMemberFromTeam(args, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        }
    },
};