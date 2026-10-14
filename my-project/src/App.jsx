import { useState, useCallback, useRef, useEffect } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { translateText } from './services/translateService';
import { LANGUAGES, getLanguageByCode } from './constants/languages';
import './App.css';

// SVG Icons
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const StopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="5" width="14" height="14" rx="2" />
  </svg>
);

const VolumeIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const VolumeStopIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SwapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 3 4 4-4 4" />
    <path d="M20 7H4" />
    <path d="m8 21-4-4 4-4" />
    <path d="M4 17h16" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

const MAX_CHARS = 5000;

function App() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ta');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const settingsRef = useRef(null);

  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
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

  // Close settings on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input text when speech transcript updates
  useEffect(() => {
    if (isListening && transcript) {
      setInputText(transcript);
    }
  }, [isListening, transcript]);

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      const lang = getLanguageByCode(sourceLang);
      startListening(lang?.speechCode || 'en-US');
    }
  }, [isListening, stopListening, startListening, resetTranscript, sourceLang]);

  const handleTranslate = useCallback(async () => {
    const textToTranslate = inputText.trim();
    if (!textToTranslate) return;

    setIsTranslating(true);
    setStatus(null);

    try {
      const result = await translateText(textToTranslate, sourceLang, targetLang);
      setTranslatedText(result);

      setHistory((prev) => [
        {
          id: Date.now(),
          original: textToTranslate,
          translated: result,
          from: sourceLang,
          to: targetLang,
        },
        ...prev.slice(0, 7),
      ]);

      if (autoSpeak && isSynthesisSupported) {
        const targetLangData = getLanguageByCode(targetLang);
        speak(result, targetLangData?.speechCode || 'en-US');
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Translation failed' });
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, sourceLang, targetLang, autoSpeak, isSynthesisSupported, speak]);

  const handleSwapLanguages = useCallback(() => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 350);

    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);

    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  }, [sourceLang, targetLang, translatedText, inputText]);

  const handleCopy = useCallback(() => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [translatedText]);

  const handlePlayOriginal = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (inputText) {
      const langData = getLanguageByCode(sourceLang);
      speak(inputText, langData?.speechCode || 'en-US');
    }
  }, [isSpeaking, stopSpeaking, inputText, sourceLang, speak]);

  const handlePlayTranslation = useCallback(
    (text, langCode) => {
      if (isSpeaking) {
        stopSpeaking();
      } else if (text) {
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

  const handleKeyDown = (e) => {
    // Translate on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleTranslate();
    }
  };

  return (
    <div className="app-shell">
      {/* Top Brand & Controls Bar */}
      <header className="app-header">
        <div className="brand-badge">
          <span className="brand-dot"></span>
          <span className="brand-name">Voice Translator</span>
        </div>

        <div className="header-actions">
          {/* Settings Popover */}
          <div className="settings-container" ref={settingsRef}>
            <button
              className={`btn-settings ${isSettingsOpen ? 'active' : ''}`}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              title="Preferences & Audio Settings"
              aria-label="Settings"
            >
              <SettingsIcon />
            </button>

            {isSettingsOpen && (
              <div className="settings-popover">
                <div className="settings-popover-header">
                  <h4>Preferences</h4>
                </div>

                <div className="settings-item">
                  <label className="toggle-label">
                    <span>Auto-speak translation</span>
                    <input
                      type="checkbox"
                      checked={autoSpeak}
                      onChange={(e) => setAutoSpeak(e.target.checked)}
                      className="custom-toggle"
                    />
                  </label>
                </div>

                {audioDevices.length > 0 && (
                  <div className="settings-item device-select-item">
                    <label className="device-label">
                      <span>Audio Output (Bluetooth/Speakers)</span>
                      <select
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="device-dropdown"
                      >
                        <option value="">Default System Output</option>
                        {audioDevices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Audio Device (${device.deviceId.slice(0, 6)}...)`}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Translation Experience */}
      <main className="main-content">
        {/* Language Bar with sleek pills */}
        <div className="language-selector-bar">
          <div className="lang-pill-wrapper">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="lang-pill-select"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="lang-pill-face">
              <span>{getLanguageByCode(sourceLang)?.name || 'English'}</span>
              <ChevronDownIcon />
            </div>
          </div>

          <button
            className={`swap-pill-btn ${isSwapping ? 'rotating' : ''}`}
            onClick={handleSwapLanguages}
            title="Swap languages"
            aria-label="Swap languages"
          >
            <SwapIcon />
          </button>

          <div className="lang-pill-wrapper">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="lang-pill-select"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="lang-pill-face">
              <span>{getLanguageByCode(targetLang)?.name || 'Tamil'}</span>
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        {/* Unified Card Container with Split Grid */}
        <div className="unified-card">
          {/* Source Input Side */}
          <div className="panel-side source-side">
            <textarea
              className="seamless-textarea"
              value={inputText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setInputText(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type, paste, or click mic to speak..."
              rows={6}
            />

            {/* Bottom Docked Action Bar */}
            <div className="docked-action-bar">
              <div className="action-bar-left">
                {isSpeechSupported && (
                  <button
                    className={`mic-dock-btn ${isListening ? 'active-pulse' : ''}`}
                    onClick={handleMicToggle}
                    title={isListening ? 'Stop listening' : 'Speak via microphone'}
                  >
                    {isListening ? <StopIcon /> : <MicIcon />}
                  </button>
                )}

                {inputText && (
                  <button
                    className="action-icon-btn"
                    onClick={handlePlayOriginal}
                    title={isSpeaking ? 'Stop playback' : 'Listen to source text'}
                  >
                    {isSpeaking ? <VolumeStopIcon /> : <VolumeIcon />}
                  </button>
                )}
              </div>

              <div className="action-bar-right">
                {inputText && (
                  <button
                    className="clear-text-btn"
                    onClick={handleClear}
                    title="Clear text"
                  >
                    <ClearIcon />
                  </button>
                )}
                <span className="char-counter">
                  {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Subtle Vertical Divider */}
          <div className="panel-divider"></div>

          {/* Translation Output Side */}
          <div className="panel-side output-side">
            <div className="output-content-area">
              {isTranslating ? (
                <div className="translating-state">
                  <div className="pulse-loader"></div>
                  <span>Translating...</span>
                </div>
              ) : translatedText ? (
                <div className="translated-text-display">{translatedText}</div>
              ) : (
                <div className="empty-placeholder">
                  Translation will appear here...
                </div>
              )}
            </div>

            {/* Bottom Docked Action Bar */}
            <div className="docked-action-bar">
              <div className="action-bar-left">
                {isSpeaking && (
                  <div className="speaking-chip">
                    <span className="sound-wave">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                    <span>Speaking</span>
                  </div>
                )}
              </div>

              <div className="action-bar-right">
                {translatedText && (
                  <>
                    <button
                      className="action-icon-btn"
                      onClick={() => handlePlayTranslation(translatedText, targetLang)}
                      title={isSpeaking ? 'Stop audio' : 'Listen to translation'}
                    >
                      {isSpeaking ? <VolumeStopIcon /> : <VolumeIcon />}
                    </button>

                    <button
                      className={`action-icon-btn ${copied ? 'copied-btn' : ''}`}
                      onClick={handleCopy}
                      title={copied ? 'Copied to clipboard!' : 'Copy to clipboard'}
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Translate Trigger Bar */}
        <div className="translate-cta-row">
          <button
            className="translate-action-btn"
            onClick={handleTranslate}
            disabled={isTranslating || !inputText.trim()}
          >
            <SparkleIcon />
            <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
            <kbd className="kbd-shortcut">Ctrl+↵</kbd>
          </button>
        </div>

        {/* Error / Status Toast */}
        {(status || speechError) && (
          <div className={`status-toast ${speechError ? 'error' : status?.type || 'info'}`}>
            {speechError || status?.message}
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <section className="recent-history-section">
            <div className="history-header">
              <h3>Recent Translations</h3>
            </div>
            <div className="history-cards">
              {history.map((item) => (
                <div key={item.id} className="history-card">
                  <div className="history-text-col">
                    <div className="history-source-row">
                      <span className="lang-tag">{item.from.toUpperCase()}</span>
                      <p className="history-text">{item.original}</p>
                    </div>
                    <div className="history-target-row">
                      <span className="lang-tag highlight">{item.to.toUpperCase()}</span>
                      <p className="history-text translated">{item.translated}</p>
                    </div>
                  </div>
                  <button
                    className="history-action-btn"
                    onClick={() => handlePlayTranslation(item.translated, item.to)}
                    title="Play voice"
                  >
                    <VolumeIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
