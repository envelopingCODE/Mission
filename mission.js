"use strict"; // Strict mode helps catch common coding errors and "unsafe" actions

const inputEl = document.getElementById("addMission"); // Get the input element for mission names
const missionButtonEl = document.getElementById("addMissionButton"); // Get the button to add missions
const missionListEl = document.getElementById("missionList"); // Get the list where missions will be displayed
const resetButtonEl = document.getElementById("resetButton"); // Get the reset button element
const errorMessageEl = document.getElementById("errorMessage"); // Get the element for displaying error messages
const xpMeterEl = document.getElementById("xp-meter"); // Get the element for the XP meter
const streakBonusEl = document.getElementById("streak-bonus"); // Get the element for displaying streak bonus
const completionSound = document.getElementById("completionSound"); // Get the sound element for mission completion
const levelUpSound = document.getElementById("levelUpSound"); // Get the sound element for level up
const addMissionSound = document.getElementById("addMissionSound"); // Get the sound element for adding missions
const initializingSound = document.getElementById("initializingSound"); // Get the sound element for initializing
const swipeSound = document.getElementById("swipeSound"); // Get the sound element for initializing
const addNeuralSound = document.getElementById("addNeuralSound"); // Get the sound element for initializing
const dailyWrapModal = document.getElementById("dailyWrapModal"); // NEW

const mediaQuery = window.matchMedia("(max-width: 600px)");

let xpSelectorCallback = null;

("use strict"); // Strict mode helps catch common coding errors and "unsafe" actions

// ========================================
// CENTRALIZED CATEGORY SYSTEM - Single Source of Truth
// ========================================
const CATEGORY_CONFIG = {
  1: {
    prefix: "1.",
    title: "Secure Funding",
    shortName: "Financial",
    description: "Financial and resource acquisition tasks",
    color: "rgba(26, 228, 46, 0.835)",
    emoji: "💰",
    weight: 700,
    defaultTasks: [
      "1. Do SoME marketing",
      "1. Obtain new Client",
      "1. Prevent loss of assets",
    ],
  },
  2: {
    prefix: "2.",
    title: "Graduate",
    shortName: "Academic",
    description: "Academic and educational goals",
    color: "rgba(20, 255, 208, 0.835)",
    emoji: "🎓",
    weight: 600,
    defaultTasks: [
      "2. Study for one unit",
      "2. Code for one unit",
      "2. Complete paper",
    ],
  },
  3: {
    prefix: "3.",
    title: "Optimal State",
    shortName: "Life Optimization",
    description: "Personal wellness and optimization",
    color: "rgba(26, 211, 228, 0.892)",
    emoji: "⚡",
    weight: 600,
    defaultTasks: ["3. Morning meditation", "3. TRX", "3. Journal"],
  },
  general: {
    prefix: null,
    title: "General Tasks",
    shortName: "General",
    description: "Various tasks and goals",
    color: "rgba(255, 255, 255, 0.6)",
    emoji: "✨",
    weight: 400,
    defaultTasks: [],
  },
};

// Helper function to get category by prefix
function getCategoryByPrefix(prefix) {
  if (!prefix) return CATEGORY_CONFIG["general"];
  const categoryKey = prefix.replace(".", "");
  return CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG["general"];
}

// Helper function to get category key from task title
function getCategoryKeyFromTitle(title) {
  if (title.startsWith("1.")) return "1";
  if (title.startsWith("2.")) return "2";
  if (title.startsWith("3.")) return "3";
  return "general";
}

// Derives category key from a CSS class like "prefix-1" → "1"
function getCategoryKeyFromPrefixClass(prefixClass) {
  const match = (prefixClass || "").match(/prefix-(\d)/);
  return match ? match[1] : "general";
}

// ========================================
// END OF CATEGORY SYSTEM
// ========================================

// ========================================
// POMODORO ESTIMATOR — per-category time learning
// ========================================
const PomodoroEstimator = {
  STORAGE_KEY: "pomodoroHistory",
  WINDOW_SIZE: 5,
  MIN_SAMPLES: 3,

  _load() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  },

  _save(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  // Returns estimated Pomodoros for a category (default 1 until MIN_SAMPLES reached)
  getEstimate(category) {
    const samples = (this._load()[category]) || [];
    if (samples.length < this.MIN_SAMPLES) return 1;
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    return Math.round(avg * 2) / 2; // round to nearest ½
  },

  recordActual(category, actual) {
    const history = this._load();
    if (!history[category]) history[category] = [];
    history[category].push(actual);
    if (history[category].length > this.WINDOW_SIZE) {
      history[category] = history[category].slice(-this.WINDOW_SIZE);
    }
    this._save(history);
  },
};

// ========================================
// STREAK SYSTEM
// ========================================

// Parse date string at noon UTC — stable day-of-week regardless of timezone
function _streakDow(dateStr) {
  return new Date(dateStr + "T12:00:00Z").getUTCDay(); // 0=Sun, 6=Sat
}

// Module-level so repair mechanic and streak can share the same logic
function isDayEarned(dateStr) {
  // A repaired day counts as earned
  if (localStorage.getItem("streakRepairComplete_" + dateStr)) return true;
  const val = localStorage.getItem("readyTime_" + dateStr);
  if (!val) return false;
  const dow = _streakDow(dateStr);
  if (dow === 0 || dow === 6) return true; // weekends: any time
  return new Date(parseInt(val)).getHours() < 10; // weekdays: before 10
}

function getStreakData() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentHour = now.getHours();

  function getDayState(dateStr) {
    if (dateStr > todayStr) return "future";
    if (isDayEarned(dateStr)) return "earned";
    if (dateStr < todayStr) {
      // Show repaired dot differently from a plain miss
      return localStorage.getItem("streakRepairComplete_" + dateStr)
        ? "earned"
        : "missed";
    }
    // Today not yet earned
    const dow = _streakDow(dateStr);
    const isWeekend = dow === 0 || dow === 6;
    return isWeekend || currentHour < 10 ? "pending" : "missed";
  }

  // Streak: consecutive earned days backwards from today (or yesterday)
  let streak = 0;
  const startOffset = isDayEarned(todayStr) ? 0 : 1;
  for (let i = startOffset; i < 366; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (isDayEarned(dateStr)) { streak++; }
    else break;
  }

  // Current week Mon → Sun
  const dowToday = now.getUTCDay();
  const daysToMonday = dowToday === 0 ? 6 : dowToday - 1;
  const weekData = ["M", "T", "W", "T", "F", "S", "S"].map((label, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysToMonday + i);
    const dateStr = d.toISOString().split("T")[0];
    return { label, state: getDayState(dateStr) };
  });

  return { weekData, streak };
}

// Repair is available when exactly yesterday was missed but the day before was earned
function getRepairState() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  const yesterdayStr = yest.toISOString().split("T")[0];

  const prev = new Date(now); prev.setDate(now.getDate() - 2);
  const prevStr = prev.toISOString().split("T")[0];

  const alreadyRepaired = !!localStorage.getItem("streakRepairComplete_" + yesterdayStr);
  if (alreadyRepaired) return { available: false };

  const yesterdayMissed = !isDayEarned(yesterdayStr);
  const prevEarned = isDayEarned(prevStr);

  if (!yesterdayMissed || !prevEarned) return { available: false };

  const progress = parseInt(localStorage.getItem("streakRepairProgress_" + todayStr) || "0");
  return { available: true, progress, missedDate: yesterdayStr };
}

function renderStreakBar() {
  const container = document.getElementById("streak-bar");
  if (!container) return;

  const { weekData, streak } = getStreakData();
  const repair = getRepairState();

  const dotsHTML = weekData.map(({ label, state }) =>
    `<div class="streak-day">
      <div class="streak-dot streak-dot-${state}"></div>
      <span class="streak-label">${label}</span>
    </div>`
  ).join("");

  const repairHTML = repair.available
    ? `<div class="streak-repair">
        <span class="repair-label">Repair available</span>
        <span class="repair-pip ${repair.progress >= 1 ? "repair-pip-done" : ""}"></span>
        <span class="repair-pip ${repair.progress >= 2 ? "repair-pip-done" : ""}"></span>
      </div>`
    : "";

  const streakNumClass = streak === 0 ? "streak-num streak-zero" : "streak-num";

  container.innerHTML =
    `<div class="streak-wrap">
      <div class="streak-dots">${dotsHTML}</div>
      <div class="streak-divider"></div>
      <div class="streak-count">
        <span class="${streakNumClass}">${streak}</span>
        <span class="streak-unit">day${streak !== 1 ? "s" : ""}</span>
      </div>
    </div>
    ${repairHTML}`;
}

// ========================================
// END STREAK SYSTEM
// ========================================

// ========================================
// APP SETTINGS
// ========================================
const AppSettings = (function () {
  var KEY = "appSettings";
  var DEFAULTS = {
    pomodoroVisible:      true,
    soundEnabled:         true,
    buddyMessages:        true,
    neuralCaptureVisible: true,
    ollamaEnabled:        false,
    ollamaModel:          "llama3.2:3b",
    ollamaUrl:            "http://localhost:11434",
  };
  function get() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || "{}")); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function set(key, value) {
    var s = get(); s[key] = value;
    localStorage.setItem(KEY, JSON.stringify(s));
    applyOne(key, value);
    if (typeof window._onSettingsChange === "function") window._onSettingsChange();
  }
  function applyOne(key, value) {
    if (key === "pomodoroVisible") {
      var el = document.getElementById("pomodoro-mount");
      if (el) el.style.visibility = value ? "" : "hidden";
    }
    if (key === "neuralCaptureVisible") {
      var el2 = document.getElementById("distraction-capture-container");
      if (el2) el2.style.display = value ? "" : "none";
    }
    if (key === "soundEnabled") {
      document.querySelectorAll("audio").forEach(function (a) { a.muted = !value; });
    }
  }
  function applyAll() {
    var s = get();
    Object.keys(s).forEach(function (k) { applyOne(k, s[k]); });
  }
  return { get: get, set: set, applyAll: applyAll };
})();

// ========================================
// OLLAMA CLIENT
// ========================================
const OllamaClient = (function () {
  var _available = null;
  var SYSTEM = "You are a dry, laconic tactical AI on a personal mission board. Cyberpunk-military voice. Short punchy sentences. No emoji. No markdown. Max 2 sentences. Respond only with the message.";
  function cfg() {
    var s = AppSettings.get();
    return {
      url:     (s.ollamaUrl  || "http://localhost:11434").replace(/\/$/, ""),
      model:   s.ollamaModel || "llama3.2:3b",
      enabled: !!s.ollamaEnabled,
    };
  }
  async function checkAvailable() {
    var c = cfg();
    if (!c.enabled) { _available = false; return false; }
    try {
      var res = await fetch(c.url + "/api/tags", { signal: AbortSignal.timeout(2000) });
      _available = res.ok;
    } catch (e) { _available = false; }
    return _available;
  }
  async function generate(prompt, ms) {
    ms = ms || 5000;
    var c = cfg();
    if (!c.enabled || !_available) return null;
    // Show processing state on the buddy while Ollama is thinking
    if (typeof window.setRobotProcessing === "function") window.setRobotProcessing(true);
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, ms);
    try {
      var res = await fetch(c.url + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: c.model,
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user",   content: prompt },
          ],
          stream: false,
          options: { temperature: 0.72, num_predict: 80 },
        }),
      });
      var d = await res.json();
      return (d.message && d.message.content && d.message.content.trim()) || null;
    } catch (e) { return null; }
    finally {
      clearTimeout(t);
      if (typeof window.setRobotProcessing === "function") window.setRobotProcessing(false);
    }
  }
  async function generateBriefing(tasks, streak) {
    var list = tasks.slice(0, 6).map(function (t) { return t.title || t; }).join(", ") || "none yet";
    return generate(
      "Ready signal at " + new Date().getHours() + ":00. Streak: " + streak + " days. Objectives: " + list + ". One-sentence tactical briefing.",
      7000
    );
  }
  async function generateCompletion(taskTitle, category, sessionNum, streak) {
    return generate(
      "Task completed: \"" + taskTitle + "\" (" + category + "). Session #" + sessionNum + ". Streak: " + streak + " days. One-sentence acknowledgement.",
      5000
    );
  }
  return {
    checkAvailable: checkAvailable,
    generate: generate,
    generateBriefing: generateBriefing,
    generateCompletion: generateCompletion,
    get available() { return _available; },
  };
})();

// Expose on window — top-level const is NOT auto-added to window in browser scripts
window.AppSettings  = AppSettings;
window.OllamaClient = OllamaClient;

// Returns YYYY-MM-DD of Monday of the current week — weekly record key
function getWeekKey() {
  const now = new Date();
  const dow = now.getDay();
  const daysToMonday = dow === 0 ? 6 : dow - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  return monday.toISOString().split("T")[0];
}

// ========================================
// SESSION PROGRESS (Flow: immediate feedback + clear goals)
// ========================================
let sessionCompletedCount = 0;
let sessionXpEarned = 0;
let sessionCeremonyShown = false;

function updateSessionProgress() {
  const el = document.getElementById("session-progress");
  if (!el) return;
  const remaining = document.querySelectorAll(".mission").length;
  if (remaining === 0 && sessionCompletedCount > 0) {
    el.textContent = "All clear";
    el.className = "session-progress-done";
    if (!sessionCeremonyShown) {
      sessionCeremonyShown = true;
      showSessionCeremony(sessionCompletedCount, sessionXpEarned);
    }
  } else {
    if (remaining > 0) sessionCeremonyShown = false; // reset if tasks are added again
    el.textContent = sessionCompletedCount > 0 || remaining > 0
      ? `${sessionCompletedCount} done · ${remaining} left`
      : "";
    el.className = "";
  }
}

