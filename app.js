// Main Controller for VelocityType
import { COMMON_WORDS, PUNCTUATION_POOL, NUMBERS_POOL, QUOTES, CODE_SNIPPETS } from './words.js';
import { soundManager } from './sound.js';

class VelocityTypeApp {
  constructor() {
    // Config state
    this.mode = 'time'; // 'time', 'words', 'quote', 'code', 'zen'
    this.timeLimit = 30; // 15, 30, 60, 120
    this.wordLimit = 25; // 10, 25, 50, 100
    this.hasPunctuation = false;
    this.hasNumbers = false;
    this.currentTheme = localStorage.getItem('velocity_theme') || 'obsidian';
    this.currentSound = localStorage.getItem('velocity_sound') || 'thock';
    this.showKeyboard = localStorage.getItem('velocity_keyboard') !== 'false';

    // Game state
    this.status = 'idle'; // 'idle', 'running', 'finished'
    this.wordsList = [];
    this.currentQuote = null;
    this.wordIndex = 0;
    this.letterIndex = 0;
    this.typedHistory = []; // stores user typed string per word index
    
    // Timing & Metrics
    this.startTime = null;
    this.endTime = null;
    this.timerInterval = null;
    this.timeElapsed = 0;
    this.totalSeconds = 30;
    
    // Stats tracking
    this.statsTimeline = []; // [{ second, wpm, rawWpm, errors }]
    this.totalKeypresses = 0;
    this.correctKeypresses = 0;
    this.incorrectKeypresses = 0;
    this.extraKeypresses = 0;
    this.missedKeypresses = 0;
    this.capsLockActive = false;

    // DOM Elements Cache
    this.dom = {
      appContainer: document.querySelector('.app-container'),
      mainContent: document.getElementById('mainContent'),
      typingCard: document.getElementById('typingCard'),
      typingInput: document.getElementById('typingInput'),
      wordsWrapper: document.getElementById('wordsWrapper'),
      wordsContainer: document.getElementById('wordsContainer'),
      caret: document.getElementById('caret'),
      focusOverlay: document.getElementById('focusOverlay'),
      capsWarning: document.getElementById('capsWarning'),
      quoteAuthor: document.getElementById('quoteAuthor'),
      quoteAuthorName: document.getElementById('quoteAuthorName'),
      restartBtn: document.getElementById('restartBtn'),
      
      // HUD
      hudTimer: document.getElementById('hudTimer'),
      hudTimerLabel: document.getElementById('hudTimerLabel'),
      liveWpmHud: document.getElementById('liveWpmHud'),
      hudLiveWpm: document.getElementById('hudLiveWpm'),
      hudLiveAcc: document.getElementById('hudLiveAcc'),

      // Controls
      btnPunctuation: document.getElementById('btnPunctuation'),
      btnNumbers: document.getElementById('btnNumbers'),
      mainModes: document.getElementById('mainModes'),
      configOptions: document.getElementById('configOptions'),
      soundBtn: document.getElementById('soundBtn'),
      soundMenu: document.getElementById('soundMenu'),
      soundLabel: document.getElementById('soundLabel'),
      themeBtn: document.getElementById('themeBtn'),
      themeMenu: document.getElementById('themeMenu'),
      themeLabel: document.getElementById('themeLabel'),
      toggleKeyboardBtn: document.getElementById('toggleKeyboardBtn'),
      virtualKeyboard: document.getElementById('virtualKeyboard'),

      // Results
      resultsView: document.getElementById('resultsView'),
      resultModeBadge: document.getElementById('resultModeBadge'),
      newPbBadge: document.getElementById('newPbBadge'),
      resWpm: document.getElementById('resWpm'),
      resAcc: document.getElementById('resAcc'),
      resRawWpm: document.getElementById('resRawWpm'),
      resCharsCorrect: document.getElementById('resCharsCorrect'),
      resCharsIncorrect: document.getElementById('resCharsIncorrect'),
      resCharsExtra: document.getElementById('resCharsExtra'),
      resCharsMissed: document.getElementById('resCharsMissed'),
      resConsistency: document.getElementById('resConsistency'),
      resTime: document.getElementById('resTime'),
      wpmChart: document.getElementById('wpmChart'),
      chartTooltip: document.getElementById('chartTooltip'),
      btnNextTest: document.getElementById('btnNextTest'),
      btnRepeatTest: document.getElementById('btnRepeatTest'),
      btnCopyResult: document.getElementById('btnCopyResult'),
      copyBtnText: document.getElementById('copyBtnText'),

      // History Modal
      historyModalBtn: document.getElementById('historyModalBtn'),
      historyModal: document.getElementById('historyModal'),
      closeHistoryModal: document.getElementById('closeHistoryModal'),
      ovCompletedTests: document.getElementById('ovCompletedTests'),
      ovBestWpm: document.getElementById('ovBestWpm'),
      ovAvgWpm: document.getElementById('ovAvgWpm'),
      ovAvgAcc: document.getElementById('ovAvgAcc'),
      clearHistoryBtn: document.getElementById('clearHistoryBtn'),
      historyTableBody: document.getElementById('historyTableBody')
    };

    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.applySound(this.currentSound);
    this.applyKeyboardVisibility(this.showKeyboard);
    this.renderConfigOptions();
    this.bindEvents();
    this.initTest();
  }

