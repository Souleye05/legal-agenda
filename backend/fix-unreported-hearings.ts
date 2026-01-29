/**
 * Script de correction pour les audiences non renseignées
 * 
 * Ce script corrige le statut des audiences passées qui sont encore marquées comme "A_VENIR"
 * alors qu'elles devraient être "NON_RENSEIGNEE"
 * 
 * Utilisation:
 *   npx ts-node fix-unreported-hearings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnreportedHearings() {
  console.log('🔧 Correction des audiences non renseignées...\n');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Trouver toutes les audiences passées avec statut A_VENIR et sans résultat
  const unreportedHearings = await prisma.audience.findMany({
    where: {
      date: { lt: today },
      statut: 'A_VENIR',
      resultat: { is: null },
    },
    include: {
      affaire: {
        select: {
          reference: true,
          titre: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  console.log(`📊 Trouvé ${unreportedHearings.length} audience(s) à corriger\n`);

  if (unreportedHearings.length === 0) {
    console.log('✅ Aucune correction nécessaire !');
    return;
  }

  // Afficher les audiences trouvées
  console.log('📋 Liste des audiences à corriger:');
  console.log('─'.repeat(80));
  unreportedHearings.forEach((hearing, index) => {
    const dateStr = hearing.date.toLocaleDateString('fr-FR');
    console.log(`${index + 1}. ${dateStr} - ${hearing.affaire.reference} - ${hearing.affaire.titre}`);
  });
  console.log('─'.repeat(80));
  console.log();

  // Demander confirmation
  console.log('⚠️  Ces audiences vont être marquées comme "NON_RENSEIGNEE"');
  console.log('   Voulez-vous continuer ? (y/n)');
  
  // En mode automatique (pour production), on continue directement
  const shouldContinue = process.env.AUTO_FIX === 'true' || process.argv.includes('--auto');
  
  if (!shouldContinue) {
    console.log('\n💡 Pour exécuter automatiquement, utilisez:');
    console.log('   npx ts-node fix-unreported-hearings.ts --auto');
    console.log('   ou');
    console.log('   AUTO_FIX=true npx ts-node fix-unreported-hearings.ts');
    return;
  }

  console.log('\n🔄 Correction en cours...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const hearing of unreportedHearings) {
    try {
      await prisma.audience.update({
        where: { id: hearing.id },
        data: { statut: 'NON_RENSEIGNEE' },
      });

      const dateStr = hearing.date.toLocaleDateString('fr-FR');
      console.log(`✅ ${dateStr} - ${hearing.affaire.reference} → NON_RENSEIGNEE`);
      successCount++;
    } catch (error) {
      console.error(`❌ Erreur pour ${hearing.affaire.reference}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`📊 Résumé:`);
  console.log(`   ✅ Corrigées: ${successCount}`);
  console.log(`   ❌ Erreurs: ${errorCount}`);
  console.log(`   📝 Total: ${unreportedHearings.length}`);
  console.log('─'.repeat(80));

  if (successCount > 0) {
    console.log('\n✅ Correction terminée avec succès !');
    console.log('💡 Les audiences sont maintenant visibles dans la page "À renseigner"');
  }
}

async function main() {
  try {
    await fixUnreportedHearings();
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
