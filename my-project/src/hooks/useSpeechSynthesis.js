import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Google Translate TTS URL builder.
 * Generates actual audio that can be routed to any audio output device
 * (including Bluetooth speakers/headphones) via setSinkId.
 */
function buildGoogleTTSUrl(text, lang) {
  const params = new URLSearchParams({
    client: 'gtx',
    tl: lang,
    q: text,
    ie: 'UTF-8',
  });
  return `https://translate.google.com/translate_tts?${params}`;
}

/**
 * Split text into chunks of ~180 chars (Google TTS limit is ~200).
 * Splits on sentence boundaries, then word boundaries.
 */
function splitTextForTTS(text, maxLen = 180) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    let splitIdx = remaining.lastIndexOf('. ', maxLen);
    if (splitIdx === -1 || splitIdx < maxLen / 2) {
      splitIdx = remaining.lastIndexOf(' ', maxLen);
    }
    if (splitIdx === -1 || splitIdx < maxLen / 2) {
      splitIdx = maxLen;
    } else {
      splitIdx += 1; // include the space/period
    }

    chunks.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }

  return chunks.filter((c) => c.length > 0);
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const abortRef = useRef(false);
  const audioRef = useRef(null);

  // Also keep browser SpeechSynthesis as fallback
  const [voices, setVoices] = useState([]);
  const isSupported = typeof window !== 'undefined';

  // Load available audio output devices (speakers, Bluetooth, etc.)
  useEffect(() => {
    async function loadDevices() {
      try {
        // Need at least one getUserMedia call to get device labels
        // (browsers require permission to enumerate device labels)
        await navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          stream.getTracks().forEach((t) => t.stop());
        });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter((d) => d.kind === 'audiooutput');
        setAudioDevices(outputs);

        // Auto-select Bluetooth if available and no device selected yet
        const bluetooth = outputs.find(
          (d) =>
            d.label.toLowerCase().includes('bluetooth') ||
            d.label.toLowerCase().includes('bt') ||
            d.label.toLowerCase().includes('headset') ||
            d.label.toLowerCase().includes('headphone') ||
            d.label.toLowerCase().includes('earbuds') ||
            d.label.toLowerCase().includes('airpods')
        );
        if (bluetooth) {
          setSelectedDeviceId(bluetooth.deviceId);
        }
      } catch {
        // Permission denied or not supported — fall back to default
        console.warn('Could not enumerate audio devices');
      }
    }

    loadDevices();

    // Re-scan when devices change (Bluetooth connect/disconnect)
    const handler = () => loadDevices();
    navigator.mediaDevices?.addEventListener('devicechange', handler);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handler);
    };
  }, []);

  // Load browser voices (fallback)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  /**
   * Primary speak method: Uses Google TTS audio + HTML5 Audio element.
   * This lets us route audio to a specific output device (Bluetooth)
   * via Audio.setSinkId().
   *
   * Falls back to browser SpeechSynthesis if Google TTS fails.
   */
  const speak = useCallback(
    async (text, lang = 'en-US') => {
      if (!text) return;

      // Cancel any ongoing playback
      abortRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      abortRef.current = false;
      setIsSpeaking(true);

      // Extract the base language code (e.g. 'ta' from 'ta-IN')
      const baseLang = lang.split('-')[0];

      try {
        const chunks = splitTextForTTS(text);

        for (const chunk of chunks) {
          if (abortRef.current) break;

          const url = buildGoogleTTSUrl(chunk, baseLang);
          const audio = new Audio(url);
          audioRef.current = audio;

          // Route to selected audio device (Bluetooth, etc.)
          if (selectedDeviceId && typeof audio.setSinkId === 'function') {
            try {
              await audio.setSinkId(selectedDeviceId);
            } catch (e) {
              console.warn('setSinkId failed, using default output:', e);
            }
          }

          await new Promise((resolve, reject) => {
            audio.onended = resolve;
            audio.onerror = reject;
            audio.play().catch(reject);
          });
        }
      } catch (err) {
        console.warn('Google TTS failed, falling back to browser speech:', err);

        // Fallback: browser SpeechSynthesis (uses system default audio device)
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang;
          utterance.rate = 0.95;
          utterance.pitch = 1;

          const matchingVoice = voices.find((v) =>
            v.lang.startsWith(baseLang)
          );
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }

          await new Promise((resolve) => {
            utterance.onend = resolve;
            utterance.onerror = resolve;
            window.speechSynthesis.speak(utterance);
          });
        }
      } finally {
        setIsSpeaking(false);
        audioRef.current = null;
      }
    },
    [selectedDeviceId, voices]
  );

  const stop = useCallback(() => {
    abortRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
    voices,
    audioDevices,
    selectedDeviceId,
    setSelectedDeviceId,
  };
}
