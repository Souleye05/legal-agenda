import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@legalagenda.com' },
    update: {},
    create: {
      email: 'admin@legalagenda.com',
      motDePasse: adminPassword,
      nomComplet: 'Maître Administrateur',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create collaborator user
  const collabPassword = await bcrypt.hash('collab123', 10);
  const collaborator = await prisma.utilisateur.upsert({
    where: { email: 'collaborateur@legalagenda.com' },
    update: {},
    create: {
      email: 'collaborateur@legalagenda.com',
      motDePasse: collabPassword,
      nomComplet: 'Jean Collaborateur',
      role: 'COLLABORATEUR',
    },
  });

  console.log('✅ Collaborator user created:', collaborator.email);

  // Create sample cases
  const affaire1 = await prisma.affaire.create({
    data: {
      reference: 'AFF-2026-0001',
      titre: 'Dupont c/ Martin - Expulsion',
      juridiction: 'Tribunal Judiciaire',
      chambre: 'Chambre civile',
      ville: 'Dakar',
      statut: 'ACTIVE',
      observations: 'Affaire urgente - locataire en situation irrégulière depuis 6 mois',
      createurId: admin.id,
      parties: {
        create: [
          { nom: 'Société Dupont SARL', role: 'DEMANDEUR' },
          { nom: 'M. Jean Martin', role: 'DEFENDEUR' },
          { nom: 'Me Lefebvre', role: 'CONSEIL_ADVERSE' },
        ],
      },
    },
  });

  const affaire2 = await prisma.affaire.create({
    data: {
      reference: 'AFF-2026-0002',
      titre: 'SCI Horizon c/ Constructions Plus - Malfaçons',
      juridiction: 'Tribunal de Commerce',
      chambre: 'Chambre commerciale',
      ville: 'Lyon',
      statut: 'ACTIVE',
      observations: 'Expertise en cours - rapport attendu pour mars 2026',
      createurId: admin.id,
      parties: {
        create: [
          { nom: 'SCI Horizon', role: 'DEMANDEUR' },
          { nom: 'Constructions Plus SA', role: 'DEFENDEUR' },
        ],
      },
    },
  });

  console.log('✅ Sample cases created');

  // Create sample hearings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const audience1 = await prisma.audience.create({
    data: {
      date: tomorrow,
      heure: '09:30',
      type: 'MISE_EN_ETAT',
      statut: 'A_VENIR',
      notesPreparation: 'Vérifier échange des conclusions. Préparer demande de renvoi si conclusions adverses non reçues.',
      affaireId: affaire1.id,
      createurId: admin.id,
    },
  });

  const audience2 = await prisma.audience.create({
    data: {
      date: tomorrow,
      heure: '14:00',
      type: 'PLAIDOIRIE',
      statut: 'A_VENIR',
      notesPreparation: 'Plaidoirie finale. Dossier complet. Prévoir 45 min de plaidoirie.',
      estPreparee: true,
      affaireId: affaire2.id,
      createurId: admin.id,
    },
  });

  // Create a past unreported hearing
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2);

  const audience3 = await prisma.audience.create({
    data: {
      date: pastDate,
      heure: '09:00',
      type: 'REFERE',
      statut: 'NON_RENSEIGNEE',
      notesPreparation: 'Demande de provision urgente',
      estPreparee: true,
      affaireId: affaire1.id,
      createurId: admin.id,
    },
  });

  // Create alert for unreported hearing
  await prisma.alerte.create({
    data: {
      audienceId: audience3.id,
      statut: 'EN_ATTENTE',
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
