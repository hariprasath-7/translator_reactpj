export const LANGUAGES = [
  { code: 'en', name: 'English', speechCode: 'en-US' },
  { code: 'es', name: 'Spanish', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', speechCode: 'de-DE' },
  { code: 'it', name: 'Italian', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', speechCode: 'pt-BR' },
  { code: 'ru', name: 'Russian', speechCode: 'ru-RU' },
  { code: 'ja', name: 'Japanese', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', speechCode: 'ko-KR' },
  { code: 'zh', name: 'Chinese', speechCode: 'zh-CN' },
  { code: 'ar', name: 'Arabic', speechCode: 'ar-SA' },
  { code: 'hi', name: 'Hindi', speechCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', speechCode: 'bn-IN' },
  { code: 'ta', name: 'Tamil', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', speechCode: 'te-IN' },
  { code: 'nl', name: 'Dutch', speechCode: 'nl-NL' },
  { code: 'sv', name: 'Swedish', speechCode: 'sv-SE' },
  { code: 'pl', name: 'Polish', speechCode: 'pl-PL' },
  { code: 'tr', name: 'Turkish', speechCode: 'tr-TR' },
  { code: 'th', name: 'Thai', speechCode: 'th-TH' },
  { code: 'vi', name: 'Vietnamese', speechCode: 'vi-VN' },
  { code: 'id', name: 'Indonesian', speechCode: 'id-ID' },
  { code: 'uk', name: 'Ukrainian', speechCode: 'uk-UA' },
  { code: 'el', name: 'Greek', speechCode: 'el-GR' },
  { code: 'cs', name: 'Czech', speechCode: 'cs-CZ' },
  { code: 'ro', name: 'Romanian', speechCode: 'ro-RO' },
  { code: 'da', name: 'Danish', speechCode: 'da-DK' },
  { code: 'fi', name: 'Finnish', speechCode: 'fi-FI' },
  { code: 'hu', name: 'Hungarian', speechCode: 'hu-HU' },
  { code: 'no', name: 'Norwegian', speechCode: 'nb-NO' },
];

export function getLanguageByCode(code) {
  return LANGUAGES.find((lang) => lang.code === code);
}

