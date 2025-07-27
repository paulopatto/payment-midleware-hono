import { describe, beforeEach, it, expect, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import app from '../../src/app';
import { paymentQueue } from '../../src/shared/queue';


describe('POST /payments', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Scenario: creating a payment with valid data', () => {
    let response: Response;
    let paymentQueueAddSpy: vi.SpyInstance;
    let correlationId: string;
    let amount: number;

    beforeEach(async () => {
      // Arrange
      paymentQueueAddSpy = vi.spyOn(paymentQueue, "add").mockResolvedValueOnce({} as any);
      correlationId = faker.string.uuid();
      amount = faker.number.int({ min: 1, max: 100 });
      
      // Act
      response = await app.request('/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correlationId,
          amount,
          requestedAt: faker.date.recent().toISOString(),
        }),
      });
    });

    it('enqueue a new payment', async () => {
      expect(paymentQueueAddSpy).toHaveBeenCalledWith("paymentsQueue",
        expect.objectContaining({ correlationId, amount }),
        expect.objectContaining({ attempts: 10, backoff: { type: "exponential", delay: 500 } })
      )
    });

    it('returns 202 status code', async () => {
      expect(response.status).toBe(202);
    });
  });

  describe('Scenario: trying create a payment with invalid data', () => {
    it('returns 400 status code if without correlationId', async () => {
      // Arrange
      const invalidPayload = {
        amount: faker.number.int({ min: 1, max: 100 }),
        requestedAt: faker.date.recent().toISOString()
      };

      // Act
      const response = await app.request('/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    it('returns 400 status code if amount is negative', async () => {
      // Arrange
      const invalidPayload = {
        correlationId: faker.string.uuid(),
        amount: -100, // Invalid amount
        requestedAt: faker.date.recent().toISOString(),
      };

      // Act
      const response = await app.request('/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });
});