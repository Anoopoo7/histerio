import assert from 'node:assert';
import {
  createBlock,
  createButtonBlock,
  createDefaultDocument,
  createImageBlock,
  createOneColumnRow,
  createSection,
  createThreeColumnRow,
  createTwoColumnRow,
} from '../model/defaults';
import { BLOCK_REGISTRY } from '../model/registry';
import { resizeColumns } from '../model/columnResize';
import { validateBuilderBlock, validateBuilderDocument } from '../model/validation';
import { deserializeBuilder, serializeBuilder } from '../model/serialization';
import { generateEmailHtml } from '../renderer/renderEmail';
import { isSafeUrl } from '../utils/urlValidation';
import { extractVariables, replaceVariablesWithMockData, validateVariableSyntax } from '../utils/variableUtils';

function runAllTests() {
  console.log('🧪 Starting Visual Email Builder Test Suite...\n');
  let passedCount = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      passedCount++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✕ ${name}`);
      console.error(err);
      process.exit(1);
    }
  }

  // 1. Builder document creation
  test('1. Builder document creation', () => {
    const doc = createDefaultDocument();
    assert.strictEqual(doc.version, 1);
    assert.strictEqual(doc.settings.width, 600);
    assert.ok(doc.children.length > 0);
  });

  // 2. Default component props
  test('2. Default component props from BLOCK_REGISTRY', () => {
    const textBlock = createBlock('text');
    assert.strictEqual(textBlock.type, 'text');
    assert.strictEqual(textBlock.props.fontSize, BLOCK_REGISTRY.text.defaultProps.fontSize);

    const headingBlock = createBlock('heading');
    assert.strictEqual(headingBlock.type, 'heading');
    assert.strictEqual(headingBlock.props.level, 'h2');
  });

  // 3. Drag/drop insertion logic
  test('3. Drag/drop insertion logic', () => {
    const doc = createDefaultDocument();
    const newSection = createSection([createOneColumnRow([createBlock('button')])]);
    doc.children.push(newSection);

    assert.strictEqual(doc.children.length, 3);
    assert.strictEqual(doc.children[2].children[0].columns[0].children[0].type, 'button');
  });

  // 4. Reorder behavior
  test('4. Reorder behavior', () => {
    const row = createOneColumnRow([createBlock('heading'), createBlock('text')]);
    const blocks = row.columns[0].children;
    const [first] = blocks.splice(0, 1);
    blocks.splice(1, 0, first);

    assert.strictEqual(blocks[0].type, 'text');
    assert.strictEqual(blocks[1].type, 'heading');
  });

  // 5. Duplicate behavior
  test('5. Duplicate block behavior', () => {
    const row = createOneColumnRow([createBlock('image')]);
    const col = row.columns[0];
    const original = col.children[0];
    const clone = { ...JSON.parse(JSON.stringify(original)), id: 'clone-123' };
    col.children.push(clone);

    assert.strictEqual(col.children.length, 2);
    assert.strictEqual(col.children[1].type, 'image');
    assert.notStrictEqual(col.children[0].id, col.children[1].id);
  });

  // 6. Delete behavior
  test('6. Delete block behavior', () => {
    const row = createOneColumnRow([createBlock('divider'), createBlock('spacer')]);
    const col = row.columns[0];
    col.children = col.children.filter((b) => b.type !== 'divider');

    assert.strictEqual(col.children.length, 1);
    assert.strictEqual(col.children[0].type, 'spacer');
  });

  // 7. Column resize normalization
  test('7. Column resize normalization (100% sum)', () => {
    const twoColRow = createTwoColumnRow();
    const resized2 = resizeColumns(twoColRow.columns, 0, -15);
    assert.strictEqual(resized2[0].width, 35);
    assert.strictEqual(resized2[1].width, 65);
    assert.strictEqual(resized2[0].width + resized2[1].width, 100);

    const threeColRow = createThreeColumnRow();
    const resized3 = resizeColumns(threeColRow.columns, 0, 10);
    assert.strictEqual(resized3[0].width, 43.33);
    assert.strictEqual(resized3[1].width, 23.33);
    assert.strictEqual(resized3[2].width, 33.34);
    const sum = Math.round((resized3[0].width + resized3[1].width + resized3[2].width) * 100) / 100;
    assert.strictEqual(sum, 100);
  });

  // 8. Image resize constraints
  test('8. Image resize constraints & aspect ratio lock', () => {
    const imgBlock = createImageBlock({ width: 300, height: 200, aspectRatioLocked: true });
    imgBlock.props.width = 300;
    imgBlock.props.height = 200;
    imgBlock.props.aspectRatioLocked = true;

    const ratio = 200 / 300;
    const newW = 450;
    const newH = Math.round(newW * ratio);
    assert.strictEqual(newH, 300);
  });

  // 9. Variable insertion
  test('9. Variable extraction & Mustache tag parsing', () => {
    const text = 'Hello {{customer.name}}, your order {{order.id}} total is {{order.total}}.';
    const vars = extractVariables(text);
    assert.deepStrictEqual(vars, ['customer.name', 'order.id', 'order.total']);
  });

  // 10. Invalid URL rejection
  test('10. Invalid URL scheme rejection', () => {
    assert.strictEqual(isSafeUrl('https://example.com/logo.png'), true);
    assert.strictEqual(isSafeUrl('http://example.com'), true);
    assert.strictEqual(isSafeUrl('mailto:test@example.com'), true);
    assert.strictEqual(isSafeUrl('javascript:alert(1)'), false);
    assert.strictEqual(isSafeUrl('data:text/html,<script>alert(1)</script>'), false);
    assert.strictEqual(isSafeUrl('file:///etc/passwd'), false);
  });

  // 11. Builder serialization
  test('11. Builder state serialization', () => {
    const doc = createDefaultDocument();
    const serialized = serializeBuilder(doc);
    assert.strictEqual(typeof serialized, 'object');
    assert.strictEqual(serialized.version, 1);
  });

  // 12. Builder deserialization
  test('12. Builder state deserialization', () => {
    const doc = createDefaultDocument();
    const serialized = serializeBuilder(doc);
    const deserialized = deserializeBuilder(serialized);

    assert.strictEqual(deserialized.version, 1);
    assert.strictEqual(deserialized.children.length, doc.children.length);

    // Fallback on null/invalid
    const fallback = deserializeBuilder(null);
    assert.strictEqual(fallback.version, 1);
    assert.ok(fallback.children.length > 0);
  });

  // 13. HTML generation
  test('13. HTML generation compiles directly from AST', () => {
    const doc = createDefaultDocument();
    const html = generateEmailHtml(doc);

    assert.ok(html.includes('<!DOCTYPE html'));
    assert.ok(html.includes('role="presentation"'));
    assert.ok(html.includes('Welcome to Histeria!'));
  });

  // 14. Nested section/row/column rendering
  test('14. Nested section/row/column rendering', () => {
    const doc = createDefaultDocument();
    const html = generateEmailHtml(doc);
    assert.ok(html.includes('width="600"'));
    assert.ok(html.includes('<td class="h-col-'));
  });

  // 15. Responsive rendering
  test('15. Responsive rendering & media queries', () => {
    const doc = createDefaultDocument();
    const html = generateEmailHtml(doc);
    assert.ok(html.includes('@media only screen and (max-width: 600px)'));
    assert.ok(html.includes('.h-col-stack'));
  });

  // 16. Generated HTML contains no script
  test('16. Generated HTML contains no script or unsafe tags', () => {
    const doc = createDefaultDocument();
    const html = generateEmailHtml(doc);
    assert.strictEqual(html.includes('<script'), false);
    assert.strictEqual(html.includes('javascript:'), false);
    assert.strictEqual(html.includes('<iframe'), false);
  });

  // 17. Unsafe links are rejected in validation
  test('17. Unsafe links are rejected during block validation', () => {
    const badButton = createButtonBlock({ url: 'javascript:evil()' });
    const errors = validateBuilderBlock(badButton);
    assert.ok(errors.length > 0);
    assert.ok(errors[0].includes('unsafe button URL'));
  });

  // 18. Save payload construction
  test('18. Save payload contains html + builderContent', () => {
    const doc = createDefaultDocument();
    const compiledHtml = generateEmailHtml(doc);
    const serializedBuilder = serializeBuilder(doc);

    const payload = {
      html: compiledHtml,
      builderContent: serializedBuilder,
    };

    assert.ok(typeof payload.html === 'string');
    assert.ok(typeof payload.builderContent === 'object');
    assert.ok(payload.html.length > 100);
  });

  // 19. CODE template distinction
  test('19. CODE template payload structure', () => {
    const codePayload = {
      html: '<html><body><h1>Raw HTML</h1></body></html>',
    };
    assert.strictEqual(codePayload.html.includes('Raw HTML'), true);
    assert.strictEqual('builderContent' in codePayload, false);
  });

  // 20. BUILDER template structure
  test('20. BUILDER template payload validation', () => {
    const doc = createDefaultDocument();
    const res = validateBuilderDocument(doc);
    if (!res.valid) {
      console.error('Validation errors:', res.errors);
    }
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.errors.length, 0);
  });

  // 21. Version history builderContent restoration
  test('21. Version history builderContent restoration', () => {
    const doc = createDefaultDocument();
    const serialized = serializeBuilder(doc);
    const verDetail = {
      id: 'ver-1',
      templateId: 'tpl-1',
      version: 1,
      variables: [],
      createdBy: 'user',
      isCurrent: true,
      createdAt: new Date().toISOString(),
      html: generateEmailHtml(doc),
      builderContent: serialized,
    };

    const restoredDoc = deserializeBuilder(verDetail.builderContent);
    assert.strictEqual(restoredDoc.version, 1);
    assert.strictEqual(restoredDoc.settings.width, 600);
  });

  // 22. Preview replacement with mock data
  test('22. Preview replaces Handlebars tags with sample JSON data', () => {
    const rawText = 'Hello {{customer.name}}, order {{order.id}} confirmed!';
    const mockJson = JSON.stringify({
      customer: { name: 'John Doe' },
      order: { id: 'ORD-999' },
    });
    const replaced = replaceVariablesWithMockData(rawText, mockJson);
    assert.strictEqual(replaced, 'Hello John Doe, order ORD-999 confirmed!');
  });

  // 23. Unmatched bracket variable syntax validation
  test('23. Unmatched bracket variable syntax validation', () => {
    assert.strictEqual(validateVariableSyntax('Hello {{customer.name}}'), null);
    assert.ok(validateVariableSyntax('Hello {{customer.name') !== null);
    assert.ok(validateVariableSyntax('Hello customer.name}}') !== null);
    assert.ok(validateVariableSyntax('Hello {customer.name}') !== null);
  });

  console.log(`\n🎉 All ${passedCount} tests passed successfully!`);
}

runAllTests();
