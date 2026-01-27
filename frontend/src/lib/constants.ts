// Constants for Legal Agenda Application

import { HearingType, HearingStatus, CaseStatus } from '@/types/legal';

/**
 * Labels français pour les types d'audience
 */
export const HEARING_TYPE_LABELS: Record<HearingType, string> = {
  MISE_EN_ETAT: 'Mise en état',
  PLAIDOIRIE: 'Plaidoirie',
  REFERE: 'Référé',
  EVOCATION: 'Évocation',
  CONCILIATION: 'Conciliation',
  MEDIATION: 'Médiation',
  AUTRE: 'Autre',
};

/**
 * Labels français pour les statuts d'audience
 */
export const HEARING_STATUS_LABELS: Record<HearingStatus, string> = {
  A_VENIR: 'À venir',
  TENUE: 'Tenue',
  NON_RENSEIGNEE: 'Non renseignée',
};

/**
 * Labels français pour les statuts d'affaire
 */
export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  ACTIVE: 'Active',
  CLOTUREE: 'Clôturée',
  RADIEE: 'Radiée',
};

/**
 * Options de juridiction
 */
export const JURISDICTION_OPTIONS = [
  'Tribunal de Grande Instance',
  'Tribunal d\'Instance',
  'Tribunal de Commerce',
  'Tribunal de Travail',
  'Cour d\'Appel',
  'Cour de Cassation',
  'Tribunal Administratif',
  'Cour Administrative d\'Appel',
] as const;

/**
 * Options de chambre
 */
export const CHAMBER_OPTIONS = [
  'Chambre civile',
  'Chambre commerciale',
  'Chambre sociale',
  'Chambre criminelle',
  'Chambre des référés',
  'Chambre correctionnelle',
  'Chambre de l\'instruction',
  'Chambre civile 1',
  'Chambre civile 2',
  'Chambre civile 3',
] as const;

/**
 * Rôles des parties
 */
export const PARTY_ROLES = {
  demandeur: 'Demandeur',
  defendeur: 'Défendeur',
  conseil_adverse: 'Conseil adverse',
} as const;

/**
 * Types de résultat d'audience
 */
export const HEARING_RESULT_TYPES = {
  RENVOI: 'Renvoi',
  RADIATION: 'Radiation',
  DELIBERE: 'Délibéré',
} as const;

/**
 * Configuration React Query
 */
export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  REFETCH_INTERVAL: {
    ALERTS: 60 * 1000, // 1 minute pour les alertes
    DASHBOARD: 5 * 60 * 1000, // 5 minutes pour le dashboard
  },
} as const;

/**
 * Limites de pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Délais de debounce (ms)
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
} as const;
