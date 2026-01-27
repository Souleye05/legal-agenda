import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Hearing, Case, Party } from '@/types/api';
import logoCabinet from '@/assets/logo-cabinet.png';

interface HearingWithCase extends Hearing {
  affaire: Case & { parties?: Party[] };
}

const CABINET_ADDRESS = "7 Boulevard Dial Diop-Place de l'Obelisque : Immeuble Medoune Mbengue 2eme etage a gauche";
const CABINET_CITY = "Dakar SENEGAL";
const CABINET_CONTACT = "Tel : +221 33 823 85 06 - Fax : +221 33 842 38 31 - BP : 14.453 Dakar, Peytavin - Email : ibniang55@hotmail.com";

// Helper to add cabinet header with logo - matching the template
function addCabinetHeader(doc: jsPDF, yPosition: number): number {
  // Add logo at top left - Agrandir pour meilleure visibilité
  try {
    doc.addImage(logoCabinet, 'PNG', 20, yPosition, 70, 35);
  } catch (e) {
    // Fallback if logo fails to load
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text("CABINET Me IBRAHIMA NIANG", 20, yPosition + 15);
  }
  
  return yPosition + 45;
}

// Helper to add footer with cabinet address
function addFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  
  // Draw a line above footer
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(20, pageHeight - 25, 190, pageHeight - 25);
  
  doc.text(CABINET_ADDRESS, 105, pageHeight - 20, { align: 'center' });
  doc.text(CABINET_CITY, 105, pageHeight - 15, { align: 'center' });
  doc.text(CABINET_CONTACT, 105, pageHeight - 10, { align: 'center' });
}

// Generate daily report PDF - Following the cabinet letter template
export function generateDailyReportPDF(hearings: HearingWithCase[], date: Date): void {
  const doc = new jsPDF();
  
  if (hearings.length === 0) {
    let y = addCabinetHeader(doc, 15);
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text("Aucune audience enregistree pour cette date.", 20, y + 20);
    addFooter(doc);
    doc.save(`compte-rendu-${format(date, 'yyyy-MM-dd')}.pdf`);
    return;
  }
  
  // Generate one page per hearing (like the template - one letter per case)
  hearings.forEach((hearing, index) => {
    if (index > 0) {
      doc.addPage();
    }
    
    const caseData = hearing.affaire;
    const parties = caseData.parties || [];
    const demandeur = parties.find(p => p.role === 'DEMANDEUR');
    const defendeurs = parties.filter(p => p.role === 'DEFENDEUR').map(p => p.nom).join(', ');
    const demandeurs = parties.filter(p => p.role === 'DEMANDEUR').map(p => p.nom).join(', ');
    
    let y = addCabinetHeader(doc, 15);
    
    // Date at top right
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    doc.setTextColor(0, 0, 0);
    const dateFormatted = format(date, 'd MMMM yyyy', { locale: fr });
    doc.text(`Dakar, le ${dateFormatted}`, 190, y, { align: 'right' });
    y += 15;
    
    // Recipient block (A L'ATTENTION DE)
    doc.setFont('times', 'bold');
    doc.text("A L'ATTENTION DE :", 20, y);
    y += 8;
    
    doc.setFont('times', 'normal');
    if (demandeur) {
      doc.text(demandeur.nom, 20, y);
      y += 5;
    } else {
      doc.text("Client", 20, y);
      y += 5;
    }
    y += 10;
    
    // Title - COMPTE RENDU D'AUDIENCE
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text("COMPTE RENDU D'AUDIENCE", 105, y, { align: 'center' });
    y += 12;
    
    // Case reference
    doc.setFontSize(12);
    doc.text(`AFFAIRE : ${demandeurs} c/ ${defendeurs}`, 105, y, { align: 'center' });
    y += 15;
    
    // Body of the letter
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    
    // Greeting
    const civilite = demandeur?.nom?.includes('SARL') || demandeur?.nom?.includes('SA') || demandeur?.nom?.includes('SCI') 
      ? "Messieurs" : "Cher Client";
    doc.text(civilite + ",", 20, y);
    y += 10;
    
    // Main content
    const hearingDateFormatted = format(new Date(hearing.date), 'd MMMM yyyy', { locale: fr });
    const jurisdiction = caseData.juridiction || "la juridiction competente";
    
    let bodyText = `Je vous prie de noter que la procedure citee en reference a ete evoquee a l'audience du ${hearingDateFormatted} du ${jurisdiction}.`;
    let bodyLines = doc.splitTextToSize(bodyText, 170);
    doc.text(bodyLines, 20, y);
    y += bodyLines.length * 6 + 5;
    
    // Result information
    if (hearing.resultatType) {
      let resultText = "";
      if (hearing.resultatType === 'RENVOI') {
        const newDate = hearing.nouvelleDate 
          ? format(new Date(hearing.nouvelleDate), 'd MMMM yyyy', { locale: fr })
          : '[date a confirmer]';
        const motif = hearing.motifRenvoi || 'pour poursuite des debats';
        resultText = `A cette date, elle a ete renvoyee au ${newDate} ${motif}.`;
      } else if (hearing.resultatType === 'RADIATION') {
        const motif = hearing.motifRadiation || 'defaut de diligences';
        resultText = `A cette date, l'affaire a ete radiee du role pour ${motif}.`;
      } else if (hearing.resultatType === 'DELIBERE') {
        const decision = hearing.texteDelibere || 'decision rendue';
        resultText = `A cette date, l'affaire a ete mise en delibere. Decision : ${decision}`;
      }
      
      if (resultText) {
        const resultLines = doc.splitTextToSize(resultText, 170);
        doc.text(resultLines, 20, y);
        y += resultLines.length * 6 + 5;
      }
    } else {
      doc.text("Le resultat de l'audience sera communique ulterieurement.", 20, y);
      y += 10;
    }
    
    // Promise to keep informed
    doc.text("Nous vous tiendrons regulierement informe du suivi.", 20, y);
    y += 15;
    
    // Closing
    doc.text("Votre bien devoue.", 20, y);
    y += 20;
    
    // Signature
    doc.setFont('times', 'bold');
    doc.text("Maitre Ibrahima NIANG", 20, y);
  });
  
  // Add footers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc);
  }
  
  doc.save(`compte-rendu-${format(date, 'yyyy-MM-dd')}.pdf`);
}