  // -------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------
  bindEvents() {
    // Mode toggles
    this.dom.mainModes.addEventListener('click', (e) => {
      const btn = e.target.closest('.mode-btn');
      if (!btn) return;
      this.mode = btn.dataset.mode;
      this.dom.mainModes.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.renderConfigOptions();
      this.initTest();
    });

    // Punctuation & Numbers
    this.dom.btnPunctuation.addEventListener('click', () => {
      this.hasPunctuation = !this.hasPunctuation;
      this.dom.btnPunctuation.classList.toggle('active', this.hasPunctuation);
      this.initTest();
    });

    this.dom.btnNumbers.addEventListener('click', () => {
      this.hasNumbers = !this.hasNumbers;
      this.dom.btnNumbers.classList.toggle('active', this.hasNumbers);
      this.initTest();
    });

    // Dynamic config options (15, 30, 60 or 10, 25, 50)
    this.dom.configOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.config-btn');
      if (!btn) return;
      const val = parseInt(btn.dataset.val, 10);
      if (this.mode === 'time') this.timeLimit = val;
      if (this.mode === 'words') this.wordLimit = val;
      this.dom.configOptions.querySelectorAll('.config-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.initTest();
    });

    // Sound picker dropdown
    this.dom.soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dom.soundMenu.classList.toggle('show');
      this.dom.themeMenu.classList.remove('show');
    });

    this.dom.soundMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;
      this.applySound(item.dataset.sound);
      this.dom.soundMenu.classList.remove('show');
      soundManager.playKey();
    });

    // Theme picker dropdown
    this.dom.themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dom.themeMenu.classList.toggle('show');
      this.dom.soundMenu.classList.remove('show');
    });

    this.dom.themeMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;
      this.applyTheme(item.dataset.theme);
      this.dom.themeMenu.classList.remove('show');
    });

    document.addEventListener('click', () => {
      this.dom.soundMenu.classList.remove('show');
      this.dom.themeMenu.classList.remove('show');
    });

    // Virtual Keyboard Toggle
    this.dom.toggleKeyboardBtn.addEventListener('click', () => {
      this.showKeyboard = !this.showKeyboard;
      localStorage.setItem('velocity_keyboard', this.showKeyboard);
      this.applyKeyboardVisibility(this.showKeyboard);
    });

    // Restart button
    this.dom.restartBtn.addEventListener('click', () => this.initTest());
    this.dom.btnNextTest.addEventListener('click', () => this.initTest());
    this.dom.btnRepeatTest.addEventListener('click', () => this.repeatTest());
    this.dom.btnCopyResult.addEventListener('click', () => this.copyResultsToClipboard());

    // Stats modal
    this.dom.historyModalBtn.addEventListener('click', () => this.openHistoryModal());
    this.dom.closeHistoryModal.addEventListener('click', () => this.closeHistoryModal());
    this.dom.historyModal.addEventListener('click', (e) => {
      if (e.target === this.dom.historyModal) this.closeHistoryModal();
    });
    this.dom.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

    // Typing Card click focus
    this.dom.typingCard.addEventListener('click', () => {
      this.focusInput();
    });
    this.dom.focusOverlay.addEventListener('click', () => {
      this.focusInput();
    });

    // Hidden input events
    this.dom.typingInput.addEventListener('input', (e) => this.handleInput(e));
    this.dom.typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.dom.typingInput.addEventListener('keyup', (e) => this.handleKeyUp(e));
    this.dom.typingInput.addEventListener('focus', () => {
      this.dom.focusOverlay.classList.add('hidden');
      this.dom.typingCard.classList.add('focused');
      this.dom.caret.style.display = 'block';
    });
    this.dom.typingInput.addEventListener('blur', () => {
      if (this.status !== 'finished') {
        this.dom.focusOverlay.classList.remove('hidden');
        this.dom.typingCard.classList.remove('focused');
        this.dom.caret.style.display = 'none';
      }
    });

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // CapsLock tracking
      if (e.getModifierState) {
        this.capsLockActive = e.getModifierState('CapsLock');
        this.dom.capsWarning.classList.toggle('hidden', !this.capsLockActive);
      }

      // Tab + Enter or Esc to restart
      if (e.key === 'Escape') {
        e.preventDefault();
        this.initTest();
        return;
      }

      if (e.key === 'Tab') {
        this.tabPressed = true;
      }
      if (e.key === 'Enter' && this.tabPressed) {
        e.preventDefault();
        this.tabPressed = false;
        this.initTest();
        return;
      }

      // If results screen is shown and Enter is pressed, go to next test
      if (this.status === 'finished' && e.key === 'Enter') {
        this.initTest();
        return;
      }

      // If typing anywhere while idle or running and modal is not open, focus input
      if (!this.dom.historyModal.classList.contains('hidden')) return;
      if (document.activeElement !== this.dom.typingInput && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.focusInput();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'Tab') {
        this.tabPressed = false;
      }
    });

    // Canvas tooltip hover
    this.dom.wpmChart.addEventListener('mousemove', (e) => this.handleChartHover(e));
    this.dom.wpmChart.addEventListener('mouseleave', () => {
      this.dom.chartTooltip.classList.add('hidden');
    });

    window.addEventListener('resize', () => {
      this.updateCaretPosition();
      if (this.status === 'finished') {
        this.renderChart();
      }
    });
  }

  focusInput() {
    this.dom.typingInput.focus();
    this.dom.focusOverlay.classList.add('hidden');
    this.dom.typingCard.classList.add('focused');
    this.dom.caret.style.display = 'block';
  }

  // -------------------------------------------------------------
  // Theme & Sound Configuration
  // -------------------------------------------------------------
  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('velocity_theme', theme);

    const activeItem = this.dom.themeMenu.querySelector(`[data-theme="${theme}"]`);
    if (activeItem) {
      this.dom.themeMenu.querySelectorAll('.dropdown-item').forEach(b => b.classList.remove('active'));
      activeItem.classList.add('active');
      const text = activeItem.textContent.trim().split(' ')[1] || theme;
      this.dom.themeLabel.textContent = text;
    }

    if (this.status === 'finished') {
      this.renderChart();
    }
  }

  applySound(sound) {
    this.currentSound = sound;
    soundManager.setProfile(sound);
    localStorage.setItem('velocity_sound', sound);

    const activeItem = this.dom.soundMenu.querySelector(`[data-sound="${sound}"]`);
    if (activeItem) {
      this.dom.soundMenu.querySelectorAll('.dropdown-item').forEach(b => b.classList.remove('active'));
      activeItem.classList.add('active');
      const text = activeItem.textContent.trim().split(' ')[1] || sound;
      this.dom.soundLabel.textContent = text;
    }
  }

  applyKeyboardVisibility(show) {
    this.dom.virtualKeyboard.classList.toggle('hidden', !show);
    this.dom.toggleKeyboardBtn.classList.toggle('active', show);
  }

  renderConfigOptions() {
    this.dom.configOptions.innerHTML = '';
    
    // Sub-options visibility
    const showSubOptions = (this.mode === 'time' || this.mode === 'words');
    this.dom.btnPunctuation.parentElement.style.display = showSubOptions ? 'flex' : 'none';

    if (this.mode === 'time') {
      const times = [15, 30, 60, 120];
      times.forEach(t => {
        const btn = document.createElement('button');
        btn.className = `config-btn ${t === this.timeLimit ? 'active' : ''}`;
        btn.dataset.val = t;
        btn.textContent = `${t}s`;
        this.dom.configOptions.appendChild(btn);
      });
    } else if (this.mode === 'words') {
      const wordCounts = [10, 25, 50, 100];
      wordCounts.forEach(w => {
        const btn = document.createElement('button');
        btn.className = `config-btn ${w === this.wordLimit ? 'active' : ''}`;
        btn.dataset.val = w;
        btn.textContent = w;
        this.dom.configOptions.appendChild(btn);
      });
    } else if (this.mode === 'quote') {
      const lbl = document.createElement('span');
      lbl.className = 'btn-label';
      lbl.textContent = 'random quote';
      lbl.style.padding = '0.35rem 0.75rem';
      lbl.style.fontSize = '0.8rem';
      lbl.style.color = 'var(--text-sub)';
      this.dom.configOptions.appendChild(lbl);
    } else if (this.mode === 'code') {
      const lbl = document.createElement('span');
      lbl.className = 'btn-label';
      lbl.textContent = 'javascript snippets';
      lbl.style.padding = '0.35rem 0.75rem';
      lbl.style.fontSize = '0.8rem';
      lbl.style.color = 'var(--text-sub)';
      this.dom.configOptions.appendChild(lbl);
    } else if (this.mode === 'zen') {
      const lbl = document.createElement('span');
      lbl.className = 'btn-label';
      lbl.textContent = 'endless typing';
      lbl.style.padding = '0.35rem 0.75rem';
      lbl.style.fontSize = '0.8rem';
      lbl.style.color = 'var(--text-sub)';
      this.dom.configOptions.appendChild(lbl);
    }
  }

  // -------------------------------------------------------------
  // Test Initialization & Word Generation
  // -------------------------------------------------------------
  initTest() {
    clearInterval(this.timerInterval);
    this.status = 'idle';
    this.startTime = null;
    this.endTime = null;
    this.timeElapsed = 0;
    this.wordIndex = 0;
    this.letterIndex = 0;
    this.typedHistory = [];
    this.statsTimeline = [];
    this.totalKeypresses = 0;
    this.correctKeypresses = 0;
    this.incorrectKeypresses = 0;
    this.extraKeypresses = 0;
    this.missedKeypresses = 0;

    // Reset UI visibility
    this.dom.resultsView.classList.add('hidden');
    this.dom.mainContent.style.display = 'flex';
    this.dom.liveWpmHud.classList.remove('visible');
    this.dom.hudLiveWpm.textContent = '0';
    this.dom.hudLiveAcc.textContent = '100%';
    this.dom.typingInput.value = '';

    // Update HUD counters
    if (this.mode === 'time') {
      this.totalSeconds = this.timeLimit;
      this.dom.hudTimer.textContent = this.timeLimit;
      this.dom.hudTimerLabel.textContent = 'seconds';
    } else if (this.mode === 'words') {
      this.dom.hudTimer.textContent = `0/${this.wordLimit}`;
      this.dom.hudTimerLabel.textContent = 'words';
    } else if (this.mode === 'zen') {
      this.dom.hudTimer.textContent = '0:00';
      this.dom.hudTimerLabel.textContent = 'elapsed';
    } else {
      this.dom.hudTimer.textContent = '—';
      this.dom.hudTimerLabel.textContent = this.mode;
    }

    // Generate Words
    this.wordsList = this.generateWords();
    this.renderWords();
    this.focusInput();
    this.updateCaretPosition();
  }

  repeatTest() {
    if (!this.wordsList.length) return this.initTest();
    clearInterval(this.timerInterval);
    this.status = 'idle';
    this.startTime = null;
    this.endTime = null;
    this.timeElapsed = 0;
    this.wordIndex = 0;
    this.letterIndex = 0;
    this.typedHistory = [];
    this.statsTimeline = [];
    this.totalKeypresses = 0;
    this.correctKeypresses = 0;
    this.incorrectKeypresses = 0;
    this.extraKeypresses = 0;
    this.missedKeypresses = 0;

    this.dom.resultsView.classList.add('hidden');
    this.dom.mainContent.style.display = 'flex';
    this.dom.liveWpmHud.classList.remove('visible');
    this.dom.hudLiveWpm.textContent = '0';
    this.dom.hudLiveAcc.textContent = '100%';
    this.dom.typingInput.value = '';

    if (this.mode === 'time') {
      this.dom.hudTimer.textContent = this.timeLimit;
    } else if (this.mode === 'words') {
      this.dom.hudTimer.textContent = `0/${this.wordLimit}`;
    }

    this.renderWords();
    this.focusInput();
    this.updateCaretPosition();
  }

  generateWords() {
    if (this.mode === 'quote') {
      const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      this.currentQuote = q;
      this.dom.quoteAuthor.classList.remove('hidden');
      this.dom.quoteAuthorName.textContent = q.author;
      return q.text.split(' ');
    } else {
      this.dom.quoteAuthor.classList.add('hidden');
    }

    if (this.mode === 'code') {
      const c = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
      this.currentQuote = c;
      this.dom.quoteAuthor.classList.remove('hidden');
      this.dom.quoteAuthorName.textContent = c.author;
      return c.text.split(' ');
    }

    let count = 80;
    if (this.mode === 'words') {
      count = this.wordLimit;
    } else if (this.mode === 'time') {
      count = Math.max(80, Math.ceil(this.timeLimit * 3.5));
    }

    const words = [];
    const pool = [...COMMON_WORDS];

    for (let i = 0; i < count; i++) {
      let word = pool[Math.floor(Math.random() * pool.length)];

      if (this.hasNumbers && Math.random() < 0.16) {
        word = NUMBERS_POOL[Math.floor(Math.random() * NUMBERS_POOL.length)];
      }

      if (this.hasPunctuation && Math.random() < 0.2) {
        const p = PUNCTUATION_POOL[Math.floor(Math.random() * PUNCTUATION_POOL.length)];
        word = `${word}${p}`;
      }

      words.push(word);
    }

    return words;
  }

  renderWords() {
    this.dom.wordsWrapper.innerHTML = '';
    this.dom.wordsWrapper.style.transform = 'translateY(0px)';

    const fragment = document.createDocumentFragment();
    this.wordsList.forEach((wordText, wIdx) => {
      const wordDiv = document.createElement('div');
      wordDiv.className = `word ${wIdx === 0 ? 'active' : ''}`;
      wordDiv.dataset.widx = wIdx;

      for (let lIdx = 0; lIdx < wordText.length; lIdx++) {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = wordText[lIdx];
        wordDiv.appendChild(span);
      }
      fragment.appendChild(wordDiv);
    });

    this.dom.wordsWrapper.appendChild(fragment);
  }

  // -------------------------------------------------------------
  // Keystrokes & Input Handling
  // -------------------------------------------------------------
  startTest() {
    this.status = 'running';
    this.startTime = performance.now();
    this.dom.liveWpmHud.classList.add('visible');

    this.timerInterval = setInterval(() => {
      this.onTick();
    }, 1000);
  }

  onTick() {
    this.timeElapsed++;
    
    // Live metrics
    const currentWpm = this.calculateCurrentWPM();
    const currentAcc = this.calculateCurrentAccuracy();
    const currentRaw = this.calculateCurrentRawWPM();

    this.dom.hudLiveWpm.textContent = currentWpm;
    this.dom.hudLiveAcc.textContent = `${currentAcc}%`;

    // Record timeline point
    this.statsTimeline.push({
      second: this.timeElapsed,
      wpm: currentWpm,
      rawWpm: currentRaw,
      errors: this.incorrectKeypresses
    });

    if (this.mode === 'time') {
      const remaining = this.timeLimit - this.timeElapsed;
      this.dom.hudTimer.textContent = remaining;
      if (remaining <= 0) {
        this.finishTest();
      }
    } else if (this.mode === 'zen') {
      const m = Math.floor(this.timeElapsed / 60);
      const s = this.timeElapsed % 60;
      this.dom.hudTimer.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    }
  }

  handleKeyDown(e) {
    if (this.status === 'finished') return;

    // Virtual keyboard key press highlight
    this.highlightVirtualKey(e.key, true);

    // Ctrl + Backspace to delete whole word
    if (e.key === 'Backspace' && (e.ctrlKey || e.altKey)) {
      e.preventDefault();
      this.handleWordDelete();
      soundManager.playKey();
      return;
    }

    // Space key
    if (e.key === ' ') {
      e.preventDefault();
      if (this.status === 'idle') {
        this.startTest();
      }
      soundManager.playKey(true);
      this.handleSpace();
      return;
    }

    // Normal Backspace
    if (e.key === 'Backspace') {
      soundManager.playKey();
      this.handleBackspace();
      return;
    }
  }

  handleKeyUp(e) {
    this.highlightVirtualKey(e.key, false);
  }

  highlightVirtualKey(key, isPressed) {
    if (!this.showKeyboard) return;
    try {
      let selector;
      if (key === ' ') selector = `[data-key=" "]`;
      else if (key === 'Backspace') selector = `[data-key="Backspace"]`;
      else if (key === 'Tab') selector = `[data-key="Tab"]`;
      else if (key === 'CapsLock') selector = `[data-key="CapsLock"]`;
      else if (key === 'Enter') selector = `[data-key="Enter"]`;
      else if (key === 'Shift') selector = `[data-key="Shift"]`;
      else if (key === 'Control') selector = `[data-key="Control"]`;
      else if (key === 'Alt') selector = `[data-key="Alt"]`;
      else if (key === '\\') selector = `[data-key="\\\\"]`;
      else if (key === '"') selector = `[data-key="\'"]`;
      else {
        const escaped = window.CSS && CSS.escape ? CSS.escape(key.toLowerCase()) : key.toLowerCase();
        selector = `[data-key="${escaped}"]`;
      }

      const el = this.dom.virtualKeyboard.querySelector(selector);
      if (el) {
        if (isPressed) el.classList.add('pressed');
        else el.classList.remove('pressed');
      }
    } catch {
      // Ignore non-standard keys gracefully
    }
  }

  handleInput(e) {
    if (this.status === 'finished') return;

    if (this.status === 'idle') {
      this.startTest();
    }

    const currentWord = this.wordsList[this.wordIndex];
    const typedVal = this.dom.typingInput.value;
    
    // Ignore leading space
    if (typedVal.startsWith(' ')) {
      this.dom.typingInput.value = typedVal.trim();
      return;
    }

    this.typedHistory[this.wordIndex] = typedVal;
    this.totalKeypresses++;

    const wordEl = this.dom.wordsWrapper.children[this.wordIndex];
    if (!wordEl) return;

    // Check last typed character sound
    const lastCharTyped = typedVal[typedVal.length - 1];
    const expectedChar = currentWord[typedVal.length - 1];

    if (lastCharTyped !== undefined) {
      if (lastCharTyped === expectedChar) {
        this.correctKeypresses++;
        soundManager.playKey();
      } else {
        this.incorrectKeypresses++;
        soundManager.playError();
      }
    }

    // Update letter classes in the current word
    this.updateWordLetterElements(wordEl, currentWord, typedVal);
    this.updateCaretPosition();

    // Check if test completed in word or quote mode
    if (this.mode === 'words' || this.mode === 'quote' || this.mode === 'code') {
      const isLastWord = this.wordIndex === this.wordsList.length - 1;
      if (isLastWord && typedVal.length >= currentWord.length) {
        this.finishTest();
      }
    }
  }

  updateWordLetterElements(wordEl, targetWord, typedVal) {
    // Clear out any previous extra letters
    const extraLetters = wordEl.querySelectorAll('.letter.extra');
    extraLetters.forEach(el => el.remove());

    const letterEls = wordEl.querySelectorAll('.letter:not(.extra)');

    for (let i = 0; i < targetWord.length; i++) {
      const letterSpan = letterEls[i];
      if (!letterSpan) continue;

      if (i < typedVal.length) {
        if (typedVal[i] === targetWord[i]) {
          letterSpan.className = 'letter correct';
        } else {
          letterSpan.className = 'letter incorrect';
        }
      } else {
        letterSpan.className = 'letter';
      }
    }

    // If typed beyond word length, append extra letters
    if (typedVal.length > targetWord.length) {
      for (let i = targetWord.length; i < typedVal.length; i++) {
        const extraSpan = document.createElement('span');
        extraSpan.className = 'letter extra';
        extraSpan.textContent = typedVal[i];
        wordEl.appendChild(extraSpan);
        this.extraKeypresses++;
      }
    }
  }

  handleSpace() {
    const currentWord = this.wordsList[this.wordIndex];
    const typedVal = this.dom.typingInput.value;

    // Don't allow empty space jump if nothing typed at all
    if (!typedVal && this.wordIndex > 0) return;

    const wordEl = this.dom.wordsWrapper.children[this.wordIndex];
    if (wordEl) {
      // Mark untyped letters as missed
      const letterEls = wordEl.querySelectorAll('.letter');
      letterEls.forEach((el, idx) => {
        if (!el.classList.contains('correct') && !el.classList.contains('incorrect') && !el.classList.contains('extra')) {
          el.classList.add('incorrect');
          this.missedKeypresses++;
        }
      });
      wordEl.classList.remove('active');
    }

    this.wordIndex++;
    this.dom.typingInput.value = '';

    // Check word mode progress counter
    if (this.mode === 'words') {
      this.dom.hudTimer.textContent = `${Math.min(this.wordIndex, this.wordLimit)}/${this.wordLimit}`;
      if (this.wordIndex >= this.wordLimit) {
        this.finishTest();
        return;
      }
    }

    // Quote or code mode finish
    if ((this.mode === 'quote' || this.mode === 'code') && this.wordIndex >= this.wordsList.length) {
      this.finishTest();
      return;
    }

    // If we're getting close to running out of words in time/zen mode, append more!
    if (this.wordsList.length - this.wordIndex < 20) {
      this.appendMoreWords();
    }

    // Activate next word
    const nextWordEl = this.dom.wordsWrapper.children[this.wordIndex];
    if (nextWordEl) {
      nextWordEl.classList.add('active');
    }

    this.checkScrollWordWindow();
    this.updateCaretPosition();
  }

  handleBackspace() {
    const typedVal = this.dom.typingInput.value;
    
    // If input is empty and we're not on word 0, go back to previous word if it has mistakes
    if (typedVal.length === 0 && this.wordIndex > 0) {
      const prevWord = this.wordsList[this.wordIndex - 1];
      const prevTyped = this.typedHistory[this.wordIndex - 1] || '';

      // Allow backspacing into previous word
      const currentWordEl = this.dom.wordsWrapper.children[this.wordIndex];
      if (currentWordEl) currentWordEl.classList.remove('active');

      this.wordIndex--;
      const prevWordEl = this.dom.wordsWrapper.children[this.wordIndex];
      if (prevWordEl) prevWordEl.classList.add('active');

      this.dom.typingInput.value = prevTyped;
      this.checkScrollWordWindow();
      this.updateCaretPosition();
    }
  }

  handleWordDelete() {
    this.dom.typingInput.value = '';
    const currentWord = this.wordsList[this.wordIndex];
    const wordEl = this.dom.wordsWrapper.children[this.wordIndex];
    if (wordEl) {
      this.updateWordLetterElements(wordEl, currentWord, '');
    }
    this.updateCaretPosition();
  }

  appendMoreWords() {
    const newWords = [];
    const pool = [...COMMON_WORDS];
    for (let i = 0; i < 40; i++) {
      let word = pool[Math.floor(Math.random() * pool.length)];
      if (this.hasNumbers && Math.random() < 0.15) {
        word = NUMBERS_POOL[Math.floor(Math.random() * NUMBERS_POOL.length)];
      }
      if (this.hasPunctuation && Math.random() < 0.2) {
        const p = PUNCTUATION_POOL[Math.floor(Math.random() * PUNCTUATION_POOL.length)];
        word = `${word}${p}`;
      }
      newWords.push(word);
      this.wordsList.push(word);

      const wordDiv = document.createElement('div');
      wordDiv.className = 'word';
      wordDiv.dataset.widx = this.wordsList.length - 1;
      for (let l = 0; l < word.length; l++) {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = word[l];
        wordDiv.appendChild(span);
      }
      this.dom.wordsWrapper.appendChild(wordDiv);
    }
  }

  // -------------------------------------------------------------
  // Caret & Smooth Scrolling Viewport
  // -------------------------------------------------------------
  updateCaretPosition() {
    const currentWordEl = this.dom.wordsWrapper.children[this.wordIndex];
    if (!currentWordEl) return;

    const typedVal = this.dom.typingInput.value;
    const letterEls = currentWordEl.querySelectorAll('.letter');
    const containerRect = this.dom.wordsContainer.getBoundingClientRect();

    let targetRect;
    if (typedVal.length === 0) {
      // At the start of current word
      const firstLetter = letterEls[0];
      if (firstLetter) {
        targetRect = firstLetter.getBoundingClientRect();
      } else {
        targetRect = currentWordEl.getBoundingClientRect();
      }
      const left = targetRect.left - containerRect.left;
      const top = targetRect.top - containerRect.top;
      this.setCaretCoords(left, top);
    } else if (typedVal.length <= letterEls.length) {
      // Placed after the last typed letter
      const lastTypedLetter = letterEls[typedVal.length - 1];
      if (lastTypedLetter) {
        targetRect = lastTypedLetter.getBoundingClientRect();
        const left = targetRect.right - containerRect.left;
        const top = targetRect.top - containerRect.top;
        this.setCaretCoords(left, top);
      }
    } else {
      // Extra characters
      const lastLetter = letterEls[letterEls.length - 1];
      if (lastLetter) {
        targetRect = lastLetter.getBoundingClientRect();
        const left = targetRect.right - containerRect.left;
        const top = targetRect.top - containerRect.top;
        this.setCaretCoords(left, top);
      }
    }

    // Trigger typing animation removal (steady caret while typing)
    this.dom.caret.classList.add('typing');
    clearTimeout(this.caretTypingTimeout);
    this.caretTypingTimeout = setTimeout(() => {
      this.dom.caret.classList.remove('typing');
    }, 450);
  }

  setCaretCoords(left, top) {
    this.dom.caret.style.transform = `translate3d(${left}px, ${top + 6}px, 0)`;
  }

  checkScrollWordWindow() {
    const currentWordEl = this.dom.wordsWrapper.children[this.wordIndex];
    if (!currentWordEl) return;

    const firstWordEl = this.dom.wordsWrapper.children[0];
    if (!firstWordEl) return;

    // Line height difference relative to container
    const wordTop = currentWordEl.offsetTop;
    const firstTop = firstWordEl.offsetTop;
    const diff = wordTop - firstTop;

    // If diff is greater than one line (~44px), scroll up by that diff
    if (diff > 40) {
      const shiftY = diff - 44;
      this.dom.wordsWrapper.style.transform = `translateY(-${shiftY}px)`;
    } else {
      this.dom.wordsWrapper.style.transform = 'translateY(0px)';
    }
  }

  // -------------------------------------------------------------
  // Live Metrics Calculations
  // -------------------------------------------------------------
  calculateCurrentWPM() {
    const elapsedMinutes = Math.max(0.01, this.timeElapsed / 60);
    const correctChars = this.dom.wordsWrapper.querySelectorAll('.letter.correct').length;
    // Standard typing speed test formula: 5 characters = 1 word
    const netWpm = Math.round((correctChars / 5) / elapsedMinutes);
    return Math.max(0, netWpm);
  }

  calculateCurrentRawWPM() {
    const elapsedMinutes = Math.max(0.01, this.timeElapsed / 60);
    const totalTypedChars = this.totalKeypresses;
    return Math.max(0, Math.round((totalTypedChars / 5) / elapsedMinutes));
  }

  calculateCurrentAccuracy() {
    if (this.totalKeypresses === 0) return 100;
    const acc = Math.round((this.correctKeypresses / this.totalKeypresses) * 100);
    return Math.max(0, Math.min(100, acc));
  }

  // -------------------------------------------------------------
  // Test Completion & Results
  // -------------------------------------------------------------
  finishTest() {
    if (this.status === 'finished') return;
    this.status = 'finished';
    clearInterval(this.timerInterval);
    this.endTime = performance.now();

    soundManager.playCompletion();

    const actualDurationSec = Math.max(1, Math.round((this.endTime - this.startTime) / 1000));
    const elapsedMinutes = actualDurationSec / 60;

    // Count final characters
    const correctCount = this.dom.wordsWrapper.querySelectorAll('.letter.correct').length;
    const incorrectCount = this.dom.wordsWrapper.querySelectorAll('.letter.incorrect').length;
    const extraCount = this.dom.wordsWrapper.querySelectorAll('.letter.extra').length;

    // Total characters expected in words attempted
    let expectedChars = 0;
    for (let i = 0; i <= Math.min(this.wordIndex, this.wordsList.length - 1); i++) {
      expectedChars += this.wordsList[i].length;
    }
    const missedCount = Math.max(0, expectedChars - (correctCount + incorrectCount));

    // Net WPM
    const finalWpm = Math.max(0, Math.round((correctCount / 5) / elapsedMinutes));
    // Raw WPM
    const finalRaw = Math.max(0, Math.round((this.totalKeypresses / 5) / elapsedMinutes));
    // Accuracy
    const finalAcc = this.totalKeypresses > 0 
      ? Math.max(0, Math.min(100, Math.round((this.correctKeypresses / this.totalKeypresses) * 100))) 
      : 100;

    // Consistency calculation (standard deviation of second-by-second WPM)
    const consistency = this.calculateConsistency();

    // Personal best check
    const isNewPb = this.checkAndSaveRecord({
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: `${this.mode} ${this.mode === 'time' ? this.timeLimit : (this.mode === 'words' ? this.wordLimit : '')}`.trim(),
      wpm: finalWpm,
      raw: finalRaw,
      accuracy: finalAcc,
      consistency: consistency,
      time: `${actualDurationSec}s`
    });

    // Populate Results Screen
    this.dom.resWpm.textContent = finalWpm;
    this.dom.resAcc.textContent = `${finalAcc}%`;
    this.dom.resRawWpm.textContent = finalRaw;
    this.dom.resCharsCorrect.textContent = correctCount;
    this.dom.resCharsIncorrect.textContent = incorrectCount;
    this.dom.resCharsExtra.textContent = extraCount;
    this.dom.resCharsMissed.textContent = missedCount;
    this.dom.resConsistency.textContent = `${consistency}%`;
    this.dom.resTime.textContent = `${actualDurationSec}s`;

    this.dom.resultModeBadge.textContent = `${this.mode} ${this.mode === 'time' ? this.timeLimit : (this.mode === 'words' ? this.wordLimit : '')}`;
    this.dom.newPbBadge.classList.toggle('hidden', !isNewPb);

    // Switch view
    this.dom.mainContent.style.display = 'none';
    this.dom.resultsView.classList.remove('hidden');

    // Render interactive Canvas chart
    this.renderChart();
  }

  calculateConsistency() {
    if (this.statsTimeline.length < 2) return 100;
    const wpms = this.statsTimeline.map(s => s.wpm);
    const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
    if (mean === 0) return 100;

    const variance = wpms.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wpms.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / mean) * 100;
    
    // Higher score = better consistency
    const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - coefficientOfVariation)));
    return consistencyScore;
  }

  // -------------------------------------------------------------
  // Spline Canvas Chart Rendering
  // -------------------------------------------------------------
  renderChart() {
    const canvas = this.dom.wpmChart;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const data = this.statsTimeline;
    if (!data.length) return;

    const padding = { top: 25, right: 30, bottom: 35, left: 45 };
    const chartW = rect.width - padding.left - padding.right;
    const chartH = 200 - padding.top - padding.bottom;

    const maxWpm = Math.max(40, ...data.map(d => Math.max(d.wpm, d.rawWpm))) * 1.15;
    const maxSec = Math.max(1, data[data.length - 1].second);

    const getX = (sec) => padding.left + ((sec - 1) / Math.max(1, maxSec - 1)) * chartW;
    const getY = (val) => padding.top + chartH - (val / maxWpm) * chartH;

    // Grid lines & Y-axis labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-sub').trim() || '#8b949e';
    ctx.font = '11px JetBrains Mono';
    ctx.textAlign = 'right';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round((maxWpm / ySteps) * i);
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
      ctx.fillText(val, padding.left - 8, y + 4);
    }

    // X-axis seconds labels
    ctx.textAlign = 'center';
    const xInterval = Math.max(1, Math.floor(maxSec / 6));
    for (let s = 1; s <= maxSec; s += xInterval) {
      const x = getX(s);
      ctx.fillText(`${s}s`, x, 200 - 10);
    }

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e2b714';

    // 1. Draw Raw WPM (Dotted muted grey curve)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    data.forEach((pt, idx) => {
      const x = getX(pt.second);
      const y = getY(pt.rawWpm);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 2. Draw Net WPM (Gradient fill under curve)
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, `${accentColor}40`);
    gradient.addColorStop(1, `${accentColor}00`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(getX(data[0].second), getY(0));
    data.forEach((pt) => {
      ctx.lineTo(getX(pt.second), getY(pt.wpm));
    });
    ctx.lineTo(getX(data[data.length - 1].second), getY(0));
    ctx.closePath();
    ctx.fill();

    // Net WPM Solid Curve
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((pt, idx) => {
      const x = getX(pt.second);
      const y = getY(pt.wpm);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Data points & Error dots
    this.chartPoints = [];
    let prevErrors = 0;

    data.forEach((pt) => {
      const x = getX(pt.second);
      const y = getY(pt.wpm);
      const hasError = pt.errors > prevErrors;
      prevErrors = pt.errors;

      this.chartPoints.push({ x, y, second: pt.second, wpm: pt.wpm, rawWpm: pt.rawWpm, errors: pt.errors });

      // If errors happened in this second, draw red marker
      if (hasError) {
        ctx.fillStyle = '#f85149';
        ctx.beginPath();
        ctx.arc(x, getY(0) - 10, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw normal accent dot on curve
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  handleChartHover(e) {
    if (!this.chartPoints || !this.chartPoints.length) return;
    const rect = this.dom.wpmChart.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find nearest point
    let nearest = this.chartPoints[0];
    let minDiff = Math.abs(mouseX - nearest.x);

    for (let i = 1; i < this.chartPoints.length; i++) {
      const diff = Math.abs(mouseX - this.chartPoints[i].x);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = this.chartPoints[i];
      }
    }

    if (minDiff < 30) {
      const tooltip = this.dom.chartTooltip;
      tooltip.classList.remove('hidden');
      tooltip.style.left = `${nearest.x}px`;
      tooltip.style.top = `${nearest.y}px`;
      tooltip.innerHTML = `<strong>${nearest.second}s</strong>: ${nearest.wpm} WPM (Raw: ${nearest.rawWpm})`;
    } else {
      this.dom.chartTooltip.classList.add('hidden');
    }
  }

  // -------------------------------------------------------------
  // Records & History LocalStorage
  // -------------------------------------------------------------
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem('velocity_history') || '[]');
    } catch {
      return [];
    }
  }

  checkAndSaveRecord(record) {
    const history = this.getHistory();
    const isBest = history.every(h => h.wpm < record.wpm);

    history.unshift(record);
    if (history.length > 50) history.pop(); // Keep last 50 tests
    localStorage.setItem('velocity_history', JSON.stringify(history));

    return isBest && record.wpm > 0;
  }

  openHistoryModal() {
    const history = this.getHistory();
    this.dom.ovCompletedTests.textContent = history.length;
    
    if (history.length > 0) {
      const best = Math.max(...history.map(h => h.wpm));
      const avgWpm = Math.round(history.reduce((a, b) => a + b.wpm, 0) / history.length);
      const avgAcc = Math.round(history.reduce((a, b) => a + b.accuracy, 0) / history.length);

      this.dom.ovBestWpm.textContent = best;
      this.dom.ovAvgWpm.textContent = avgWpm;
      this.dom.ovAvgAcc.textContent = `${avgAcc}%`;
    } else {
      this.dom.ovBestWpm.textContent = '0';
      this.dom.ovAvgWpm.textContent = '0';
      this.dom.ovAvgAcc.textContent = '0%';
    }

    // Populate rows
    this.dom.historyTableBody.innerHTML = '';
    if (history.length === 0) {
      this.dom.historyTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 2rem;">No test history yet. Complete a test!</td></tr>';
    } else {
      history.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.date}</td>
          <td><span class="result-badge" style="font-size: 0.7rem;">${item.mode}</span></td>
          <td style="color: var(--accent); font-weight: 700;">${item.wpm}</td>
          <td>${item.raw}</td>
          <td>${item.accuracy}%</td>
          <td>${item.consistency || '—'}%</td>
        `;
        this.dom.historyTableBody.appendChild(tr);
      });
    }

    this.dom.historyModal.classList.remove('hidden');
  }

  closeHistoryModal() {
    this.dom.historyModal.classList.add('hidden');
    this.focusInput();
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear all your test history?')) {
      localStorage.removeItem('velocity_history');
      this.openHistoryModal();
    }
  }

  copyResultsToClipboard() {
    const wpm = this.dom.resWpm.textContent;
    const acc = this.dom.resAcc.textContent;
    const mode = this.dom.resultModeBadge.textContent;
    const raw = this.dom.resRawWpm.textContent;
    const consistency = this.dom.resConsistency.textContent;

    const text = `🚀 VelocityType Performance Score\nMode: ${mode}\nWPM: ${wpm} | Accuracy: ${acc}\nRaw: ${raw} | Consistency: ${consistency}`;
    navigator.clipboard.writeText(text).then(() => {
      this.dom.copyBtnText.textContent = 'Copied!';
      setTimeout(() => {
        this.dom.copyBtnText.textContent = 'Copy Result';
      }, 2000);
    });
  }
}

// Start App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new VelocityTypeApp();
});
