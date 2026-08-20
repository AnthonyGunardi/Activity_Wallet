const { sequelize, Activity } = require('../../src/models');
const { ActivityStatus } = require('../../src/constants/enums');
const adminActivityService = require('../../src/services/adminActivityService');
const { AppError } = require('../../src/utils/responseEnvelope');

describe('AdminActivityService Unit Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Activity.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('createActivity', () => {
    test('should create a new activity successfully', async () => {
      const activity = await adminActivityService.createActivity({
        name: 'Jet Skiing',
        price: 350000,
        description: 'High speed water sport',
        status: ActivityStatus.ACTIVE
      });

      expect(activity).toBeDefined();
      expect(activity.id).toBeDefined();
      expect(activity.name).toBe('Jet Skiing');
      expect(activity.price).toBe(350000);
      expect(activity.description).toBe('High speed water sport');
      expect(activity.status).toBe(ActivityStatus.ACTIVE);
    });

    test('should default status to ACTIVE if not provided', async () => {
      const activity = await adminActivityService.createActivity({
        name: 'Banana Boat',
        price: 150000
      });

      expect(activity.status).toBe(ActivityStatus.ACTIVE);
      expect(activity.description).toBeNull();
    });

    test('should throw 409 ACTIVITY_ALREADY_EXISTS when creating duplicate activity name', async () => {
      await adminActivityService.createActivity({
        name: 'Snorkeling',
        price: 200000
      });

      await expect(
        adminActivityService.createActivity({
          name: 'Snorkeling',
          price: 250000
        })
      ).rejects.toThrow(AppError);

      try {
        await adminActivityService.createActivity({
          name: 'Snorkeling',
          price: 250000
        });
      } catch (err) {
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('ACTIVITY_ALREADY_EXISTS');
      }
    });
  });

  describe('listActivities', () => {
    test('should list all activities when no filter is given', async () => {
      await Activity.bulkCreate([
        { name: 'Donut Boat', price: 175000, status: ActivityStatus.ACTIVE },
        { name: 'Scuba Diving', price: 500000, status: ActivityStatus.INACTIVE }
      ]);

      const activities = await adminActivityService.listActivities();
      expect(activities.length).toBe(2);
    });

    test('should filter activities by status when provided', async () => {
      await Activity.bulkCreate([
        { name: 'Donut Boat', price: 175000, status: ActivityStatus.ACTIVE },
        { name: 'Scuba Diving', price: 500000, status: ActivityStatus.INACTIVE }
      ]);

      const activeList = await adminActivityService.listActivities({ status: ActivityStatus.ACTIVE });
      expect(activeList.length).toBe(1);
      expect(activeList[0].name).toBe('Donut Boat');

      const inactiveList = await adminActivityService.listActivities({ status: ActivityStatus.INACTIVE });
      expect(inactiveList.length).toBe(1);
      expect(inactiveList[0].name).toBe('Scuba Diving');
    });
  });

  describe('getActivityById', () => {
    test('should retrieve an existing activity by ID', async () => {
      const created = await Activity.create({
        name: 'Kayaking',
        price: 120000,
        status: ActivityStatus.ACTIVE
      });

      const found = await adminActivityService.getActivityById(created.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Kayaking');
    });

    test('should throw 404 ACTIVITY_NOT_FOUND when ID does not exist', async () => {
      await expect(
        adminActivityService.getActivityById('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(AppError);

      try {
        await adminActivityService.getActivityById('00000000-0000-0000-0000-000000000000');
      } catch (err) {
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe('ACTIVITY_NOT_FOUND');
      }
    });
  });

  describe('updateActivity', () => {
    test('should update activity price, name, description, and status successfully', async () => {
      const created = await Activity.create({
        name: 'Old Name',
        price: 100000,
        description: 'Old Desc',
        status: ActivityStatus.ACTIVE
      });

      const updated = await adminActivityService.updateActivity(created.id, {
        name: 'New Name',
        price: 150000,
        description: 'New Desc',
        status: ActivityStatus.INACTIVE
      });

      expect(updated.name).toBe('New Name');
      expect(updated.price).toBe(150000);
      expect(updated.description).toBe('New Desc');
      expect(updated.status).toBe(ActivityStatus.INACTIVE);
    });

    test('should throw 404 ACTIVITY_NOT_FOUND when updating non-existent activity', async () => {
      await expect(
        adminActivityService.updateActivity('00000000-0000-0000-0000-000000000000', {
          price: 200000
        })
      ).rejects.toThrow(AppError);
    });

    test('should throw 409 ACTIVITY_ALREADY_EXISTS when updating name to an existing activity name', async () => {
      await Activity.create({
        name: 'Activity One',
        price: 100000
      });
      const act2 = await Activity.create({
        name: 'Activity Two',
        price: 200000
      });

      await expect(
        adminActivityService.updateActivity(act2.id, {
          name: 'Activity One'
        })
      ).rejects.toThrow(AppError);

      try {
        await adminActivityService.updateActivity(act2.id, {
          name: 'Activity One'
        });
      } catch (err) {
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('ACTIVITY_ALREADY_EXISTS');
      }
    });

    test('should allow update with unchanged name and null description', async () => {
      const act = await Activity.create({
        name: 'Keep Name',
        price: 100000,
        description: 'Existing Desc'
      });

      const updated = await adminActivityService.updateActivity(act.id, {
        name: 'Keep Name',
        description: ''
      });

      expect(updated.name).toBe('Keep Name');
      expect(updated.description).toBeNull();
    });
  });
});
