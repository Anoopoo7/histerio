export type EditorType = 'CODE' | 'BUILDER';

export interface DocumentSettings {
  width: number;
  backgroundColor: string;
  contentBackgroundColor: string;
  fontFamily: string;
  textColor: string;
  padding: number;
}

export interface SectionProps {
  backgroundColor?: string;
  padding?: number | string;
  margin?: number | string;
  borderRadius?: number;
  border?: string;
  align?: 'left' | 'center' | 'right';
}

export interface RowProps {
  mobileStack: boolean;
  padding?: number | string;
  backgroundColor?: string;
}

export interface ColumnProps {
  backgroundColor?: string;
  padding?: number | string;
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface TextProps {
  content: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: number;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  padding?: number | string;
  backgroundColor?: string;
  href?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface HeadingProps {
  text: string;
  level: 'h1' | 'h2' | 'h3';
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  spacing?: number;
}

export interface ImageProps {
  src: string;
  alt: string;
  href?: string;
  width: number;
  height?: number;
  aspectRatioLocked?: boolean;
  naturalWidth?: number;
  naturalHeight?: number;
  align?: 'left' | 'center' | 'right';
  borderRadius?: number;
  padding?: number | string;
}

export interface ButtonProps {
  text: string;
  url: string;
  backgroundColor: string;
  textColor: string;
  fontSize?: number;
  fontWeight?: string;
  align?: 'left' | 'center' | 'right';
  padding?: number | string;
  borderRadius?: number;
  fullWidth?: boolean;
}

export interface DividerProps {
  color: string;
  thickness: number;
  width: number;
  align?: 'left' | 'center' | 'right';
  spacing?: number;
}

export interface SpacerProps {
  height: number;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube' | 'github' | 'web';

export interface SocialPlatformItem {
  platform: SocialPlatform;
  url: string;
  label?: string;
}

export interface SocialProps {
  items: SocialPlatformItem[];
  align?: 'left' | 'center' | 'right';
  iconSize?: number;
  spacing?: number;
  color?: string;
}

export interface LogoProps {
  src: string;
  alt: string;
  href?: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  padding?: number | string;
}

export interface FooterProps {
  text: string;
  companyAddress?: string;
  unsubscribeText?: string;
  unsubscribeUrl?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  fontSize?: number;
  spacing?: number;
}

export interface TextBlock {
  id: string;
  type: 'text';
  props: TextProps;
}

export interface HeadingBlock {
  id: string;
  type: 'heading';
  props: HeadingProps;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  props: ImageProps;
}

export interface ButtonBlock {
  id: string;
  type: 'button';
  props: ButtonProps;
}

export interface DividerBlock {
  id: string;
  type: 'divider';
  props: DividerProps;
}

export interface SpacerBlock {
  id: string;
  type: 'spacer';
  props: SpacerProps;
}

export interface SocialBlock {
  id: string;
  type: 'social';
  props: SocialProps;
}

export interface LogoBlock {
  id: string;
  type: 'logo';
  props: LogoProps;
}

export interface FooterBlock {
  id: string;
  type: 'footer';
  props: FooterProps;
}

export type BuilderBlock =
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | SpacerBlock
  | SocialBlock
  | LogoBlock
  | FooterBlock;

export type BuilderBlockType = BuilderBlock['type'];

export interface BuilderColumn {
  id: string;
  type: 'column';
  width: number;
  props: ColumnProps;
  children: BuilderBlock[];
}

export interface BuilderRow {
  id: string;
  type: 'row';
  props: RowProps;
  columns: BuilderColumn[];
}

export interface BuilderSection {
  id: string;
  type: 'section';
  props: SectionProps;
  children: BuilderRow[];
}

export interface BuilderDocument {
  version: number;
  settings: DocumentSettings;
  children: BuilderSection[];
}

export type LayoutType = 'section' | 'row-1' | 'row-2' | 'row-3';

export type DragItem =
  | { kind: 'new-block'; blockType: BuilderBlockType }
  | { kind: 'new-layout'; layoutType: LayoutType }
  | { kind: 'move-block'; blockId: string; sourceColumnId: string }
  | { kind: 'move-row'; rowId: string; sourceSectionId: string }
  | { kind: 'move-section'; sectionId: string };

export type DropTarget =
  | { type: 'column'; columnId: string; index: number }
  | { type: 'section'; sectionId: string; index: number }
  | { type: 'document'; index: number };

export type SelectedTarget =
  | { type: 'document' }
  | { type: 'section'; id: string }
  | { type: 'row'; id: string; sectionId: string }
  | { type: 'column'; id: string; rowId: string; sectionId: string }
  | { type: 'block'; id: string; columnId: string; rowId: string; sectionId: string };
