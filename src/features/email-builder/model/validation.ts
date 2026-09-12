import { isSafeUrl } from '../utils/urlValidation';
import { validateVariableSyntax } from '../utils/variableUtils';
import { BuilderBlock, BuilderDocument } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateBuilderBlock(block: BuilderBlock): string[] {
  const errors: string[] = [];

  switch (block.type) {
    case 'text': {
      if (block.props.href && !isSafeUrl(block.props.href)) {
        errors.push(`Block [${block.id}] has unsafe text link: ${block.props.href}`);
      }
      const varErr = validateVariableSyntax(block.props.content);
      if (varErr) {
        errors.push(`Text block [${block.id}]: ${varErr}`);
      }
      break;
    }
    case 'heading': {
      const varErr = validateVariableSyntax(block.props.text);
      if (varErr) {
        errors.push(`Heading block [${block.id}]: ${varErr}`);
      }
      break;
    }
    case 'button': {
      if (block.props.url && !isSafeUrl(block.props.url)) {
        errors.push(`Block [${block.id}] has unsafe button URL: ${block.props.url}`);
      }
      const varErr = validateVariableSyntax(block.props.text);
      if (varErr) {
        errors.push(`Button block [${block.id}]: ${varErr}`);
      }
      break;
    }
    case 'image': {
      if (block.props.src && !isSafeUrl(block.props.src)) {
        errors.push(`Block [${block.id}] has unsafe image URL: ${block.props.src}`);
      }
      if (block.props.href && !isSafeUrl(block.props.href)) {
        errors.push(`Block [${block.id}] has unsafe image link: ${block.props.href}`);
      }
      break;
    }
    case 'logo': {
      if (block.props.src && !isSafeUrl(block.props.src)) {
        errors.push(`Block [${block.id}] has unsafe logo URL: ${block.props.src}`);
      }
      if (block.props.href && !isSafeUrl(block.props.href)) {
        errors.push(`Block [${block.id}] has unsafe logo link: ${block.props.href}`);
      }
      break;
    }
    case 'social': {
      for (const item of block.props.items || []) {
        if (item.url && !isSafeUrl(item.url)) {
          errors.push(`Social block [${block.id}] item [${item.platform}] has unsafe URL: ${item.url}`);
        }
      }
      break;
    }
    case 'footer': {
      if (block.props.unsubscribeUrl && !isSafeUrl(block.props.unsubscribeUrl)) {
        errors.push(`Footer block [${block.id}] has unsafe unsubscribe URL: ${block.props.unsubscribeUrl}`);
      }
      const textErr = validateVariableSyntax(block.props.text);
      if (textErr) errors.push(`Footer block [${block.id}]: ${textErr}`);
      break;
    }
  }

  return errors;
}

export function validateBuilderDocument(doc: BuilderDocument | null | undefined): ValidationResult {
  const errors: string[] = [];

  if (!doc) {
    return { valid: false, errors: ['Builder document is empty or undefined'] };
  }

  if (typeof doc.version !== 'number') {
    errors.push('Document is missing numeric version');
  }

  if (!doc.settings || typeof doc.settings.width !== 'number') {
    errors.push('Document settings missing valid width');
  } else if (doc.settings.width < 320 || doc.settings.width > 900) {
    errors.push('Document email width must be between 320px and 900px');
  }

  if (!Array.isArray(doc.children)) {
    errors.push('Document children must be an array of sections');
    return { valid: false, errors };
  }

  for (const section of doc.children) {
    if (section.type !== 'section') {
      errors.push(`Invalid section node type: ${section.type}`);
      continue;
    }
    if (!Array.isArray(section.children)) {
      errors.push(`Section [${section.id}] children must be an array of rows`);
      continue;
    }

    for (const row of section.children) {
      if (row.type !== 'row') {
        errors.push(`Invalid row node type: ${row.type}`);
        continue;
      }
      if (!Array.isArray(row.columns) || row.columns.length === 0) {
        errors.push(`Row [${row.id}] must contain at least one column`);
        continue;
      }

      const totalWidth = row.columns.reduce((sum, col) => sum + (col.width || 0), 0);
      if (Math.abs(totalWidth - 100) > 1) {
        errors.push(`Row [${row.id}] column widths sum to ${totalWidth}%, expected ~100%`);
      }

      for (const col of row.columns) {
        if (col.type !== 'column') {
          errors.push(`Invalid column node type: ${col.type}`);
          continue;
        }
        if (!Array.isArray(col.children)) {
          errors.push(`Column [${col.id}] children must be an array`);
          continue;
        }

        for (const block of col.children) {
          const blockErrors = validateBuilderBlock(block);
          errors.push(...blockErrors);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
