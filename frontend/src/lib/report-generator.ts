import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Hearing, Case, HearingResult } from '@/types/legal';
import { hearingTypeLabels } from './mock-data';

interface HearingWithCase extends Hearing {
  case: Case;
  result?: HearingResult;
}

// Generate daily hearing report
export function generateDailyReport(hearings: HearingWithCase[], date: Date): string {
  const dateStr = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  
  let report = `
═══════════════════════════════════════════════════════════════════
                    CABINET MAÎTRE IBRAHIMA NIANG
                         AVOCAT À LA COUR
═══════════════════════════════════════════════════════════════════

                    COMPTES RENDUS D'AUDIENCE
                        ${dateStr.toUpperCase()}

═══════════════════════════════════════════════════════════════════

`;

  if (hearings.length === 0) {
    report += `Aucune audience enregistrée pour cette date.\n`;
    return report;
  }

  hearings.forEach((hearing, index) => {
    const caseData = hearing.case;
    const demandeurs = caseData.parties.filter(p => p.role === 'demandeur').map(p => p.name).join(', ');
    const defendeurs = caseData.parties.filter(p => p.role === 'defendeur').map(p => p.name).join(', ');
    
    report += `───────────────────────────────────────────────────────────────────
AUDIENCE N°${index + 1}
───────────────────────────────────────────────────────────────────

AFFAIRE:         ${caseData.reference}
INTITULÉ:        ${caseData.title}
JURIDICTION:     ${caseData.jurisdiction}
CHAMBRE:         ${caseData.chamber || 'Non précisée'}
HEURE:           ${hearing.time || 'Non précisée'}
TYPE:            ${hearingTypeLabels[hearing.type] || hearing.type}

PARTIES:
  • Demandeur(s): ${demandeurs}
  • Défendeur(s): ${defendeurs}

`;

    if (hearing.result) {
      report += `RÉSULTAT:        ${hearing.result.type}\n\n`;
      
      if (hearing.result.type === 'RENVOI') {
        const newDate = hearing.result.newDate 
          ? format(new Date(hearing.result.newDate), 'dd MMMM yyyy', { locale: fr })
          : 'Non précisée';
        report += `NOUVELLE DATE:   ${newDate}\n`;
        report += `MOTIF DU RENVOI: ${hearing.result.postponementReason || 'Non précisé'}\n`;
      } else if (hearing.result.type === 'RADIATION') {
        report += `MOTIF DE LA RADIATION: ${hearing.result.radiationReason || 'Non précisé'}\n`;
      } else if (hearing.result.type === 'DELIBERE') {
        report += `DÉLIBÉRÉ RENDU:\n${hearing.result.deliberationText || 'Non précisé'}\n`;
      }
    } else {
      report += `RÉSULTAT:        En attente de saisie\n`;
    }

    report += `\n`;
  });

  report += `
═══════════════════════════════════════════════════════════════════
                         FIN DU RAPPORT
              Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
═══════════════════════════════════════════════════════════════════
`;

  return report;
}

// Generate tomorrow's hearings tracking sheet by jurisdiction
export function generateTomorrowTrackingSheet(hearings: HearingWithCase[], date: Date): string {
  const dateStr = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  
  // Group by jurisdiction
  const byJurisdiction = hearings.reduce((acc, hearing) => {
    const key = hearing.case.jurisdiction;
    if (!acc[key]) acc[key] = [];
    acc[key].push(hearing);
    return acc;
  }, {} as Record<string, HearingWithCase[]>);

  let sheet = `
═══════════════════════════════════════════════════════════════════
                    CABINET MAÎTRE IBRAHIMA NIANG
                         AVOCAT À LA COUR
═══════════════════════════════════════════════════════════════════

             FICHE DE SUIVI DES AUDIENCES DU ${dateStr.toUpperCase()}

═══════════════════════════════════════════════════════════════════

Instructions: Renseigner les résultats dans la colonne prévue et
transmettre cette fiche à la secrétaire pour saisie dans l'application.

`;

  if (hearings.length === 0) {
    sheet += `Aucune audience prévue pour cette date.\n`;
    return sheet;
  }

  Object.entries(byJurisdiction).forEach(([jurisdiction, jurisdictionHearings]) => {
    sheet += `
┌──────────────────────────────────────────────────────────────────┐
│  ${jurisdiction.toUpperCase().padEnd(62)} │
└──────────────────────────────────────────────────────────────────┘

`;

    jurisdictionHearings.forEach((hearing, index) => {
      const caseData = hearing.case;
      const demandeurs = caseData.parties.filter(p => p.role === 'demandeur').map(p => p.name).join(', ');
      const defendeurs = caseData.parties.filter(p => p.role === 'defendeur').map(p => p.name).join(', ');
      
      sheet += `───────────────────────────────────────────────────────────────────
AFFAIRE ${index + 1}: ${caseData.reference}
───────────────────────────────────────────────────────────────────
Intitulé:     ${caseData.title}
Chambre:      ${caseData.chamber || 'Non précisée'}
Heure:        ${hearing.time || 'Non précisée'}
Type:         ${hearingTypeLabels[hearing.type] || hearing.type}
Demandeur(s): ${demandeurs}
Défendeur(s): ${defendeurs}

${hearing.preparationNotes ? `Notes: ${hearing.preparationNotes}\n` : ''}
┌─────────────────────────────────────────────────────────────────┐
│  RÉSULTAT À RENSEIGNER                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  □ RENVOI     Date: ____/____/________                         │
│               Motif: _________________________________________ │
│               ________________________________________________ │
│                                                                 │
│  □ RADIATION  Motif: _________________________________________ │
│               ________________________________________________ │
│                                                                 │
│  □ DÉLIBÉRÉ   Décision: ______________________________________ │
│               ________________________________________________ │
│               ________________________________________________ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

`;
    });
  });

  sheet += `
═══════════════════════════════════════════════════════════════════
                     FIN DE LA FICHE DE SUIVI
              
Collaborateur: _________________________  Date: ____/____/________

Signature: _________________________

═══════════════════════════════════════════════════════════════════
`;

  return sheet;
}

// Download text as file
export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Print content
export function printContent(content: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Impression</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              white-space: pre-wrap;
              padding: 20px;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}
