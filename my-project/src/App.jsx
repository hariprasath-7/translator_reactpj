import { useState, useCallback } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { translateText } from './services/translateService';
import { LANGUAGES, getLanguageByCode } from './constants/languages';
import './App.css';

function App() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition();

  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
    isSupported: isSynthesisSupported,
    audioDevices,
    selectedDeviceId,
    setSelectedDeviceId,
  } = useSpeechSynthesis();

  // Sync transcript to input text while listening
  const currentInput = isListening ? transcript : inputText;

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      stopListening();
      // After stopping, set the transcript as input text
      setTimeout(() => {
        setInputText(transcript);
      }, 100);
    } else {
      resetTranscript();
      const lang = getLanguageByCode(sourceLang);
      startListening(lang?.speechCode || 'en-US');
    }
  }, [isListening, stopListening, startListening, resetTranscript, sourceLang, transcript]);

  const handleTranslate = useCallback(async () => {
    const textToTranslate = currentInput.trim();
    if (!textToTranslate) {
      setStatus({ type: 'error', message: 'Please enter or speak some text first.' });
      return;
    }

    setIsTranslating(true);
    setStatus({ type: 'info', message: 'Translating...' });
    setTranslatedText('');

    try {
      const result = await translateText(textToTranslate, sourceLang, targetLang);
      setTranslatedText(result);
      setStatus({ type: 'success', message: 'Translation complete!' });

      // Add to history
      setHistory((prev) => [
        {
          id: Date.now(),
          original: textToTranslate,
          translated: result,
          from: sourceLang,
          to: targetLang,
        },
        ...prev.slice(0, 9),
      ]);

      // Auto-speak the translation
      if (autoSpeak && isSynthesisSupported) {
        const targetLangData = getLanguageByCode(targetLang);
        speak(result, targetLangData?.speechCode || 'en-US');
      }

      // Clear status after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsTranslating(false);
    }
  }, [currentInput, sourceLang, targetLang, autoSpeak, isSynthesisSupported, speak]);

  const handleSwapLanguages = useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText('');
  }, [sourceLang, targetLang, translatedText]);

  const handlePlayTranslation = useCallback(
    (text, langCode) => {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        const langData = getLanguageByCode(langCode);
        speak(text, langData?.speechCode || 'en-US');
      }
    },
    [isSpeaking, speak, stopSpeaking]
  );

  const handleClear = useCallback(() => {
    setInputText('');
    setTranslatedText('');
    resetTranscript();
    setStatus(null);
  }, [resetTranscript]);

  return (
    <div className="app">
      <header className="header">
        <h1>🌐 Voice Translator</h1>
        <p>Speak in one language, hear it in another</p>
      </header>

      <div className="translator-container">
        {/* Language Selector Bar */}
        <div className="language-bar">
          <div className="lang-select-group">
            <label>From</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="swap-btn"
            onClick={handleSwapLanguages}
            title="Swap languages"
          >
            ⇄
          </button>

          <div className="lang-select-group">
            <label>To</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Panels */}
        <div className="panels">
          {/* Input Panel */}
          <div className="panel">
            <div className="panel-header">
              <h3>Original</h3>
              <div className="panel-actions">
                <button
                  className="icon-btn"
                  onClick={handleClear}
                  title="Clear"
                  disabled={!currentInput}
                >
                  ✕
                </button>
                <button
                  className="icon-btn"
                  onClick={() => handlePlayTranslation(currentInput, sourceLang)}
                  title="Play original"
                  disabled={!currentInput || !isSynthesisSupported}
                >
                  {isSpeaking ? '⏹' : '🔊'}
                </button>
              </div>
            </div>

            <textarea
              className="text-area"
              value={currentInput}
              onChange={(e) => {
                setInputText(e.target.value);
                if (isListening) {
                  stopListening();
                }
              }}
              placeholder="Type text or click the microphone to speak..."
              rows={5}
            />

            <div className="mic-section">
              {isSpeechSupported ? (
                <button
                  className={`mic-btn ${isListening ? 'listening' : ''}`}
                  onClick={handleMicToggle}
                  title={isListening ? 'Stop listening' : 'Start listening'}
                >
                  {isListening ? '⏹' : '🎤'}
                </button>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  🎤 Speech recognition not supported in this browser
                </span>
              )}
            </div>
          </div>

          {/* Output Panel */}
          <div className="panel">
            <div className="panel-header">
              <h3>Translation</h3>
              <div className="panel-actions">
                {isSpeaking && (
                  <span className="speaking-indicator">🔊 Speaking...</span>
                )}
                <button
                  className="icon-btn"
                  onClick={() => handlePlayTranslation(translatedText, targetLang)}
                  title="Play translation"
                  disabled={!translatedText || !isSynthesisSupported}
                >
                  {isSpeaking ? '⏹' : '🔊'}
                </button>
                <button
                  className="icon-btn"
                  onClick={() => navigator.clipboard.writeText(translatedText)}
                  title="Copy translation"
                  disabled={!translatedText}
                >
                  📋
                </button>
              </div>
            </div>

            <div className={`text-display ${!translatedText ? 'empty' : ''}`}>
              {translatedText || 'Translation will appear here...'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                Auto-speak translation
              </label>
            </div>

            {/* Audio Output Device Selector (for Bluetooth support) */}
            {audioDevices.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  🔈 Audio output:
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    style={{
                      background: 'var(--bg-primary, #1a1a2e)',
                      color: 'var(--text-primary, #e0e0e0)',
                      border: '1px solid var(--border, #333)',
                      borderRadius: '6px',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.8rem',
                      maxWidth: '220px',
                    }}
                  >
                    <option value="">Default</option>
                    {audioDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Translate Button */}
        <div className="translate-section">
          <button
            className="translate-btn"
            onClick={handleTranslate}
            disabled={isTranslating || !currentInput.trim()}
          >
            {isTranslating ? '⟳ Translating...' : '✦ Translate'}
          </button>
        </div>

        {/* Status */}
        {(status || speechError) && (
          <div className={`status-bar ${speechError ? 'error' : status?.type || 'info'}`}>
            {speechError || status?.message}
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="history-section">
          <h3>Recent Translations</h3>
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <span className="history-original">{item.original}</span>
                <span className="history-arrow">→</span>
                <span className="history-translated">{item.translated}</span>
                <button
                  className="history-play"
                  onClick={() => handlePlayTranslation(item.translated, item.to)}
                  title="Play this translation"
                >
                  🔊
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
