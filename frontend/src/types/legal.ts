// Types for the Legal Agenda Application

export type CaseStatus = 'ACTIVE' | 'CLOTUREE' | 'RADIEE';

export type HearingStatus = 'A_VENIR' | 'TENUE' | 'NON_RENSEIGNEE';

export type HearingType = 
  | 'mise_en_etat' 
  | 'plaidoirie' 
  | 'refere' 
  | 'evocation' 
  | 'conciliation'
  | 'mediation'
  | 'autre';

export type HearingResultType = 'RENVOI' | 'RADIATION' | 'DELIBERE';

export interface Party {
  id: string;
  name: string;
  role: 'demandeur' | 'defendeur' | 'conseil_adverse';
}

export interface Case {
  id: string;
  reference: string; // Auto-generated: AFF-2026-0001
  title: string; // Short title: "X c/ Y - expulsion"
  parties: Party[];
  jurisdiction: string; // TGI, TC, CA, etc.
  chamber: string; // Civile, Commerciale, Référés
  city?: string;
  status: CaseStatus;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Hearing {
  id: string;
  caseId: string;
  case?: Case;
  date: Date;
  time?: string;
  type: HearingType;
  status: HearingStatus;
  preparationNotes?: string;
  isPrepared: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface HearingResult {
  id: string;
  hearingId: string;
  hearing?: Hearing;
  type: HearingResultType;
  // For RENVOI
  newDate?: Date;
  postponementReason?: string;
  // For RADIATION
  radiationReason?: string;
  // For DELIBERE
  deliberationText?: string;
  createdAt: Date;
  createdBy: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'collaborator';
  createdAt: Date;
}

// View Models
export interface DashboardStats {
  activeCases: number;
  upcomingHearings: number;
  unreportedHearings: number;
  tomorrowHearings: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  caseReference: string;
  parties: string;
  jurisdiction: string;
  chamber: string;
  status: HearingStatus;
  type: HearingType;
}

// Form types
export interface CreateCaseForm {
  title: string;
  parties: Party[];
  jurisdiction: string;
  chamber: string;
  city?: string;
  observations?: string;
}

export interface CreateHearingForm {
  caseId: string;
  date: Date;
  time?: string;
  type: HearingType;
  preparationNotes?: string;
}

export interface RecordResultForm {
  hearingId: string;
  type: HearingResultType;
  newDate?: Date;
  postponementReason?: string;
  radiationReason?: string;
  deliberationText?: string;
}
