import {
  BuilderBlockType,
  ButtonProps,
  DividerProps,
  FooterProps,
  HeadingProps,
  ImageProps,
  LogoProps,
  SocialProps,
  SpacerProps,
  TextProps,
} from './types';

export interface BlockRegistryEntry<P> {
  type: BuilderBlockType;
  label: string;
  category: 'content';
  defaultProps: P;
  allowedParents: ReadonlyArray<'column'>;
}

export const BLOCK_REGISTRY: {
  text: BlockRegistryEntry<TextProps>;
  heading: BlockRegistryEntry<HeadingProps>;
  image: BlockRegistryEntry<ImageProps>;
  button: BlockRegistryEntry<ButtonProps>;
  divider: BlockRegistryEntry<DividerProps>;
  spacer: BlockRegistryEntry<SpacerProps>;
  social: BlockRegistryEntry<SocialProps>;
  logo: BlockRegistryEntry<LogoProps>;
  footer: BlockRegistryEntry<FooterProps>;
} = {
  text: {
    type: 'text',
    label: 'Text',
    category: 'content',
    allowedParents: ['column'],
    defaultProps: {
      content: 'Write your email body copy here. You can insert Handlebars variables like {{customer.name}}.',
      fontSize: 15,
      fontFamily: 'Arial, Helvetica, sans-serif',
      color: '#374151',
      align: 'left',
      lineHeight: 1.6,
      padding: 12,
    },
  },
  heading: {
    type: 'heading',
    label: 'Heading',
    category: 'content',
    allowedParents: ['column'],
    defaultProps: {
      text: 'Headline Title',
      level: 'h2',
      fontSize: 24,
      fontWeight: '700',
      color: '#111827',
      align: 'left',
      lineHeight: 1.3,
      spacing: 12,
    },
  },
  image: {
    type: 'image',
    label: 'Image',
    category: 'content',
    allowedParents: ['column'],
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
      alt: 'Email Banner Image',
      width: 560,
      aspectRatioLocked: true,
      align: 'center',
      borderRadius: 8,
      padding: 12,
    },
  },
  button: {
    type: 'button',
    label: 'Button',
    category: 'content',
    allowedParents: ['column'],
    defaultProps: {
      text: 'Click Here',
      url: 'https://example.com',
      backgroundColor: '#4f46e5',
      textColor: '#ffffff',
      fontSize: 15,
      fontWeight: '600',
      align: 'center',
      borderRadius: 6,
      padding: 12,
      fullWidth: false,
    },
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    category: 'content',
    allowedParents: ['column'],
    defaultProps: {
      color: '#e5e7eb',
      thickness: 1,
      width: 100,
      align: 'center',
      spacing: 16,
    },
  },
  spacer: {
    type: 'spacer',
    label: 'Spacer',
    category: 'content',
    allowedParents: ['column'],
    defaultProps: {
      height: 24,
    },
  },
  social: {
    type: 'social',
    label: 'Social Icons',
    category: 'content',
    allowedParents: ['column'],
    defaultProps: {
      items: [
        { platform: 'x', url: 'https://x.com', label: 'X' },
        { platform: 'facebook', url: 'https://facebook.com', label: 'Facebook' },
        { platform: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
        { platform: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
      ],
      align: 'center',
      iconSize: 24,
      spacing: 12,
      color: '#4b5563',
    },
  },
  logo: {
    type: 'logo',
    label: 'Logo',
    category: 'content',
    allowedParents: ['column'],
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      alt: 'Company Logo',
      width: 140,
      align: 'center',
      padding: 16,
    },
  },
  footer: {
    type: 'footer',
    label: 'Footer',
    category: 'content',
    allowedParents: ['column'],
    defaultProps: {
      text: '© 2026 Your Company Inc. All rights reserved.',
      companyAddress: '123 Main Street, Suite 400, San Francisco, CA 94105',
      unsubscribeText: 'Unsubscribe from these emails',
      unsubscribeUrl: 'https://example.com/unsubscribe',
      align: 'center',
      color: '#6b7280',
      fontSize: 12,
      spacing: 16,
    },
  },
} as const;

export const LAYOUT_REGISTRY = [
  { type: 'section', label: 'Section', description: 'Container section wrapper' },
  { type: 'row-1', label: '1 Column Row', description: 'Single full-width column' },
  { type: 'row-2', label: '2 Columns Row', description: 'Dual columns (50% / 50%)' },
  { type: 'row-3', label: '3 Columns Row', description: 'Triple columns (33.33% each)' },
] as const;
