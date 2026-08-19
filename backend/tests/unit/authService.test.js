const { sequelize, User } = require('../../src/models');
const authService = require('../../src/services/authService');
const { UserRole } = require('../../src/constants/enums');
const { AppError } = require('../../src/utils/responseEnvelope');

describe('Auth Service Unit Tests', () => {
  let activeUser, inactiveUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    activeUser = await User.create({
      username: 'unit_admin',
      password_hash: 'adminpassword',
      name: 'Unit Admin',
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    });

    inactiveUser = await User.create({
      username: 'unit_inactive',
      password_hash: 'inactivepassword',
      name: 'Unit Inactive',
      role: UserRole.STAFF,
      status: 'INACTIVE'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('generateToken & verifyToken', () => {
    test('should generate and verify valid JWT token', () => {
      const token = authService.generateToken(activeUser);
      expect(typeof token).toBe('string');

      const decoded = authService.verifyToken(token);
      expect(decoded.id).toBe(activeUser.id);
      expect(decoded.username).toBe('unit_admin');
      expect(decoded.role).toBe(UserRole.ADMIN);
    });

    test('verifyToken should throw AppError UNAUTHORIZED on invalid token', () => {
      expect(() => authService.verifyToken('invalid.token.string')).toThrow(AppError);
    });
  });

  describe('login', () => {
    test('should return token and user object on successful login', async () => {
      const result = await authService.login('unit_admin', 'adminpassword');
      expect(result).toHaveProperty('token');
      expect(result.user).toEqual({
        id: activeUser.id,
        username: 'unit_admin',
        name: 'Unit Admin',
        role: UserRole.ADMIN,
        assigned_booth_id: null,
        status: 'ACTIVE'
      });
    });

    test('should throw AppError 401 when username does not exist', async () => {
      await expect(authService.login('nonexistent_user', 'anypassword')).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS'
      });
    });

    test('should throw AppError 401 when password does not match', async () => {
      await expect(authService.login('unit_admin', 'wrongpassword')).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS'
      });
    });

    test('should throw AppError 403 when account status is INACTIVE', async () => {
      await expect(authService.login('unit_inactive', 'inactivepassword')).rejects.toMatchObject({
        statusCode: 403,
        code: 'ACCOUNT_INACTIVE'
      });
    });
  });

  describe('getUserProfile', () => {
    test('should return user profile for active user', async () => {
      const profile = await authService.getUserProfile(activeUser.id);
      expect(profile.username).toBe('unit_admin');
      expect(profile.role).toBe(UserRole.ADMIN);
    });

    test('should throw AppError 404 if user not found or inactive', async () => {
      await expect(authService.getUserProfile('00000000-0000-0000-0000-000000000000')).rejects.toMatchObject({
        statusCode: 404,
        code: 'USER_NOT_FOUND'
      });

      await expect(authService.getUserProfile(inactiveUser.id)).rejects.toMatchObject({
        statusCode: 404,
        code: 'USER_NOT_FOUND'
      });
    });
  });
});
