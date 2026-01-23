import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanSeedData() {
  console.log('Nettoyage des donnees du seed...');

  try {
    // Recuperer les IDs des utilisateurs du seed
    const seedUsers = await prisma.utilisateur.findMany({
      where: {
        email: {
          in: [
            'admin@legalagenda.com',
            'collaborateur@legalagenda.com',
          ],
        },
      },
      select: { id: true },
    });

    const userIds = seedUsers.map(u => u.id);

    if (userIds.length === 0) {
      console.log('Aucune donnee du seed trouvee.');
      return;
    }

    console.log(`${userIds.length} utilisateurs du seed trouves`);

    // Supprimer le journal d'audit lie a ces utilisateurs
    const deletedAudit = await prisma.journalAudit.deleteMany({
      where: {
        utilisateurId: {
          in: userIds,
        },
      },
    });
    console.log(`${deletedAudit.count} entrees d'audit supprimees`);

    // Supprimer les affaires creees par ces utilisateurs
    // (les audiences et resultats seront supprimes en cascade)
    const deletedCases = await prisma.affaire.deleteMany({
      where: {
        createurId: {
          in: userIds,
        },
      },
    });
    console.log(`${deletedCases.count} affaires supprimees`);

    // Supprimer les utilisateurs du seed
    const deletedUsers = await prisma.utilisateur.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
    console.log(`${deletedUsers.count} utilisateurs supprimes`);
    
    console.log('Nettoyage termine !');
    console.log('La base est maintenant vide et prete pour vos tests.');
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanSeedData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
