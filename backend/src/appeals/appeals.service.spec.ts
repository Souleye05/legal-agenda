import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AppealsService } from './appeals.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('AppealsService', () => {
  let service: AppealsService;
  let prismaService: PrismaService;
  let auditService: AuditService;

  const mockPrismaService = {
    rappelRecours: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockAppealReminder = {
    id: '123',
    affaireId: 'case-123',
    dateLimite: new Date('2026-02-05'),
    estEffectue: false,
    dateEffectue: null,
    notes: 'Test notes',
    resultatAudienceId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createurId: 'user-123',
    affaire: {
      id: 'case-123',
      reference: 'AFF-2026-001',
      titre: 'Test Case',
      juridiction: 'TJ Paris',
      chambre: '1ère chambre',
      parties: [],
    },
    createur: {
      id: 'user-123',
      nomComplet: 'Test User',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppealsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<AppealsService>(AppealsService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active appeal reminders', async () => {
      const mockReminders = [mockAppealReminder];
      mockPrismaService.rappelRecours.findMany.mockResolvedValue(mockReminders);

      const result = await service.findAll();

      expect(result).toEqual(mockReminders);
      expect(mockPrismaService.rappelRecours.findMany).toHaveBeenCalledWith({
        where: { estEffectue: false },
        include: {
          affaire: { include: { parties: true } },
          resultatAudience: { include: { audience: true } },
          createur: { select: { id: true, nomComplet: true } },
        },
        orderBy: [{ dateLimite: 'asc' }],
      });
    });

    it('should return empty array when no reminders exist', async () => {
      mockPrismaService.rappelRecours.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findCompleted', () => {
    it('should return completed appeal reminders', async () => {
      const completedReminder = { ...mockAppealReminder, estEffectue: true, dateEffectue: new Date() };
      mockPrismaService.rappelRecours.findMany.mockResolvedValue([completedReminder]);

      const result = await service.findCompleted();

      expect(result).toEqual([completedReminder]);
      expect(mockPrismaService.rappelRecours.findMany).toHaveBeenCalledWith({
        where: { estEffectue: true },
        include: {
          affaire: { include: { parties: true } },
          resultatAudience: { include: { audience: true } },
          createur: { select: { id: true, nomComplet: true } },
        },
        orderBy: [{ dateEffectue: 'desc' }],
        take: 50,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single appeal reminder', async () => {
      mockPrismaService.rappelRecours.findUnique.mockResolvedValue(mockAppealReminder);

      const result = await service.findOne('123');

      expect(result).toEqual(mockAppealReminder);
      expect(mockPrismaService.rappelRecours.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: {
          affaire: { include: { parties: true } },
          resultatAudience: { include: { audience: true } },
          createur: { select: { id: true, nomComplet: true } },
        },
      });
    });

    it('should throw NotFoundException when reminder not found', async () => {
      mockPrismaService.rappelRecours.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new appeal reminder', async () => {
      const createDto = {
        affaireId: 'case-123',
        dateLimite: '2026-02-05T00:00:00.000Z',
        notes: 'Test notes',
      };

      mockPrismaService.rappelRecours.create.mockResolvedValue(mockAppealReminder);

      const result = await service.create(createDto, 'user-123');

      expect(result).toEqual(mockAppealReminder);
      expect(mockPrismaService.rappelRecours.create).toHaveBeenCalledWith({
        data: {
          affaireId: createDto.affaireId,
          dateLimite: new Date(createDto.dateLimite),
          notes: createDto.notes,
          resultatAudienceId: undefined,
          createurId: 'user-123',
        },
        include: {
          affaire: { include: { parties: true } },
          resultatAudience: { include: { audience: true } },
        },
      });
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'RappelRecours',
        mockAppealReminder.id,
        'CREATION',
        null,
        JSON.stringify(mockAppealReminder),
        'user-123',
      );
    });
  });

  describe('update', () => {
    it('should update an appeal reminder', async () => {
      const updateDto = {
        notes: 'Updated notes',
        dateLimite: '2026-02-10T00:00:00.000Z',
      };

      const updatedReminder = { ...mockAppealReminder, notes: 'Updated notes' };

      mockPrismaService.rappelRecours.findUnique.mockResolvedValue(mockAppealReminder);
      mockPrismaService.rappelRecours.update.mockResolvedValue(updatedReminder);

      const result = await service.update('123', updateDto, 'user-123');

      expect(result).toEqual(updatedReminder);
      expect(mockPrismaService.rappelRecours.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          dateLimite: new Date(updateDto.dateLimite),
          notes: updateDto.notes,
        },
        include: {
          affaire: { include: { parties: true } },
          resultatAudience: { include: { audience: true } },
        },
      });
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should mark reminder as complete when estEffectue is true', async () => {
      const updateDto = { estEffectue: true };
      const completedReminder = { ...mockAppealReminder, estEffectue: true, dateEffectue: expect.any(Date) };

      mockPrismaService.rappelRecours.findUnique.mockResolvedValue(mockAppealReminder);
      mockPrismaService.rappelRecours.update.mockResolvedValue(completedReminder);

      await service.update('123', updateDto, 'user-123');

      expect(mockPrismaService.rappelRecours.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estEffectue: true,
            dateEffectue: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('markComplete', () => {
    it('should mark an appeal reminder as complete', async () => {
      const completedReminder = { ...mockAppealReminder, estEffectue: true, dateEffectue: new Date() };

      mockPrismaService.rappelRecours.findUnique.mockResolvedValue(mockAppealReminder);
      mockPrismaService.rappelRecours.update.mockResolvedValue(completedReminder);

      const result = await service.markComplete('123', 'user-123');

      expect(result.estEffectue).toBe(true);
      expect(result.dateEffectue).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete an appeal reminder', async () => {
      mockPrismaService.rappelRecours.findUnique.mockResolvedValue(mockAppealReminder);
      mockPrismaService.rappelRecours.delete.mockResolvedValue(mockAppealReminder);

      const result = await service.remove('123', 'user-123');

      expect(result).toEqual({ message: 'Rappel de recours supprimé avec succès' });
      expect(mockPrismaService.rappelRecours.delete).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'RappelRecours',
        '123',
        'SUPPRESSION',
        JSON.stringify(mockAppealReminder),
        null,
        'user-123',
      );
    });
  });

  describe('calculateDefaultDeadline', () => {
    it('should calculate deadline 10 days after deliberation', () => {
      const deliberationDate = new Date('2026-01-26');
      const expectedDeadline = new Date('2026-02-05');
      expectedDeadline.setHours(23, 59, 59, 999);

      const result = service.calculateDefaultDeadline(deliberationDate);

      expect(result.getDate()).toBe(expectedDeadline.getDate());
      expect(result.getMonth()).toBe(expectedDeadline.getMonth());
      expect(result.getFullYear()).toBe(expectedDeadline.getFullYear());
    });
  });
});
