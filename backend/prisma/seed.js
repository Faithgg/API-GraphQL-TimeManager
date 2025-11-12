const { PrismaClient, Kind } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const business = await prisma.business.create({
    data: {
      name: "Tech Corp",
      description: "Entreprise pour tests",
    },
  });

  const users = await Promise.all([
    prisma.users.create({ data: { first_name: "Faithgot", last_name: "Tech", email: "faithgot.tech@gmail.com", phone_number: "1234567890", kind: Kind.business, business_id: business.id } }),
    prisma.users.create({ data: { first_name: "Alice", last_name: "Manager", email: "alice@techcorp.com", phone_number: "1234567891", kind: Kind.manager, business_id: business.id } }),
    prisma.users.create({ data: { first_name: "Bob", last_name: "Employee", email: "bob@techcorp.com", phone_number: "1234567892", kind: Kind.employee, business_id: business.id } }),
    prisma.users.create({ data: { first_name: "Charlie", last_name: "Employee", email: "charlie@techcorp.com", phone_number: "1234567893", kind: Kind.employee, business_id: business.id } }),
    prisma.users.create({ data: { first_name: "David", last_name: "Manager", email: "david@techcorp.com", phone_number: "1234567894", kind: Kind.manager, business_id: business.id } }),
    prisma.users.create({ data: { first_name: "Eve", last_name: "Employee", email: "eve@techcorp.com", phone_number: "1234567895", kind: Kind.employee, business_id: business.id } }),
  ]);

  const team1 = await prisma.teams.create({
    data: {
      name: "Équipe Alpha",
      description: "L'équipe principale",
      business_id: business.id,
      manager_id: users[0].id, // Alice
    },
  });

  const team2 = await prisma.teams.create({
    data: {
      name: "Équipe Beta",
      description: "L'équipe secondaire",
      business_id: business.id,
      manager_id: users[3].id, // David
    },
  });

  await Promise.all([
    prisma.team_members.create({ data: { team_id: team1.id, member_id: users[1].id } }), // Bob
    prisma.team_members.create({ data: { team_id: team1.id, member_id: users[2].id } }), // Charlie
    prisma.team_members.create({ data: { team_id: team2.id, member_id: users[4].id } }), // Eve
  ]);

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
