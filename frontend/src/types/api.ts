// API Types - Strict TypeScript interfaces for API responses
// These types match the backend Prisma schema (French field names)

/**
 * User roles
 */
export type UserRole = 'ADMIN' | 'COLLABORATEUR';

/**
 * User interface (from backend Utilisateur model)
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastLoginUserAgent?: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Party role in a case
 */
export type PartyRole = 'DEMANDEUR' | 'DEFENDEUR' | 'CONSEIL_ADVERSE';

/**
 * Party interface (Partie model)
 */
export interface Party {
  id: string;
  nom: string;
  role: PartyRole;
  affaireId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Case interface (Affaire model)
 */
export interface Case {
  id: string;
  reference: string;
  titre: string;
  juridiction: string;
  chambre?: string;
  ville?: string;
  statut: CaseStatus;
  parties?: Party[];
  observations?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Hearing interface (Audience model)
 */
export interface Hearing {
  id: string;
  affaireId: string;
  affaire?: Case;
  date: string;
  heure?: string;
  type: HearingType;
  statut: HearingStatus;
  notesPreparation?: string;
  resultatType?: HearingResultType;
  resultatDetails?: string;
  nouvelleDate?: string;
  motifRenvoi?: string;
  motifRadiation?: string;
  texteDelibere?: string;
  estPreparee: boolean;
  rappelEnrolement?: boolean;
  dateRappelEnrolement?: string;
  enrolementEffectue?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Audit log interface (JournalAudit model)
 */
export interface AuditLog {
  id: string;
  utilisateurId: string;
  utilisateur?: User;
  action: string;
  entite: string;
  entiteId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * Alert interface (Alerte model)
 */
export interface Alert {
  id: string;
  audienceId: string;
  audience?: Hearing;
  type: string;
  message: string;
  estEnvoyee: boolean;
  dateEnvoi?: string;
  createdAt: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  upcomingHearings: number;
  unreportedHearings: number;
}

/**
 * Create case DTO
 */
export interface CreateCaseDto {
  reference: string;
  titre: string;
  juridiction: string;
  chambre?: string;
  ville?: string;
  parties: Array<{
    nom: string;
    role: PartyRole;
  }>;
  observations?: string;
}

/**
 * Update case DTO
 */
export interface UpdateCaseDto {
  titre?: string;
  juridiction?: string;
  chambre?: string;
  ville?: string;
  statut?: CaseStatus;
  observations?: string;
}

/**
 * Create hearing DTO
 */
export interface CreateHearingDto {
  affaireId: string;
  date: string;
  heure?: string;
  type: HearingType;
  notesPreparation?: string;
  rappelEnrolement?: boolean;
}

/**
 * Update hearing DTO
 */
export interface UpdateHearingDto {
  date?: string;
  heure?: string;
  type?: HearingType;
  notesPreparation?: string;
  estPreparee?: boolean;
}

/**
 * Record hearing result DTO
 */
export interface RecordHearingResultDto {
  type: HearingResultType;
  nouvelleDate?: string;
  motifRenvoi?: string;
  motifRadiation?: string;
  texteDelibere?: string;
}

/**
 * Login DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Register DTO
 */
export interface RegisterDto {
  email: string;
  password: string;
  nomComplet: string;
}

/**
 * Change password DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

/**
 * Forgot password DTO
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * Reset password DTO
 */
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

/**
 * Refresh token DTO
 */
export interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API Error response
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// Re-export types from legal.ts for convenience
export type { CaseStatus, HearingType, HearingStatus, HearingResultType } from './legal';
