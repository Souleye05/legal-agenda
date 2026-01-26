import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Appeals (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let caseId: string;
  let reminderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database
    await prisma.rappelRecours.deleteMany();
    await prisma.resultatAudience.deleteMany();
    await prisma.audience.deleteMany();
    await prisma.partie.deleteMany();
    await prisma.affaire.deleteMany();
    await prisma.utilisateur.deleteMany();

    // Create test user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test-appeals@example.com',
        password: 'Test123!',
        nomComplet: 'Test User Appeals',
      });

    authToken = registerResponse.body.access_token;
    userId = registerResponse.body.user.id;

    // Create test case
    const caseResponse = await request(app.getHttpServer())
      .post('/cases')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        reference: 'AFF-2026-TEST-001',
        titre: 'Test Case for Appeals',
        juridiction: 'TJ Paris',
        chambre: '1ère chambre',
        ville: 'Paris',
        parties: [
          { nom: 'Demandeur Test', role: 'DEMANDEUR' },
          { nom: 'Défendeur Test', role: 'DEFENDEUR' },
        ],
      });

    caseId = caseResponse.body.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.rappelRecours.deleteMany();
    await prisma.resultatAudience.deleteMany();
    await prisma.audience.deleteMany();
    await prisma.partie.deleteMany();
    await prisma.affaire.deleteMany();
    await prisma.utilisateur.deleteMany();

    await app.close();
  });

  describe('POST /appeals', () => {
    it('should create a new appeal reminder', async () => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 10);

      const response = await request(app.getHttpServer())
        .post('/appeals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          affaireId: caseId,
          dateLimite: deadline.toISOString(),
          notes: 'Test appeal reminder',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.affaireId).toBe(caseId);
      expect(response.body.notes).toBe('Test appeal reminder');
      expect(response.body.estEffectue).toBe(false);

      reminderId = response.body.id;
    });

    it('should fail without authentication', async () => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 10);

      await request(app.getHttpServer())
        .post('/appeals')
        .send({
          affaireId: caseId,
          dateLimite: deadline.toISOString(),
        })
        .expect(401);
    });

    it('should fail with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/appeals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          affaireId: 'invalid-id',
          dateLimite: 'invalid-date',
        })
        .expect(400);
    });
  });

  describe('GET /appeals', () => {
    it('should return all active appeal reminders', async () => {
      const response = await request(app.getHttpServer())
        .get('/appeals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('affaire');
      expect(response.body[0].estEffectue).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/appeals')
        .expect(401);
    });
  });

  describe('GET /appeals/:id', () => {
    it('should return a specific appeal reminder', async () => {
      const response = await request(app.getHttpServer())
        .get(`/appeals/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(reminderId);
      expect(response.body).toHaveProperty('affaire');
      expect(response.body.affaire).toHaveProperty('parties');
    });

    it('should return 404 for non-existent reminder', async () => {
      await request(app.getHttpServer())
        .get('/appeals/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /appeals/:id', () => {
    it('should update an appeal reminder', async () => {
      const response = await request(app.getHttpServer())
        .put(`/appeals/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notes: 'Updated notes',
        })
        .expect(200);

      expect(response.body.notes).toBe('Updated notes');
    });

    it('should update deadline', async () => {
      const newDeadline = new Date();
      newDeadline.setDate(newDeadline.getDate() + 15);

      const response = await request(app.getHttpServer())
        .put(`/appeals/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dateLimite: newDeadline.toISOString(),
        })
        .expect(200);

      const returnedDate = new Date(response.body.dateLimite);
      expect(returnedDate.getDate()).toBe(newDeadline.getDate());
    });
  });

  describe('PUT /appeals/:id/complete', () => {
    it('should mark an appeal reminder as complete', async () => {
      const response = await request(app.getHttpServer())
        .put(`/appeals/${reminderId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.estEffectue).toBe(true);
      expect(response.body.dateEffectue).toBeDefined();
    });
  });

  describe('GET /appeals/completed', () => {
    it('should return completed appeal reminders', async () => {
      const response = await request(app.getHttpServer())
        .get('/appeals/completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].estEffectue).toBe(true);
    });
  });

  describe('DELETE /appeals/:id', () => {
    it('should delete an appeal reminder', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/appeals/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Rappel de recours supprimé avec succès');

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/appeals/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Integration with Hearings', () => {
    it('should create appeal reminder when recording DELIBERE result', async () => {
      // Create hearing
      const hearingDate = new Date();
      hearingDate.setDate(hearingDate.getDate() - 1); // Yesterday

      const hearingResponse = await request(app.getHttpServer())
        .post('/hearings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          affaireId: caseId,
          date: hearingDate.toISOString(),
          heure: '14:00',
          type: 'PLAIDOIRIE',
        });

      const hearingId = hearingResponse.body.id;

      // Record DELIBERE result with appeal reminder
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 10);

      await request(app.getHttpServer())
        .post(`/hearings/${hearingId}/result`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'DELIBERE',
          texteDelibere: 'Test deliberation',
          creerRappelRecours: true,
          dateLimiteRecours: deadline.toISOString(),
          notesRecours: 'Auto-created appeal reminder',
        })
        .expect(201);

      // Verify appeal reminder was created
      const appealsResponse = await request(app.getHttpServer())
        .get('/appeals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const autoCreatedReminder = appealsResponse.body.find(
        (r: any) => r.notes === 'Auto-created appeal reminder',
      );

      expect(autoCreatedReminder).toBeDefined();
      expect(autoCreatedReminder.affaireId).toBe(caseId);
    });
  });
});
