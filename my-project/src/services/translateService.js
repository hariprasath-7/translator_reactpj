/**
 * Translation service using Google Translate (free, no API key).
 * Provides much better quality than MyMemory, especially for
 * Indian languages like Tamil, Hindi, Telugu, Bengali etc.
 */

const GOOGLE_TRANSLATE_API =
  'https://translate.googleapis.com/translate_a/single';

export async function translateText(text, sourceLang, targetLang) {
  if (!text.trim()) {
    throw new Error('No text to translate');
  }

  const params = new URLSearchParams({
    client: 'gtx',
    sl: sourceLang,
    tl: targetLang,
    dt: 't',
    q: text,
  });

  const url = `${GOOGLE_TRANSLATE_API}?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const data = await response.json();

  // Google Translate returns a nested array structure:
  // data[0] contains translation segments, each segment is [translatedChunk, originalChunk, ...]
  if (data && data[0]) {
    const translatedText = data[0]
      .filter((segment) => segment && segment[0])
      .map((segment) => segment[0])
      .join('');

    if (translatedText) {
      return translatedText;
    }
  }

  throw new Error('Translation failed. Please try again.');
}
