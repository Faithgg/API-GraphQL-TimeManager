const { PrismaClient } = require('@prisma/client');
const { AuthenticationError} = require('apollo-server-express');
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

const prisma = new PrismaClient();

async function getAuthUser(user) {
    if (user==null) return null;
    let existingUser = await prisma.users.findFirst({ where: { email: user.email } });
    if (!existingUser) {
        existingUser = await createUser(user);
    } else{
        if (existingUser.email === user.email) {
            const firstName = user.name ? user.name.split(' ')[0] : null;
            let lastName = null;
            if (user.name && user.name.split(' ').length > 1) {
                lastName = user.name.split(' ').slice(1).join(' ');
            }
            existingUser = await prisma.users.update({
                where: { id: existingUser.id },
                data: { google_id: user.uid, first_name: firstName, last_name: lastName },
            });
        }
    }

    if (user.user_id == "ci-runner") {
        existingUser = await prisma.users.findFirst({ where: { email: superAdminEmail } });
    }
    return { id: existingUser.id, email: existingUser.email, kind: existingUser.kind , business_id: existingUser.business_id, uid: user.uid  };
}

function checkAuth (authUser, onlyForBusiness = false) {
   if (!authUser) { 
    const error = new AuthenticationError('Token invalide ou manquant');
    error.extensions.code = "UNAUTHORIZED";
    error.extensions.http = { status: 401 };
    throw error;
   }
   if (onlyForBusiness && authUser.kind !== 'business') {
       const error = new ForbiddenError('Accès interdit aux utilisateurs non business');
       error.extensions.code = "FORBIDDEN";
       error.extensions.http = { status: 403 };
       throw error;
   }
}
function createUser (user) {    
    return prisma.users.create({
        data: {
            google_id: user.uid,
            email: user.email,
            first_name: user.name ? user.name.split(' ')[0] : null,
            last_name: user.name ? user.name.split(' ').slice(1).join(' ') : null,
            kind: 'user',
        },
    });
}

async function revokeToken (uid) {
    let bool = false;
    try {
        await admin.auth().revokeRefreshTokens(uid);
        console.log(`Refresh tokens révoqués pour l'utilisateur ${uid}`);
        bool = true;
    } catch (error) {
        console.error(`Erreur lors de la révocation des tokens pour ${uid}:`, error);
    }
    return bool;
}

module.exports = {
    getAuthUser,
    checkAuth,
    revokeToken
};