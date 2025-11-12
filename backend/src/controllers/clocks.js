const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkAuth } = require('../services/auth');
const { ApolloError, ForbiddenError } = require('apollo-server-express');

async function employeeClockPointed( employee_id , userAuth) {
    checkAuth(userAuth);
    return await prisma.clocks.findMany({
        where: { employee_id: employee_id }
    });
}

async function setClock(data, authUser) {
    checkAuth(authUser);

    let { employee_id, date, start, end, status } = data;

    const employee = await prisma.users.findUnique({ where: { id: employee_id } });
    if (!employee) {
        const error = new ApolloError('Employee not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    const business = await prisma.business.findUnique({ where: { id: employee.business_id } });
    if (!business) {
        const error = new ApolloError('Business not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    const targetTime = business.normal_employee_start_time;
    const dateR = new Date(start);
    const targetDate = new Date(date);
    const [hours, minutes, seconds] = targetTime.split(":").map(Number);
    targetDate.setUTCHours(hours, minutes, seconds, 0);

    if (dateR > targetDate) {
        status = 'late';
    } else {
        status = 'on_time';
}
    return await prisma.clocks.create({
        data: {
            employee_id,
            date,
            start,
            end,
            status
        }
    });
}

async function daylyReport(date, employee_id, authUser) {
    checkAuth(authUser);

    const dateBegin = new Date(date);
    const dateEnd = new Date(date);
    dateBegin.setHours(0, 0, 0, 0);
    dateEnd.setHours(23, 59, 59, 999);
    const whereClause = { date: { gte: dateBegin, lte: dateEnd }, employee_id };

    return await prisma.clocks.findMany({
        where: whereClause
    });
}
async function reportByPeriod(start_date, end_date, employee_id, authUser) {
    checkAuth(authUser);

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const whereClause = {
        date: {
            gte: startDate,
            lte: endDate
        },
        employee_id
    };

    return await prisma.clocks.findMany({
        where: whereClause,
        include: { employee: true }
    });
}

module.exports = {
    employeeClockPointed,
    setClock,
    daylyReport,
    reportByPeriod
};
