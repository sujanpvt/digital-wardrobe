export function cloudThumb(url: string, w: number, h: number): string {
  try {
    if (!url) return url;
    const idx = url.indexOf('/upload/');
    if (idx === -1) return url;
    const prefix = url.substring(0, idx + 8); // include '/upload/'
    const suffix = url.substring(idx + 8);
    const transform = `c_fill,f_auto,q_auto,w_${w},h_${h}`;
    return `${prefix}${transform}/${suffix}`;
  } catch (_) {
    return url;
  }
}

export function squareThumb(url: string, size: number = 256): string {
  return cloudThumb(url, size, size);
}