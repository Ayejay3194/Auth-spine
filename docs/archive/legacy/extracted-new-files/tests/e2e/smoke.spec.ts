import { test, expect } from '@playwright/test';

test('health', async ({ request }) => { const r = await request.get('/health'); expect(r.ok()).toBeTruthy(); });
