const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkAuth } = require('../services/auth');
const { ApolloError, ForbiddenError } = require('apollo-server-express');

async function getTeams(authUser) {
    checkAuth(authUser);
    if (authUser.kind === 'business') {
        return await prisma.teams.findMany({ where: { business_id: authUser.business_id } });
    }
    if (authUser.kind === 'manager') {
        return await prisma.teams.findMany({ where: { manager_id: authUser.id } });
    }
    if (authUser.kind === 'employee') {
        const teamMembers = await prisma.team_members.findMany({ where: { member_id: authUser.id } });
        const teamIds = teamMembers.map(member => member.team_id);
        return await prisma.teams.findMany({ where: { id: { in: teamIds } } });
    }
    return [];
}

async function getBusinessTeams(businessId, authUser) {
    checkAuth(authUser);
    if (authUser.kind === 'business' && authUser.business_id === businessId) {
        return await prisma.teams.findMany({ where: { business_id: businessId } });
    }
    if (authUser.kind === 'manager') {
        const teams = await prisma.teams.findMany({ where: { business_id: businessId, manager_id: authUser.id } });
        return teams;
    }
    const error = new ForbiddenError('You do not have access to these teams');
    error.extensions.code = "FORBIDDEN";
    error.extensions.http = { status: 403 };
    throw error;
}

async function getTeam(id, authUser) {
    checkAuth(authUser);
    const team = await prisma.teams.findUnique({ where: { id } });
    if (!team) {
        const error = new ApolloError('Team not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    return team;
}

async function getTeamMembers(teamId, authUser) {
    checkAuth(authUser);
    const team = await prisma.teams.findUnique({ where: { id: teamId } });
    if (!team) {
        const error = new ApolloError('Team not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    const members = await prisma.team_members.findMany({ where: { team_id: teamId } });
    const memberIds = members.map(member => member.member_id);
    return await prisma.users.findMany({ where: { id: { in: memberIds } } });
}

async function createTeam(data, authUser) {
    checkAuth(authUser,true);
    const existingTeam = await prisma.teams.findFirst({ where: { name: data.name, business_id: data.business_id } });
    if (existingTeam) {
        const error = new ForbiddenError('Team with this name already exists in this business');
        error.extensions.code = "FORBIDDEN";
        error.extensions.http = { status: 403 };
        throw error;
    }
    return await prisma.teams.create({ data });
}

async function updateTeam(id, data, authUser) {
    checkAuth(authUser,true);
    const team = await prisma.teams.findUnique({ where: { id } });
    if (!team) {
        const error = new ApolloError('Team not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    return await prisma.teams.update({
        where: { id },
        data,
    });
}

async function deleteTeam(id, authUser) {
    checkAuth(authUser,true);
    await prisma.team_members.deleteMany({ where: { team_id: id } });
    await prisma.teams.delete({ where: { id } });
    return true;
}

async function addMemberToTeam({ userId, teamId }, authUser) {
    checkAuth(authUser);
    if (!['manager', 'business'].includes(authUser.kind)) {
        const error = new ForbiddenError('Only managers or business users can add members to a team');
        error.extensions.code = "FORBIDDEN";
        error.extensions.http = { status: 403 };
        throw error;
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
        const error = new ApolloError('User not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    const team = await prisma.teams.findUnique({ where: { id: teamId } });
    if (!team) {
        const error = new ApolloError('Team not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    if (user.business_id !== team.business_id) {
        const error = new ForbiddenError('User and Team must belong to the same business');
        error.extensions.code = "FORBIDDEN";
        error.extensions.http = { status: 403 };
        throw error;
    }
    const existingMembership = await prisma.team_members.findFirst({ where: { member_id: userId, team_id: teamId } });
    if (existingMembership) {
        const error = new ForbiddenError('User is already a member of this team');
        error.extensions.code = "FORBIDDEN";
        error.extensions.http = { status: 403 };
        throw error;
    }

    return await prisma.team_members.create({ data: { member_id: userId, team_id: teamId } });
}

async function removeMemberFromTeam({ userId, teamId }, authUser) {
    checkAuth(authUser);
    if (!['manager', 'business'].includes(authUser.kind)) {
        const error = new ForbiddenError('Only managers or business users can remove members from a team');
        error.extensions.code = "FORBIDDEN";
        error.extensions.http = { status: 403 };
        throw error;
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
        const error = new ApolloError('User not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    const team = await prisma.teams.findUnique({ where: { id: teamId } });
    if (!team) {
        const error = new ApolloError('Team not found');
        error.extensions.code = "NOT_FOUND";
        error.extensions.http = { status: 404 };
        throw error;
    }
    if (user.business_id !== team.business_id) {
        const error = new ForbiddenError('User and Team must belong to the same business');
        error.extensions.code = "FORBIDDEN";
        error.extensions.http = { status: 403 };
        throw error;
    }
    const existingMembership = await prisma.team_members.findFirst({ where: { member_id: userId, team_id: teamId } });
    if (!existingMembership) {
        const error = new ForbiddenError('User is not a member of this team');
        error.extensions.code = "FORBIDDEN";
        error.extensions.http = { status: 403 };
        throw error;
    }

    let bool = null;
    try {
        await prisma.team_members.delete({ where: { id: existingMembership.id } });
        bool = true;
    } catch (error) {
        bool = false;
    }

    return bool;
}

module.exports = {
    getTeams,
    getTeam,
    createTeam,
    deleteTeam,
    updateTeam,
    addMemberToTeam,
    removeMemberFromTeam,
    getBusinessTeams,
    getTeamMembers,
};
