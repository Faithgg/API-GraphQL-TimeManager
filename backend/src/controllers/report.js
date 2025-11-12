const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkAuth , revokeToken} = require('../services/auth');
const { ApolloError, ForbiddenError } = require('apollo-server-express');

async function someScore (employee_id, status, authUser) {
    checkAuth(authUser);

    const clocksOnTime = await prisma.clocks.findMany({
        where: { employee_id , status: { in: [status] } }
    });
    const clocks = await prisma.clocks.findMany({
        where: { employee_id }
    });

    if (clocksOnTime.length === 0) {
        return 0; // No records, score is 0
    }


    const score = (clocksOnTime.length / clocks.length) * 100;
    return score;
}

module.exports = {
    someScore
};