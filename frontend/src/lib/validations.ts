// Validation schemas using Zod
// These schemas validate form inputs before sending to the API

import { z } from 'zod';

/**
 * Party role validation
 */
const partyRoleSchema = z.enum(['demandeur', 'defendeur', 'conseil_adverse'], {
  errorMap: () => ({ message: 'Rôle invalide' }),
});

/**
 * Party validation schema
 */
const partySchema = z.object({
  nom: z.string()
    .min(1, 'Le nom est obligatoire')
    .max(200, 'Maximum 200 caractères')
    .trim()
    .refine((val) => val.length > 0, {
      message: 'Le nom ne peut pas être vide',
    }),
  role: partyRoleSchema,
});

/**
 * Create case validation schema
 */
export const createCaseSchema = z.object({
  titre: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères')
    .trim(),
  
  juridiction: z.string()
    .min(1, 'La juridiction est obligatoire')
    .max(100, 'Maximum 100 caractères')
    .trim(),
  
  chambre: z.string()
    .max(100, 'Maximum 100 caractères')
    .trim()
    .optional()
    .or(z.literal('')),
  
  ville: z.string()
    .max(100, 'Maximum 100 caractères')
    .trim()
    .optional()
    .or(z.literal('')),
  
  parties: z.array(partySchema)
    .min(2, 'Au moins 2 parties sont requises (demandeur et défendeur)')
    .max(10, 'Maximum 10 parties'),
  
  observations: z.string()
    .max(2000, 'Maximum 2000 caractères')
    .trim()
    .optional()
    .or(z.literal('')),
});

export type CreateCaseFormData = z.infer<typeof createCaseSchema>;

/**
 * Hearing type validation
 */
const hearingTypeSchema = z.enum([
  'mise_en_etat',
  'plaidoirie',
  'refere',
  'evocation',
  'conciliation',
  'mediation',
  'autre',
], {
  errorMap: () => ({ message: 'Type d\'audience invalide' }),
});

/**
 * Create hearing validation schema
 */
export const createHearingSchema = z.object({
  affaireId: z.string()
    .uuid('ID d\'affaire invalide'),
  
  date: z.date({
    required_error: 'La date est obligatoire',
    invalid_type_error: 'Date invalide',
  }),
  
  heure: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide (HH:MM)')
    .optional()
    .or(z.literal('')),
  
  type: hearingTypeSchema,
  
  notesPreparation: z.string()
    .max(2000, 'Maximum 2000 caractères')
    .trim()
    .optional()
    .or(z.literal('')),
});

export type CreateHearingFormData = z.infer<typeof createHearingSchema>;

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est obligatoire')
    .email('Email invalide')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(1, 'Le mot de passe est obligatoire'),
    // Pas de validation stricte pour le login
    // L'utilisateur peut avoir un ancien mot de passe
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register validation schema
 */
export const registerSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est obligatoire')
    .email('Email invalide')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Maximum 100 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  
  confirmPassword: z.string()
    .min(1, 'Veuillez confirmer le mot de passe'),
  
  nomComplet: z.string()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(100, 'Maximum 100 caractères')
    .trim(),
  
  role: z.enum(['ADMIN', 'COLLABORATEUR'], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Change password validation schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Le mot de passe actuel est obligatoire'),
  
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Maximum 100 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  
  confirmNewPassword: z.string()
    .min(1, 'Veuillez confirmer le nouveau mot de passe'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'Le nouveau mot de passe doit être différent de l\'ancien',
  path: ['newPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Hearing result type validation
 */
const hearingResultTypeSchema = z.enum(['RENVOI', 'RADIATION', 'DELIBERE'], {
  errorMap: () => ({ message: 'Type de résultat invalide' }),
});

/**
 * Record hearing result validation schema
 */
export const recordHearingResultSchema = z.discriminatedUnion('type', [
  // RENVOI
  z.object({
    type: z.literal('RENVOI'),
    newDate: z.date({
      required_error: 'La nouvelle date est obligatoire pour un renvoi',
      invalid_type_error: 'Date invalide',
    }),
    postponementReason: z.string()
      .min(3, 'Le motif du renvoi doit contenir au moins 3 caractères')
      .max(500, 'Maximum 500 caractères')
      .trim(),
  }),
  // RADIATION
  z.object({
    type: z.literal('RADIATION'),
    radiationReason: z.string()
      .min(3, 'Le motif de radiation doit contenir au moins 3 caractères')
      .max(500, 'Maximum 500 caractères')
      .trim(),
  }),
  // DELIBERE
  z.object({
    type: z.literal('DELIBERE'),
    deliberationText: z.string()
      .min(3, 'Le texte du délibéré doit contenir au moins 3 caractères')
      .max(2000, 'Maximum 2000 caractères')
      .trim(),
  }),
]);

export type RecordHearingResultFormData = z.infer<typeof recordHearingResultSchema>;

/**
 * Update case validation schema (all fields optional)
 */
export const updateCaseSchema = createCaseSchema.partial();

export type UpdateCaseFormData = z.infer<typeof updateCaseSchema>;

/**
 * Update hearing validation schema (all fields optional)
 */
export const updateHearingSchema = createHearingSchema.partial();

export type UpdateHearingFormData = z.infer<typeof updateHearingSchema>;

