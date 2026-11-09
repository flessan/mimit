/**
 * Creates a File from a URL and verifies that the response is an image.
 *
 * @param {{ url: string, filename?: string, mimeType?: string }} options
 * @returns {Promise<File>}
 */
export const fileFromUrl = async (options = {}) => {
  const response = await fetch(options.url);
  if (!response.ok) {
    throw new Error(`Image request failed with status ${response.status}.`);
  }

  const blob = await response.blob();
  const mimeType = options.mimeType || blob.type || '';
  if (!mimeType.toLowerCase().startsWith('image/')) {
    throw new Error('The selected URL did not return an image.');
  }

  const extension = mimeType.split('/')[1]?.replace('svg+xml', 'svg') || 'img';
  return new File([blob], options.filename || `image.${extension}`, { type: mimeType });
};
