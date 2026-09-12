import { BuilderColumn } from './types';

export function resizeColumns(
  columns: BuilderColumn[],
  dividerIndex: number,
  deltaPercentage: number
): BuilderColumn[] {
  if (columns.length < 2 || dividerIndex < 0 || dividerIndex >= columns.length - 1) {
    return columns;
  }

  const result = columns.map((col) => ({ ...col }));

  if (columns.length === 2) {
    const minWidth = 20;
    const maxWidth = 80;

    let newW0 = Math.round((columns[0].width + deltaPercentage) * 100) / 100;
    if (newW0 < minWidth) newW0 = minWidth;
    if (newW0 > maxWidth) newW0 = maxWidth;

    const newW1 = Math.round((100 - newW0) * 100) / 100;

    result[0].width = newW0;
    result[1].width = newW1;
    return result;
  }

  if (columns.length === 3) {
    const minWidth = 15;

    if (dividerIndex === 0) {
      // Dragging between col 0 and col 1
      const fixedCol2W = columns[2].width;
      const availableW = 100 - fixedCol2W;

      let newW0 = Math.round((columns[0].width + deltaPercentage) * 100) / 100;
      if (newW0 < minWidth) newW0 = minWidth;
      if (newW0 > availableW - minWidth) newW0 = Math.round((availableW - minWidth) * 100) / 100;

      const newW1 = Math.round((availableW - newW0) * 100) / 100;

      result[0].width = newW0;
      result[1].width = newW1;
      result[2].width = fixedCol2W;
      return result;
    }

    if (dividerIndex === 1) {
      // Dragging between col 1 and col 2
      const fixedCol0W = columns[0].width;
      const availableW = 100 - fixedCol0W;

      let newW1 = Math.round((columns[1].width + deltaPercentage) * 100) / 100;
      if (newW1 < minWidth) newW1 = minWidth;
      if (newW1 > availableW - minWidth) newW1 = Math.round((availableW - minWidth) * 100) / 100;

      const newW2 = Math.round((availableW - newW1) * 100) / 100;

      result[0].width = fixedCol0W;
      result[1].width = newW1;
      result[2].width = newW2;
      return result;
    }
  }

  return result;
}
