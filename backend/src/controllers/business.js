const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkAuth } = require('../services/auth');
const { ApolloError, ForbiddenError } = require('apollo-server-express');
const users = require('./users')

async function getBusinesses(authUser) {
    checkAuth(authUser);
    return await prisma.business.findMany();
}

async function getBusiness(id, authUser) {
    checkAuth(authUser);
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
        const error = new ApolloError('Business not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    return business;
}

async function createBusiness(data, authUser) {
    checkAuth(authUser);
    const existingBusiness = await prisma.business.findFirst({ where: { name: data.name } });
    if (existingBusiness) {
        const error = new ForbiddenError('Business with this name already exists');
        error.extensions.code = "FORBIDDEN";
        error.extensions.http = { status: 403 };
        throw error;
    }
    const business = await prisma.business.create({ data });
    await prisma.users.update({
        where: { id: authUser.id },
        data: { kind: 'business' , business_id: business.id },
    });
    return business;
}

async function updateBusiness(id, data, authUser) {
    checkAuth(authUser);
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
        const error = new ApolloError('Business not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    return await prisma.business.update({
        where: { id },
        data,
    });
}

async function deleteBusiness(id, authUser) {
    checkAuth(authUser);
    await prisma.business.delete({ where: { id } });
    return true;
}

async function addMemberToBusiness(data, authUser) {
    return await users.addMemberToBusiness(data, authUser);
}

module.exports = {
    getBusinesses,
    getBusiness,
    createBusiness,
    deleteBusiness,
    updateBusiness,
    addMemberToBusiness,
};