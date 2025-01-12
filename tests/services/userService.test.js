import { userService } from '../../src/services/index.js';
import UserStatus from '../../src/enums/userStatus.js';
import createError from 'http-errors';

describe('Driver Status Management', () => {
    const testDriver = {
        id: 1,
        name: 'Test Driver',
        email: 'driver@test.com',
        password: 'password',
        type: 'driver',
        status: UserStatus.AVAILABLE
    };

    beforeEach(() => {
        userService.getUsers().length = 0;
        userService.registerUser(testDriver);
    });

    describe('reserveDriver', () => {
        it('should reserve an available driver', () => {
            const driver = userService.reserveDriver(testDriver.id);
            expect(driver.status).toBe(UserStatus.BUSY);
        });

        it('should throw error when driver is already busy', () => {
            userService.reserveDriver(testDriver.id);
            expect(() => userService.reserveDriver(testDriver.id))
                .toThrow(createError(400, 'Driver is already busy with another ride'));
        });

        it('should throw error for non-existent driver', () => {
            expect(() => userService.reserveDriver(999))
                .toThrow(createError(404, 'Driver not found'));
        });
    });

    describe('releaseDriver', () => {
        it('should release a busy driver', () => {
            userService.reserveDriver(testDriver.id);
            const driver = userService.releaseDriver(testDriver.id);
            expect(driver.status).toBe(UserStatus.AVAILABLE);
        });

        it('should throw error when releasing non-busy driver', () => {
            expect(() => userService.releaseDriver(testDriver.id))
                .toThrow(createError(400, 'Driver is not currently busy'));
        });

        it('should throw error for non-existent driver', () => {
            expect(() => userService.releaseDriver(999))
                .toThrow(createError(404, 'Driver not found'));
        });
    });
}); 