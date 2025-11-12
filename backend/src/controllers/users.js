const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkAuth , revokeToken} = require('../services/auth');
const { ApolloError, ForbiddenError } = require('apollo-server-express');

async function getMe(authUser) {
  checkAuth(authUser);
  return await prisma.users.findUnique({ where: { id: authUser.id } });
}

async function getUsers(authUser) {
  checkAuth(authUser);
  if (authUser.kind === 'business') {
    return await prisma.users.findMany({ where: { business_id: authUser.business_id } });
  }
  if (authUser.kind === 'manager') {
    return await prisma.users.findMany({ 
      where: { 
        team_id: authUser.team_id,
        id: { not: authUser.id }
      } 
    });
  }
  return [await prisma.users.findUnique({ where: { id: authUser.id } })];
}

async function getUser(id, authUser) {
  checkAuth(authUser);
  const user = await prisma.users.findUnique({ where: { id } });
    if (!user) {
    const error = new ApolloError('User not found');
    error.extensions.code = "NOT_FOUND";
    error.extensions.http = { status: 404 };
    throw error;
  }
  return user;
}

async function createUser(data, authUser) {
  checkAuth(authUser);
  const existingUser = await prisma.users.findFirst({ where: { email: data.email } });
    if (existingUser) {
        const error = new ForbiddenError('User with this email already exists');
        error.extensions.code = "FORBIDDEN";
        error.extensions.http = { status: 403 };
        throw error;
    }
    return await prisma.users.create({ data });
}

async function updateUser(id, data, authUser) {
  checkAuth(authUser);
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) {
    const error = new ApolloError('User not found');
    error.extensions.code = "NOT_FOUND";
    error.extensions.http = { status: 404 };
    throw error;
  }
  return await prisma.users.update({
    where: { id },
    data,
  });
}

async function deleteUser(id, authUser) {
  checkAuth(authUser);
  await prisma.users.delete({ where: { id } });
  return true;
}

async function addMemberToBusiness({userEmail, businessId}, authUser) {
  checkAuth(authUser);
  if (authUser.kind !== 'business') {
    const error = new ForbiddenError('Only business users can add members to a business');
    error.extensions.code = "FORBIDDEN";
    error.extensions.http = { status: 403 };
    throw error;
  }

  let user = await prisma.users.findFirst({ where: { email: userEmail } });
  if (!user) {
    return await prisma.users.create({ data: { email: userEmail, kind: 'employee', business_id: businessId } });
  }

  return await prisma.users.update({
    where: { id: user.id },
    data: { business_id: businessId , kind: 'employee' },
  });
}

async function removeMemberFromBusiness({userEmail, businessId}, authUser) {
  checkAuth(authUser);
  if (authUser.kind !== 'business') {
    const error = new ForbiddenError('Only business users can remove members from a business');
    error.extensions.code = "FORBIDDEN";
    error.extensions.http = { status: 403 };
    throw error;
  }

  const user = await prisma.users.findFirst({ where: { email: userEmail, business_id: businessId } });
  if (!user) {
    const error = new ApolloError('User not found');
    error.extensions.code = "NOT_FOUND";
    error.extensions.http = { status: 404 };
    throw error;
  }

  return await prisma.users.update({
    where: { id: user.id },
    data: { business_id: null, kind: 'user' },
  });
}

async function disconnectUser(authUser) {
  checkAuth(authUser);
  try {
    await revokeToken(authUser.uid);
    return true;
  } catch (error) {
    throw new ApolloError('Error disconnecting user');
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  updateUser,
  addMemberToBusiness,
  getMe,
  disconnectUser,
  removeMemberFromBusiness,
};
