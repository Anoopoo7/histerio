import assert from 'node:assert';
import {
  getAllPolicyMetadata,
  getCompanyLegalConfig,
  getLegalDocument,
  getRequiredRegistrationPolicies,
  getRequiredOrganizationPolicies,
  checkLegalPlaceholders,
} from '../lib/legal';
import { LegalDocumentType } from '../types/legal';

function runLegalSystemTests() {
  console.log('🧪 Starting Legal System & Consent Integration Test Suite...\n');
  let count = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      count++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✕ ${name}`);
      console.error(err);
      process.exit(1);
    }
  }

  // 1. Company legal config loader
  test('1. Company legal config loads brand and email properties', () => {
    const company = getCompanyLegalConfig();
    assert.strictEqual(company.brandName, 'Histeria');
    assert.ok(company.legalEmail.includes('@'));
    assert.ok(company.privacyEmail.includes('@'));
  });

  // 2. Policy index loader
  test('2. Policy index returns all 10 registered legal documents', () => {
    const policies = getAllPolicyMetadata();
    assert.strictEqual(policies.length, 10);
    const docTypes = policies.map((p) => p.documentType);
    assert.ok(docTypes.includes('terms'));
    assert.ok(docTypes.includes('privacy'));
    assert.ok(docTypes.includes('acceptable-use'));
    assert.ok(docTypes.includes('anti-spam'));
    assert.ok(docTypes.includes('cookie'));
    assert.ok(docTypes.includes('dpa'));
    assert.ok(docTypes.includes('subprocessors'));
    assert.ok(docTypes.includes('refunds'));
    assert.ok(docTypes.includes('security'));
    assert.ok(docTypes.includes('sla'));
  });

  // 3. Document details verification
  test('3. Document loader returns valid sections for terms and privacy', () => {
    const terms = getLegalDocument('terms');
    assert.ok(terms !== null);
    assert.strictEqual(terms.documentType, 'terms');
    assert.ok(terms.sections.length >= 5);

    const privacy = getLegalDocument('privacy');
    assert.ok(privacy !== null);
    assert.strictEqual(privacy.documentType, 'privacy');
    assert.ok(privacy.sections.length >= 5);
  });

  // 4. Registration requirement check
  test('4. Registration required policies include terms and privacy', () => {
    const required = getRequiredRegistrationPolicies();
    const types = required.map((r) => r.documentType);
    assert.ok(types.includes('terms'));
    assert.ok(types.includes('privacy'));
  });

  // 5. Organization requirement check
  test('5. Organization required policies include acceptable-use and anti-spam', () => {
    const required = getRequiredOrganizationPolicies();
    const types = required.map((r) => r.documentType);
    assert.ok(types.includes('acceptable-use'));
    assert.ok(types.includes('anti-spam'));
  });

  // 6. Subprocessors document validation
  test('6. Subprocessors document contains Razorpay and Google entries', () => {
    const subDoc = getLegalDocument('subprocessors');
    assert.ok(subDoc !== null);
    const subObj = subDoc as unknown as { subprocessors: Array<{ name: string }> };
    assert.ok(Array.isArray(subObj.subprocessors));
    assert.ok(subObj.subprocessors.some((s) => s.name.includes('Razorpay')));
    assert.ok(subObj.subprocessors.some((s) => s.name.includes('Google')));
  });

  // 7. Legal placeholder detector
  test('7. Legal placeholder detector identifies unreplaced placeholder tokens', () => {
    const warnings = checkLegalPlaceholders();
    assert.ok(Array.isArray(warnings));
    // Confirms detector catches placeholders in dev mode
    assert.ok(warnings.some((w) => w.includes('LEGAL ENTITY NAME')));
  });

  // 8. Document integrity for all 10 documents
  test('8. All 10 legal documents have valid non-empty headings and paragraphs', () => {
    const types: LegalDocumentType[] = [
      'terms',
      'privacy',
      'acceptable-use',
      'anti-spam',
      'cookie',
      'dpa',
      'subprocessors',
      'refunds',
      'security',
      'sla',
    ];

    for (const t of types) {
      const doc = getLegalDocument(t);
      assert.ok(doc !== null, `Document type ${t} failed to load`);
      assert.ok(doc.title.length > 0);
      assert.ok(doc.sections.length > 0);
      for (const section of doc.sections) {
        assert.ok(section.heading.length > 0);
        assert.ok(section.paragraphs.length > 0);
      }
    }
  });

  console.log(`🎉 All ${count} Legal System unit tests passed successfully!\n`);
}

runLegalSystemTests();