// Generate tracking sheet PDF - Black & White theme
export function generateTrackingSheetPDF(hearings: HearingWithCase[], date: Date): void {
  const doc = new jsPDF();
  const dateStr = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  
  let y = addCabinetHeader(doc, 20);
  
  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text("FICHE DE SUIVI DES AUDIENCES", 105, y, { align: 'center' });
  y += 8;
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.text(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), 105, y, { align: 'center' });
  y += 10;
  
  // Instructions
  doc.setFontSize(9);
  doc.setFont('times', 'italic');
  doc.text("Renseigner les résultats et transmettre à la secrétaire pour saisie.", 105, y, { align: 'center' });
  y += 10;
  
  if (hearings.length === 0) {
    doc.setFont('times', 'normal');
    doc.text("Aucune audience prévue pour cette date.", 20, y);
  } else {
    // Group by jurisdiction
    const byJurisdiction = hearings.reduce((acc, hearing) => {
      const key = hearing.affaire.juridiction;
      if (!acc[key]) acc[key] = [];
      acc[key].push(hearing);
      return acc;
    }, {} as Record<string, HearingWithCase[]>);
    
    Object.entries(byJurisdiction).forEach(([jurisdiction, jurisdictionHearings]) => {
      // Check if we need a new page
      if (y > 220) {
        doc.addPage();
        y = 20;
      }
      
      // Jurisdiction header - Simple border with bold text (économie d'encre)
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(20, y - 5, 170, 8, 'S');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text(jurisdiction.toUpperCase(), 25, y);
      y += 10;
      
      jurisdictionHearings.forEach((hearing, index) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        const caseData = hearing.affaire;
        const parties = caseData.parties || [];
        const demandeurs = parties.filter(p => p.role === 'DEMANDEUR').map(p => p.nom).join(', ');
        const defendeurs = parties.filter(p => p.role === 'DEFENDEUR').map(p => p.nom).join(', ');
        
        doc.setFontSize(10);
        doc.setFont('times', 'bold');
        doc.text(`${index + 1}. ${caseData.reference} - ${caseData.titre}`, 25, y);
        y += 5;
        
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        const hearingTypeLabel = hearing.type === 'PLAIDOIRIE' ? 'Plaidoirie' : 
                                 hearing.type === 'MISE_EN_ETAT' ? 'Mise en état' :
                                 hearing.type === 'RENVOI' ? 'Renvoi' : hearing.type;
        doc.text(`Chambre: ${caseData.chambre || '-'} | Heure: ${hearing.heure || '-'} | Type: ${hearingTypeLabel}`, 30, y);
        y += 4;
        doc.text(`Dem.: ${demandeurs}  |  Déf.: ${defendeurs}`, 30, y);
        y += 8;
        
        // Result boxes - Clean black border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.setFontSize(8);
        doc.rect(30, y, 150, 25);
        
        // Draw checkbox squares manually instead of using special characters
        const checkboxSize = 3;
        const checkboxY1 = y + 4;
        const checkboxY2 = y + 11;
        const checkboxY3 = y + 18;
        
        // First checkbox
        doc.rect(35, checkboxY1, checkboxSize, checkboxSize);
        doc.text('RENVOI - Date: ___/___/_____ Motif: _________________________________', 40, y + 6);
        
        // Second checkbox
        doc.rect(35, checkboxY2, checkboxSize, checkboxSize);
        doc.text('RADIATION - Motif: ________________________________________________', 40, y + 13);
        
        // Third checkbox
        doc.rect(35, checkboxY3, checkboxSize, checkboxSize);
        doc.text('DELIBERE - Decision: ______________________________________________', 40, y + 20);
        
        y += 35;
      });
      
      y += 5;
    });
  }
  
  // Signature section
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  y += 10;
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.text('Collaborateur: _________________________', 25, y);
  doc.text('Date: ___/___/_____', 130, y);
  y += 10;
  doc.text('Signature: _________________________', 25, y);
  
  doc.save(`fiche-suivi-${format(date, 'yyyy-MM-dd')}.pdf`);
}

