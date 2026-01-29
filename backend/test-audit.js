const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAudit() {
  console.log('🔍 Vérification du journal d\'audit...\n');

  try {
    // Compter le nombre total d'entrées
    const totalCount = await prisma.journalAudit.count();
    console.log(`📊 Total d'entrées dans le journal: ${totalCount}`);

    if (totalCount === 0) {
      console.log('⚠️  Le journal d\'audit est vide!\n');
      console.log('Cela peut signifier:');
      console.log('  1. Aucune action n\'a encore été effectuée');
      console.log('  2. Le service d\'audit ne fonctionne pas correctement\n');
      return;
    }

    // Récupérer les 10 dernières entrées
    console.log('\n📝 Les 10 dernières entrées:\n');
    const recentEntries = await prisma.journalAudit.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateur: {
          select: {
            nomComplet: true,
            email: true,
          },
        },
      },
    });

    recentEntries.forEach((entry, index) => {
      console.log(`${index + 1}. [${entry.action}] ${entry.typeEntite} (${entry.idEntite})`);
      console.log(`   Par: ${entry.utilisateur.nomComplet} (${entry.utilisateur.email})`);
      console.log(`   Date: ${entry.createdAt.toLocaleString('fr-FR')}`);
      if (entry.ancienneValeur) {
        console.log(`   Ancienne valeur: ${entry.ancienneValeur.substring(0, 100)}...`);
      }
      if (entry.nouvelleValeur) {
        console.log(`   Nouvelle valeur: ${entry.nouvelleValeur.substring(0, 100)}...`);
      }
      console.log('');
    });

    // Statistiques par type d'action
    console.log('\n📈 Statistiques par action:');
    const statsByAction = await prisma.journalAudit.groupBy({
      by: ['action'],
      _count: true,
    });
    statsByAction.forEach(stat => {
      console.log(`   ${stat.action}: ${stat._count} entrées`);
    });

    // Statistiques par type d'entité
    console.log('\n📈 Statistiques par type d\'entité:');
    const statsByEntity = await prisma.journalAudit.groupBy({
      by: ['typeEntite'],
      _count: true,
    });
    statsByEntity.forEach(stat => {
      console.log(`   ${stat.typeEntite}: ${stat._count} entrées`);
    });

    // Vérifier les utilisateurs qui ont fait des actions
    console.log('\n👥 Utilisateurs actifs:');
    const activeUsers = await prisma.journalAudit.groupBy({
      by: ['utilisateurId'],
      _count: true,
    });
    
    for (const userStat of activeUsers) {
      const user = await prisma.utilisateur.findUnique({
        where: { id: userStat.utilisateurId },
        select: { nomComplet: true, email: true },
      });
      console.log(`   ${user.nomComplet} (${user.email}): ${userStat._count} actions`);
    }

    console.log('\n✅ Le journal d\'audit fonctionne correctement!\n');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testAudit();
