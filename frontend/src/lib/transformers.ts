/**
 * Data transformers to convert API responses to component-compatible types
 * API uses French field names, components use English field names
 */

import type { Hearing as ApiHearing, Case as ApiCase, Party as ApiParty } from '@/types/api';
import type { Hearing, Case, Party } from '@/types/legal';

/**
 * Transform API Party to component Party
 */
export const transformParty = (apiParty: ApiParty): Party => {
  return {
    id: apiParty.id,
    nom: apiParty.nom,
    name: apiParty.nom, // Alias for compatibility
    role: apiParty.role,
  };
};

/**
 * Transform API Case to component Case
 */
export const transformCase = (apiCase: ApiCase): Case => {
  return {
    id: apiCase.id,
    reference: apiCase.reference,
    title: apiCase.titre,
    parties: apiCase.parties?.map(transformParty) || [],
    jurisdiction: apiCase.juridiction,
    chamber: apiCase.chambre || '',
    city: apiCase.ville,
    status: apiCase.statut,
    observations: apiCase.observations,
    createdAt: new Date(apiCase.createdAt),
    updatedAt: new Date(apiCase.updatedAt),
    createdBy: apiCase.createdBy,
  };
};

/**
 * Transform API Hearing to component Hearing
 */
export const transformHearing = (apiHearing: ApiHearing): Hearing => {
  return {
    id: apiHearing.id,
    caseId: apiHearing.affaireId,
    case: apiHearing.affaire ? transformCase(apiHearing.affaire) : undefined,
    date: new Date(apiHearing.date),
    time: apiHearing.heure,
    type: apiHearing.type,
    status: apiHearing.statut,
    preparationNotes: apiHearing.notesPreparation,
    isPrepared: apiHearing.estPrepare,
    createdAt: new Date(apiHearing.createdAt),
    updatedAt: new Date(apiHearing.updatedAt),
    createdBy: apiHearing.createdBy,
  };
};

/**
 * Transform API Hearing with embedded Case
 */
export const transformHearingWithCase = (apiHearing: ApiHearing): Hearing & { affaire: Case } => {
  const transformed = transformHearing(apiHearing);
  return {
    ...transformed,
    affaire: apiHearing.affaire ? transformCase(apiHearing.affaire) : ({} as Case),
  };
};