function showSessionCeremony(taskCount, xpEarned) {
  const { tier: depthTier, daysActive } = getPartnerDepth();
  const buddyLine = depthTier >= 2
    ? "Done. See you tomorrow."
    : depthTier >= 1
      ? `Day ${daysActive}. Board cleared.`
      : "Board cleared. A strong session.";

  const overlay = document.createElement("div");
  overlay.className = "session-ceremony";
  overlay.innerHTML = `
    <div class="ceremony-content">
      <div class="ceremony-count">${taskCount}</div>
      <div class="ceremony-count-label">objective${taskCount !== 1 ? "s" : ""} cleared</div>
      <div class="ceremony-xp">+${xpEarned} XP</div>
      <div class="ceremony-buddy">${buddyLine}</div>
      <div class="ceremony-hint">tap to continue</div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("ceremony-visible"));

  function dismiss() {
    overlay.classList.remove("ceremony-visible");
    setTimeout(() => overlay.remove(), 500);
  }
  overlay.addEventListener("click", dismiss);
  setTimeout(dismiss, 6000);
}

// Create a single shared AudioContext for all audio operations
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Initialize on first user interaction
document.addEventListener(
  "click",
  function initAudio() {
    // Resume AudioContext if it was suspended
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    // Remove the listener once initialized
    document.removeEventListener("click", initAudio);
  },
  { once: true }
);

// Add this to your mission.js file
window.addEventListener("error", function (e) {
  console.error("Script error:", e);
});

function debounce(func, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, arguments), delay);
  };
}

// let currentStreak = 0; // Variable to track the current streak of completed missions

missionButtonEl.disabled = true; // Initially disable the mission button until input is valid

function minimumInput() {
  const input = inputEl.value; // Get the current value from the input field
  const sanitizedInput = sanitizeInput(input); // Sanitize the input to remove any HTML tags

  if (sanitizedInput.length > 3) {
    // Check if the sanitized input length is more than 3 characters
    errorMessageEl.textContent = " "; // Clear any error message
    missionButtonEl.disabled = false; // Enable the mission button
  } else {
    errorMessageEl.textContent =
      "Your mission name has to be 3 characters long . . "; // Show error message
    missionButtonEl.disabled = true; // Disable the mission button
  }
}

// Event listeners

missionButtonEl.addEventListener("mousedown", function () {
  const input = inputEl.value; // Get the value from the input field
  const sanitizedInput = sanitizeInput(input); // Sanitize the input
  addMission(sanitizedInput); // Add the mission with the sanitized input
});

inputEl.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    // Check if the Enter key is pressed
    const input = inputEl.value; // Get the value from the input field
    const sanitizedInput = sanitizeInput(input); // Sanitize the input
    addMission(sanitizedInput); // Add the mission with the sanitized input
  }
});

xpMeterEl.addEventListener("click", clearXP);

missionButtonEl.addEventListener("mouseup", clearTextField); // Clear the text field when the button is released
resetButtonEl.addEventListener("click", clearData); // Clear all data when the reset button is clicked
inputEl.addEventListener("keyup", debounce(minimumInput, 200)); // Check the input length after every key press. Now with debounce
// Task Completion Notification System
function sanitizeInput(input) {
  return input.trim().replace(/<[^>]*>?/gm, ""); // Trim and sanitize input
}

// Motivational messages array (kept for backwards compatibility)
window.motivationalMessages = [
  "Great Job! 🎉",
  "Way to go! 👍",
  "You deserve a small break soon! ☕",
  "Excellent! 🌟",
  "You'll be done in no time! ⏳",
  "Success! 🏆",
  "You're unstoppable! 🚀",
  "Yay! 🎊",
  "Keep up the great work! 💪",
  "You're doing amazing! 🌈",
  "Almost there, keep pushing! 💪",
  "Fantastic effort! 👏",
  "You're on the right track! 🛤️",
  "Stay focused, you're doing great! 🧠",
  "Believe in yourself! 🌠",
  "You're capable of amazing things! 🏅",
  "Keep the momentum going! 🔄",
  "You're making a difference! 🌍",
  "One step at a time! 👣",
  "Stay positive and keep going! 😊",
  "You got this! ✊",
];

// Tracks completions since page load — tiers message intensity as the session progresses
let sessionTaskCount = 0;

// Category-aware, session-tiered messages in the app's cyber/military voice
const NARRATIVE_MESSAGES = {
  financial: [
    [
      "Asset acquisition confirmed. Operation underway.",
      "Revenue protocol initiated. Momentum building.",
      "Financial objective logged. Forward.",
    ],
    [
      "Funding stream secured. Asset base growing.",
      "Capital operation executed. Keep advancing.",
      "Economic protocol on track.",
    ],
    [
      "Financial protocols running hot.",
      "Revenue engine fully engaged.",
      "Asset acquisition at peak throughput.",
    ],
    [
      "Maximum asset acquisition. Unstoppable.",
      "Economic dominance protocol: ACTIVE.",
      "Funding empire expanding. Outstanding.",
    ],
  ],
  academic: [
    [
      "Knowledge unit acquired. Neural uplink active.",
      "Data block uploaded. Learning sequence initiated.",
      "Academic objective logged. Progress confirmed.",
    ],
    [
      "Neural pathways reinforced. Keep uploading.",
      "Knowledge matrix expanding.",
      "Academic protocol advancing. On track.",
    ],
    [
      "Cognitive engine running at capacity.",
      "Scholar mode: ENGAGED. Accelerating.",
      "Knowledge architecture solidifying.",
    ],
    [
      "Maximum neural output. Graduation approaching.",
      "Academic machine: PEAK PERFORMANCE.",
      "Knowledge singularity imminent.",
    ],
  ],
  life: [
    [
      "Optimization sequence logged. Vitals improving.",
      "System health protocol executed.",
      "Biological objective cleared.",
    ],
    [
      "Optimal state protocol progressing.",
      "Performance metrics rising. Keep going.",
      "Body systems performing within parameters.",
    ],
    [
      "Peak performance state achieved.",
      "Body-mind alignment confirmed.",
      "All biological systems optimal.",
    ],
    [
      "Superhuman protocol active.",
      "Optimal state: MAXIMUM OUTPUT.",
      "Biological optimization maxed. Running hot.",
    ],
  ],
  general: [
    [
      "Op complete. Momentum sequence initiated.",
      "Objective cleared. Forward.",
      "Mission logged. Good start.",
    ],
    [
      "Mission executed. Trajectory: positive.",
      "Op complete. Neural uptime confirmed.",
      "Strike sequence continuing.",
    ],
    [
      "You're operating at peak parameters.",
      "Efficiency increasing. Command is impressed.",
      "Deep in the zone.",
    ],
    [
      "Legendary operational status. Outstanding.",
      "Maximum productivity confirmed.",
      "You're rewriting what's possible today.",
    ],
  ],
};

function getMessageTier(count) {
  if (count <= 1) return 0;
  if (count <= 4) return 1;
  if (count <= 8) return 2;
  return 3;
}

// Reads total lifetime completions to determine how "deep" the buddy relationship is
function getPartnerDepth() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("dailyTasks_"));
  const daysActive = keys.length;
  const totalCompletions = keys.reduce((sum, key) => {
    try {
      const tasks = JSON.parse(localStorage.getItem(key)) || [];
      return sum + tasks.length;
    } catch (e) {
      return sum;
    }
  }, 0);
  const tier = totalCompletions < 10 ? 0 : totalCompletions < 50 ? 1 : 2;
  return { tier, daysActive, totalCompletions };
}

// Task Completion Display Function
// Uses DOM bubble directly — avoids double-wrapping through the React notification templates
function displayRandomMessage(category = "general") {
  if (!AppSettings.get().buddyMessages) return;
  sessionTaskCount++;
  const sessionTier = getMessageTier(sessionTaskCount);
  const { tier: depthTier, daysActive } = getPartnerDepth();

  const cat = NARRATIVE_MESSAGES[category] ? category : "general";
  const tierMessages = NARRATIVE_MESSAGES[cat][sessionTier];
  let message = tierMessages[Math.floor(Math.random() * tierMessages.length)];

  // Depth tier 1: occasional day-count context (35% chance)
  if (depthTier >= 1 && daysActive > 5 && Math.random() < 0.35) {
    message = `Day ${daysActive}. ` + message;
  }

  // Depth tier 2: veteran acknowledgment — laconic prefix (30% chance)
  if (depthTier >= 2 && Math.random() < 0.3) {
    const veteranCues = ["Standard.", "As expected.", "Pattern confirmed.", "Routine."];
    message = veteranCues[Math.floor(Math.random() * veteranCues.length)] + " " + message;
  }

  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messageElement.classList.add("motivational-message");
  document.body.appendChild(messageElement);

  // Mouth sync — animate while message is visible
  if (typeof window.setRobotSpeaking === "function") {
    window.setRobotSpeaking(true);
    setTimeout(function () { window.setRobotSpeaking(false); }, 3500);
  }
  setTimeout(() => messageElement.remove(), 3500);
}

// Converts Pomodoro units to a clean minute display (1 pomo = 25 min)
function pomoToMinutes(estimate) {
  const mins = Math.round(estimate * 25);
  return `~${mins}m`;
}

// Post-completion Pomodoro check — low-friction chip strip
// Auto-dismisses after 4 s, logging the estimate as actual if the user ignores it
function showPomodoroCheck(categoryKey, estimate) {
  const existing = document.getElementById("pomo-check-bar");
  if (existing) existing.remove();

  const chips = [
    { value: 0.5, label: "12m" },
    { value: 1,   label: "25m" },
    { value: 2,   label: "50m" },
    { value: 3,   label: "75m+" },
  ];

  const bar = document.createElement("div");
  bar.id = "pomo-check-bar";
  bar.innerHTML =
    `<span class="pomo-check-label">How long?</span>` +
    chips.map((c) =>
      `<button class="pomo-chip${c.value === estimate ? " pomo-chip-est" : ""}" data-value="${c.value}">${c.label}</button>`
    ).join("") +
    `<button class="pomo-chip pomo-chip-skip" data-value="${estimate}">–</button>`;

  document.body.appendChild(bar);

  let dismissed = false;
  function dismiss(actual) {
    if (dismissed) return;
    dismissed = true;
    PomodoroEstimator.recordActual(categoryKey, actual);
    bar.classList.add("pomo-check-exit");
    setTimeout(() => bar.remove(), 280);
  }

  bar.querySelectorAll(".pomo-chip").forEach((chip) => {
    chip.addEventListener("click", () => dismiss(parseFloat(chip.dataset.value)));
  });

  // Animate in on next frame
  requestAnimationFrame(() => bar.classList.add("pomo-check-visible"));

  // Auto-dismiss after 4 s — paused while the cursor is over the bar
  let autoTimer = setTimeout(() => dismiss(estimate), 4000);

  bar.addEventListener("mouseenter", () => {
    clearTimeout(autoTimer);
    autoTimer = null;
  });

  bar.addEventListener("mouseleave", () => {
    autoTimer = setTimeout(() => dismiss(estimate), 4000);
  });
}

// Global task completion notification function
window.notifyTaskCompletion = (taskDetails) => {
  // Sanitize input to prevent XSS
  const sanitizedTask = {
    id: sanitizeInput(taskDetails.id || "unknown-task"),
    title: sanitizeInput(taskDetails.title || "Completed Task"),
    priority: ["high", "medium", "low", "normal"].includes(taskDetails.priority)
      ? taskDetails.priority
      : "normal",
    completedAt: taskDetails.completedAt || new Date().toISOString(),
  };

  // Create and dispatch a custom event with the task details
  const event = new CustomEvent("taskCompleted", { detail: sanitizedTask });
  document.dispatchEvent(event);
};

// Expose display function globally if needed
window.displayRandomMessage = displayRandomMessage;

// Function to smoothly scroll to the XP meter
function scrollToXPMeter() {
  const xpMeterEl = document.getElementById("xp-meter");
  xpMeterEl.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

// Modify the mission click event listener in the loadMissions and addMission functions

// Keep track of recently notified task IDs to prevent duplicate notifications
const recentlyNotifiedTasks = new Set();

function createMissionClickHandler(element) {
  element.addEventListener("click", function (e) {
    // Stop event propagation to prevent multiple triggers
    e.stopPropagation();

    const xp = parseInt(e.target.dataset.xp);

    // Create a unique ID for this task
    const taskId = Date.now();

    // Check if we've already processed this element
    if (element.dataset.processed === "true") {
      console.log("Task already processed, preventing duplicate handling");
      return;
    }

    // Mark this element as processed
    element.dataset.processed = "true";

    // Extract mission text (everything before the XP value)
    const missionText = e.target.innerText.split(" — ")[0].trim();

    // Get prefix class to determine priority
    const prefixSpan = e.target.querySelector("span");
    const priority = prefixSpan
      ? prefixSpan.className.includes("prefix-1")
        ? "high"
        : prefixSpan.className.includes("prefix-2")
        ? "medium"
        : prefixSpan.className.includes("prefix-3")
        ? "low"
        : "normal"
      : "normal";

    // Create task object
    const taskDetails = {
      id: taskId,
      title: missionText,
      xp: xp,
      priority: priority,
      completedAt: new Date().toISOString(),
    };

    // Track task for daily wrap
    trackDailyTask(taskDetails);

    // First Op dispatch — fires on the very first task ever completed
    (function () {
      var allKeys = Object.keys(localStorage).filter(function (k) { return k.startsWith("dailyTasks_"); });
      var total = allKeys.reduce(function (s, k) { return s + (JSON.parse(localStorage.getItem(k)) || []).length; }, 0);
      if (total === 1 && !localStorage.getItem("dispatch_read_first_op")) {
        setTimeout(function () {
          if (typeof window.showDispatch === "function") window.showDispatch("first_op");
        }, 1800);
      }
    })();

    // Neon skin unlock — rewarded at 10 tasks in a single day
    if (!localStorage.getItem("timerSkinUnlocked")) {
      var unlockKey = new Date().toISOString().split("T")[0];
      var todayCount = (JSON.parse(localStorage.getItem("dailyTasks_" + unlockKey)) || []).length;
      if (todayCount >= 10) {
        localStorage.setItem("timerSkinUnlocked", "neon");
        localStorage.setItem("timerSkinActive", "neon");
        if (typeof window._onTimerSkinUnlock === "function") window._onTimerSkinUnlock("neon");
        if (typeof window.triggerInsightFlash === "function") window.triggerInsightFlash();
        // Neon Protocol dispatch — appears after the buddy animation settles
        setTimeout(function () {
          if (typeof window.showDispatch === "function") window.showDispatch("neon_proto");
        }, 2200);
        var nb = document.createElement("div");
        nb.className = "buddy-suggestion";
        nb.textContent = "10 objectives cleared. Neon ring protocol unlocked.";
        document.body.appendChild(nb);
        requestAnimationFrame(function () { nb.classList.add("buddy-suggestion-visible"); });
        setTimeout(function () {
          nb.classList.remove("buddy-suggestion-visible");
          setTimeout(function () { nb.remove(); }, 300);
        }, 5000);
      }
    }

    // Flow state detection — 3+ completions within 10 min triggers locked-in mode
    (function () {
      var now = Date.now();
      if (!window._flowTaskTimes) window._flowTaskTimes = [];
      window._flowTaskTimes.push(now);
      window._flowTaskTimes = window._flowTaskTimes.filter(function (t) { return now - t < 600000; });
      if (window._flowTaskTimes.length >= 3 && typeof window.setRobotEmotion === "function") {
        window.setRobotEmotion("flow", 90000); // hold for 90s, refreshed by next task
      }
    })();

    // Update the button HUD
    updateWrapButtonHUD();

    // In trackDailyTask() - now extracts category from prefix
    let category = "general";
    if (taskDetails.title.startsWith("1.")) {
      category = "financial";
    } else if (taskDetails.title.startsWith("2.")) {
      category = "academic";
    } else if (taskDetails.title.startsWith("3.")) {
      category = "life";
    }

    // Check if we've already notified for this task
    if (recentlyNotifiedTasks.has(missionText)) {
      console.log(
        "Already notified for this task, skipping duplicate notification"
      );
    } else {
      // Add to recently notified tasks
      recentlyNotifiedTasks.add(missionText);

      // Clear this task from the set after some time to prevent memory leaks
      setTimeout(() => {
        recentlyNotifiedTasks.delete(missionText);
      }, 30000); // 30 seconds

      // Notify the React component about task completion if the function exists
      if (typeof window.notifyTaskCompletion === "function") {
        try {
          console.log("Notifying completion of task:", taskDetails);
          window.notifyTaskCompletion(taskDetails);
        } catch (error) {
          console.error("Error notifying task completion:", error);
        }
      }
    }

    // Continue with original functionality
    addXp(xp);
    e.target.remove();
    saveMissions();
    displayRandomMessage(category);
    playCompletionSound();
    scrollToXPMeter();

    // Session progress (Flow: immediate feedback)
    sessionCompletedCount++;
    sessionXpEarned += xp;
    updateSessionProgress();

    // Streak repair progress
    const repair = getRepairState();
    if (repair.available) {
      const todayStr = new Date().toISOString().split("T")[0];
      const newProgress = repair.progress + 1;
      localStorage.setItem("streakRepairProgress_" + todayStr, String(newProgress));
      if (newProgress >= 2) {
        // Repair complete — mark the missed day as earned
        localStorage.setItem("streakRepairComplete_" + repair.missedDate, "1");
        const bubble = document.createElement("div");
        bubble.className = "buddy-suggestion";
        bubble.textContent = "Streak restored.";
        document.body.appendChild(bubble);
        requestAnimationFrame(() => bubble.classList.add("buddy-suggestion-visible"));
        setTimeout(() => {
          bubble.classList.remove("buddy-suggestion-visible");
          setTimeout(() => bubble.remove(), 300);
        }, 3500);
      }
      renderStreakBar();
    }

    // Pomodoro calibration chip strip
    const pomoCategory = getCategoryKeyFromTitle(taskDetails.title);
    showPomodoroCheck(pomoCategory, PomodoroEstimator.getEstimate(pomoCategory));
  });
}

// Adding the mission to the list

function addMission(sanitizedInput) {
  const modifiedMission = TaskSystem.modifyMissionText(sanitizedInput);
  const prefix = modifiedMission.match(/^(\d+\.)/)?.[0];
  const prefixClass = TaskSystem.getClassForPrefix(prefix);

  if (mediaQuery.matches) {
    typeAdditionalMessage(2);
  }

  // Create a callback function to handle XP selection

  xpSelectorCallback = (xpValue) => {
    const pomoCategory = getCategoryKeyFromTitle(modifiedMission);
    const pomoEstimate = PomodoroEstimator.getEstimate(pomoCategory);
    const pomoDisplay = pomoToMinutes(pomoEstimate);

    const newEl = document.createElement("li");
    newEl.innerHTML = `<span class="${prefixClass}">${
      modifiedMission.split(":")[0]
    }:</span> ${modifiedMission.split(":")[1]} — ${xpValue} XP<span class="pomo-estimate" title="Estimated duration">${pomoDisplay}</span>`;
    newEl.className = "mission";
    newEl.dataset.xp = xpValue;

    // Add drag attributes
    newEl.draggable = true;
    newEl.addEventListener("dragstart", handleDragStart);
    newEl.addEventListener("dragend", handleDragEnd);
    newEl.addEventListener("dragover", handleDragOver);
    newEl.addEventListener("drop", handleDrop);

    // Add touch events for mobile support
    newEl.addEventListener("touchstart", handleTouchStart);
    newEl.addEventListener("touchmove", handleTouchMove);
    newEl.addEventListener("touchend", handleTouchEnd);

    // Use the new click handler function
    createMissionClickHandler(newEl);

    missionListEl.appendChild(newEl);

    // Play the sound after XP is selected and mission is added
    playAddMissionSound();

    setTimeout(() => {
      newEl.classList.add("active");
      saveMissions();
    }, 10);
  };

  // Show the XP selector
  const mountPoint = document.getElementById("xp-selector-mount");
  if (mountPoint) {
    mountPoint.style.display = "flex";
    const backdrop = document.createElement("div");
    backdrop.id = "xp-selector-backdrop";
    document.body.appendChild(backdrop);
  }

  // Call the showXPSelector function from your React component
  if (typeof window.showXPSelector === "function") {
    window.showXPSelector(xpSelectorCallback);
  } else {
    console.error("XP Selector not initialized");
  }
}

// Add this function to handle closing the XP selector
function closeXPSelector() {
  const mountPoint = document.getElementById("xp-selector-mount");
  const backdrop = document.getElementById("xp-selector-backdrop");

  if (backdrop) {
    backdrop.remove();
  }

  if (mountPoint) {
    mountPoint.style.display = "none";
  }
}

const TaskSystem = {
  taskFrequency: new Map(),

  // Use the centralized config instead of duplicating
  get categories() {
    const cats = {};
    Object.keys(CATEGORY_CONFIG).forEach((key) => {
      if (key !== "general") {
        cats[CATEGORY_CONFIG[key].prefix] = CATEGORY_CONFIG[key];
      }
    });
    return cats;
  },

  fadeTimeout: null,
  cycleTimeout: null,

  // ... rest of TaskSystem stays the same

  init() {
    try {
      const saved = localStorage.getItem("taskFrequency");
      if (saved) {
        this.taskFrequency = new Map(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Neural memory retrieval failed:", e);
    }

    const input = document.getElementById("addMission");
    if (!input) return;

    // Initialize with default tasks if no history exists
    if (this.taskFrequency.size === 0) {
      Object.values(this.categories).forEach((category) => {
        category.defaultTasks.forEach((task) => this.recordTask(task));
      });
    }

    let currentSuggestionIndex = 0;
    let currentSuggestions = this.getMostFrequentTasks();

    const updatePlaceholder = (suggestions, instant = false) => {
      if (!suggestions?.length) return;

      clearTimeout(this.fadeTimeout);
      clearTimeout(this.cycleTimeout);

      const doUpdate = () => {
        const suggestion = suggestions[currentSuggestionIndex];
        input.placeholder = suggestion;
        input.style.opacity = "1";

        currentSuggestionIndex =
          (currentSuggestionIndex + 1) % suggestions.length;
        this.cycleTimeout = setTimeout(() => {
          updatePlaceholder(suggestions);
        }, 3000);
      };

      if (instant) {
        doUpdate();
      } else {
        input.style.opacity = "0.6";
        this.fadeTimeout = setTimeout(doUpdate, 300);
      }
    };

    // Initialize suggestions immediately
    updatePlaceholder(currentSuggestions, true);
    // Inside TaskSystem.init()
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      if (value) {
        if (value.match(/^[123]\.$/)) {
          // Show category-specific suggestions when user types a prefix
          const suggestions = this.getSuggestionsForPrefix(value);
          if (suggestions.length) {
            currentSuggestions = suggestions;
            currentSuggestionIndex = 0;
            input.classList.add("cycling-placeholder");
            updatePlaceholder(suggestions, true);
          }
        } else {
          const suggestions = this.getSuggestionsForPrefix(value);
          if (suggestions.length) {
            currentSuggestions = suggestions;
            currentSuggestionIndex = 0;
            updatePlaceholder(suggestions, true);
          }
        }
      } else {
        currentSuggestions = this.getMostFrequentTasks();
        currentSuggestionIndex = 0;
        updatePlaceholder(currentSuggestions);
      }
    });

    // Add tab completion
    input.addEventListener("keydown", (e) => {
      if (e.key === "Tab" && !e.shiftKey && currentSuggestions.length > 0) {
        e.preventDefault();
        input.value = currentSuggestions[currentSuggestionIndex];
        currentSuggestionIndex =
          (currentSuggestionIndex + 1) % currentSuggestions.length;
        input.classList.add("cycling-placeholder");
      }
    });

    // Add wheel scrolling
    input.addEventListener("wheel", (e) => {
      if (currentSuggestions.length > 0) {
        e.preventDefault();
        currentSuggestionIndex =
          (currentSuggestionIndex +
            (e.deltaY > 0 ? 1 : -1) +
            currentSuggestions.length) %
          currentSuggestions.length;
        input.placeholder = currentSuggestions[currentSuggestionIndex];
        input.classList.add("cycling-placeholder");
      }
    });

    // Add this inside TaskSystem.init() after the existing input event listeners
    input.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (currentSuggestions.length > 0) {
        currentSuggestionIndex =
          (currentSuggestionIndex +
            (e.deltaY > 0 ? 1 : -1) +
            currentSuggestions.length) %
          currentSuggestions.length;
        input.placeholder = currentSuggestions[currentSuggestionIndex];
        input.classList.add("cycling-placeholder");
      }
    });

    // Add adaptive learning rate based on user interaction patterns
    let learningRate = 1;
    const updateLearningRate = (task) => {
      const categoryPrefix = task.match(/^(\d+\.)/)?.[0];
      if (categoryPrefix) {
        const existingTasks = this.getSuggestionsForPrefix(categoryPrefix);
        learningRate = Math.min(2, 1 + existingTasks.length * 0.1);
      }
    };

    // Generate styles for categories
    this.updateCategoryStyles();
  },

  updateCategoryStyles() {
    let styleSheet = document.getElementById("category-styles");
    if (!styleSheet) {
      styleSheet = document.createElement("style");
      styleSheet.id = "category-styles";
      document.head.appendChild(styleSheet);
    }

    const styles = Object.entries(this.categories)
      .map(
        ([prefix, config]) => `
        .prefix-${prefix.replace(".", "")} {
          color: ${config.color};
          font-weight: ${config.weight};
        }
        
        .prefix-${prefix.replace(".", "")}:hover::after {
          content: '${config.description}';
          background-color: #33333346;
          color: white;
          padding: 14px;
          position: absolute;
          z-index: 100;
          left: 110%;
          top: 50%;
          transform: translateY(-47%);
          border-radius: 5px;
          white-space: nowrap;
          font-family: 'Courier New', Courier, monospace;
        }
      `
      )
      .join("\n");

    styleSheet.textContent = styles;
  },

  getSuggestionsForPrefix(prefix) {
    prefix = prefix.toLowerCase();
    return Array.from(this.taskFrequency.entries())
      .filter(([task]) => task.toLowerCase().startsWith(prefix))
      .sort((a, b) => b[1] - a[1])
      .map(([task]) => task);
  },

  getMostFrequentTasks() {
    return Array.from(this.taskFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([task]) => task);
  },

  recordTask(task) {
    if (!task) return;
    const frequency = (this.taskFrequency.get(task) || 0) + 1;
    this.taskFrequency.set(task, frequency);

    try {
      localStorage.setItem(
        "taskFrequency",
        JSON.stringify(Array.from(this.taskFrequency.entries()))
      );
    } catch (e) {
      console.warn("Neural memory storage failed:", e);
    }
  },

  getClassForPrefix(prefix) {
    if (this.categories[prefix]) {
      return `prefix-${prefix.replace(".", "")}`;
    }
    return "prefix-default";
  },

  modifyMissionText(input) {
    const prefix = input.match(/^(\d+\.)/)?.[0];
    if (prefix && this.categories[prefix]) {
      const category = this.categories[prefix];
      return input.replace(prefix, `${prefix} ${category.title}: `);
    }
    return input;
  },

  // Method to add new categories dynamically
  addCategory(prefix, config) {
    if (this.categories[prefix]) {
      console.warn(
        `Category ${prefix} already exists. Updating configuration...`
      );
    }
    this.categories[prefix] = {
      prefix,
      ...config,
    };

    this.updateCategoryStyles();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  AppSettings.applyAll();
  OllamaClient.checkAvailable();
  TaskSystem.init();
  loadMissions();
  renderStreakBar();
  updateSessionProgress();
  const initialSuggestions = TaskSystem.getMostFrequentTasks();
  if (initialSuggestions.length) {
    inputEl.placeholder = initialSuggestions[0];
  }
});

// Add this after your existing event listeners
inputEl.addEventListener("focus", () => {
  // Reset placeholder cycling when input is focused
  const suggestions = TaskSystem.getMostFrequentTasks();
  if (suggestions.length) {
    inputEl.placeholder = suggestions[0];
    inputEl.classList.add("cycling-placeholder");
  }
});

inputEl.addEventListener("blur", () => {
  inputEl.classList.remove("cycling-placeholder");
});

// Enhanced input handling for prefix suggestions
inputEl.addEventListener("input", (e) => {
  const value = e.target.value;
  if (value.match(/^[123]\.$/)) {
    // Show category-specific suggestions when user types a prefix
    const suggestions = TaskSystem.getSuggestionsForPrefix(value);
    if (suggestions.length) {
      inputEl.placeholder = suggestions[0];
    }
  }
});

// Lock in timer

// Click dragging functionality

// Drag and Drop event handlers
let draggedItem = null;

function handleDragStart(e) {
  draggedItem = e.target;
  e.target.classList.add("dragging");

  // Set ghost drag image
  const ghost = e.target.cloneNode(true);
  ghost.style.opacity = "0.5";
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, 0, 0);
  setTimeout(() => document.body.removeChild(ghost), 0);
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
  draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
  const targetItem = e.target.closest("li");

  if (!targetItem || !draggedItem || targetItem === draggedItem) return;

  const boundingRect = targetItem.getBoundingClientRect();
  const draggedRect = draggedItem.getBoundingClientRect();

  if (e.clientY < boundingRect.top + boundingRect.height / 2) {
    targetItem.parentNode.insertBefore(draggedItem, targetItem);
  } else {
    targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
  }

  saveMissions();
}

function handleDrop(e) {
  e.preventDefault();
  saveMissions();
}

let touchDraggedItem = null;
let touchStartY = 0;

function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartY = touch.clientY;
  touchDraggedItem = e.target.closest("li");
  if (touchDraggedItem) {
    touchDraggedItem.classList.add("dragging");
  }
}

// Track previous priority mission
let previousPriorityMission = null;

function handleDragOver(e) {
  e.preventDefault();
  const targetItem = e.target.closest("li");

  if (!targetItem || !draggedItem || targetItem === draggedItem) return;

  const boundingRect = targetItem.getBoundingClientRect();

  if (e.clientY < boundingRect.top + boundingRect.height / 2) {
    targetItem.parentNode.insertBefore(draggedItem, targetItem);
  } else {
    targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
  }

  // Check if priority mission changed
  const currentPriorityMission = missionListEl.firstElementChild;
  if (currentPriorityMission !== previousPriorityMission) {
    // Remove priority class from previous
    if (previousPriorityMission) {
      previousPriorityMission.classList.remove("becoming-priority");
    }
    // Add priority class to new top mission
    currentPriorityMission.classList.add("becoming-priority");
    // Play priority change sound
    playPriorityChangeSound();

    previousPriorityMission = currentPriorityMission;
  }

  saveMissions();
}

// Add a subtle sound effect for priority changes
function playPriorityChangeSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(
    880,
    audioContext.currentTime + 0.1
  );

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
}

// Initialize the priority system when loading missions
function initializePrioritySystem() {
  const firstMission = missionListEl.firstElementChild;
  if (firstMission) {
    previousPriorityMission = firstMission;
    firstMission.classList.add("becoming-priority");
  }
}

// Touch dragging functionality

function handleTouchMove(e) {
  e.preventDefault();
  if (!touchDraggedItem) return;

  const touch = e.touches[0];
  const currentY = touch.clientY;

  // Get all mission items
  const items = Array.from(document.querySelectorAll(".mission"));
  const draggedIndex = items.indexOf(touchDraggedItem);

  items.forEach((item, index) => {
    if (item === touchDraggedItem) return;

    const rect = item.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;

    if (currentY < centerY && index < draggedIndex) {
      item.parentNode.insertBefore(touchDraggedItem, item);
    } else if (currentY > centerY && index > draggedIndex) {
      item.parentNode.insertBefore(touchDraggedItem, item.nextSibling);
    }
  });
}

function handleTouchEnd(e) {
  if (!touchDraggedItem) return;

  touchDraggedItem.classList.remove("dragging");
  touchDraggedItem = null;
  saveMissions();
}

function saveMissions() {
  const missionsEl = document.getElementsByClassName("mission"); // Get all elements with the 'mission' class
  const missionsData = Array.from(missionsEl).map((missionEl) => {
    const prefixClass = missionEl.querySelector("span").className; // Get the prefix class from the <span>
    const missionText = missionEl.textContent.split(" — ")[0]; // Get the mission text before the XP
    const xp = missionEl.dataset.xp; // Get the XP value from the data attribute

    return {
      text: missionText,
      prefixClass: prefixClass,
      xp: xp,
    };
  });

  localStorage.setItem("missions", JSON.stringify(missionsData)); // Save the structured data to localStorage
}

function loadMissions() {
  let missions = JSON.parse(localStorage.getItem("missions")); // Get the saved missions from localStorage

  if (missions) {
    // If there are saved missions
    missions.forEach((mission) => {
      const newEl = document.createElement("li"); // Create a new list item element

      // Create the span with the prefix class
      const prefixSpan = document.createElement("span");
      prefixSpan.className = mission.prefixClass; // Apply the saved prefix class
      prefixSpan.textContent = mission.text.split(":")[0] + ":";

      const missionText = document.createTextNode(
        " " + mission.text.split(":")[1] + " — " + mission.xp + " XP"
      );

      // Pomodoro estimate badge
      const loadPomoCategory = getCategoryKeyFromPrefixClass(mission.prefixClass);
      const loadPomoEstimate = PomodoroEstimator.getEstimate(loadPomoCategory);
      const pomoSpan = document.createElement("span");
      pomoSpan.className = "pomo-estimate";
      pomoSpan.title = "Estimated duration";
      pomoSpan.textContent = pomoToMinutes(loadPomoEstimate);

      // Append the prefix, mission text, and estimate badge
      newEl.appendChild(prefixSpan);
      newEl.appendChild(missionText);
      newEl.appendChild(pomoSpan);
      newEl.className = "mission";
      newEl.dataset.xp = mission.xp;

      // Add drag functionality
      newEl.draggable = true;
      newEl.addEventListener("dragstart", handleDragStart);
      newEl.addEventListener("dragend", handleDragEnd);
      newEl.addEventListener("dragover", handleDragOver);
      newEl.addEventListener("drop", handleDrop);

      // Add touch events for mobile support
      newEl.addEventListener("touchstart", handleTouchStart);
      newEl.addEventListener("touchmove", handleTouchMove);
      newEl.addEventListener("touchend", handleTouchEnd);

      // Use the new click handler function
      createMissionClickHandler(newEl);

      missionListEl.appendChild(newEl);

      setTimeout(() => {
        newEl.classList.add("active");
      }, 10);
    });
  }

  // Load current XP, level, and high score from localStorage
  let currentXp = parseInt(localStorage.getItem("currentXp")) || 0;
  let currentLevel = parseInt(localStorage.getItem("currentLevel")) || 1;
  let highScore = parseInt(localStorage.getItem("highScore")) || 0;

  // Update XP meter to show progress within the current level
  xpMeterEl.dataset.xp = currentXp;
  updateXpMeter(currentXp); // Update the XP meter display with the adjusted function

  // Update leaderboard display
  updateHighScoreDisplay(highScore);

  // Function to update the XP meter to show progress for the current level
  function updateXpMeter(currentXp) {
    const level = Math.floor(currentXp / 100) + 1; // Calculate level
    const xpForCurrentLevel = currentXp % 100; // XP within the current level
    const xpProgress = (xpForCurrentLevel / 100) * 100; // Calculate percentage within level

    // Update meter width based on current level XP
    xpMeterEl.style.width = `${xpProgress}%`;

    // Update level and XP text (optional for clarity)
    xpText.textContent = `LEVEL ${level} — XP: ${xpForCurrentLevel}/100`;
    xpMeterEl.textContent = `${xpForCurrentLevel} XP`; // Update the text content of the XP meter
  }

  // Update high score display
  function updateHighScoreDisplay(highScore) {
    const highScoreEl = document.getElementById("highScore");
    highScoreEl.textContent = highScore;
  }
}

// Update high score function
function updateHighScoreDisplay(highScore) {
  const highScoreEl = document.getElementById("highScore");
  highScoreEl.textContent = highScore;
}

function displayCongratulatoryMessage() {
  const messageElement = document.createElement("div");
  messageElement.textContent = "New High Score! 🎉";
  messageElement.classList.add("congratulatory-message");

  document.body.appendChild(messageElement);

  setTimeout(() => {
    messageElement.remove(); // Remove the message after 3 seconds
  }, 3000);
}

function checkXP(totalXp) {
  const level = Math.floor(totalXp / 100) + 1;
  const xpForCurrentLevel = totalXp % 100;

  // Level up condition with visual reset
  if (xpForCurrentLevel === 0 && totalXp > 0) {
    playLevelUpSound();
    // Reset visual bar but maintain total XP
    xpMeterEl.style.width = "0%";
    xpMeterEl.textContent = "0/100 XP";
    xpText.textContent = `LEVEL ${level} — NEURAL INTERFACE UPGRADED`;

    // Add a subtle flash effect for level up
    xpMeterEl.classList.add("level-up-flash");
    setTimeout(() => {
      xpMeterEl.classList.remove("level-up-flash");
    }, 1000);
  } else {
    // Normal XP update within current level
    const xpProgress = (xpForCurrentLevel / 100) * 100;
    xpMeterEl.style.width = `${xpProgress}%`;
    xpMeterEl.textContent = `${xpForCurrentLevel}/100 XP`;
    xpText.textContent = `Level ${level} — XP: ${xpForCurrentLevel}/100`;
  }
}
// Function to create a signal flare animation
function createSignalFlare() {
  // Create the main flare element
  const flare = document.createElement("div");
  flare.className = "signal-flare";

  // Position at the button
  const readyButton = document.getElementById("readyButton");
  if (!readyButton) return;

  const buttonRect = readyButton.getBoundingClientRect();
  const startX = buttonRect.left + buttonRect.width / 2;
  const startY = buttonRect.top;

  flare.style.left = `${startX}px`;
  flare.style.top = `${startY}px`;

  document.body.appendChild(flare);

  // Add sparkles to the flare
  const addSparkles = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const sparkle = document.createElement("div");
        sparkle.className = "flare-sparkle";

        // Random x and y offsets for the sparkle movement
        const xMove = (Math.random() - 0.5) * 100;
        const yMove = (Math.random() * -1 - 0.5) * 100;

        sparkle.style.setProperty("--x-move", `${xMove}px`);
        sparkle.style.setProperty("--y-move", `${yMove}px`);

        // Position sparkle near the current position of the flare
        const flareRect = flare.getBoundingClientRect();
        sparkle.style.left = `${
          flareRect.left + flareRect.width / 2 + (Math.random() - 0.5) * 10
        }px`;
        sparkle.style.top = `${flareRect.top + (Math.random() - 0.5) * 10}px`;

        document.body.appendChild(sparkle);

        // Remove sparkle after animation completes
        setTimeout(() => {
          sparkle.remove();
        }, 1500);
      }, i * 100);
    }
  };

  // Add multiple sets of sparkles over time
  for (let i = 0; i < 8; i++) {
    setTimeout(addSparkles, i * 300);
  }

  // Remove flare after animation completes
  setTimeout(() => {
    flare.remove();
  }, 3000);
}
// Ready signal functionality - add after the high score code
const readyButtonEl = document.getElementById("readyButton");

// Create a special sound for the ready signal (using existing sounds)
function playReadySignalSound() {
  // You can use one of your existing sounds or combine them
  const completionSound = document.getElementById("completionSound");
  const addMissionSound = document.getElementById("addMissionSound");
  if (completionSound && addMissionSound) {
    // Play both sounds with a slight delay for an interesting effect
    addMissionSound.currentTime = 0;
    addMissionSound.play();
    setTimeout(() => {
      completionSound.currentTime = 0;
      completionSound.play();
    }, 300);
  }
}

// Define the click handler as a named function so we can remove it later
function readyButtonClickHandler() {
  const now = new Date();
  const currentTime = now.getTime();

  // Get today's date in YYYY-MM-DD format for the localStorage key
  const today = now.toISOString().split("T")[0];
  const todayReadyKey = `readyTime_${today}`;

  // Check if we've already sent a signal today
  const alreadySentToday = localStorage.getItem(todayReadyKey);

  if (alreadySentToday) {
    // Already sent a signal today, just remind the user
    const messageElement = document.createElement("div");
    messageElement.className = "signal-sent-message";
    messageElement.innerHTML = `
      <div style="font-size: 1.2em; margin-bottom: 8px;">SIGNAL ALREADY DEPLOYED</div>
      <div>READY STATUS PREVIOUSLY CONFIRMED TODAY</div>
    `;
    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
    }, 3000);

    return; // Exit early
  }

  // Get just the time portion by setting date to a fixed reference date
  const todayTimeOnly = new Date(now);
  todayTimeOnly.setFullYear(2000, 0, 1); // Set to Jan 1, 2000 to compare times only
  const todayTimeOnlyMs = todayTimeOnly.getTime();

  // Weekly key — resets every Monday
  const weekKey = getWeekKey();
  const weeklyRecordKey = `earliestReadyTime_${weekKey}`;

  // Get this week's record, defaulting to end-of-day sentinel
  const storedEarliestReady = localStorage.getItem(weeklyRecordKey);
  let earliestReadyTimeMs = storedEarliestReady
    ? parseInt(storedEarliestReady)
    : new Date(2000, 0, 1, 23, 59, 59).getTime();

  // Normalise both times to the same reference date (time-of-day comparison only)
  const earliestTimeOnly = new Date(earliestReadyTimeMs);
  earliestTimeOnly.setFullYear(2000, 0, 1);
  const earliestTimeOnlyMs = earliestTimeOnly.getTime();

  // Always record today's ready time
  localStorage.setItem(todayReadyKey, currentTime.toString());

  // Create the signal flare animation
  createSignalFlare();

  // Play sound effects
  playReadySignalSound();

  if (todayTimeOnlyMs < earliestTimeOnlyMs) {
    // New weekly record
    localStorage.setItem(weeklyRecordKey, currentTime.toString());

    // Calculate improvement delta (minutes earlier than previous best)
    const deltaMs = earliestTimeOnlyMs - todayTimeOnlyMs;
    const deltaMins = Math.round(deltaMs / 60000);
    const deltaText = storedEarliestReady
      ? `${deltaMins} min earlier than your previous best`
      : "First signal of the week";

    const messageElement = document.createElement("div");
    messageElement.className = "signal-sent-message";
    messageElement.innerHTML = `
      <div style="font-size: 1.1em; margin-bottom: 6px; letter-spacing: 0.1em;">WEEK'S BEST</div>
      <div>${deltaText.toUpperCase()}</div>
    `;
    document.body.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 3500);

    updateEarliestReadyDisplay(currentTime);
  } else {
    // Signal sent, record stands — look away (mild disappointment)
    if (typeof window.robotLookAway === "function") window.robotLookAway();
    const prevTime = new Date(earliestReadyTimeMs).toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const messageElement = document.createElement("div");
    messageElement.className = "signal-sent-message";
    messageElement.innerHTML = `
      <div style="font-size: 1.1em; margin-bottom: 6px; letter-spacing: 0.1em;">SIGNAL DEPLOYED</div>
      <div>WEEK'S BEST STANDS AT ${prevTime}</div>
    `;
    document.body.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 3000);
  }

  // Disable the button after use
  disableReadyButton();
}

// Function to disable the ready button until next day
function disableReadyButton() {
  // Only proceed if the button exists
  if (!readyButtonEl) return;

  // Change appearance to look disabled
  readyButtonEl.classList.add("disabled");

  // Update text to show it's been used
  readyButtonEl.textContent = "Out of flares";

  // Disable the button functionality
  readyButtonEl.disabled = true;

  // Remove the hover animation
  readyButtonEl.style.animation = "none";
  readyButtonEl.style.boxShadow = "none";

  // Prevent the click handler from doing anything
  readyButtonEl.removeEventListener("click", readyButtonClickHandler);
}

// Function to check if we should disable the ready button on page load
function checkReadyButtonStatus() {
  if (!readyButtonEl) return;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  const todayReadyKey = `readyTime_${today}`;

  // Check if we've already sent a signal today
  if (localStorage.getItem(todayReadyKey)) {
    disableReadyButton();
  }
}

// Builds the HUD panel content from live localStorage data
function buildWeeksBestHUD() {
  const todayKey = getTodayKey();
  const todayTasks = JSON.parse(localStorage.getItem("dailyTasks_" + todayKey)) || [];
  const todayXP = todayTasks.reduce(function(s, t) { return s + (t.xp || 0); }, 0);
  const readyVal = localStorage.getItem("readyTime_" + todayKey);
  const deployStr = readyVal
    ? new Date(parseInt(readyVal)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    : "—";

  return `
    <div class="er-hud-inner">
      <div class="er-stats">
        <div class="er-stat">
          <span class="er-stat-icon">◻</span>
          <span class="er-stat-val">${todayTasks.length}</span>
          <span class="er-stat-lbl">ops</span>
        </div>
        <div class="er-stat">
          <span class="er-stat-icon">◈</span>
          <span class="er-stat-val">${todayXP}</span>
          <span class="er-stat-lbl">xp</span>
        </div>
        <div class="er-stat">
          <span class="er-stat-icon">▷</span>
          <span class="er-stat-val">${deployStr}</span>
          <span class="er-stat-lbl">deployed</span>
        </div>
      </div>
      <button class="er-reset-btn" id="er-reset-week">Reset week's best</button>
    </div>`;
}

// Function to update earliest ready time display
function updateEarliestReadyDisplay(earliestReadyTime) {
  const timeString = earliestReadyTime
    ? new Date(earliestReadyTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    : "—";

  const container = document.getElementById("earliest-display");
  if (!container) return;

  let el = document.querySelector(".earliest-ready-display");
  if (!el) {
    el = document.createElement("div");
    el.className = "earliest-ready-display";
    container.appendChild(el);
  }

  el.innerHTML = `
    <div class="er-header">
      <div class="info">
        <div>WEEK'S BEST: <span class="time">${timeString}</span></div>
        <div class="date">RESETS MONDAY</div>
      </div>
      <span class="er-toggle">+</span>
    </div>
    <div class="er-hud"></div>
  `;

  // Toggle expand — rebuilds HUD content on each open so stats are fresh
  var header = el.querySelector(".er-header");
  var hud = el.querySelector(".er-hud");
  header.addEventListener("click", function () {
    var expanding = el.classList.toggle("er-expanded");
    if (expanding) {
      hud.innerHTML = buildWeeksBestHUD();
      // Wire reset button — clears this week's record
      var resetBtn = hud.querySelector("#er-reset-week");
      if (resetBtn) {
        resetBtn.addEventListener("click", function (e) {
          e.stopPropagation(); // don't collapse the HUD
          var weeklyKey = "earliestReadyTime_" + getWeekKey();
          localStorage.removeItem(weeklyKey);
          el.classList.remove("er-expanded");
          updateEarliestReadyDisplay(null); // re-render showing "—"
        });
      }
    }
  });
}

// One-time migration: move the old all-time key into the current week's key
(function migrateEarliestReadyRecord() {
  const weeklyKey = `earliestReadyTime_${getWeekKey()}`;
  const legacy = localStorage.getItem("earliestReadyTime");
  if (legacy && !localStorage.getItem(weeklyKey)) {
    localStorage.setItem(weeklyKey, legacy);
    localStorage.removeItem("earliestReadyTime");
  }
})();

// Always render the display — shows "—" if no signal sent yet this week
const storedEarliestReady = localStorage.getItem(`earliestReadyTime_${getWeekKey()}`);
updateEarliestReadyDisplay(storedEarliestReady ? parseInt(storedEarliestReady) : null);

// Attach the handler to the button and check initial state
if (readyButtonEl) {
  readyButtonEl.addEventListener("click", readyButtonClickHandler);
  readyButtonEl.addEventListener("click", function () {
    // Alert / Combat-Ready expression on deploy — snaps to attention
    if (typeof window.setRobotEmotion === "function") window.setRobotEmotion("alert", 2500);
  });
  readyButtonEl.addEventListener("click", checkCategoryNeglect);
  readyButtonEl.addEventListener("click", suggestQuickWin);
  readyButtonEl.addEventListener("click", renderStreakBar);
  readyButtonEl.addEventListener("click", function () {
    if (!OllamaClient.available || !AppSettings.get().buddyMessages) return;
    var todayKey = new Date().toISOString().split("T")[0];
    var todayTasks = JSON.parse(localStorage.getItem("dailyTasks_" + todayKey)) || [];
    var pending = Array.from(document.querySelectorAll(".mission")).map(function (el) {
      return { title: el.innerText.split(" — ")[0].trim() };
    });
    var { streak } = getStreakData();
    OllamaClient.generateBriefing(pending.concat(todayTasks), streak).then(function (brief) {
      if (!brief || !AppSettings.get().buddyMessages) return;
      var bubble = document.createElement("div");
      bubble.className = "buddy-suggestion";
      bubble.textContent = brief;
      document.body.appendChild(bubble);
      requestAnimationFrame(function () { bubble.classList.add("buddy-suggestion-visible"); });
      setTimeout(function () {
        bubble.classList.remove("buddy-suggestion-visible");
        setTimeout(function () { bubble.remove(); }, 300);
      }, 7000);
    });
  });

  // Check if button should be disabled on page load
  checkReadyButtonStatus();
}

// Category neglect alert — flags any named category with 0 completions in 3+ days
function checkCategoryNeglect() {
  const now = new Date();
  const neglected = [];

  ["1", "2", "3"].forEach((catKey) => {
    let daysDark = 0;
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const tasks = JSON.parse(localStorage.getItem("dailyTasks_" + dateStr)) || [];
      if (!tasks.some((t) => t.category === catKey)) daysDark++;
    }
    if (daysDark >= 3) {
      neglected.push({ name: CATEGORY_CONFIG[catKey].shortName, days: daysDark });
    }
  });

  neglected.forEach(({ name, days }, i) => {
    setTimeout(() => {
      // Look away before delivering bad news
      if (typeof window.robotLookAway === "function") window.robotLookAway();
      const bubble = document.createElement("div");
      bubble.className = "buddy-suggestion";
      bubble.textContent = `${name} objectives: ${days} days dark.`;
      document.body.appendChild(bubble);
      requestAnimationFrame(() => bubble.classList.add("buddy-suggestion-visible"));
      setTimeout(() => {
        bubble.classList.remove("buddy-suggestion-visible");
        setTimeout(() => bubble.remove(), 300);
      }, 5000);
    }, i * 1800);
  });
}

// Quick Win suggestion — buddy surfaces the easiest pending task at session start
function suggestQuickWin() {
  const missions = Array.from(document.querySelectorAll(".mission"));
  if (missions.length === 0) return;

  const easiest = missions.reduce((min, el) => {
    return parseInt(el.dataset.xp || 999) < parseInt(min.dataset.xp || 999) ? el : min;
  });

  const taskText = easiest.textContent.split("—")[0].trim();
  const xp = easiest.dataset.xp;

  const bubble = document.createElement("div");
  bubble.className = "buddy-suggestion";
  bubble.textContent = `Quick win: "${taskText}" — ${xp} XP. Knock it out first?`;
  document.body.appendChild(bubble);
  requestAnimationFrame(() => bubble.classList.add("buddy-suggestion-visible"));
  setTimeout(() => {
    bubble.classList.remove("buddy-suggestion-visible");
    setTimeout(() => bubble.remove(), 300);
  }, 4500);
}

// Run the check again when DOM is fully loaded (in case readyButtonEl wasn't available earlier)
document.addEventListener("DOMContentLoaded", checkReadyButtonStatus);

function updateXpMeter(totalXp) {
  const xpForCurrentLevel = totalXp % 100;
  const xpProgress = (xpForCurrentLevel / 100) * 100;

  // Always show progress within current level
  xpMeterEl.style.width = `${xpProgress}%`;
  xpMeterEl.textContent = `${xpForCurrentLevel}/100 XP`;
}

function clearData() {
  playResetDataSound();
  typeAdditionalMessage(3);
  localStorage.clear(); // Clear all data from local storage
  missionListEl.textContent = ""; // Clear the mission list
  resetXpMeter(); // Reset the XP meter
  //  resetStreak(); // Reset the streak count
  console.log("Data has been wiped . . ");
}

function clearXP() {
  playResetDataSound();
  resetXpMeter(); // Reset the XP meter
  //  resetStreak(); // Reset the streak count
  console.log("XP meter has been reset.");
}

function clearTextField() {
  inputEl.value = ""; // Clear the input field
  missionButtonEl.disabled = true; // Disable the mission button
}

function addXp(xp) {
  let currentXp = parseInt(xpMeterEl.dataset.xp) || 0;
  currentXp += xp;

  // Calculate the current level
  const currentLevel = Math.floor(currentXp / 100) + 1;

  // Store both XP and level
  xpMeterEl.dataset.xp = currentXp;
  localStorage.setItem("currentXp", currentXp);
  localStorage.setItem("currentLevel", currentLevel);

  // Rest of the existing function remains the same
  updateXpMeter(currentXp);

  let highScore = parseInt(localStorage.getItem("highScore")) || 0;
  if (currentXp > highScore) {
    localStorage.setItem("highScore", currentXp);
    updateHighScoreDisplay(currentXp);
    displayCongratulatoryMessage();
  }

  checkXP(currentXp);
}

function updateXpMeter(currentXp) {
  const maxXP = 100; // Set the maximum XP for the meter
  const xpPercentage = (currentXp / maxXP) * 100; // Calculate the XP as a percentage of the maximum
  const xpMeterWidth = Math.min(xpPercentage, 100); // Ensure the XP meter doesn't exceed 100%
  xpMeterEl.style.width = `${xpMeterWidth}%`; // Set the width of the XP meter
  xpMeterEl.textContent = `${currentXp} XP`; // Update the text content of the XP meter
}

function resetXpMeter() {
  xpMeterEl.dataset.xp = 0; // Reset the XP meter's data attribute to 0
  xpMeterEl.style.width = "0px"; // Set the XP meter width to 0
  xpMeterEl.textContent = "0 XP"; // Update the text content of the XP meter to 0
  localStorage.setItem("currentXp", 0); // Reset the current XP in local storage to 0
}

function resetXpMeterVisual() {
  xpMeterEl.style.width = "0%"; // Visually reset the XP bar to 0%
  xpMeterEl.textContent = "0 XP"; // Update the text content to show 0 XP
}
/*
function updateStreak() {
    currentStreak++; // Increase the current streak count
    streakBonusEl.textContent = `Streak Bonus: ${currentStreak * 5} XP`; // Update the streak bonus display
}

function resetStreak() {
    currentStreak = 0; // Reset the current streak count to 0
    streakBonusEl.textContent = `Streak Bonus: 0 XP`; // Update the streak bonus display
} */

function playCompletionSound() {
  completionSound.currentTime = 0; // Reset the sound to the beginning
  completionSound.play(); // Play the completion sound
}

function playLevelUpSound() {
  levelUpSound.currentTime = 0; // Reset the sound to the beginning
  levelUpSound.play(); // Play the completion sound
}

function playResetDataSound() {
  resetDataSound.currentTime = 0; // Reset the sound to the beginning
  resetDataSound.play(); // Play the completion sound
}

function playAddMissionSound() {
  addMissionSound.currentTime = 0; // Reset the sound to the beginning
  addMissionSound.play(); // Play the completion sound
}

function playInitSound() {
  initializingSound.currentTime = 0; // Reset the sound to the beginning
  initializingSound.play(); // Play the completion sound
}

function playSwipeSound() {
  swipeSound.currentTime = 0; // Reset the sound to the beginning
  swipeSound.play(); // Play the completion sound
}

const motivationalQuotes = [
  // Updated motivational quotes with revised character names

  "The wasteland doesn’t define you; you define yourself. Forge your own path, Nomad.",
  "Every choice you make brings you closer to your purpose. Reflect and decide your way forward.",
  "You are the architect of your own world. Build it with purpose, Creator.",
  "Your story is yours alone to write. Every line matters, and every choice is yours, Author.",
  "Trust in your ability to overcome. Each obstacle is a stepping stone, Survivor.",
  "Take a moment to breathe and appreciate how far you’ve come. You've earned it.",
  "Your potential is limitless; believe in your ability to adapt and evolve.",
  "You are in control of your journey. Each step is a conscious move toward your greater goal, Architect.",
  "You’ve got the tools, now use them to craft the future you want. You’ve got this, Tinkerer.",
  "In the chaos, you’re the constant. Trust your inner compass and keep moving forward, Navigator.",
  "No one else can walk your path for you. Forge your own way, pathfinder.",
  "Every victory, no matter how small, is a testament to your resilience. Take pride in it.",
  "Look back at your progress only to fuel your next move. Your journey isn’t over yet, Pathfinder.",
  "Your actions ripple through this world, affecting others more than you realize. Keep leading the way, Vanguard.",
  "Every setback is an opportunity to learn and grow. You’re stronger than any failure, Builder.",
  "The world shifts as you shape it. Stay the course and claim your power, Architect.",
  "Your legacy is built on moments like these. Make them count, Explorer.",
  "Listen to your instincts. They’ve gotten you this far for a reason, Traveler.",
  "Progress isn’t always linear, but each step forward is a testament to your determination, Pioneer.",
  "You’re not alone in this journey. Every connection you make strengthens your cause, Networker.",
  "Your resilience is unmatched. Each challenge is an opportunity to rise stronger, Athelete.",
  "The horizon may seem distant, but you’ve already crossed galaxies to get here. Keep going, Visionary.",
  "Celebrate your wins—no matter how small. They’re the building blocks of your future, Vault Dweller.",
  "This world is what you make of it. You’re the one in control of your destiny.",
  "Your mind is your greatest asset. Use it to solve, adapt, and conquer.",
  "The wasteland only hardens those who rise above it. You’ve proven you can, Survivor.",
  "Let every step be a reminder of how far you’ve come. Keep building, Maker.",
];

document.addEventListener("DOMContentLoaded", function () {
  const mediaQuery = window.matchMedia("(max-width: 600px)");

  // Function to display the quote based on the media query
  function updateQuote() {
    if (mediaQuery.matches) {
      // Mobile mode
      displayQuote("motivationalQuoteMobile");
    } else {
      // Desktop mode
      displayQuote("motivationalQuoteWidescreen");
    }
  }

  // Function to display a quote in the specified element
  function displayQuote(elementId) {
    let quoteElement = document.getElementById(elementId);
    const randomQuote =
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    quoteElement.textContent = randomQuote;
  }

  // Initial quote display
  updateQuote();
  setInterval(updateQuote, 10 * 60 * 1000); // Updates every 10 minutes

  // Listen for changes in the viewport size
  mediaQuery.addEventListener("change", updateQuote);
});

// Array containing the messages to be displayed
const messages = [
  "Initializing Uplink . . ", // First message
  "Uplink established.", // Second message
  "OP. accepted", // Third message
  "Data wipe initiated . . ", // Fourth message
];

let index = 0; // Index to track the current message being typed
const outputDiv = document.getElementById("output"); // Get the output div element

// Function to type out messages one by one
function typeMessage() {
  // Check if there are more messages to type
  if (index < 2) {
    // Only type the first three messages
    let message = messages[index]; // Get the current message
    let charIndex = 0; // Index to track the current character being typed

    // Set an interval to type each character of the message
    const typeInterval = setInterval(() => {
      outputDiv.textContent += message.charAt(charIndex); // Append the current character to the output div
      charIndex++; // Move to the next character

      // Check if the entire message has been typed
      if (charIndex === message.length) {
        clearInterval(typeInterval); // Stop the typing interval
        index++; // Move to the next message
        outputDiv.textContent += "\n"; // Add a new line after the message

        // Add an extra line space after the first message
        if (index === 1) {
          outputDiv.textContent += "\n"; // Add an extra line space after the first message
        }

        // Start the fade-out effect after 10 seconds
        setTimeout(() => {
          outputDiv.style.opacity = 0; // Start fading out
          setTimeout(() => {
            outputDiv.style.display = "none"; // Remove the div from the display
          }, 1000); // Wait for 1 second after fading out
        }, 4000); // Wait for 8 seconds before starting the fade-out

        if (index < 3) {
          // Only type the first three messages
          setTimeout(typeMessage, 1000); // Wait for 1 second before typing the next message
        }
      }
    }, 60); // Typing speed: 60 milliseconds per character
  }
}

// Call typeMessage on page load to start typing the first message
window.onload = typeMessage;

// Function to type out additional messages (e.g., when a task is added)
function typeAdditionalMessage(messageIndex) {
  // Ensure the output div is visible and fully opaque before typing the new message
  outputDiv.style.display = "block";
  outputDiv.style.opacity = 1;

  // Check if the message index is within the array bounds
  if (messageIndex >= 0 && messageIndex < messages.length) {
    let message = messages[messageIndex]; // Get the current message
    let charIndex = 0; // Index to track the current character being typed

    // Clear the output div before typing the new message
    outputDiv.textContent = "";

    // Set an interval to type each character of the message
    const typeInterval = setInterval(() => {
      outputDiv.textContent += message.charAt(charIndex); // Append the current character to the output div
      charIndex++; // Move to the next character

      // Check if the entire message has been typed
      if (charIndex === message.length) {
        clearInterval(typeInterval); // Stop the typing interval
        outputDiv.textContent += "\n"; // Add a new line after the message

        // Start the fade-out effect after 10 seconds
        setTimeout(() => {
          outputDiv.style.opacity = 0; // Start fading out
          setTimeout(() => {
            outputDiv.style.display = "none"; // Remove the div from the display
          }, 1000); // Wait for 1 second after fading out
        }, 2000); // Wait for 4 seconds before starting the fade-out
      }
    }, 60); // Typing speed: 60 milliseconds per character
  } else {
    console.error("Message index out of bounds."); // Log an error if the index is invalid
  }
} // Optimized version with performance improvements and bug fixes

//################## SECTION 11: Distraction Capture System ##################

// ===== CONSTANTS & ELEMENT SELECTORS =====
const DOM = {
  // Core container elements - will be populated on initialization
  container: null,
  header: null,
  input: null,
  saveButton: null,
  list: null,
  clearButton: null,
  carouselContainer: null,
  carouselView: null,
  listView: null,
  viewToggle: null,
  listViewBtn: null,
  carouselViewBtn: null,
  listView: null,
  carouselView: null,
};

// ===== STATE VARIABLES =====
let expandTimeout = null;
let collapseTimeout = null;
let currentFilter = "all";
let distractionsCache = null; // Cache for distractions to reduce localStorage reads

// ===== CONSTANTS =====
const TIMEFRAMES = {
  NOW: "now",
  BREAK: "break",
  LATER: "later",
  TOMORROW: "tomorrow",
};

const PRIORITIES = {
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
};

const FILTERS = {
  ALL: "all",
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
};

// Category keywords for intelligent classification
const KEYWORDS = {
  CATEGORY_1: [
    "client",
    "marketing",
    "sales",
    "money",
    "revenue",
    "income",
    "finance",
    "financial",
    "invest",
    "payment",
    "invoice",
    "bill",
    "budget",
    "fund",
    "asset",
    "profit",
    "earning",
    "sell",
    "customer",
    "promotion",
    "campaign",
  ],
  CATEGORY_2: [
    "study",
    "homework",
    "assignment",
    "research",
    "paper",
    "thesis",
    "exam",
    "class",
    "course",
    "lecture",
    "learn",
    "education",
    "school",
    "college",
    "university",
    "degree",
    "grade",
    "academic",
    "read",
    "book",
    "code",
    "programming",
    "project",
    "deadline",
    "professor",
    "teacher",
    "student",
  ],
  CATEGORY_3: [
    "health",
    "exercise",
    "workout",
    "fitness",
    "gym",
    "meditation",
    "yoga",
    "run",
    "jog",
    "walk",
    "sleep",
    "rest",
    "relax",
    "journal",
    "diet",
    "meal",
    "food",
    "nutrition",
    "doctor",
    "appointment",
    "medicine",
    "therapy",
    "mental",
    "wellness",
    "mindfulness",
    "breathe",
    "calm",
    "peace",
    "balance",
  ],
};

// ===== HELPER FUNCTIONS =====
function escapeHTML(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function truncateText(text, maxLength = 60) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function formatTimestamp(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return "Invalid time";
  }
}

function playAddNeuralSound() {
  // Ensure swipeSound is an audio element and exists
  if (swipeSound && typeof addNeuralSound.play === "function") {
    try {
      // Reset the sound to the beginning and play
      addNeuralSound.currentTime = 0;
      addNeuralSound.play().catch((error) => {
        console.warn("Error playing addNeural sound:", error);
      });
    } catch (error) {
      console.warn("Error playing addNeuralsound:", error);
    }
  }
}

// ===== DATA MANAGEMENT =====
function getDistractions() {
  // Use cache if available to prevent excessive localStorage reads
  if (distractionsCache !== null) {
    return distractionsCache;
  }

  try {
    const distractions = localStorage.getItem("distractions");
    distractionsCache = distractions ? JSON.parse(distractions) : [];
    return distractionsCache;
  } catch (e) {
    console.error("Error reading distractions from localStorage:", e);
    return [];
  }
}

function saveDistractions(distractions) {
  try {
    // Update cache
    distractionsCache = distractions;
    // Save to localStorage
    localStorage.setItem("distractions", JSON.stringify(distractions));
    return true;
  } catch (e) {
    console.error("Error saving distractions to localStorage:", e);
    return false;
  }
}

function updateDistractionProperty(id, property, value) {
  if (!id || !property) return false;

  let distractions = getDistractions();
  const index = distractions.findIndex((d) => d.id === parseInt(id));

  if (index !== -1) {
    distractions[index][property] = value;
    const success = saveDistractions(distractions);

    if (success) {
      // Preserve the current carousel view
      if (carouselInstance && carouselInstance.cards.length > 0) {
        // Find the index of the current card being edited
        const currentCardIndex = carouselInstance.cards.findIndex(
          (card) => parseInt(card.dataset.id) === id
        );

        // Update the carousel to maintain the current card's position
        if (currentCardIndex !== -1) {
          carouselInstance.currentIndex = currentCardIndex;
        }
      }

      // Use targeted update instead of full refresh when possible
      updateSingleDistraction(distractions[index]);

      // Optional: Update both list and carousel views
      refreshUI();

      return true;
    }
  }

  return false;
}

function deleteDistraction(id) {
  if (!id) return false;

  let distractions = getDistractions();
  const index = distractions.findIndex((d) => d.id === parseInt(id));

  if (index !== -1) {
    // Remove the item from the array
    distractions.splice(index, 1);
    const success = saveDistractions(distractions);

    if (success) {
      // Remove element from DOM for better performance than full refresh
      const itemElement = document.querySelector(
        `.distraction-item[data-id="${id}"]`
      );
      if (itemElement) {
        itemElement.classList.add("removing");
        setTimeout(() => {
          itemElement.remove();

          // Check if we need to show "no distractions" message
          const container = document.getElementById(
            "distraction-items-container"
          );
          if (container && distractions.length === 0) {
            showNoDistractions(container);
          }
        }, 300);
      } else {
        // If we can't find the element, do a full refresh
        refreshUI();
      }

      // Update carousel view
      updateCarouselView();

      return true;
    }
  }

  return false;
}

// ===== TARGETED UPDATES =====
function updateSingleDistraction(distraction) {
  // Find existing item in DOM
  const itemElement = document.querySelector(
    `.distraction-item[data-id="${distraction.id}"]`
  );
  if (!itemElement) {
    // If element doesn't exist, do a full refresh
    refreshUI();
    return;
  }

  // Update priority classes
  itemElement.classList.remove(
    "priority-high",
    "priority-normal",
    "priority-low"
  );
  if (distraction.priority) {
    itemElement.classList.add(`priority-${distraction.priority}`);
  }

  // Update timeframe classes
  itemElement.classList.remove("now", "break", "later", "tomorrow");
  if (distraction.timeframe) {
    itemElement.classList.add(distraction.timeframe);
  }

  // Update priority buttons
  const priorityBtns = itemElement.querySelectorAll(".priority-btn");
  priorityBtns.forEach((btn) => {
    btn.classList.toggle(
      "active",
      btn.dataset.priority === distraction.priority
    );
  });

  // Update timeframe selector
  const selectElement = itemElement.querySelector(".delay-select");
  if (selectElement) {
    selectElement.value = distraction.timeframe;
  }
}

function showNoDistractions(container) {
  const emptyMessage = document.createElement("div");
  emptyMessage.className = "no-distractions";
  emptyMessage.textContent = "Neural buffer empty...";
  container.appendChild(emptyMessage);
}

// ===== CATEGORIZATION & MISSION CONVERSION =====
function categorizeText(text) {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  // Check for matches in each category
  for (const keyword of KEYWORDS.CATEGORY_1) {
    if (lowerText.includes(keyword)) return "1.";
  }

  for (const keyword of KEYWORDS.CATEGORY_2) {
    if (lowerText.includes(keyword)) return "2.";
  }

  for (const keyword of KEYWORDS.CATEGORY_3) {
    if (lowerText.includes(keyword)) return "3.";
  }

  return null; // No category match
}

function convertDistractionToMission(id, text) {
  if (!id || !text) {
    console.error("Invalid id or text for conversion");
    return false;
  }

  // Close XP selector if open
  if (typeof closeXPSelector === "function") {
    closeXPSelector();
  }

  const convertCallback = (xpValue) => {
    addMissionFromDistraction(text, xpValue);
    deleteDistraction(id);
    if (typeof playAddMissionSound === "function") {
      playAddMissionSound();
    }
  };

  // Show the XP selector
  if (typeof window.showXPSelector === "function") {
    window.showXPSelector(convertCallback);
  } else {
    console.error("XP Selector not initialized");
  }
}

function addMissionFromDistraction(text, xpValue) {
  if (!text || !xpValue) {
    console.error("Missing text or XP value");
    return false;
  }

  // Ensure sanitizeInput function exists
  if (typeof sanitizeInput !== "function") {
    console.error("sanitizeInput function not found");
    return false;
  }

  // Check for existing category or categorize intelligently
  const hasPrefix = /^[123]\./.test(text);
  const modifiedText = hasPrefix
    ? text
    : categorizeText(text)
    ? `${categorizeText(text)} ${text}`
    : text;

  const sanitizedInput = sanitizeInput(modifiedText);

  // Store original callback
  const tempXpCallback = window.xpSelectorCallback;

  // Create mission with temporary callback
  window.xpSelectorCallback = (xp) => {
    // Restore original callback
    window.xpSelectorCallback = tempXpCallback;

    try {
      // Process the mission text
      const modifiedMission =
        typeof TaskSystem !== "undefined" && TaskSystem.modifyMissionText
          ? TaskSystem.modifyMissionText(sanitizedInput)
          : sanitizedInput;

      const prefix = modifiedMission.match(/^(\d+\.)/)?.[0];
      const prefixClass =
        prefix &&
        typeof TaskSystem !== "undefined" &&
        TaskSystem.getClassForPrefix
          ? TaskSystem.getClassForPrefix(prefix)
          : "prefix-default";

      // Create mission element
      const newEl = document.createElement("li");

      // Set HTML content based on whether we have a category prefix
      if (prefix) {
        newEl.innerHTML = `<span class="${prefixClass}">${
          modifiedMission.split(":")[0]
        }:</span> ${modifiedMission.split(":")[1]} — ${xpValue} XP`;
      } else {
        newEl.innerHTML = `<span class="prefix-default">${modifiedMission}</span> — ${xpValue} XP`;
      }

      // Add necessary attributes and event listeners
      newEl.className = "mission";
      newEl.dataset.xp = xpValue;

      // Add drag functionality if handleDragStart exists
      if (typeof handleDragStart === "function") {
        newEl.draggable = true;
        newEl.addEventListener("dragstart", handleDragStart);
        newEl.addEventListener("dragend", handleDragEnd);
        newEl.addEventListener("dragover", handleDragOver);
        newEl.addEventListener("drop", handleDrop);

        // Add touch events for mobile
        newEl.addEventListener("touchstart", handleTouchStart);
        newEl.addEventListener("touchmove", handleTouchMove);
        newEl.addEventListener("touchend", handleTouchEnd);
      }

      // Set up click handler if available
      if (typeof createMissionClickHandler === "function") {
        createMissionClickHandler(newEl);
      }

      // Add to mission list
      if (typeof missionListEl !== "undefined" && missionListEl) {
        missionListEl.appendChild(newEl);

        // Activate with animation
        setTimeout(() => {
          newEl.classList.add("active");
          if (typeof saveMissions === "function") {
            saveMissions();
          }
        }, 10);
      }
    } catch (e) {
      console.error("Error creating mission from distraction:", e);
    }
  };

  // Execute callback with the XP value
  window.xpSelectorCallback(xpValue);

  // Record in task frequency system
  if (
    typeof TaskSystem !== "undefined" &&
    typeof TaskSystem.recordTask === "function"
  ) {
    TaskSystem.recordTask(modifiedText);
  }

  return true;
}

// ===== UI COMPONENTS =====
function createDistractionItem(distraction, index) {
  if (!distraction || !distraction.id) {
    console.error("Invalid distraction object:", distraction);
    return null;
  }

  const item = document.createElement("div");
  item.className = "distraction-item";
  item.dataset.id = distraction.id;

  // Add classes for priority and timeframe
  if (distraction.priority) {
    item.classList.add(`priority-${distraction.priority}`);
  }

  if (distraction.timeframe) {
    item.classList.add(distraction.timeframe);
  }

  // Create timeframe selector
  const timeframeSelector = createTimeframeSelector(distraction);

  // Format time
  const timeStr = formatTimestamp(distraction.timestamp);

  // Add index display for 3D list effect
  const indexNum = (index + 1).toString().padStart(2, "0");

  // Create truncated text for mobile with full text in data attribute
  const truncatedText = truncateText(distraction.text);
  const isLongText =
    distraction.text && distraction.text.length > truncatedText.length;

  // Build HTML with expandable text for mobile and item number
  item.innerHTML = `
        <div class="distraction-index">${indexNum}</div>
        <div class="distraction-text ${isLongText ? "expandable" : ""}" 
             data-full-text="${escapeHTML(distraction.text)}">
            ${escapeHTML(truncatedText)}
            ${isLongText ? '<span class="expand-text">⤵</span>' : ""}
        </div>
        <div class="distraction-controls">
            <div class="distraction-time">${timeStr}</div>
            <button class="distraction-convert tooltip" data-tooltip="Convert to Mission">⚡</button>
            <div class="priority-controls">
                <button class="priority-btn ${
                  distraction.priority === PRIORITIES.HIGH ? "active" : ""
                }" 
                        data-priority="${
                          PRIORITIES.HIGH
                        }" data-tooltip="High">⬆</button>
                <button class="priority-btn ${
                  distraction.priority === PRIORITIES.NORMAL ? "active" : ""
                }" 
                        data-priority="${
                          PRIORITIES.NORMAL
                        }" data-tooltip="Normal">■</button>
                <button class="priority-btn ${
                  distraction.priority === PRIORITIES.LOW ? "active" : ""
                }" 
                        data-priority="${
                          PRIORITIES.LOW
                        }" data-tooltip="Low">⬇</button>
            </div>
            <button class="distraction-delete tooltip" data-tooltip="Delete">×</button>
        </div>
    `;

  // Add the timeframe selector
  const controlsDiv = item.querySelector(".distraction-controls");
  if (controlsDiv && timeframeSelector) {
    controlsDiv.insertBefore(timeframeSelector, controlsDiv.firstChild);
  }

  // Add event listeners
  setupItemEventListeners(item, distraction);

  return item;
}

function createTimeframeSelector(distraction) {
  if (!distraction) return null;

  const select = document.createElement("select");
  select.className = "delay-select";
  select.innerHTML = `
        <option value="${TIMEFRAMES.NOW}" ${
    distraction.timeframe === TIMEFRAMES.NOW ? "selected" : ""
  }>Now</option>
        <option value="${TIMEFRAMES.BREAK}" ${
    distraction.timeframe === TIMEFRAMES.BREAK ? "selected" : ""
  }>Next Break</option>
        <option value="${TIMEFRAMES.LATER}" ${
    distraction.timeframe === TIMEFRAMES.LATER ? "selected" : ""
  }>Later</option>
        <option value="${TIMEFRAMES.TOMORROW}" ${
    distraction.timeframe === TIMEFRAMES.TOMORROW ? "selected" : ""
  }>Tomorrow</option>
    `;

  select.addEventListener("change", function () {
    updateDistractionProperty(distraction.id, "timeframe", this.value);
  });

  return select;
}

function setupItemEventListeners(item, distraction) {
  if (!item || !distraction) return;

  // Expandable text for mobile
  const textElement = item.querySelector(".distraction-text");
  if (textElement && textElement.classList.contains("expandable")) {
    textElement.addEventListener("click", function () {
      if (this.classList.contains("expanded")) {
        this.textContent = truncateText(distraction.text);
        this.innerHTML += '<span class="expand-text">⤵</span>';
        this.classList.remove("expanded");
      } else {
        this.textContent = this.dataset.fullText;
        this.innerHTML += '<span class="expand-text">⤴</span>';
        this.classList.add("expanded");
      }
    });
  }

  // Delete button
  const deleteBtn = item.querySelector(".distraction-delete");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteDistraction(distraction.id);
    });
  }

  // Convert button
  const convertBtn = item.querySelector(".distraction-convert");
  if (convertBtn) {
    convertBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      convertDistractionToMission(distraction.id, distraction.text);
    });
  }

  // Priority buttons
  const priorityBtns = item.querySelectorAll(".priority-btn");
  priorityBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      updateDistractionProperty(
        distraction.id,
        "priority",
        btn.dataset.priority
      );
    });
  });
}

// ===== MAIN FUNCTIONS =====
function saveDistraction() {
  if (!DOM.input) {
    console.error("Input element not found");
    return false;
  }

  const distractionText = DOM.input.value.trim();
  if (distractionText === "") return false;

  // Create distraction object
  const distraction = {
    id: Date.now(),
    text: distractionText,
    timestamp: new Date().toISOString(),
    priority: PRIORITIES.NORMAL,
    timeframe: TIMEFRAMES.BREAK,
  };

  // Add to localStorage
  const distractions = getDistractions();
  distractions.unshift(distraction); // Add to beginning of array
  const success = saveDistractions(distractions);

  if (success) {
    // Clear input and play sound
    DOM.input.value = "";
    DOM.input.focus();
    playAddNeuralSound();

    // Use incremental update for better performance
    incrementalUIUpdate(distraction);

    return true;
  }

  return false;
}

// Incremental update for better performance
function incrementalUIUpdate(newDistraction) {
  if (!newDistraction) return;

  // Check if list view container exists
  const itemsContainer = document.getElementById("distraction-items-container");

  if (itemsContainer) {
    // Create new item
    const item = createDistractionItem(newDistraction);
    if (item) {
      // Remove empty message if it exists
      const emptyMessage = itemsContainer.querySelector(".no-distractions");
      if (emptyMessage) {
        emptyMessage.remove();
      }

      // Add animation class
      item.classList.add("new-distraction");

      // Add to beginning of list
      itemsContainer.insertBefore(item, itemsContainer.firstChild);

      // Apply filter to ensure it's visible if it should be
      if (
        currentFilter !== FILTERS.ALL &&
        newDistraction.priority !== currentFilter
      ) {
        item.style.display = "none";
      }
    }
  } else {
    // If container doesn't exist, do a full refresh
    renderListView();
  }

  // Update carousel view
  updateCarouselView();
}

// Function to refresh all UI components
function refreshUI() {
  // Update both views, but maintain the current view's state
  if (DOM.carouselView.classList.contains("active")) {
    updateCarouselView();
  } else {
    renderListView();
  }
}

function updateListPerspective() {
  if (!DOM.list) return;

  const scrollPosition = DOM.list.scrollTop;
  const itemsContainer = document.getElementById("distraction-items-container");
  if (!itemsContainer) return;

  const items = itemsContainer.querySelectorAll(".distraction-item");

  items.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const distanceFromCenter = Math.abs(
      rect.top + rect.height / 2 - window.innerHeight / 2
    );
    const maxDistance = window.innerHeight / 2;

    if (distanceFromCenter < maxDistance) {
      // Calculate scale and elevation based on distance from center
      const scale =
        1 + ((maxDistance - distanceFromCenter) / maxDistance) * 0.05;
      const translateZ =
        ((maxDistance - distanceFromCenter) / maxDistance) * 10;

      // Apply transformations
      item.style.transform = `translateZ(${translateZ}px) scale(${scale})`;
      item.style.opacity =
        0.7 + ((maxDistance - distanceFromCenter) / maxDistance) * 0.3;

      // Add a selected class to the most centered item
      if (distanceFromCenter < 50) {
        item.classList.add("selected");
      } else {
        item.classList.remove("selected");
      }
    } else {
      // Reset transformation for items far from center
      item.style.transform = "translateZ(5px) scale(1)";
      item.style.opacity = 0.7;
      item.classList.remove("selected");
    }
  });
}

function renderListView() {
  if (!DOM.list) {
    console.error("List container not found");
    return;
  }

  const distractions = getDistractions();

  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();

  // Create and add filter controls
  const filterContainer = document.createElement("div");
  filterContainer.className = "distraction-filters";
  filterContainer.innerHTML = `
        <button class="filter-btn ${
          currentFilter === FILTERS.ALL ? "active" : ""
        }" 
                data-filter="${FILTERS.ALL}">All</button>
        <button class="filter-btn ${
          currentFilter === FILTERS.HIGH ? "active" : ""
        }" 
                data-filter="${FILTERS.HIGH}">High</button>
        <button class="filter-btn ${
          currentFilter === FILTERS.NORMAL ? "active" : ""
        }" 
                data-filter="${FILTERS.NORMAL}">Normal</button>
        <button class="filter-btn ${
          currentFilter === FILTERS.LOW ? "active" : ""
        }" 
                data-filter="${FILTERS.LOW}">Low</button>
    `;

  // Add single event listener using event delegation
  filterContainer.addEventListener("click", (event) => {
    const btn = event.target.closest(".filter-btn");
    if (!btn) return;

    // Update active class
    filterContainer.querySelectorAll(".filter-btn").forEach((button) => {
      button.classList.remove("active");
    });
    btn.classList.add("active");

    // Set filter and rerender
    currentFilter = btn.dataset.filter;
    applyFilter();
  });

  fragment.appendChild(filterContainer);

  // Create container for items that will be filtered
  const itemsContainer = document.createElement("div");
  itemsContainer.className = "distraction-items-container";
  itemsContainer.id = "distraction-items-container";

  // If no distractions, show empty message
  if (distractions.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "no-distractions";
    emptyMessage.textContent = "Neural buffer empty...";
    itemsContainer.appendChild(emptyMessage);
  } else {
    // Create all distraction items with index for 3D effect
    distractions.forEach((distraction, index) => {
      const item = createDistractionItem(distraction, index);
      if (item) {
        // Add animation class to newest item
        if (index === 0) {
          item.classList.add("new-distraction");
        }

        itemsContainer.appendChild(item);
      }
    });
  }

  fragment.appendChild(itemsContainer);

  // Clear existing list and add the fragment
  DOM.list.innerHTML = "";
  DOM.list.appendChild(fragment);

  // Apply current filter
  applyFilter();

  // Add scroll event for 3D perspective effect
  DOM.list.addEventListener("scroll", updateListPerspective);

  // Initialize perspective effect
  requestAnimationFrame(() => {
    updateListPerspective();
  });
}

function applyFilter() {
  const container = document.getElementById("distraction-items-container");
  if (!container) return;

  const distractions = getDistractions();

  // Get all items
  const items = container.querySelectorAll(".distraction-item");
  let visibleCount = 0;

  // Show/hide based on filter
  items.forEach((item) => {
    const id = parseInt(item.dataset.id);
    const distraction = distractions.find((d) => d.id === id);

    if (!distraction) return;

    if (
      currentFilter === FILTERS.ALL ||
      distraction.priority === currentFilter
    ) {
      item.style.display = "";
      visibleCount++;
    } else {
      item.style.display = "none";
    }
  });

  // If no items visible after filtering, show message
  if (visibleCount === 0 && distractions.length > 0) {
    // Remove existing no-match message if it exists
    const existingMessage = container.querySelector(".no-distractions");
    if (existingMessage) {
      existingMessage.remove();
    }

    const noMatchMessage = document.createElement("div");
    noMatchMessage.className = "no-distractions";
    noMatchMessage.textContent = "No distractions match the current filter";
    container.appendChild(noMatchMessage);
  }
}

function setupHoverBehavior() {
  if (!DOM.container) {
    console.error("Distraction container not found");
    return;
  }

  // Mouse enter - expand after delay
  DOM.container.addEventListener("mouseenter", () => {
    if (collapseTimeout) {
      clearTimeout(collapseTimeout);
      collapseTimeout = null;
    }

    if (!DOM.container.classList.contains("expanded")) {
      expandTimeout = setTimeout(() => {
        DOM.container.classList.add("expanded");
        if (DOM.container.classList.contains("expanded") && DOM.input) {
          DOM.input.focus();
        }
      }, 500);
    }
  });

  // Mouse leave - collapse after delay
  DOM.container.addEventListener("mouseleave", () => {
    if (expandTimeout) {
      clearTimeout(expandTimeout);
      expandTimeout = null;
    }

    if (DOM.container.classList.contains("expanded")) {
      collapseTimeout = setTimeout(() => {
        DOM.container.classList.remove("expanded");
      }, 1000);
    }
  });
}

// ===== 3D CAROUSEL IMPLEMENTATION =====
class DistractionCarousel {
  constructor() {
    this.container = null;
    this.carousel = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.cards = [];
    this.currentIndex = 0;
    this.radius = 250;
    this.theta = 0;
    this.touchStartX = 0;
    this.isInitialized = false;
    this.rotationDirection = 0; // Track rotation direction for smoother transitions
    this.scrollThreshold = 0; // To track scroll wheel movement
  }

  initialize(container) {
    if (!container) {
      console.error("Carousel container is null");
      return;
    }

    this.container = container;
    this.carousel = container.querySelector(".carousel");

    if (!this.carousel) {
      console.error("Carousel element not found");
      return;
    }

    // Set up navigation buttons
    this.prevBtn = container.querySelector(".prev-btn");
    this.nextBtn = container.querySelector(".next-btn");

    if (this.prevBtn && this.nextBtn) {
      // Bind events
      this.prevBtn.addEventListener("click", () => this.rotateCarousel("prev"));
      this.nextBtn.addEventListener("click", () => this.rotateCarousel("next"));
    }

    // Add scroll wheel support to the entire carousel container
    // This ensures interaction works anywhere in the carousel area
    const carouselContainer = container.querySelector(".carousel-container");
    if (carouselContainer) {
      carouselContainer.addEventListener(
        "wheel",
        (e) => {
          // Only prevent default and handle scroll if mouse is over the carousel
          if (this.isMouseOverCarousel(e)) {
            e.preventDefault(); // Prevent page scrolling
            this.handleScrollWheel(e);
          }
        },
        { passive: false }
      );
    }

    // Add touch/swipe support
    this.carousel.addEventListener(
      "touchstart",
      (e) => {
        this.touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );

    this.carousel.addEventListener(
      "touchend",
      (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diffX = this.touchStartX - touchEndX;

        if (Math.abs(diffX) > 50) {
          // Only register as swipe if movement is significant
          if (diffX > 0) {
            this.rotateCarousel("next");
          } else {
            this.rotateCarousel("prev");
          }
        }
      },
      { passive: true }
    );

    this.isInitialized = true;
  }

  // New method to check if mouse is over the carousel
  isMouseOverCarousel(event) {
    const carouselContainer = event.currentTarget;
    const rect = carouselContainer.getBoundingClientRect();

    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  handleScrollWheel(e) {
    // Accumulate scroll delta
    this.scrollThreshold += e.deltaY;

    // Use a threshold to prevent too-frequent rotations
    const rotationThreshold = 100; // Adjust this value to control scroll sensitivity

    if (Math.abs(this.scrollThreshold) >= rotationThreshold) {
      // Determine rotation direction based on scroll direction
      const direction = this.scrollThreshold > 0 ? "next" : "prev";

      // Rotate carousel
      this.rotateCarousel(direction);

      // Reset scroll threshold
      this.scrollThreshold = 0;
    }
  }

  // Update the carousel with distractions
  updateCards(distractions) {
    if (!this.isInitialized || !this.carousel) {
      console.error("Carousel not initialized");
      return;
    }

    // Only update if the carousel is currently visible
    const carouselView = this.container.closest(".carousel-view");
    if (carouselView && !carouselView.classList.contains("active")) {
      return;
    }

    // Clear existing cards
    this.carousel.innerHTML = "";
    this.cards = [];

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    // Create a card for each distraction
    distractions.forEach((distraction) => {
      const card = this.createCard(distraction);
      if (card) {
        fragment.appendChild(card);
        this.cards.push(card);
      }
    });

    if (this.cards.length === 0) {
      // If no cards, show a message
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "no-distractions";
      emptyMessage.textContent = "Neural buffer empty...";
      emptyMessage.style.position = "absolute";
      emptyMessage.style.top = "50%";
      emptyMessage.style.left = "50%";
      emptyMessage.style.transform = "translate(-50%, -50%)";
      fragment.appendChild(emptyMessage);
    } else {
      // Set carousel parameters based on number of cards
      this.theta = 360 / this.cards.length;
      this.radius = Math.max(250, Math.min(400, this.cards.length * 40)); // Adjust radius based on number of cards
    }

    // Add all the cards at once
    this.carousel.appendChild(fragment);

    // Reset current index
    this.currentIndex = 0;

    // Position cards in a circle
    this.arrangeCards();

    // Activate the front card
    this.updateActiveCard();
  }

  createCard(distraction) {
    if (!distraction || !distraction.id) {
      console.error("Invalid distraction object for card creation");
      return null;
    }

    const card = document.createElement("div");
    card.className = `distraction-card priority-${distraction.priority} ${distraction.timeframe}`;
    card.dataset.id = distraction.id;

    let timeframeName =
      distraction.timeframe === TIMEFRAMES.NOW
        ? "Now"
        : distraction.timeframe === TIMEFRAMES.BREAK
        ? "Next Break"
        : distraction.timeframe === TIMEFRAMES.LATER
        ? "Later Today"
        : "Tomorrow";

    // Format timestamp
    const timestamp = distraction.timestamp
      ? new Date(distraction.timestamp)
      : new Date();
    const timeStr = formatTimestamp(timestamp);

    // Create card content with edit capability
    card.innerHTML = `
            <div class="timeframe-badge">${timeframeName}</div>
            <div class="distraction-card-text" contenteditable="false">${escapeHTML(
              distraction.text
            )}</div>
            <div class="distraction-card-footer">
                <div class="distraction-card-time">${timeStr}</div>
                <div class="distraction-card-actions">
                    <button class="distraction-edit tooltip" data-tooltip="Edit Note">✎</button>
                    <button class="distraction-convert tooltip" data-tooltip="Convert to Mission">⚡</button>
                    <button class="distraction-delete tooltip" data-tooltip="Delete">×</button>
                </div>
            </div>
        `;

    // Edit functionality
    const textElement = card.querySelector(".distraction-card-text");
    const editButton = card.querySelector(".distraction-edit");

    // Store original text for cancel functionality
    let originalText = distraction.text;
    let isEditing = false;

    // Function to enter edit mode
    const enterEditMode = () => {
      if (isEditing) return;

      isEditing = true;
      textElement.contentEditable = true;
      textElement.focus();
      textElement.classList.add("editing");

      // Select all text when entering edit mode
      const range = document.createRange();
      range.selectNodeContents(textElement);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    };

    // Function to exit edit mode and save
    const exitEditMode = (save = true) => {
      if (!isEditing) return;

      const newText = textElement.textContent.trim();

      if (save && newText && newText !== originalText) {
        // Update the distraction in localStorage
        updateDistractionProperty(distraction.id, "text", newText);

        // Optional: Play a subtle sound to indicate save
        if (typeof playAddNeuralSound === "function") {
          playAddNeuralSound();
        }

        // Update original text
        originalText = newText;
      } else if (!save) {
        // Revert to original text
        textElement.textContent = originalText;
      }

      // Exit edit mode
      isEditing = false;
      textElement.contentEditable = false;
      textElement.classList.remove("editing");
    };

    // Edit button click handler
    editButton.addEventListener("click", enterEditMode);

    // Add keyboard event listeners
    textElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent new line
        exitEditMode(true); // Save changes
      } else if (e.key === "Escape") {
        exitEditMode(false); // Cancel changes
      }
    });

    // Blur event to save changes when focus is lost
    textElement.addEventListener("blur", () => {
      if (isEditing) {
        exitEditMode(true);
      }
    });

    // Add event listeners for other actions
    card
      .querySelector(".distraction-convert")
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        convertDistractionToMission(distraction.id, distraction.text);
      });

    card
      .querySelector(".distraction-delete")
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteDistraction(distraction.id);
      });

    return card;
  }

  // Enhanced card arrangement with more pronounced 3D effect
  // Updated arrangeCards() method that preserves original card styling and glow
  // while showing adjacent cards

  arrangeCards() {
    if (!this.cards.length || !this.carousel) return;

    const totalCards = this.cards.length;
    this.theta = 360 / totalCards;

    // Use a smaller offset to keep cards closer together
    const cardOffset = 60; // Horizontal distance between cards

    requestAnimationFrame(() => {
      this.cards.forEach((card, index) => {
        // Calculate position relative to current card
        const indexDiff = index - this.currentIndex;

        // Handle wrap-around for a circular carousel
        const wrappedDiff =
          indexDiff < -Math.floor(totalCards / 2)
            ? indexDiff + totalCards
            : indexDiff > Math.floor(totalCards / 2)
            ? indexDiff - totalCards
            : indexDiff;

        // Calculate horizontal position based on distance from current card
        const xPos = wrappedDiff * cardOffset;

        // Calculate z-index and opacity based on distance from current
        const distance = Math.abs(wrappedDiff);
        const zIndex = 100 - distance * 10;

        // Ensure center card is fully opaque (1)
        // and side cards are more transparent (max 0.7)
        const opacity =
          distance === 0 ? 1 : Math.max(0.3, 0.7 - distance * 0.15);

        // Scale down cards that aren't current
        const scale = distance === 0 ? 1 : 0.85 - distance * 0.05;

        // Apply rotation for a subtle 3D effect
        const rotation = wrappedDiff * 5; // Degrees

        // Apply all transformations
        card.style.transform = `
                translateX(${xPos}px)
                translateZ(${-distance * 20}px)
                rotateY(${rotation}deg)
                scale(${scale})
            `;

        // Set opacity and z-index
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;

        // Add/remove active class without manually changing box-shadow
        // This preserves your original styling/glow from CSS
        if (index === this.currentIndex) {
          card.classList.add("active");
        } else {
          card.classList.remove("active");
        }
      });
    });
  }

  // Enhanced rotation method
  rotateCarousel(direction) {
    if (this.cards.length <= 1) return;

    // Determine rotation direction
    this.rotationDirection = direction === "next" ? 1 : -1;

    // Update current index with wrap-around
    this.currentIndex =
      (this.currentIndex + this.rotationDirection + this.cards.length) %
      this.cards.length;

    // Rearrange cards with smooth transition
    this.arrangeCards();

    // Play slide sound
    this.playRotationFeedback();
  }

  playRotationFeedback() {
    // Ensure swipeSound is an audio element and exists
    if (swipeSound && typeof swipeSound.play === "function") {
      try {
        // Reset the sound to the beginning
        swipeSound.currentTime = 0;

        // Set the volume to a lower level (0.3 = 30% volume)
        // You can adjust this value between 0.0 (silent) and 1.0 (full volume)
        swipeSound.volume = 0.4;

        // Play the sound
        swipeSound.play().catch((error) => {
          console.warn("Error playing swipe sound:", error);
        });
      } catch (error) {
        console.warn("Error playing swipe sound:", error);
      }
    }
  }

  // Enhanced touch/swipe handling
  setupTouchHandling() {
    let startX = 0;
    let endX = 0;

    this.carousel.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
      },
      { passive: true }
    );

    this.carousel.addEventListener(
      "touchend",
      (e) => {
        endX = e.changedTouches[0].clientX;
        const swipeDistance = startX - endX;

        // More forgiving swipe threshold
        if (Math.abs(swipeDistance) > 50) {
          this.rotateCarousel(swipeDistance > 0 ? "next" : "prev");
        }
      },
      { passive: true }
    );
  }

  // Update which card is active
  updateActiveCard() {
    this.cards.forEach((card, index) => {
      if (index === this.currentIndex) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });
  }
}

// Create singleton carousel instance
const carouselInstance = new DistractionCarousel();

// Function to update the carousel view
function updateCarouselView() {
  // Make sure carousel view exists
  if (!DOM.carouselView) return;

  // If this is the active view, update the carousel
  if (DOM.carouselView.classList.contains("active")) {
    carouselInstance.updateCards(getDistractions());
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Toggle container expansion on header click
  if (DOM.header) {
    DOM.header.addEventListener("click", () => {
      if (DOM.container) {
        DOM.container.classList.toggle("expanded");
        if (DOM.container.classList.contains("expanded") && DOM.input) {
          DOM.input.focus();
        }
      }
    });
  }

  if (
    DOM.listViewBtn &&
    DOM.carouselViewBtn &&
    DOM.carouselView &&
    DOM.listView
  ) {
    DOM.listViewBtn.addEventListener("click", () => {
      DOM.listViewBtn.classList.add("active");
      DOM.carouselViewBtn.classList.remove("active");
      DOM.carouselView.classList.remove("active");
      DOM.listView.classList.add("active");

      // Render list view
      renderListView();
    });

    DOM.carouselViewBtn.addEventListener("click", () => {
      DOM.carouselViewBtn.classList.add("active");
      DOM.listViewBtn.classList.remove("active");
      DOM.carouselView.classList.add("active");
      DOM.listView.classList.remove("active");

      // Update carousel when switched to
      carouselInstance.updateCards(getDistractions());
    });
  }

  // Save distraction on button click
  if (DOM.saveButton) {
    DOM.saveButton.addEventListener("click", saveDistraction);
  }

  // Save on Enter key
  if (DOM.input) {
    DOM.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveDistraction();
      }
    });
  }

  // Clear all distractions
  if (DOM.clearButton) {
    DOM.clearButton.addEventListener("click", () => {
      if (confirm("Clear neural buffer? This action cannot be undone.")) {
        localStorage.removeItem("distractions");
        distractionsCache = []; // Clear cache
        refreshUI();
        if (typeof playResetDataSound === "function") {
          playResetDataSound();
        }
      }
    });
  }

  // View toggle functionality (list/carousel)
  const listViewBtn = document.querySelector(".list-view-btn");
  const carouselViewBtn = document.querySelector(".carousel-view-btn");

  if (listViewBtn && carouselViewBtn && DOM.carouselView && DOM.listView) {
    listViewBtn.addEventListener("click", () => {
      listViewBtn.classList.add("active");
      carouselViewBtn.classList.remove("active");
      DOM.carouselView.classList.remove("active");
      DOM.listView.classList.add("active");
    });

    carouselViewBtn.addEventListener("click", () => {
      carouselViewBtn.classList.add("active");
      listViewBtn.classList.remove("active");
      DOM.carouselView.classList.add("active");
      DOM.listView.classList.remove("active");

      // Initialize and update carousel when switched to
      if (!carouselInstance.isInitialized) {
        carouselInstance.initialize(DOM.carouselView);
      }
      carouselInstance.updateCards(getDistractions());
    });
  }

  // Add keyboard navigation for carousel
  document.addEventListener("keydown", (e) => {
    // Skip if input has focus or carousel isn't visible
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (!DOM.carouselView || !DOM.carouselView.classList.contains("active"))
      return;

    if (e.key === "ArrowLeft") carouselInstance.rotateCarousel("prev");
    if (e.key === "ArrowRight") carouselInstance.rotateCarousel("next");
  });
}

// ===== INITIALIZATION =====
function createDOMStructure() {
  // Create main container
  const container = document.createElement("div");
  container.id = "distraction-capture-container";
  container.className = "distraction-capture-container";

  // Create header and input section
  container.innerHTML = `
        <div class="distraction-header">
            <h3>Neural Buffer</h3>
            <div class="distraction-subtitle">Capture distracting thoughts here</div>
        </div>
        <div class="distraction-input-section">
            <input type="text" id="distractionInput" placeholder="Enter distracting thought...">
            <button id="saveDistraction">Buffer</button>
        </div>
           <div class="view-toggle">
        <button class="view-btn list-view-btn">List View</button>
        <button class="view-btn carousel-view-btn active">3D View</button>
    </div>
    <div class="view-container">
        <div class="list-view" id="distractionsList"></div>
        <div class="carousel-view active">
            <div class="carousel-container">
                <div class="carousel"></div>
                <div class="carousel-navigation">
                    <button class="prev-btn">←</button>
                    <button class="next-btn">→</button>
                </div>
            </div>
        </div>
    </div>
