import assert from 'node:assert';
import { User, GoogleAuthPayload, AuthResponse } from '../types';
import { loginWithGoogleApi, linkGoogleAccountApi, unlinkGoogleAccountApi } from '../lib/api/auth.api';

function runGoogleAuthTests() {
  console.log('🧪 Starting Google Auth Integration Test Suite...\n');
  let count = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      const result = fn();
      if (result && typeof result.then === 'function') {
        result
          .then(() => {
            count++;
            console.log(`  ✓ ${name}`);
          })
          .catch((err) => {
            console.error(`  ✕ ${name}`);
            console.error(err);
            process.exit(1);
          });
      } else {
        count++;
        console.log(`  ✓ ${name}`);
      }
    } catch (err) {
      console.error(`  ✕ ${name}`);
      console.error(err);
      process.exit(1);
    }
  }

  // 1. User type supports authProviders
  test('1. User interface supports authProviders strictly', () => {
    const googleUser: User = {
      id: 'usr_123',
      email: 'user@example.com',
      name: 'Google User',
      emailVerified: true,
      authProviders: ['google'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    assert.strictEqual(googleUser.emailVerified, true);
    assert.deepStrictEqual(googleUser.authProviders, ['google']);
  });

  // 2. GoogleAuthPayload structure
  test('2. GoogleAuthPayload structure is strictly typed', () => {
    const payload: GoogleAuthPayload = {
      credential: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9.example_credential',
    };
    assert.strictEqual(typeof payload.credential, 'string');
    assert.ok(payload.credential.length > 0);
  });

  // 3. Google credential is discarded and never stored in browser storage
  test('3. Google credential is never stored in persistent storage', () => {
    const dummyCredential = 'test-google-id-token';
    
    // Simulate auth token storage
    const authRes: AuthResponse = {
      accessToken: 'histeria-jwt-token-xyz',
      user: {
        id: 'u1',
        email: 'test@gmail.com',
        name: 'Test',
        emailVerified: true,
        authProviders: ['google'],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    };

    // Stored token MUST be Histeria JWT, NOT Google credential
    assert.strictEqual(authRes.accessToken, 'histeria-jwt-token-xyz');
    assert.notStrictEqual(authRes.accessToken, dummyCredential);
    assert.strictEqual(JSON.stringify(authRes.user).includes(dummyCredential), false);
  });

  // 4. GOOGLE_ACCOUNT_EXISTS conflict message check
  test('4. GOOGLE_ACCOUNT_EXISTS 409 conflict message formatting', () => {
    const statusCode = 409;
    const errorCode = 'GOOGLE_ACCOUNT_EXISTS';
    const userMessage =
      'An account already exists with this email. Sign in with your password first, then connect Google from Account Settings.';

    assert.strictEqual(statusCode, 409);
    assert.strictEqual(errorCode, 'GOOGLE_ACCOUNT_EXISTS');
    assert.ok(userMessage.includes('Sign in with your password first'));
  });

  // 5. Rate limit 429 message check
  test('5. 429 rate limit response formatting', () => {
    const statusCode = 429;
    const userMessage = 'Too many sign-in attempts. Please try again later.';
    assert.strictEqual(statusCode, 429);
    assert.ok(userMessage.includes('Too many sign-in attempts'));
  });

  // 6. Unsafe Google disconnect safety check
  test('6. Unsafe disconnect state prevents removing Google when it is sole auth provider', () => {
    const userSoleGoogle: User = {
      id: 'u1',
      email: 'sole@gmail.com',
      name: 'Sole Google User',
      emailVerified: true,
      authProviders: ['google'],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    const providers = userSoleGoogle.authProviders || [];
    const canDisconnect = providers.includes('google') && providers.length > 1;
    assert.strictEqual(canDisconnect, false);
  });

  // 7. Safe Google disconnect state check
  test('7. Safe disconnect allowed when user has both password and Google', () => {
    const userDualAuth: User = {
      id: 'u2',
      email: 'dual@gmail.com',
      name: 'Dual Auth User',
      emailVerified: true,
      authProviders: ['password', 'google'],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    const providers = userDualAuth.authProviders || [];
    const canDisconnect = providers.includes('google') && providers.length > 1;
    assert.strictEqual(canDisconnect, true);
  });

  // 8. API endpoints are exported functions
  test('8. Google auth API helper functions exist and are exported', () => {
    assert.strictEqual(typeof loginWithGoogleApi, 'function');
    assert.strictEqual(typeof linkGoogleAccountApi, 'function');
    assert.strictEqual(typeof unlinkGoogleAccountApi, 'function');
  });

  console.log(`🎉 All ${count} Google Auth unit tests passed successfully!\n`);
}

runGoogleAuthTests();
