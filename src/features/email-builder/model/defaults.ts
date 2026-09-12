import { BLOCK_REGISTRY } from './registry';
import {
  BuilderBlock,
  BuilderBlockType,
  BuilderDocument,
  BuilderRow,
  BuilderSection,
  ButtonBlock,
  ButtonProps,
  DividerBlock,
  DividerProps,
  FooterBlock,
  FooterProps,
  HeadingBlock,
  HeadingProps,
  ImageBlock,
  ImageProps,
  LogoBlock,
  LogoProps,
  SocialBlock,
  SocialProps,
  SpacerBlock,
  SpacerProps,
  TextBlock,
  TextProps,
} from './types';

export function generateId(prefix = 'node'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createTextBlock(override?: Partial<TextProps>): TextBlock {
  return {
    id: generateId('block-text'),
    type: 'text',
    props: { ...BLOCK_REGISTRY.text.defaultProps, ...override },
  };
}

export function createHeadingBlock(override?: Partial<HeadingProps>): HeadingBlock {
  return {
    id: generateId('block-heading'),
    type: 'heading',
    props: { ...BLOCK_REGISTRY.heading.defaultProps, ...override },
  };
}

export function createImageBlock(override?: Partial<ImageProps>): ImageBlock {
  return {
    id: generateId('block-image'),
    type: 'image',
    props: { ...BLOCK_REGISTRY.image.defaultProps, ...override },
  };
}

export function createButtonBlock(override?: Partial<ButtonProps>): ButtonBlock {
  return {
    id: generateId('block-button'),
    type: 'button',
    props: { ...BLOCK_REGISTRY.button.defaultProps, ...override },
  };
}

export function createDividerBlock(override?: Partial<DividerProps>): DividerBlock {
  return {
    id: generateId('block-divider'),
    type: 'divider',
    props: { ...BLOCK_REGISTRY.divider.defaultProps, ...override },
  };
}

export function createSpacerBlock(override?: Partial<SpacerProps>): SpacerBlock {
  return {
    id: generateId('block-spacer'),
    type: 'spacer',
    props: { ...BLOCK_REGISTRY.spacer.defaultProps, ...override },
  };
}

export function createSocialBlock(override?: Partial<SocialProps>): SocialBlock {
  return {
    id: generateId('block-social'),
    type: 'social',
    props: { ...BLOCK_REGISTRY.social.defaultProps, ...override },
  };
}

export function createLogoBlock(override?: Partial<LogoProps>): LogoBlock {
  return {
    id: generateId('block-logo'),
    type: 'logo',
    props: { ...BLOCK_REGISTRY.logo.defaultProps, ...override },
  };
}

export function createFooterBlock(override?: Partial<FooterProps>): FooterBlock {
  return {
    id: generateId('block-footer'),
    type: 'footer',
    props: { ...BLOCK_REGISTRY.footer.defaultProps, ...override },
  };
}

export function createBlock(type: BuilderBlockType): BuilderBlock {
  switch (type) {
    case 'text':
      return createTextBlock();
    case 'heading':
      return createHeadingBlock();
    case 'image':
      return createImageBlock();
    case 'button':
      return createButtonBlock();
    case 'divider':
      return createDividerBlock();
    case 'spacer':
      return createSpacerBlock();
    case 'social':
      return createSocialBlock();
    case 'logo':
      return createLogoBlock();
    case 'footer':
      return createFooterBlock();
  }
}

export function createOneColumnRow(initialBlocks: BuilderBlock[] = []): BuilderRow {
  return {
    id: generateId('row'),
    type: 'row',
    props: { mobileStack: true },
    columns: [
      {
        id: generateId('col'),
        type: 'column',
        width: 100,
        props: { padding: 12, verticalAlign: 'top' },
        children: initialBlocks,
      },
    ],
  };
}

export function createTwoColumnRow(): BuilderRow {
  return {
    id: generateId('row'),
    type: 'row',
    props: { mobileStack: true },
    columns: [
      {
        id: generateId('col'),
        type: 'column',
        width: 50,
        props: { padding: 12, verticalAlign: 'top' },
        children: [],
      },
      {
        id: generateId('col'),
        type: 'column',
        width: 50,
        props: { padding: 12, verticalAlign: 'top' },
        children: [],
      },
    ],
  };
}

export function createThreeColumnRow(): BuilderRow {
  return {
    id: generateId('row'),
    type: 'row',
    props: { mobileStack: true },
    columns: [
      {
        id: generateId('col'),
        type: 'column',
        width: 33.33,
        props: { padding: 12, verticalAlign: 'top' },
        children: [],
      },
      {
        id: generateId('col'),
        type: 'column',
        width: 33.33,
        props: { padding: 12, verticalAlign: 'top' },
        children: [],
      },
      {
        id: generateId('col'),
        type: 'column',
        width: 33.34,
        props: { padding: 12, verticalAlign: 'top' },
        children: [],
      },
    ],
  };
}

export function createSection(rows: BuilderRow[] = []): BuilderSection {
  return {
    id: generateId('sec'),
    type: 'section',
    props: {
      backgroundColor: '#ffffff',
      padding: 24,
      borderRadius: 8,
    },
    children: rows.length > 0 ? rows : [createOneColumnRow([createHeadingBlock(), createTextBlock()])],
  };
}

export function createDefaultDocument(): BuilderDocument {
  return {
    version: 1,
    settings: {
      width: 600,
      backgroundColor: '#f4f4f5',
      contentBackgroundColor: '#ffffff',
      fontFamily: 'Arial, Helvetica, sans-serif',
      textColor: '#111827',
      padding: 20,
    },
    children: [
      createSection([
        createOneColumnRow([
          createLogoBlock(),
          createHeadingBlock({ text: 'Welcome to Histeria!' }),
          createTextBlock({
            content: 'Thank you for getting started. Customize this visual template using drag and drop.',
          }),
          createButtonBlock({ text: 'View Dashboard', url: 'https://example.com' }),
        ]),
      ]),
      createSection([
        createOneColumnRow([createFooterBlock()]),
      ]),
    ],
  };
}