`;

  // Find a suitable place to insert the container
  const targetElement = document.querySelector(".missions-grid");
  if (targetElement) {
    targetElement.parentNode.insertBefore(container, targetElement.nextSibling);
    return container;
  }

  // Fallback - append to body
  document.body.appendChild(container);
  return container;
}

// Add this to your initDistractionSystem function to initialize the view toggle
function initDistractionSystem() {
  // Get existing elements
  const container = document.getElementById("distraction-capture-container");

  if (!container) {
    console.error("Distraction container not found");
    return;
  }

  // Set up DOM references
  DOM.container = container;
  DOM.header = container.querySelector(".distraction-header");
  DOM.input = container.querySelector("#distractionInput");
  DOM.saveButton = container.querySelector("#saveDistraction");
  DOM.list = container.querySelector("#distractionsList");
  DOM.clearButton = container.querySelector("#clearAllDistractions");

  // Add new view toggle references
  DOM.viewToggle = container.querySelector(".view-toggle");
  DOM.listViewBtn = container.querySelector(".list-view-btn");
  DOM.carouselViewBtn = container.querySelector(".carousel-view-btn");
  DOM.listView = container.querySelector(".list-view");
  DOM.carouselView = container.querySelector(".carousel-view");

  // Set up event listeners
  setupEventListeners();

  // Initialize the carousel
  carouselInstance.initialize(DOM.carouselView);

  // Render initial view as 3D Carousel
  carouselInstance.updateCards(getDistractions());

  // Ensure carousel view is active
  DOM.listView.classList.remove("active");
  DOM.carouselView.classList.add("active");
  DOM.listViewBtn.classList.remove("active");
  DOM.carouselViewBtn.classList.add("active");

  // Set up hover behavior for desktop
  setupHoverBehavior();

  console.log("Distraction Capture System initialized");
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Short delay to ensure other scripts have loaded
  setTimeout(initDistractionSystem, 500);
  updateWrapButtonHUD(); // Update HUD on page load
});
// ========================================
// DAILY WRAP SYSTEM - SPOTIFY WRAPPED STYLE
// ========================================

// #1 Track completed tasks
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function trackDailyTask(taskDetails) {
  const todayKey = getTodayKey();
  const dailyTasksKey = `dailyTasks_${todayKey}`;

  let todayTasks = JSON.parse(localStorage.getItem(dailyTasksKey)) || [];

  // Use centralized category detection
  const categoryKey = getCategoryKeyFromTitle(taskDetails.title);

  todayTasks.push({
    ...taskDetails,
    category: categoryKey,
  });

  localStorage.setItem(dailyTasksKey, JSON.stringify(todayTasks));
}

// Finds the most-repeated non-trivial word across a set of capture texts
function analyzeCaptures(captures) {
  if (!captures || captures.length === 0) return null;
  const stopWords = new Set([
    'the','a','an','i','to','for','of','and','or','is','it','in','on','at',
    'my','me','we','be','do','this','that','with','just','but','not','so',
    'up','as','by','if','no','go','get','out','how','about','need','want',
    'check','look','fix','think','make','use','was','have','had','are','were','its','will',
  ]);
  const wordCounts = {};
  captures.forEach((c) => {
    (c.text || '').toLowerCase().split(/\s+/).forEach((w) => {
      const clean = w.replace(/[^a-z]/g, '');
      if (clean.length > 2 && !stopWords.has(clean)) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    });
  });
  const top = Object.entries(wordCounts)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}

// #2 Generate Daily Wrap Summary
function generateDailyWrap() {
  const todayKey = getTodayKey();
  const dailyTasksKey = `dailyTasks_${todayKey}`;
  const todayTasks = JSON.parse(localStorage.getItem(dailyTasksKey)) || [];

  const currentXp = parseInt(localStorage.getItem("currentXp")) || 0;
  const currentLevel = parseInt(localStorage.getItem("currentLevel")) || 1;

  const totalXP = todayTasks.reduce((sum, task) => sum + task.xp, 0);
  const totalTasks = todayTasks.length;

  // Dynamically build category breakdown from CATEGORY_CONFIG
  const categoryBreakdown = {};
  Object.keys(CATEGORY_CONFIG).forEach((key) => {
    categoryBreakdown[key] = todayTasks.filter(
      (t) => t.category === key
    ).length;
  });

  const topTask =
    todayTasks.length > 0 ? todayTasks.sort((a, b) => b.xp - a.xp)[0] : null;

  // Find most productive hour
  const hourCounts = {};
  todayTasks.forEach((task) => {
    const hour = new Date(task.completedAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakHour =
    Object.keys(hourCounts).length > 0
      ? Object.keys(hourCounts).reduce(
          (a, b) => (hourCounts[a] > hourCounts[b] ? a : b),
          0
        )
      : 12;

  // Dominant category (what you focused on most)
  const dominantCategory = Object.entries(categoryBreakdown).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  // Build categoryInfo dynamically from CATEGORY_CONFIG
  const categoryInfo = {};
  Object.keys(CATEGORY_CONFIG).forEach((key) => {
    const config = CATEGORY_CONFIG[key];
    categoryInfo[key] = {
      name: config.title,
      shortName: config.shortName,
      emoji: config.emoji,
      description: config.description,
    };
  });

  let insight = "";
  if (totalTasks === 0) {
    insight = "Tomorrow is yours to conquer. Ready to make it legendary?";
  } else if (totalTasks < 3) {
    insight = "Quality over quantity. You're building unstoppable momentum.";
  } else if (totalTasks < 7) {
    insight = "Solid productivity. You're in the zone!";
  } else if (totalTasks < 12) {
    insight = "Peak performance unlocked. You're operating like a machine.";
  } else {
    insight = "Legendary status achieved. You're rewriting what's possible!";
  }

  // Neural capture analysis: filter distractions saved today
  const allDistractions = JSON.parse(localStorage.getItem("distractions")) || [];
  const todayCaptures = allDistractions.filter(
    (d) => d.timestamp && d.timestamp.startsWith(todayKey)
  );
  const captureCount = todayCaptures.length;
  const captureTheme = analyzeCaptures(todayCaptures);

  return {
    todayTasks,
    currentXp,
    currentLevel,
    totalXP,
    totalTasks,
    categoryBreakdown,
    topTask,
    peakHour,
    dominantCategory,
    categoryInfo,
    insight,
    captureCount,
    captureTheme,
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

// #3 WRAPPED SLIDES RENDERER
function showDailyWrap() {
  const wrapData = generateDailyWrap();
  let currentSlide = 0;
  let autoAdvanceTimer = null;

  // Create fullscreen modal
  const modal = document.createElement("div");
  modal.id = "wrappedModal";
  modal.className = "wrapped-fullscreen";
  document.body.appendChild(modal);

  // Calculate all variables BEFORE slides array
  const peakHourDisplay =
    wrapData.peakHour > 12
      ? wrapData.peakHour - 12 + "PM"
      : wrapData.peakHour == 0
      ? "12AM"
      : wrapData.peakHour + "AM";

  const peakHourCount = wrapData.todayTasks.filter(
    (task) =>
      new Date(task.completedAt).getHours() === parseInt(wrapData.peakHour)
  ).length;

  const dominantCatInfo = wrapData.categoryInfo[wrapData.dominantCategory];

  const slides = [
    // Slide 0: Opening - Clean Terminal Boot
    {
      gradient: "linear-gradient(135deg, #000000 0%, #001529 100%)",
      content: `
      <div class="wrapped-slide-content cyber-boot">
        <div class="scan-grid"></div>
        <div class="wrapped-emoji">🎯</div>
        <h1 class="wrapped-title cyber-text">MISSION REPORT</h1>
        <p class="wrapped-subtitle">${wrapData.date}</p>
        <div class="cyber-line-horizontal"></div>
      </div>
    `,
    },
    // Slide 1: Total Missions - Ocean Blue
    {
      gradient:
        "linear-gradient(135deg, #000814 0%, #001d3d 50%, #003566 100%)",
      content: `
      <div class="wrapped-slide-content">
        <div class="wrapped-big-number count-up cyber-glow-cyan">${
          wrapData.totalTasks
        }</div>
        <h2 class="wrapped-stat-label">MISSIONS COMPLETED</h2>
        <p class="wrapped-stat-detail">NEURAL UPTIME: ${Math.round(
          wrapData.totalTasks * 15
        )} MINUTES</p>
        <div class="hud-corner top-left"></div>
        <div class="hud-corner top-right"></div>
        <div class="hud-corner bottom-left"></div>
        <div class="hud-corner bottom-right"></div>
      </div>
    `,
    },
    // Slide 2: XP Earned - Emerald Success
    {
      gradient:
        "linear-gradient(135deg, #001a0d 0%, #003d1f 50%, #00563f 100%)",
      content: `
      <div class="wrapped-slide-content">
        <div class="wrapped-big-number count-up cyber-glow-emerald">${
          wrapData.totalXP
        }</div>
        <h2 class="wrapped-stat-label">XP EARNED</h2>
        <p class="wrapped-stat-detail">LEVEL ${wrapData.currentLevel} • ${
        wrapData.currentXp
      } XP CACHED</p>
        <div class="progress-bar-wrapper">
          <div class="progress-bar" style="width: ${
            wrapData.currentXp % 100
          }%"></div>
        </div>
      </div>
    `,
    },
    // Slide 3: Peak Performance - Cyan Glow
    ...(wrapData.totalTasks > 0
      ? [
          {
            gradient:
              "linear-gradient(135deg, #001219 0%, #005f73 50%, #0a9396 100%)",
            content: `
      <div class="wrapped-slide-content">
        <div class="wrapped-big-number count-up cyber-glow-cyan">${peakHourDisplay}</div>
        <h2 class="wrapped-stat-label">PEAK NEURAL ACTIVITY</h2>
        <p class="wrapped-stat-detail">${peakHourCount} MISSIONS EXECUTED IN OPTIMAL WINDOW</p>
        <div class="neural-pulse-indicator"></div>
      </div>
    `,
          },
        ]
      : []),
    // Slide 4: Dominant Category - Cool Blue Gradient
    ...(wrapData.totalTasks > 0
      ? [
          {
            gradient:
              "linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)",
            content: `
      <div class="wrapped-slide-content">
        <div class="wrapped-category-icon-large">${dominantCatInfo.emoji}</div>
        <h2 class="wrapped-stat-label">PRIMARY OBJECTIVE</h2>
        <div class="count-up wrapped-big-text cyber-glow-white">${
          dominantCatInfo.name
        }</div>
        <p class="wrapped-stat-detail">${
          wrapData.categoryBreakdown[wrapData.dominantCategory]
        } MISSIONS • ${dominantCatInfo.description}</p>
        <div class="objective-scanner"></div>
      </div>
    `,
          },
        ]
      : []),
    // Slide 5: Category Breakdown - Dark with Accents
    ...(wrapData.totalTasks > 0
      ? [
          {
            gradient:
              "linear-gradient(135deg, #000000 0%, #001219 50%, #001a1f 100%)",
            content: `
      <div class="wrapped-slide-content">
        <h2 class="wrapped-stat-label">OBJECTIVE DISTRIBUTION</h2>
        <div class="wrapped-category-grid-cyber">
          ${Object.keys(CATEGORY_CONFIG)
            .filter((key) => wrapData.categoryBreakdown[key] > 0)
            .map((key) => {
              const config = CATEGORY_CONFIG[key];
              return `
                <div class="wrapped-category-item-cyber">
                  <div class="category-header">
                    <div class="wrapped-category-emoji">${config.emoji}</div>
                    <div class="wrapped-category-count cyber-count">${
                      wrapData.categoryBreakdown[key]
                    }</div>
                  </div>
                  <div class="wrapped-category-name">${config.shortName}</div>
                  <div class="category-progress">
                    <div class="category-bar" style="width: ${
                      (wrapData.categoryBreakdown[key] / wrapData.totalTasks) *
                      100
                    }%"></div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `,
          },
        ]
      : []),
    // Slide 6: Top Mission - Teal Accent
    ...(wrapData.topTask
      ? [
          {
            gradient:
              "linear-gradient(135deg, #001219 0%, #004d5a 50%, #007991 100%)",
            content: `
      <div class="wrapped-slide-content">
        <div class="wrapped-emoji">👑</div>
        <h2 class="wrapped-stat-label">HIGHEST VALUE TARGET</h2>
        <div class="wrapped-top-task-cyber">
          <p class="mission-text">${wrapData.topTask.title}</p>
          <div class="wrapped-xp-badge-cyber">${wrapData.topTask.xp} XP</div>
        </div>
        <div class="achievement-glow"></div>
      </div>
    `,
          },
        ]
      : []),
    // Neural Capture Slide (only shown when the user buffered distractions today)
    ...(wrapData.captureCount > 0
      ? [
          {
            gradient:
              "linear-gradient(135deg, #0d0d0d 0%, #1a0d2e 50%, #2d1654 100%)",
            content: `
      <div class="wrapped-slide-content">
        <div class="wrapped-emoji">🧠</div>
        <div class="wrapped-big-number count-up cyber-glow-cyan">${wrapData.captureCount}</div>
        <h2 class="wrapped-stat-label">NEURAL CAPTURES BUFFERED</h2>
        <p class="wrapped-stat-detail">${
          wrapData.captureTheme
            ? `RECURRING SIGNAL DETECTED: "${wrapData.captureTheme.toUpperCase()}" — consider converting to a mission`
            : "Your capture buffer kept you focused. Any worth converting to a mission?"
        }</p>
        <div class="hud-corner top-left"></div>
        <div class="hud-corner top-right"></div>
        <div class="hud-corner bottom-left"></div>
        <div class="hud-corner bottom-right"></div>
      </div>
    `,
          },
        ]
      : []),
    // Final Slide: Summary - Multi-gradient Spectrum
    {
      gradient:
        "linear-gradient(135deg, #000814 0%, #001d3d 20%, #001a0d 40%, #003d1f 60%, #001219 80%, #005f73 100%)",
      content: `
      <div class="wrapped-slide-content wrapped-final">
        <div class="wrapped-emoji">🚀</div>
        <h1 class="wrapped-title cyber-text-final">${wrapData.insight}</h1>
        <div class="wrapped-final-stats-cyber">
          <div class="wrapped-final-stat">
            <span class="wrapped-final-number cyber-glow-cyan">${wrapData.totalTasks}</span>
            <span class="wrapped-final-label">MISSIONS</span>
          </div>
          <div class="wrapped-final-stat">
            <span class="wrapped-final-number cyber-glow-emerald">${wrapData.totalXP}</span>
            <span class="wrapped-final-label">XP</span>
          </div>
          <div class="wrapped-final-stat">
            <span class="wrapped-final-number cyber-glow-blue">${wrapData.currentLevel}</span>
            <span class="wrapped-final-label">LEVEL</span>
          </div>
        </div>
        <div class="wrapped-actions">
          <button id="wrappedResetBtn" class="wrapped-btn wrapped-btn-primary-cyber">
            RESET FOR TOMORROW →
          </button>
          <button id="wrappedContinueBtn" class="wrapped-btn wrapped-btn-secondary-cyber">
            CONTINUE MISSION
          </button>
        </div>
        <div class="terminal-footer">NEURAL LINK STABLE • UPLINK MAINTAINED</div>
      </div>
    `,
    },
  ];

  function renderSlide(index) {
    const slide = slides[index];
    modal.style.background = slide.gradient;
    modal.innerHTML = `
      <div class="wrapped-slide wrapped-slide-active">
        ${slide.content}
        ${
          index < slides.length - 1
            ? `
          <div class="wrapped-progress">
            <p class="wrapped-progress-text">Auto-advancing in 5s • Tap to continue</p>
            <div class="wrapped-dots">
              ${slides
                .map(
                  (_, i) => `
                <div class="wrapped-dot ${i === index ? "active" : ""}"></div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;

    if (index === slides.length - 1) {
      document
        .getElementById("wrappedResetBtn")
        ?.addEventListener("click", () => {
          resetDayAndXP();
          closeWrapped();
        });
      document
        .getElementById("wrappedContinueBtn")
        ?.addEventListener("click", closeWrapped);
    }
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      renderSlide(currentSlide);
      if (currentSlide < slides.length - 1) {
        startAutoAdvance();
      }
    }
  }

  function startAutoAdvance() {
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = setTimeout(nextSlide, 5000);
  }

  function closeWrapped() {
    if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    modal.classList.add("wrapped-exit");
    setTimeout(() => modal.remove(), 300);
  }

  modal.addEventListener("click", (e) => {
    if (!e.target.closest(".wrapped-btn")) {
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      nextSlide();
    }
  });

  renderSlide(0);
  startAutoAdvance();

  if (typeof levelUpSound !== "undefined" && levelUpSound) {
    levelUpSound.currentTime = 0;
    levelUpSound.play().catch(() => {});
  }
}

// #4 Reset Day and XP
function resetDayAndXP() {
  const todayKey = getTodayKey();
  const dailyTasksKey = `dailyTasks_${todayKey}`;
  const archiveKey = `archive_${todayKey}`;

  const todayTasks = localStorage.getItem(dailyTasksKey);
  if (todayTasks) {
    localStorage.setItem(archiveKey, todayTasks);
  }

  localStorage.removeItem(dailyTasksKey);
  localStorage.setItem("currentXp", 0);
  localStorage.setItem("currentLevel", 1);

  const xpMeterEl = document.getElementById("xp-meter");
  if (xpMeterEl) {
    xpMeterEl.dataset.xp = 0;
    updateXpMeter(0);
  }

  showResetConfirmation();

  if (typeof initializingSound !== "undefined" && initializingSound) {
    initializingSound.currentTime = 0;
    initializingSound.play().catch(() => {});
  }
}

// #5 Show reset confirmation
function showResetConfirmation() {
  const messageEl = document.createElement("div");
  messageEl.className = "daily-reset-message";
  messageEl.innerHTML = `
    <div class="reset-message-content">
      <div class="reset-icon">↻</div>
      <div class="reset-text">
        <strong>New day initialized</strong>
        <p>Level reset to 1. Ready for fresh missions.</p>
      </div>
    </div>
  `;

  document.body.appendChild(messageEl);
  setTimeout(() => messageEl.classList.add("show"), 10);
  setTimeout(() => {
    messageEl.classList.remove("show");
    setTimeout(() => messageEl.remove(), 300);
  }, 3000);
}

// #6 Initialize Daily Wrap Button
const dailyWrapButton = document.getElementById("dailyWrapButton");
if (dailyWrapButton) {
  dailyWrapButton.addEventListener("click", showDailyWrap);
}

// Update the HUD stats in real-time
function updateWrapButtonHUD() {
  const todayKey = getTodayKey();
  const dailyTasksKey = `dailyTasks_${todayKey}`;
  const todayTasks = JSON.parse(localStorage.getItem(dailyTasksKey)) || [];

  const totalXP = todayTasks.reduce((sum, task) => sum + task.xp, 0);
  const totalTasks = todayTasks.length;
  const currentLevel = parseInt(localStorage.getItem("currentLevel")) || 1;

  // Update HUD values
  const hudTodayTasks = document.getElementById("hudTodayTasks");
  const hudTodayXP = document.getElementById("hudTodayXP");
  const hudCurrentLevel = document.getElementById("hudCurrentLevel");

  if (hudTodayTasks) hudTodayTasks.textContent = totalTasks;
  if (hudTodayXP) hudTodayXP.textContent = totalXP;
  if (hudCurrentLevel) hudCurrentLevel.textContent = currentLevel;
}

// Call this function whenever a mission is completed
// Add this line to your mission completion handler (createMissionClickHandler function)
// Right after: trackDailyTask(taskDetails);
// Add: updateWrapButtonHUD();

// ========================================
// END OF DAILY WRAP SYSTEM
// ========================================

// Export functions for global access
window.DistractionSystem = {
  init: initDistractionSystem,
  save: saveDistraction,
  convert: convertDistractionToMission,
  clear: () => {
    localStorage.removeItem("distractions");
    distractionsCache = [];
    refreshUI();
  },
};

// ========================================
// KEYBOARD SHORTCUTS
// Single-key shortcuts active only when no input/textarea has focus.
// c → focus neural capture input
// r → fire ready signal (if available)
// Esc → dismiss any open overlay
// ========================================
document.addEventListener("keydown", (e) => {
  // Never intercept when the user is typing
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  // Don't intercept modified keys (Ctrl/Meta/Alt combos) to avoid browser conflicts
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === "c" || e.key === "C") {
    e.preventDefault();
    const captureInput = document.getElementById("distractionInput");
    if (captureInput) captureInput.focus();
  }

  if (e.key === "r" || e.key === "R") {
    e.preventDefault();
    const btn = document.getElementById("readyButton");
    if (btn && !btn.disabled) btn.click();
  }

  if (e.key === "t" || e.key === "T") {
    e.preventDefault();
    if (typeof window.togglePomodoroTimer === "function") window.togglePomodoroTimer();
  }

  if (e.key === "a" || e.key === "A") {
    e.preventDefault();
    if (typeof window.toggleSettingsView === "function") window.toggleSettingsView("achievements");
  }

  if (e.key === "s" || e.key === "S") {
    e.preventDefault();
    if (typeof window.toggleSettingsPanel === "function") window.toggleSettingsPanel();
  }

  if (e.key === "Escape") {
    // Dismiss chip strip
    const bar = document.getElementById("pomo-check-bar");
    if (bar) {
      bar.classList.add("pomo-check-exit");
      setTimeout(() => bar.remove(), 280);
    }
    // Dismiss XP selector
    const backdrop = document.getElementById("xp-selector-backdrop");
    if (backdrop) {
      if (typeof closeXPSelector === "function") closeXPSelector();
    }
    // Dismiss any buddy suggestion / motivational message
    document.querySelectorAll(".buddy-suggestion, .motivational-message").forEach((el) => {
      el.remove();
    });
  }
});
