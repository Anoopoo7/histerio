import { sanitizeUrl } from '../utils/urlValidation';
import {
  BuilderBlock,
  BuilderColumn,
  BuilderDocument,
  BuilderRow,
  BuilderSection,
  ButtonProps,
  DividerProps,
  FooterProps,
  HeadingProps,
  ImageProps,
  LogoProps,
  SocialProps,
  SpacerProps,
  TextProps,
} from '../model/types';

export function escapeHtmlText(text: string | undefined | null): string {
  if (!text) return '';
  // Preserve Handlebars tags {{...}} and HTML tags without escaping < or >
  if (text.includes('{{') || /<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderBlockHtml(block: BuilderBlock): string {
  switch (block.type) {
    case 'heading': {
      const p = block.props as HeadingProps;
      const tag = p.level || 'h2';
      const text = escapeHtmlText(p.text);
      const font = p.fontFamily || 'Arial, Helvetica, sans-serif';
      const size = p.fontSize || 24;
      const weight = p.fontWeight || '700';
      const color = p.color || '#111827';
      const align = p.align || 'left';
      const lineHeight = p.lineHeight || 1.3;
      const spacing = p.spacing || 12;

      return `
<${tag} style="margin: 0 0 ${spacing}px 0; font-family: ${font}; font-size: ${size}px; font-weight: ${weight}; color: ${color}; text-align: ${align}; line-height: ${lineHeight};">
  ${text}
</${tag}>`.trim();
    }

    case 'text': {
      const p = block.props as TextProps;
      const font = p.fontFamily || 'Arial, Helvetica, sans-serif';
      const size = p.fontSize || 15;
      const weight = p.fontWeight || '400';
      const fontStyle = p.fontStyle || 'normal';
      const color = p.color || '#374151';
      const align = p.align || 'left';
      const lineHeight = p.lineHeight || 1.6;
      const bg = p.backgroundColor ? `background-color: ${p.backgroundColor};` : '';
      const pad = typeof p.padding === 'number' ? `${p.padding}px` : p.padding || '0px';

      let innerText = escapeHtmlText(p.content);
      if (p.bold) innerText = `<strong>${innerText}</strong>`;
      if (p.italic) innerText = `<em>${innerText}</em>`;
      if (p.underline) innerText = `<u>${innerText}</u>`;

      if (p.href) {
        const safeHref = sanitizeUrl(p.href);
        innerText = `<a href="${safeHref}" style="color: ${color}; text-decoration: underline;" target="_blank">${innerText}</a>`;
      }

      return `
<div style="font-family: ${font}; font-size: ${size}px; font-weight: ${weight}; font-style: ${fontStyle}; color: ${color}; text-align: ${align}; line-height: ${lineHeight}; padding: ${pad}; ${bg}">
  ${innerText}
</div>`.trim();
    }

    case 'image': {
      const p = block.props as ImageProps;
      const src = sanitizeUrl(p.src);
      const alt = escapeHtmlText(p.alt || 'Email Image');
      const width = p.width || 560;
      const align = p.align || 'center';
      const radius = p.borderRadius || 0;
      const pad = typeof p.padding === 'number' ? `${p.padding}px` : p.padding || '0px';

      let imgHtml = `<img src="${src}" alt="${alt}" width="${width}" style="display: block; border: 0; outline: none; text-decoration: none; width: 100%; max-width: ${width}px; height: auto; border-radius: ${radius}px;" />`;

      if (p.href) {
        const safeHref = sanitizeUrl(p.href);
        imgHtml = `<a href="${safeHref}" target="_blank" style="text-decoration: none;">${imgHtml}</a>`;
      }

      return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="${align}" style="padding: ${pad};">
      ${imgHtml}
    </td>
  </tr>
</table>`.trim();
    }

    case 'button': {
      const p = block.props as ButtonProps;
      const text = escapeHtmlText(p.text);
      const url = sanitizeUrl(p.url);
      const bg = p.backgroundColor || '#4f46e5';
      const color = p.textColor || '#ffffff';
      const size = p.fontSize || 15;
      const weight = p.fontWeight || '600';
      const align = p.align || 'center';
      const radius = p.borderRadius || 6;
      const pad = typeof p.padding === 'number' ? `${p.padding}px` : p.padding || '12px';
      const widthAttr = p.fullWidth ? 'width="100%"' : '';
      const displayStyle = p.fullWidth ? 'display: block; width: 100%;' : 'display: inline-block;';

      return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" ${widthAttr} style="margin: 0 auto;">
  <tr>
    <td align="${align}" style="padding: ${pad};">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" ${widthAttr}>
        <tr>
          <td align="center" bgcolor="${bg}" style="border-radius: ${radius}px; ${displayStyle}">
            <a href="${url}" target="_blank" style="font-family: Arial, Helvetica, sans-serif; font-size: ${size}px; font-weight: ${weight}; color: ${color}; text-decoration: none; padding: 12px 24px; border-radius: ${radius}px; ${displayStyle} box-sizing: border-box;">
              ${text}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
    }

    case 'divider': {
      const p = block.props as DividerProps;
      const color = p.color || '#e5e7eb';
      const thickness = p.thickness || 1;
      const width = p.width || 100;
      const align = p.align || 'center';
      const spacing = p.spacing || 16;

      return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="${align}" style="padding: ${spacing}px 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${width}%">
        <tr>
          <td style="border-top: ${thickness}px solid ${color}; font-size: 0; line-height: 0; height: 0;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
    }

    case 'spacer': {
      const p = block.props as SpacerProps;
      const height = p.height || 24;
      return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td height="${height}" style="font-size: 0; line-height: 0; height: ${height}px;">&nbsp;</td>
  </tr>
</table>`.trim();
    }

    case 'social': {
      const p = block.props as SocialProps;
      const align = p.align || 'center';
      const spacing = p.spacing || 12;
      const color = p.color || '#4b5563';

      const itemsHtml = (p.items || [])
        .map((item) => {
          const safeUrl = sanitizeUrl(item.url);
          const label = escapeHtmlText(item.label || item.platform);
          return `<td style="padding: 0 ${spacing / 2}px;"><a href="${safeUrl}" target="_blank" style="font-family: Arial, sans-serif; font-size: 13px; color: ${color}; text-decoration: none; font-weight: 600;">${label}</a></td>`;
        })
        .join('');

      return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="${align}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          ${itemsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
    }

    case 'logo': {
      const p = block.props as LogoProps;
      const src = sanitizeUrl(p.src);
      const alt = escapeHtmlText(p.alt || 'Logo');
      const width = p.width || 140;
      const align = p.align || 'center';
      const pad = typeof p.padding === 'number' ? `${p.padding}px` : p.padding || '16px';

      let logoImg = `<img src="${src}" alt="${alt}" width="${width}" style="display: block; border: 0; outline: none; width: ${width}px; height: auto;" />`;
      if (p.href) {
        const safeHref = sanitizeUrl(p.href);
        logoImg = `<a href="${safeHref}" target="_blank" style="text-decoration: none;">${logoImg}</a>`;
      }

      return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="${align}" style="padding: ${pad};">
      ${logoImg}
    </td>
  </tr>
</table>`.trim();
    }

    case 'footer': {
      const p = block.props as FooterProps;
      const text = escapeHtmlText(p.text);
      const address = escapeHtmlText(p.companyAddress);
      const unsubText = escapeHtmlText(p.unsubscribeText || 'Unsubscribe');
      const unsubUrl = sanitizeUrl(p.unsubscribeUrl);
      const align = p.align || 'center';
      const color = p.color || '#6b7280';
      const size = p.fontSize || 12;
      const spacing = p.spacing || 16;

      return `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="${align}" style="padding: ${spacing}px 0; font-family: Arial, Helvetica, sans-serif; font-size: ${size}px; color: ${color}; line-height: 1.5; text-align: ${align};">
      <p style="margin: 0 0 4px 0;">${text}</p>
      ${address ? `<p style="margin: 0 0 4px 0;">${address}</p>` : ''}
      ${unsubUrl ? `<p style="margin: 4px 0 0 0;"><a href="${unsubUrl}" target="_blank" style="color: ${color}; text-decoration: underline;">${unsubText}</a></p>` : ''}
    </td>
  </tr>
</table>`.trim();
    }
  }
}

function renderColumnHtml(col: BuilderColumn, isMobileStack: boolean): { html: string; colClass: string } {
  const colClass = `h-col-${col.id.replace(/[^a-zA-Z0-9-]/g, '')}`;
  const widthPercent = col.width || 100;
  const pad = typeof col.props.padding === 'number' ? `${col.props.padding}px` : col.props.padding || '12px';
  const bg = col.props.backgroundColor ? `background-color: ${col.props.backgroundColor};` : '';
  const vAlign = col.props.verticalAlign || 'top';

  const blocksHtml = (col.children || []).map((b) => renderBlockHtml(b)).join('\n');

  return {
    html: `
<td class="${colClass} ${isMobileStack ? 'h-col-stack' : ''}" width="${widthPercent}%" valign="${vAlign}" style="width: ${widthPercent}%; padding: ${pad}; ${bg} vertical-align: ${vAlign}; box-sizing: border-box;">
  ${blocksHtml}
</td>`.trim(),
    colClass,
  };
}

function renderRowHtml(row: BuilderRow): { html: string; colClasses: string[] } {
  const pad = typeof row.props.padding === 'number' ? `${row.props.padding}px` : row.props.padding || '0px';
  const bg = row.props.backgroundColor ? `background-color: ${row.props.backgroundColor};` : '';

  const colResults = (row.columns || []).map((c) => renderColumnHtml(c, row.props.mobileStack !== false));
  const colClasses = colResults.map((r) => r.colClass);
  const colsHtml = colResults.map((r) => r.html).join('\n');

  return {
    html: `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="${bg}">
  <tr>
    <td style="padding: ${pad};">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          ${colsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim(),
    colClasses,
  };
}

function renderSectionHtml(sec: BuilderSection): { html: string; colClasses: string[] } {
  const bg = sec.props.backgroundColor ? `background-color: ${sec.props.backgroundColor};` : 'background-color: #ffffff;';
  const pad = typeof sec.props.padding === 'number' ? `${sec.props.padding}px` : sec.props.padding || '24px';
  const radius = sec.props.borderRadius ? `border-radius: ${sec.props.borderRadius}px;` : '';
  const border = sec.props.border ? `border: ${sec.props.border};` : '';

  const allColClasses: string[] = [];
  const rowsHtml = (sec.children || [])
    .map((r) => {
      const res = renderRowHtml(r);
      allColClasses.push(...res.colClasses);
      return res.html;
    })
    .join('\n');

  return {
    html: `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 16px 0;">
  <tr>
    <td style="${bg} ${radius} ${border} padding: ${pad}; box-sizing: border-box;">
      ${rowsHtml}
    </td>
  </tr>
</table>`.trim(),
    colClasses: allColClasses,
  };
}

export function generateEmailHtml(doc: BuilderDocument): string {
  const settings = doc.settings || {
    width: 600,
    backgroundColor: '#f4f4f5',
    contentBackgroundColor: '#ffffff',
    fontFamily: 'Arial, Helvetica, sans-serif',
    textColor: '#111827',
    padding: 20,
  };

  const docWidth = settings.width || 600;
  const pageBg = settings.backgroundColor || '#f4f4f5';
  const contentBg = settings.contentBackgroundColor || '#ffffff';
  const font = settings.fontFamily || 'Arial, Helvetica, sans-serif';
  const textColor = settings.textColor || '#111827';
  const pagePad = typeof settings.padding === 'number' ? `${settings.padding}px` : settings.padding || '20px';

  const sectionsResults = (doc.children || []).map((s) => renderSectionHtml(s));
  const sectionsHtml = sectionsResults.map((r) => r.html).join('\n');

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Template</title>
  <style type="text/css">
    body { margin: 0; padding: 0; min-width: 100%; background-color: ${pageBg}; font-family: ${font}; color: ${textColor}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    @media only screen and (max-width: 600px) {
      .h-col-stack {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .h-container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 10px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${pageBg};">
  <!-- Wrapper Table -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${pageBg};">
    <tr>
      <td align="center" style="padding: ${pagePad} 0;">
        <!-- Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="h-container" width="${docWidth}" style="width: ${docWidth}px; max-width: ${docWidth}px; background-color: ${contentBg}; margin: 0 auto;">
          <tr>
            <td style="padding: 0;">
              ${sectionsHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
