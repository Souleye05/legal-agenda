import { Case, Hearing, DashboardStats, CalendarEvent } from '@/types/legal';
import { addDays, subDays, format } from 'date-fns';

// Mock cases
export const mockCases: Case[] = [
  {
    id: '1',
    reference: 'AFF-2026-0001',
    title: 'Dupont c/ Martin - Expulsion',
    parties: [
      { id: '1', name: 'Société Dupont SARL', role: 'demandeur' },
      { id: '2', name: 'M. Jean Martin', role: 'defendeur' },
      { id: '3', name: 'Me Lefebvre', role: 'conseil_adverse' },
    ],
    jurisdiction: 'Tribunal Judiciaire',
    chamber: 'Chambre civile',
    city: 'Paris',
    status: 'ACTIVE',
    observations: 'Affaire urgente - locataire en situation irrégulière depuis 6 mois',
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-10'),
    createdBy: 'admin',
  },
  {
    id: '2',
    reference: 'AFF-2026-0002',
    title: 'SCI Horizon c/ Constructions Plus - Malfaçons',
    parties: [
      { id: '4', name: 'SCI Horizon', role: 'demandeur' },
      { id: '5', name: 'Constructions Plus SA', role: 'defendeur' },
    ],
    jurisdiction: 'Tribunal de Commerce',
    chamber: 'Chambre commerciale',
    city: 'Lyon',
    status: 'ACTIVE',
    observations: 'Expertise en cours - rapport attendu pour mars 2026',
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-01-15'),
    createdBy: 'admin',
  },
  {
    id: '3',
    reference: 'AFF-2026-0003',
    title: 'Mme Dubois c/ Assurances Générale - Indemnisation',
    parties: [
      { id: '6', name: 'Mme Marie Dubois', role: 'demandeur' },
      { id: '7', name: 'Assurances Générale SA', role: 'defendeur' },
    ],
    jurisdiction: 'Cour d\'Appel',
    chamber: 'Chambre civile 1',
    city: 'Versailles',
    status: 'ACTIVE',
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-01-12'),
    createdBy: 'collaborateur1',
  },
  {
    id: '4',
    reference: 'AFF-2025-0045',
    title: 'Bernard c/ Société Immo - Vente annulée',
    parties: [
      { id: '8', name: 'M. Pierre Bernard', role: 'demandeur' },
      { id: '9', name: 'Société Immo Invest', role: 'defendeur' },
    ],
    jurisdiction: 'Tribunal Judiciaire',
    chamber: 'Chambre civile',
    city: 'Nantes',
    status: 'CLOTUREE',
    observations: 'Jugement rendu le 15/12/2025 - Demande rejetée',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-12-15'),
    createdBy: 'admin',
  },
];

// Mock hearings
const today = new Date();
export const mockHearings: Hearing[] = [
  {
    id: '1',
    caseId: '1',
    date: addDays(today, 1),
    time: '09:30',
    type: 'mise_en_etat',
    status: 'A_VENIR',
    preparationNotes: 'Vérifier échange des conclusions. Préparer demande de renvoi si conclusions adverses non reçues.',
    isPrepared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
  },
  {
    id: '2',
    caseId: '2',
    date: addDays(today, 1),
    time: '14:00',
    type: 'plaidoirie',
    status: 'A_VENIR',
    preparationNotes: 'Plaidoirie finale. Dossier complet. Prévoir 45 min de plaidoirie.',
    isPrepared: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
  },
  {
    id: '3',
    caseId: '3',
    date: addDays(today, 3),
    time: '10:00',
    type: 'evocation',
    status: 'A_VENIR',
    preparationNotes: 'Première évocation devant la Cour. Préparer mémoire ampliatif.',
    isPrepared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'collaborateur1',
  },
  {
    id: '4',
    caseId: '1',
    date: subDays(today, 2),
    time: '09:00',
    type: 'refere',
    status: 'NON_RENSEIGNEE',
    preparationNotes: 'Demande de provision urgente',
    isPrepared: true,
    createdAt: subDays(today, 10),
    updatedAt: subDays(today, 2),
    createdBy: 'admin',
  },
  {
    id: '5',
    caseId: '2',
    date: subDays(today, 5),
    time: '11:00',
    type: 'mise_en_etat',
    status: 'NON_RENSEIGNEE',
    preparationNotes: 'Calendrier de procédure',
    isPrepared: true,
    createdAt: subDays(today, 15),
    updatedAt: subDays(today, 5),
    createdBy: 'admin',
  },
  {
    id: '6',
    caseId: '1',
    date: addDays(today, 7),
    time: '14:30',
    type: 'mise_en_etat',
    status: 'A_VENIR',
    preparationNotes: '',
    isPrepared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
  },
];

// Dashboard stats
export const mockDashboardStats: DashboardStats = {
  activeCases: mockCases.filter(c => c.status === 'ACTIVE').length,
  upcomingHearings: mockHearings.filter(h => h.status === 'A_VENIR').length,
  unreportedHearings: mockHearings.filter(h => h.status === 'NON_RENSEIGNEE').length,
  tomorrowHearings: mockHearings.filter(h => {
    const tomorrow = addDays(today, 1);
    return format(h.date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd');
  }).length,
};

// Helper to get case by ID
export const getCaseById = (id: string): Case | undefined => {
  return mockCases.find(c => c.id === id);
};

// Helper to get hearings for a case
export const getHearingsForCase = (caseId: string): Hearing[] => {
  return mockHearings.filter(h => h.caseId === caseId);
};

// Helper to get unreported hearings
export const getUnreportedHearings = (): (Hearing & { case: Case })[] => {
  return mockHearings
    .filter(h => h.status === 'NON_RENSEIGNEE')
    .map(h => ({
      ...h,
      case: getCaseById(h.caseId)!,
    }));
};

// Helper to get tomorrow's hearings
export const getTomorrowHearings = (): (Hearing & { case: Case })[] => {
  const tomorrow = addDays(today, 1);
  return mockHearings
    .filter(h => format(h.date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd'))
    .map(h => ({
      ...h,
      case: getCaseById(h.caseId)!,
    }))
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
};

// Convert hearings to calendar events
export const getCalendarEvents = (): CalendarEvent[] => {
  return mockHearings.map(h => {
    const caseData = getCaseById(h.caseId)!;
    return {
      id: h.id,
      title: caseData.title,
      date: h.date,
      time: h.time,
      caseReference: caseData.reference,
      parties: caseData.parties.map(p => p.name).join(' / '),
      jurisdiction: caseData.jurisdiction,
      chamber: caseData.chamber,
      status: h.status,
      type: h.type,
    };
  });
};

// Hearing type labels
export const hearingTypeLabels: Record<string, string> = {
  mise_en_etat: 'Mise en état',
  plaidoirie: 'Plaidoirie',
  refere: 'Référé',
  evocation: 'Évocation',
  conciliation: 'Conciliation',
  mediation: 'Médiation',
  autre: 'Autre',
};

// Jurisdiction options
export const jurisdictionOptions = [
  'Tribunal Judiciaire',
  'Tribunal de Commerce',
  'Tribunal de Travail',
  'Cour d\'Appel',
  'Cour de Cassation',
  'Tribunal Administratif',
  'Cour Administrative d\'Appel',
];

// Chamber options
export const chamberOptions = [
  'Chambre civile',
  'Chambre commerciale',
  'Chambre sociale',
  'Chambre des référés',
  'Chambre correctionnelle',
  'Chambre de l\'instruction',
  'Chambre civile 1',
  'Chambre civile 2',
  'Chambre civile 3',
];
