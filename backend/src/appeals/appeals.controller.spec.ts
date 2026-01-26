import { Test, TestingModule } from '@nestjs/testing';
import { AppealsController } from './appeals.controller';
import { AppealsService } from './appeals.service';
import { CreateAppealReminderDto, UpdateAppealReminderDto } from './dto/appeal.dto';

describe('AppealsController', () => {
  let controller: AppealsController;
  let service: AppealsService;

  const mockAppealsService = {
    findAll: jest.fn(),
    findCompleted: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    markComplete: jest.fn(),
    remove: jest.fn(),
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
    },
  };

  const mockRequest = {
    user: {
      userId: 'user-123',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppealsController],
      providers: [
        {
          provide: AppealsService,
          useValue: mockAppealsService,
        },
      ],
    }).compile();

    controller = module.get<AppealsController>(AppealsController);
    service = module.get<AppealsService>(AppealsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active appeal reminders', async () => {
      const mockReminders = [mockAppealReminder];
      mockAppealsService.findAll.mockResolvedValue(mockReminders);

      const result = await controller.findAll();

      expect(result).toEqual(mockReminders);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findCompleted', () => {
    it('should return completed appeal reminders', async () => {
      const completedReminder = { ...mockAppealReminder, estEffectue: true };
      mockAppealsService.findCompleted.mockResolvedValue([completedReminder]);

      const result = await controller.findCompleted();

      expect(result).toEqual([completedReminder]);
      expect(service.findCompleted).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single appeal reminder', async () => {
      mockAppealsService.findOne.mockResolvedValue(mockAppealReminder);

      const result = await controller.findOne('123');

      expect(result).toEqual(mockAppealReminder);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });
  });

  describe('create', () => {
    it('should create a new appeal reminder', async () => {
      const createDto: CreateAppealReminderDto = {
        affaireId: 'case-123',
        dateLimite: '2026-02-05T00:00:00.000Z',
        notes: 'Test notes',
      };

      mockAppealsService.create.mockResolvedValue(mockAppealReminder);

      const result = await controller.create(createDto, mockRequest);

      expect(result).toEqual(mockAppealReminder);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-123');
    });
  });

  describe('update', () => {
    it('should update an appeal reminder', async () => {
      const updateDto: UpdateAppealReminderDto = {
        notes: 'Updated notes',
      };

      const updatedReminder = { ...mockAppealReminder, notes: 'Updated notes' };
      mockAppealsService.update.mockResolvedValue(updatedReminder);

      const result = await controller.update('123', updateDto, mockRequest);

      expect(result).toEqual(updatedReminder);
      expect(service.update).toHaveBeenCalledWith('123', updateDto, 'user-123');
    });
  });

  describe('markComplete', () => {
    it('should mark an appeal reminder as complete', async () => {
      const completedReminder = { ...mockAppealReminder, estEffectue: true, dateEffectue: new Date() };
      mockAppealsService.markComplete.mockResolvedValue(completedReminder);

      const result = await controller.markComplete('123', mockRequest);

      expect(result).toEqual(completedReminder);
      expect(service.markComplete).toHaveBeenCalledWith('123', 'user-123');
    });
  });

  describe('remove', () => {
    it('should delete an appeal reminder', async () => {
      const deleteResponse = { message: 'Rappel de recours supprimé avec succès' };
      mockAppealsService.remove.mockResolvedValue(deleteResponse);

      const result = await controller.remove('123', mockRequest);

      expect(result).toEqual(deleteResponse);
      expect(service.remove).toHaveBeenCalledWith('123', 'user-123');
    });
  });
});
