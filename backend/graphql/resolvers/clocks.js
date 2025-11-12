const ClockController = require('../../src/controllers/clocks');
const { getAuthUser } = require('../../src/services/auth');

module.exports = {
    Query: {
        employeeClockPointed: async (_, {employee_id}, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await ClockController.employeeClockPointed(employee_id, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        daylyReport: async (_, { date, employee_id }, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await ClockController.daylyReport(date, employee_id, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
        reportByPeriod: async (_, { start_date, end_date, employee_id }, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await ClockController.reportByPeriod(start_date, end_date, employee_id, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
    },

    Mutation: {
        setClock: async (_, args, context) => {
            const authUser = await getAuthUser(context.user);
            try {
                return await ClockController.setClock(args, authUser);
            } catch (error) {
                context.statusCode = error.extensions?.http?.status || 500;
                throw error;
            }
        },
    },
};
