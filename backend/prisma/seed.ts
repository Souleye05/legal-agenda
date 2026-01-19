import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@legalagenda.com' },
    update: {},
    create: {
      email: 'admin@legalagenda.com',
      password: adminPassword,
      fullName: 'Maître Administrateur',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create collaborator user
  const collabPassword = await bcrypt.hash('collab123', 10);
  const collaborator = await prisma.user.upsert({
    where: { email: 'collaborateur@legalagenda.com' },
    update: {},
    create: {
      email: 'collaborateur@legalagenda.com',
      password: collabPassword,
      fullName: 'Jean Collaborateur',
      role: 'COLLABORATOR',
    },
  });

  console.log('✅ Collaborator user created:', collaborator.email);

  // Create sample cases
  const case1 = await prisma.case.create({
    data: {
      reference: 'AFF-2026-0001',
      title: 'Dupont c/ Martin - Expulsion',
      jurisdiction: 'Tribunal Judiciaire',
      chamber: 'Chambre civile',
      city: 'Paris',
      status: 'ACTIVE',
      observations: 'Affaire urgente - locataire en situation irrégulière depuis 6 mois',
      createdById: admin.id,
      parties: {
        create: [
          { name: 'Société Dupont SARL', role: 'DEMANDEUR' },
          { name: 'M. Jean Martin', role: 'DEFENDEUR' },
          { name: 'Me Lefebvre', role: 'CONSEIL_ADVERSE' },
        ],
      },
    },
  });

  const case2 = await prisma.case.create({
    data: {
      reference: 'AFF-2026-0002',
      title: 'SCI Horizon c/ Constructions Plus - Malfaçons',
      jurisdiction: 'Tribunal de Commerce',
      chamber: 'Chambre commerciale',
      city: 'Lyon',
      status: 'ACTIVE',
      observations: 'Expertise en cours - rapport attendu pour mars 2026',
      createdById: admin.id,
      parties: {
        create: [
          { name: 'SCI Horizon', role: 'DEMANDEUR' },
          { name: 'Constructions Plus SA', role: 'DEFENDEUR' },
        ],
      },
    },
  });

  console.log('✅ Sample cases created');

  // Create sample hearings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const hearing1 = await prisma.hearing.create({
    data: {
      date: tomorrow,
      time: '09:30',
      type: 'MISE_EN_ETAT',
      status: 'A_VENIR',
      preparationNotes: 'Vérifier échange des conclusions. Préparer demande de renvoi si conclusions adverses non reçues.',
      caseId: case1.id,
      createdById: admin.id,
    },
  });

  const hearing2 = await prisma.hearing.create({
    data: {
      date: tomorrow,
      time: '14:00',
      type: 'PLAIDOIRIE',
      status: 'A_VENIR',
      preparationNotes: 'Plaidoirie finale. Dossier complet. Prévoir 45 min de plaidoirie.',
      isPrepared: true,
      caseId: case2.id,
      createdById: admin.id,
    },
  });

  // Create a past unreported hearing
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2);

  const hearing3 = await prisma.hearing.create({
    data: {
      date: pastDate,
      time: '09:00',
      type: 'REFERE',
      status: 'NON_RENSEIGNEE',
      preparationNotes: 'Demande de provision urgente',
      isPrepared: true,
      caseId: case1.id,
      createdById: admin.id,
    },
  });

  // Create alert for unreported hearing
  await prisma.alert.create({
    data: {
      hearingId: hearing3.id,
      status: 'PENDING',
    },
  });

  console.log('✅ Sample hearings created');
  console.log('\n📋 Login credentials:');
  console.log('Admin: admin@legalagenda.com / admin123');
  console.log('Collaborator: collaborateur@legalagenda.com / collab123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
