# ⚡ VelocityType

<div align="center">

![VelocityType Banner](https://img.shields.io/badge/VELOCITY-TYPE-e2b714?style=for-the-badge&logo=speedtest&logoColor=black)
<br/>
**A modern, minimalist, highly responsive typing speed test and keyboard training suite.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Modern%20Semantic-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Custom%20Properties-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Procedural%20Sound-purple?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/)

[Features](#-key-features) • [Themes](#-curated-themes) • [Audio Engine](#-procedural-mechanical-keyboard-audio) • [Quick Start](#-quick-start) • [Architecture](#-project-structure) • [Formulas](#-metrics--calculations)

</div>

---

## 🚀 Overview

**VelocityType** is an aesthetic, lightning-fast typing speed tester built from the ground up using **Vanilla HTML5, CSS3, and modern JavaScript**. Inspired by popular tools like Monkeytype, it combines minimalist aesthetics with deep customization: real-time spline graphs, procedural mechanical switch sounds, multiple testing modes (words, quotes, code snippets), interactive virtual keyboards, and personal record tracking.

---

## ✨ Key Features

### 🎯 5 Versatile Testing Modes
- **⏱️ Time Mode**: 15s, 30s, 60s, or 120s countdown.
- **📝 Words Mode**: Fixed word tests (10, 25, 50, 100 words).
- **💬 Quote Mode**: Type famous inspirational, philosophy, and tech quotes with author attribution.
- **💻 Code Mode**: Modern JavaScript syntax and snippets to train punctuation and coding muscle memory.
- **🧘 Zen Mode**: Endless typing with a continuous stopwatch for distraction-free flow.
- **Punctuation & Numbers Toggles**: Dynamically inject symbols and numbers into the text stream.

### 🎧 Procedural Mechanical Keyboard Audio
Experience realistic acoustic feedback on every keystroke generated natively via the **Web Audio API** (zero external sound files, 100% offline, zero latency):
- **🎧 Thock**: Deep, resonant bottom-out sound mimicking lubed Cherry MX Black / Holy Panda tactile switches.
- **🧈 Creamy**: Smooth, soft-frequency linear switch profile.
- **⚡ Clicky**: Crisp, high-frequency mechanical click inspired by Blue switches.
- **Spacebar Resonance**: Specially tuned acoustics for spacebar strikes.
- **Mistake & Finish Alerts**: Subtle error click on mistypes and a harmonic chord chime upon test completion.

### 📈 Real-Time Analytics & Spline Chart
- **Live HUD**: Instantaneous WPM, accuracy %, and countdown timer.
- **Interactive Results Canvas**: High-DPI canvas graph displaying your Net WPM (solid curve + glow fill), Raw WPM (dashed line), and error dots.
- **Chart Hover Tooltip**: Move your mouse across the timeline to view your exact speed at each second.
- **In-Depth Metrics**: Net WPM, Accuracy, Raw WPM, Consistency (rhythm stability score), and detailed character count (Correct / Incorrect / Extra / Missed).

### ⌨️ Interactive Virtual Keyboard
- On-screen layout with real-time keypress lighting and active animations.
- Toggle visibility on or off with a single click.

### 🏆 Personal Bests & Local History
- Automatically tracks your top speeds and displays a celebratory badge when you set a new record.
- Built-in stats modal shows total tests taken, best WPM, average WPM, and detailed test logs saved in `localStorage`.

---

## 🎨 Curated Themes

Switch themes instantly from the top-right menu:

| Theme | Description |
| :--- | :--- |
| **✨ Obsidian Gold** *(Default)* | Deep obsidian charcoal `#0e1117` with warm cyber amber/gold accents. |
| **🌆 Cyberpunk Neon** | Midnight dark with electric cyan `#00f2fe` and neon magenta. |
| **❄️ Nordic Frost** | Arctic blue-grey `#242933` with cool ice teal accents. |
| **🧛 Dracula Violet** | Vampire dark purple `#1e1f29` with soft pastel lilac and pink. |
| **🌿 Matrix Emerald** | Terminal dark with vivid emerald and mint highlights. |
| **📜 Paper Light** | Warm sepia newsprint background with crisp typography. |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Tab</kbd> + <kbd>Enter</kbd> or <kbd>Esc</kbd> | Quick restart / generate a new test |
| <kbd>Ctrl</kbd> + <kbd>Backspace</kbd> | Delete current word |
| <kbd>Enter</kbd> (on Results screen) | Start next test immediately |
| Any key | Auto-focus typing input |

---

## 📐 Metrics & Calculations

VelocityType follows standardized typing metrics:

- **Net WPM (Words Per Minute)**:
  $$\text{Net WPM} = \max\left(0, \frac{\text{Correct Characters} / 5}{\text{Time in Minutes}}\right)$$
- **Raw WPM**:
  $$\text{Raw WPM} = \frac{\text{Total Keypresses} / 5}{\text{Time in Minutes}}$$
- **Accuracy (%)**:
  $$\text{Accuracy} = \left(\frac{\text{Correct Keypresses}}{\text{Total Keypresses}}\right) \times 100$$
- **Consistency (%)**:
  Calculated using the coefficient of variation ($CV = \frac{\sigma}{\mu}$) of second-by-second WPM:
  $$\text{Consistency} = \max\left(0, \min(100, 100 - CV)\right)$$

---

## 📂 Project Structure

```text
typing/
├── index.html        # Semantic HTML5 layout, HUD, modals & virtual keyboard
├── style.css         # Design system, 6 themes, responsive layout & animations
├── app.js            # State machine, input listeners, Canvas spline chart & metrics
├── sound.js          # Web Audio API procedural mechanical switch synthesizer
├── words.js          # Dictionaries: common words, punctuation, quotes & code snippets
├── .gitignore        # Standard ignore patterns
└── README.md         # Documentation & guide
```

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-username/velocity-type.git
cd velocity-type
```

### 2. Run Locally
Because VelocityType uses modern native ES Modules (`import/export`), serve it with any local static HTTP server:

**Using Python (pre-installed on most systems):**
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Or using Node.js (`npx`):**
```bash
npx serve
```

**Or using VS Code Live Server:**
Right click `index.html` and click **"Open with Live Server"**.

---

## 🤝 Contributing

Contributions, feature requests, and suggestions are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
