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

  const affaire3 = await prisma.affaire.create({
    data: {
      reference: 'RG-2026-0003',
      titre: 'Ndiaye c/ SGBS - Litige bancaire',
      juridiction: 'Tribunal de Grande Instance',
      chambre: 'Chambre civile',
      ville: 'Dakar',
      statut: 'ACTIVE',
      observations: 'Contestation de frais bancaires abusifs - montant en litige: 2.5M FCFA',
      createurId: admin.id,
      parties: {
        create: [
          { nom: 'Moustapha Ndiaye', role: 'DEMANDEUR' },
          { nom: 'Société Générale de Banques au Sénégal', role: 'DEFENDEUR' },
          { nom: 'Me Diop & Associés', role: 'CONSEIL_ADVERSE' },
        ],
      },
    },
  });

  const affaire4 = await prisma.affaire.create({
    data: {
      reference: 'COM-2026-0004',
      titre: 'Import-Export SA c/ TransLog - Rupture de contrat',
      juridiction: 'Tribunal de Commerce',
      chambre: 'Chambre commerciale',
      ville: 'Dakar',
      statut: 'ACTIVE',
      observations: 'Rupture abusive de contrat de transport - préjudice estimé à 15M FCFA',
      createurId: collaborator.id,
      parties: {
        create: [
          { nom: 'Import-Export SA', role: 'DEMANDEUR' },
          { nom: 'TransLog International', role: 'DEFENDEUR' },
        ],
      },
    },
  });

  const affaire5 = await prisma.affaire.create({
    data: {
      reference: 'SOC-2026-0005',
      titre: 'Diallo c/ Entreprise BTP Plus - Licenciement abusif',
      juridiction: 'Tribunal du Travail',
      ville: 'Dakar',
      statut: 'ACTIVE',
      observations: 'Licenciement sans cause réelle et sérieuse - salarié avec 8 ans d\'ancienneté',
      createurId: admin.id,
      parties: {
        create: [
          { nom: 'Amadou Diallo', role: 'DEMANDEUR' },
          { nom: 'Entreprise BTP Plus SARL', role: 'DEFENDEUR' },
          { nom: 'Cabinet Juridique Sow', role: 'CONSEIL_ADVERSE' },
        ],
      },
    },
  });

  const affaire6 = await prisma.affaire.create({
    data: {
      reference: 'FAM-2026-0006',
      titre: 'Divorce Sarr / Fall',
      juridiction: 'Tribunal de Grande Instance',
      chambre: 'Chambre de la famille',
      ville: 'Thiès',
      statut: 'ACTIVE',
      observations: 'Divorce contentieux - liquidation du régime matrimonial en cours',
      createurId: collaborator.id,
      parties: {
        create: [
          { nom: 'Mme Aïssatou Sarr', role: 'DEMANDEUR' },
          { nom: 'M. Ibrahima Fall', role: 'DEFENDEUR' },
        ],
      },
    },
  });

  const affaire7 = await prisma.affaire.create({
    data: {
      reference: 'IMM-2026-0007',
      titre: 'Copropriété Les Almadies c/ Syndic Gestion Plus',
      juridiction: 'Tribunal de Grande Instance',
      chambre: 'Chambre civile',
      ville: 'Dakar',
      statut: 'ACTIVE',
      observations: 'Mauvaise gestion de la copropriété - détournement présumé de charges',
      createurId: admin.id,
      parties: {
        create: [
          { nom: 'Copropriété Les Almadies', role: 'DEMANDEUR' },
          { nom: 'Syndic Gestion Plus', role: 'DEFENDEUR' },
        ],
      },
    },
  });

  const affaire8 = await prisma.affaire.create({
    data: {
      reference: 'PEN-2026-0008',
      titre: 'Ministère Public c/ Sow - Escroquerie',
      juridiction: 'Tribunal Correctionnel',
      ville: 'Dakar',
      statut: 'ACTIVE',
      observations: 'Constitution partie civile pour la victime - préjudice: 8M FCFA',
      createurId: admin.id,
      parties: {
        create: [
          { nom: 'Ministère Public', role: 'DEMANDEUR' },
          { nom: 'Ousmane Sow', role: 'DEFENDEUR' },
          { nom: 'Me Kane', role: 'CONSEIL_ADVERSE' },
        ],
      },
    },
  });

  const affaire9 = await prisma.affaire.create({
    data: {
      reference: 'ADM-2026-0009',
      titre: 'Société TechSen c/ État du Sénégal - Contentieux administratif',
      juridiction: 'Cour Suprême',
      chambre: 'Chambre administrative',
      ville: 'Dakar',
      statut: 'CLOTUREE',
      observations: 'Recours contre décision administrative - affaire clôturée suite à transaction',
      createurId: collaborator.id,
      parties: {
        create: [
          { nom: 'Société TechSen SARL', role: 'DEMANDEUR' },
          { nom: 'État du Sénégal', role: 'DEFENDEUR' },
        ],
      },
    },
  });

  console.log('✅ 9 sample cases created (8 active, 1 closed)');

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