// Generate tomorrow hearings PDF - Black & White theme
export function generateTomorrowHearingsPDF(hearings: HearingWithCase[], date: Date): void {
  const doc = new jsPDF();
  const dateStr = format(date, 'EEEE d MMMM yyyy', { locale: fr });
  
  let y = addCabinetHeader(doc, 20);
  
  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text("AUDIENCES DU LENDEMAIN", 105, y, { align: 'center' });
  y += 8;
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.text(dateStr.charAt(0).toUpperCase() + dateStr.slice(1), 105, y, { align: 'center' });
  y += 15;
  
  if (hearings.length === 0) {
    doc.text("Aucune audience prévue.", 20, y);
  } else {
    hearings.forEach((hearing, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      const caseData = hearing.affaire;
      const parties = caseData.parties || [];
      const demandeurs = parties.filter(p => p.role === 'DEMANDEUR').map(p => p.nom).join(', ');
      const defendeurs = parties.filter(p => p.role === 'DEFENDEUR').map(p => p.nom).join(', ');
      
      // Header - Simple border (économie d'encre)
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(20, y - 5, 170, 8, 'S');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('times', 'bold');
      doc.text(`${index + 1}. ${caseData.reference}`, 25, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      doc.text(`Intitulé: ${caseData.titre}`, 25, y);
      y += 5;
      doc.text(`Juridiction: ${caseData.juridiction} | Chambre: ${caseData.chambre || '-'}`, 25, y);
      y += 5;
      const hearingTypeLabel = hearing.type === 'PLAIDOIRIE' ? 'Plaidoirie' : 
                               hearing.type === 'MISE_EN_ETAT' ? 'Mise en état' :
                               hearing.type === 'RENVOI' ? 'Renvoi' : hearing.type;
      doc.text(`Heure: ${hearing.heure || 'Non précisée'} | Type: ${hearingTypeLabel}`, 25, y);
      y += 5;
      doc.text(`Demandeur(s): ${demandeurs}`, 25, y);
      y += 5;
      doc.text(`Défendeur(s): ${defendeurs}`, 25, y);
      y += 5;
      
      if (hearing.notesPreparation) {
        const lines = doc.splitTextToSize(`Notes: ${hearing.notesPreparation}`, 160);
        doc.text(lines, 25, y);
        y += lines.length * 5;
      }
      
      y += 10;
    });
  }
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc);
  }
  
  doc.save(`audiences-${format(date, 'yyyy-MM-dd')}.pdf`);
}
