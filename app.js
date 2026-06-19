// --- EcoTrace Application Logic ---

// --- Default Application State ---
const DEFAULT_STATE = {
  calculator: {
    vehicleType: 'petrol',
    vehicleMiles: 50,
    flightsShort: 2,
    flightsLong: 0,
    electricBill: 80,
    gasBill: 40,
    cleanEnergyShare: 0,
    dietType: 'moderate-meat',
    localFoodShare: 20,
    wasteBags: 2,
    recyclingRate: 30,
  },
  dailyLogs: {}, // Format: { "YYYY-MM-DD": ["action-1", "action-2"] }
  totalSavings: 0.0, // in kg CO2
  streak: 0,
  lastLoggedDate: null, // "YYYY-MM-DD"
  hasCompletedCalc: false,
  unlockedBadges: {}, // Format: { "badge-id": "YYYY-MM-DD" }
};

let state = { ...DEFAULT_STATE };

// --- Constants & Carbon Coefficients ---
// Conversions return kg CO2 equivalent
const COEFFS = {
  // Transport (kg CO2 per mile)
  vehicle: {
    petrol: 0.411,
    diesel: 0.355,
    hybrid: 0.22,
    ev: 0.08,
    motorbike: 0.18,
    none: 0.0,
  },
  flights: {
    short: 225, // kg per flight (average regional)
    long: 820, // kg per flight (average international)
  },
  // Home Energy
  electric: {
    kwhCost: 0.15, // $ per kWh
    co2PerKwh: 0.39, // kg CO2 per kWh grid average
  },
  gas: {
    thermCost: 1.0, // $ per therm
    co2PerTherm: 5.3, // kg CO2 per therm
  },
  // Diet (Annual base footprint in tons CO2e)
  diet: {
    'heavy-meat': 3.3,
    'moderate-meat': 2.5,
    'low-meat': 1.7,
    vegetarian: 1.2,
    vegan: 0.9,
  },
  // Waste (Annual base footprint in tons CO2e)
  waste: {
    perBag: 0.25, // tons CO2e per bag per week annually
  },
};

// Badges definitions
const BADGES = [
  {
    id: 'carbon-pioneer',
    name: 'Carbon Pioneer',
    desc: 'Completed your first carbon footprint projection calculation.',
    icon: 'compass',
  },
  {
    id: 'energy-guardian',
    name: 'Energy Guardian',
    desc: 'Maintained an annual home energy footprint below 1.5 tons CO₂e.',
    icon: 'zap',
  },
  {
    id: 'pedal-power',
    name: 'Pedal Power',
    desc: 'Logged a walking, cycling, or scooting commute 3 times.',
    icon: 'bike',
  },
  {
    id: 'herbivore',
    name: 'Herbivore Hero',
    desc: 'Logged 5 plant-based meals in the Daily Tracker.',
    icon: 'salad',
  },
  {
    id: 'waste-ninja',
    name: 'Waste Ninja',
    desc: 'Achieved a household recycling rate of 75% or higher in the calculator.',
    icon: 'trash-2',
  },
  {
    id: 'eco-champion',
    name: 'Eco Champion',
    desc: 'Avoided a total of 50 kg or more of carbon emissions through logs.',
    icon: 'award',
  },
  {
    id: 'green-streak',
    name: 'Green Streak',
    desc: 'Logged your sustainable activities for 5 consecutive days.',
    icon: 'flame',
  },
  {
    id: 'tree-planter',
    name: 'Tree Planter',
    desc: 'Offset the equivalent carbon absorption of 5 mature trees (110 kg CO₂e).',
    icon: 'sprout',
  },
];

// Eco Tips pool
const ECO_TIPS = [
  'Replacing just 5 incandescent light bulbs with LEDs saves about $75 a year and avoids 150 kg of CO₂.',
  'Washing your laundry in cold water instead of hot saves up to 90% of the energy consumed by the washing machine.',
  'Drying laundry on a simple clothesline or drying rack instead of using a gas/electric dryer avoids 0.8 kg of CO₂ per load.',
  'Reducing your driving speed from 75 mph to 65 mph can improve highway fuel efficiency by up to 15%, saving emissions and fuel.',
  'Eliminating beef from your diet for just one day saves more carbon than swapping a standard car for a hybrid for that day.',
  "Leaving chargers plugged in when not in use still draws 'phantom load' electricity. Unplugging them saves up to 10% on power bills.",
  'Composting food leftovers prevents food waste from rotting anaerobically in landfills, which otherwise releases potent methane gas.',
  "Eating locally grown foods reduces emissions associated with transcontinental food freight shipping, known as 'food miles'.",
];

// --- Global Charts References ---
let categoryChart = null;
let savingsTrendChart = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initTabNavigation();
  initCalculatorStepper();
  initDailyLogger();
  initDashboardMetrics();
  updateStreakDisplay();
  checkBadges();
  renderBadges();
  renderQuests();
  updateInsights();

  // Set date in header and log card
  const todayStr = getFormattedDate(new Date());
  document.getElementById('header-date').innerText = todayStr;
  document.getElementById('log-current-date').innerText = todayStr;

  // Lucide initialization
  lucide.createIcons();
});

// --- State Management ---
function loadState() {
  const saved = localStorage.getItem('ecotrace_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Deep merge calculator settings
      state = {
        ...DEFAULT_STATE,
        ...parsed,
        calculator: { ...DEFAULT_STATE.calculator, ...(parsed.calculator || {}) },
        unlockedBadges: parsed.unlockedBadges || {},
        dailyLogs: parsed.dailyLogs || {},
      };
    } catch (e) {
      console.error('Error loading saved state, resetting...', e);
      state = { ...DEFAULT_STATE };
    }
  } else {
    state = { ...DEFAULT_STATE };
  }
}

function saveState() {
  localStorage.setItem('ecotrace_state', JSON.stringify(state));
}

// Helper: Get YYYY-MM-DD
function getLocalDateString(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
  return adjustedDate.toISOString().split('T')[0];
}

// Helper: Readable date format
function getFormattedDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// --- Navigation Tabs ---
function initTabNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanels = document.querySelectorAll('.tab-content');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach((nav) => nav.classList.remove('active'));
      tabPanels.forEach((panel) => panel.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');

      // Special routines on tab open
      if (targetTab === 'dashboard') {
        initDashboardCharts();
        updateInsights();
      } else if (targetTab === 'challenges') {
        renderBadges();
        renderQuests();
      }

      lucide.createIcons();
    });
  });

  // Dashboard shortcuts
  document.getElementById('btn-dashboard-go-calc').addEventListener('click', () => {
    document.getElementById('nav-btn-calculator').click();
  });
  document.getElementById('btn-dashboard-go-log').addEventListener('click', () => {
    document.getElementById('nav-btn-log').click();
  });
}

// --- Carbon Footprint Math Calculations ---
function calculateCarbonBreakdown() {
  const calc = state.calculator;

  // 1. Transport Annual Carbon (Tons)
  let transportCo2 = 0;
  if (calc.vehicleType !== 'none') {
    const annualMiles = calc.vehicleMiles * 52;
    const coef = COEFFS.vehicle[calc.vehicleType] || 0;
    transportCo2 += annualMiles * coef; // in kg
  }
  transportCo2 += calc.flightsShort * COEFFS.flights.short;
  transportCo2 += calc.flightsLong * COEFFS.flights.long;
  transportCo2 = transportCo2 / 1000; // convert to tons

  // 2. Home Energy Annual Carbon (Tons)
  // Electric
  const annualKwh = (calc.electricBill / COEFFS.electric.kwhCost) * 12;
  const standardGridShare = 1 - calc.cleanEnergyShare / 100;
  const electricCo2 = (annualKwh * standardGridShare * COEFFS.electric.co2PerKwh) / 1000; // in tons

  // Natural Gas
  const annualTherms = (calc.gasBill / COEFFS.gas.thermCost) * 12;
  const gasCo2 = (annualTherms * COEFFS.gas.co2PerTherm) / 1000; // in tons

  const energyCo2 = electricCo2 + gasCo2;

  // 3. Diet Annual Carbon (Tons)
  const dietBase = COEFFS.diet[calc.dietType] || 2.0;
  // Local food reduces transportation overhead portion of diet footprint by up to 10%
  const dietDiscount = (calc.localFoodShare / 100) * 0.1;
  const dietCo2 = dietBase * (1 - dietDiscount);

  // 4. Waste Annual Carbon (Tons)
  const wasteBase = calc.wasteBags * COEFFS.waste.perBag;
  // Recycling reduces waste footprint by up to 50%
  const wasteDiscount = (calc.recyclingRate / 100) * 0.5;
  const wasteCo2 = wasteBase * (1 - wasteDiscount);

  const total = transportCo2 + energyCo2 + dietCo2 + wasteCo2;

  return {
    transport: parseFloat(transportCo2.toFixed(2)),
    energy: parseFloat(energyCo2.toFixed(2)),
    diet: parseFloat(dietCo2.toFixed(2)),
    waste: parseFloat(wasteCo2.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

// --- Dashboard Logic & Charting ---
function initDashboardMetrics() {
  const breakdown = calculateCarbonBreakdown();

  // Update Projected Annual CO2
  const co2El = document.getElementById('val-projected-co2');
  if (state.hasCompletedCalc) {
    co2El.innerText = breakdown.total.toFixed(1);
    document.getElementById('footprint-status-msg').innerText =
      'Based on your calculations. Nice work keeping track!';
  } else {
    co2El.innerText = '—';
    document.getElementById('footprint-status-msg').innerText =
      'Please complete the Footprint Calculator to estimate your projected annual footprint.';
  }

  // Update Ring Progress
  const circle = document.getElementById('footprint-progress-circle');
  const target = 3.5; // tons annual target
  const circumference = 2 * Math.PI * 68; // r=68 -> 427.25
  circle.style.strokeDasharray = `${circumference} ${circumference}`;

  if (state.hasCompletedCalc) {
    const percent = Math.min((breakdown.total / target) * 100, 100);
    // Inverse offset, since full circle means high carbon projection (worse) or savings?
    // Let's make it represent: % of target used. Green is good, but if user uses MORE than target, we show red.
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Change gradient colors dynamically based on footprint size
    const gradientStop1 = document.querySelector('#greenGradient stop:first-child');
    const gradientStop2 = document.querySelector('#greenGradient stop:last-child');
    if (breakdown.total <= target) {
      gradientStop1.setAttribute('stop-color', '#34d399'); // Emerald
      gradientStop2.setAttribute('stop-color', '#059669');
    } else if (breakdown.total <= target * 1.5) {
      gradientStop1.setAttribute('stop-color', '#f59e0b'); // Amber
      gradientStop2.setAttribute('stop-color', '#d97706');
    } else {
      gradientStop1.setAttribute('stop-color', '#f43f5e'); // Rose
      gradientStop2.setAttribute('stop-color', '#be123c');
    }
  } else {
    circle.style.strokeDashoffset = circumference;
  }

  // Cumulative Savings Card
  document.getElementById('stat-total-savings').innerText = `${state.totalSavings.toFixed(1)} kg`;

  // Tree Offset Card (Tree absorbs ~22kg CO2 per year)
  const trees = state.totalSavings / 22.0;
  document.getElementById('stat-tree-offset').innerText = trees.toFixed(1);

  // Active challenges
  let activeQuestsCount = 0;
  const quests = getQuestsData();
  quests.forEach((q) => {
    if (q.progress > 0 && !q.completed) activeQuestsCount++;
  });
  document.getElementById('stat-active-challenges').innerText = `${activeQuestsCount} / 4`;

  // Badges Count
  const badgesCount = Object.keys(state.unlockedBadges).length;
  document.getElementById('stat-unlocked-badges').innerText = `${badgesCount} / ${BADGES.length}`;

  // Dashboard Charts Load
  initDashboardCharts();
}

function initDashboardCharts() {
  const categoryCanvas = document.getElementById('categoryChart');
  const trendCanvas = document.getElementById('savingsTrendChart');

  if (!categoryCanvas || !trendCanvas) return;

  const hasCalc = state.hasCompletedCalc;
  const emptyCalcEl = document.getElementById('chart-empty-calc');
  const emptyTrendEl = document.getElementById('chart-empty-trend');

  // Destroy previous instances to prevent overlap bugs
  if (categoryChart) categoryChart.destroy();
  if (savingsTrendChart) savingsTrendChart.destroy();

  // --- Category Doughnut Chart ---
  if (hasCalc) {
    emptyCalcEl.classList.add('hidden');
    categoryCanvas.classList.remove('hidden');

    const breakdown = calculateCarbonBreakdown();

    categoryChart = new Chart(categoryCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Transportation', 'Home Energy', 'Diet & Food', 'Waste'],
        datasets: [
          {
            data: [breakdown.transport, breakdown.energy, breakdown.diet, breakdown.waste],
            backgroundColor: [
              'rgba(99, 102, 241, 0.75)', // Indigo
              'rgba(59, 130, 246, 0.75)', // Blue
              'rgba(16, 185, 129, 0.75)', // Emerald
              'rgba(245, 158, 11, 0.75)', // Amber
            ],
            borderColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 1.5,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.label}: ${context.raw} t CO₂e`;
              },
            },
          },
        },
        cutout: '65%',
      },
    });
  } else {
    emptyCalcEl.classList.remove('hidden');
    categoryCanvas.classList.add('hidden');
  }

  // --- Savings Trend Line Chart ---
  const last7Days = [];
  const savingsData = [];
  const logDates = Object.keys(state.dailyLogs).sort();

  // Generate date labels for past 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    last7Days.push(dateStr);

    // Compute total savings logged on that specific day
    let daySavings = 0;
    if (state.dailyLogs[dateStr]) {
      state.dailyLogs[dateStr].forEach((actionId) => {
        // Find action saving in checklist elements
        const checkbox = document.querySelector(`input[name="log-action"][value="${actionId}"]`);
        if (checkbox) {
          daySavings += parseFloat(checkbox.getAttribute('data-saving') || 0);
        }
      });
    }
    savingsData.push(daySavings);
  }

  const hasTrendData = savingsData.some((val) => val > 0);

  if (hasTrendData) {
    emptyTrendEl.classList.add('hidden');
    trendCanvas.classList.remove('hidden');

    // Make dates more readable on chart X axis
    const formattedLabels = last7Days.map((dateStr) => {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    savingsTrendChart = new Chart(trendCanvas, {
      type: 'line',
      data: {
        labels: formattedLabels,
        datasets: [
          {
            label: 'Daily Savings (kg CO₂e)',
            data: savingsData,
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderColor: '#10b981',
            borderWidth: 2,
            tension: 0.35,
            pointBackgroundColor: '#10b981',
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } },
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 10 } },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  } else {
    emptyTrendEl.classList.remove('hidden');
    trendCanvas.classList.add('hidden');
  }
}

// --- Footprint Calculator Stepper ---
function initCalculatorStepper() {
  const steps = ['transport', 'energy', 'diet', 'waste'];
  let currentStepIndex = 0;

  const prevBtn = document.getElementById('btn-calc-prev');
  const nextBtn = document.getElementById('btn-calc-next');
  const saveBtn = document.getElementById('btn-calc-save');

  // Elements
  const inputs = {
    vehicleType: document.getElementById('calc-vehicle-type'),
    vehicleMiles: document.getElementById('calc-vehicle-miles'),
    flightsShort: document.getElementById('calc-flights-short'),
    flightsLong: document.getElementById('calc-flights-long'),
    electricBill: document.getElementById('calc-energy-electric'),
    gasBill: document.getElementById('calc-energy-gas'),
    cleanEnergyShare: document.getElementById('calc-energy-clean'),
    dietType: document.getElementById('calc-diet-type'),
    localFoodShare: document.getElementById('calc-diet-local'),
    wasteBags: document.getElementById('calc-waste-bags'),
    recyclingRate: document.getElementById('calc-waste-recycling'),
  };

  // Sync state values to form controls on startup
  Object.keys(inputs).forEach((key) => {
    const element = inputs[key];
    if (element) {
      element.value = state.calculator[key];
      // Trigger display sync
      updateDisplayValue(key, element.value);
    }
  });

  // Calculate live projection instantly when any input changes
  Object.keys(inputs).forEach((key) => {
    const element = inputs[key];
    if (!element) return;

    const eventName =
      element.type === 'range' || element.type === 'select-one' ? 'input' : 'change';
    element.addEventListener(eventName, (e) => {
      let val = e.target.value;
      if (e.target.type === 'number' || e.target.type === 'range') {
        val = parseFloat(val) || 0;
      }

      state.calculator[key] = val;
      updateDisplayValue(key, val);
      updateLiveTicker();
    });
  });

  // Counters Short/Long Flights Controls
  document.querySelectorAll('.counter-control button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const inputId = btn.getAttribute('data-target');
      const input = document.getElementById(inputId);
      const isInc = btn.classList.contains('btn-counter-inc');

      let val = parseInt(input.value) || 0;
      if (isInc) val = Math.min(val + 1, 50);
      else val = Math.max(val - 1, 0);

      input.value = val;
      state.calculator[inputId === 'calc-flights-short' ? 'flightsShort' : 'flightsLong'] = val;
      updateLiveTicker();
    });
  });

  function updateDisplayValue(key, val) {
    if (key === 'vehicleMiles') {
      document.getElementById('disp-vehicle-miles').innerText = `${val} miles/wk`;
    } else if (key === 'electricBill') {
      document.getElementById('disp-energy-electric').innerText = `$${val}/mo`;
    } else if (key === 'gasBill') {
      document.getElementById('disp-energy-gas').innerText = `$${val}/mo`;
    } else if (key === 'cleanEnergyShare') {
      document.getElementById('disp-energy-clean').innerText = `${val}%`;
    } else if (key === 'localFoodShare') {
      document.getElementById('disp-diet-local').innerText = `${val}%`;
    } else if (key === 'wasteBags') {
      document.getElementById('disp-waste-bags').innerText = `${val} bag${val !== 1 ? 's' : ''}/wk`;
    } else if (key === 'recyclingRate') {
      document.getElementById('disp-waste-recycling').innerText = `${val}%`;
    }
  }

  function updateLiveTicker() {
    const breakdown = calculateCarbonBreakdown();
    document.getElementById('calc-live-total').innerText = breakdown.total.toFixed(1);
  }

  // Initial update
  updateLiveTicker();

  // Next/Back buttons handler
  nextBtn.addEventListener('click', () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(currentStepIndex + 1);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStepIndex > 0) {
      setStep(currentStepIndex - 1);
    }
  });

  // Calculate Stepper Buttons clicks
  document.querySelectorAll('.calc-step-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      setStep(index);
    });
  });

  function setStep(index) {
    currentStepIndex = index;

    // Update step buttons sidebar
    document.querySelectorAll('.calc-step-btn').forEach((btn, i) => {
      if (i === index) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    // Update panels body
    document.querySelectorAll('.calc-step-panel').forEach((panel, i) => {
      if (i === index) panel.classList.add('active');
      else panel.classList.remove('active');
    });

    // Buttons availability
    prevBtn.disabled = index === 0;

    if (index === steps.length - 1) {
      nextBtn.classList.add('hidden');
      saveBtn.classList.remove('hidden');
    } else {
      nextBtn.classList.remove('hidden');
      saveBtn.classList.add('hidden');
    }
  }

  // Save Results handler
  saveBtn.addEventListener('click', () => {
    state.hasCompletedCalc = true;
    saveState();

    // Unlock Carbon Pioneer Badge
    unlockBadge('carbon-pioneer');

    // Extra checks for recalculations
    checkBadges();

    // Go to dashboard
    document.getElementById('nav-btn-dashboard').click();

    // Update metrics and show a nice feedback message
    initDashboardMetrics();
  });
}

// --- Daily Action Logger & Savings ---
function initDailyLogger() {
  const form = document.getElementById('daily-log-form');
  const checkboxes = form.querySelectorAll('input[name="log-action"]');
  const liveSavingsEl = document.getElementById('log-live-savings');
  const eqEl = document.getElementById('log-savings-eq');

  // Update live savings count when toggling boxes
  checkboxes.forEach((box) => {
    box.addEventListener('change', () => {
      let currentVal = 0;
      checkboxes.forEach((c) => {
        if (c.checked) currentVal += parseFloat(c.getAttribute('data-saving') || 0);
      });
      liveSavingsEl.innerText = currentVal.toFixed(1);

      // Equivalent factor: 1 kg CO2 ~ 122 smartphone charges
      const charges = Math.round(currentVal * 122);
      eqEl.innerText = `Equivalent to ${charges} smartphone charges avoided.`;
    });
  });

  // Pre-fill logger checklist if logged today
  const todayStr = getLocalDateString();
  if (state.dailyLogs[todayStr]) {
    const loggedActions = state.dailyLogs[todayStr];
    checkboxes.forEach((c) => {
      if (loggedActions.includes(c.value)) {
        c.checked = true;
      }
    });
    // Trigger label update
    checkboxes[0].dispatchEvent(new Event('change'));
  }

  // Load mini logging history
  renderMiniHistory();

  // Load Eco tip
  loadEcoTip();

  // Form Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const loggedActions = [];
    let savedKg = 0;

    checkboxes.forEach((c) => {
      if (c.checked) {
        loggedActions.push(c.value);
        savedKg += parseFloat(c.getAttribute('data-saving') || 0);
      }
    });

    if (loggedActions.length === 0) {
      alert('Please check at least one eco-friendly action to log!');
      return;
    }

    // Process Streak Logic
    processStreak();

    // Log savings
    // Check if we already logged today. If so, calculate the net increase/decrease
    let previousSaved = 0;
    if (state.dailyLogs[todayStr]) {
      state.dailyLogs[todayStr].forEach((actionId) => {
        const checkbox = form.querySelector(`input[value="${actionId}"]`);
        if (checkbox) previousSaved += parseFloat(checkbox.getAttribute('data-saving') || 0);
      });
    }

    const netSavings = savedKg - previousSaved;
    state.totalSavings += netSavings;
    state.dailyLogs[todayStr] = loggedActions;
    state.lastLoggedDate = todayStr;
    saveState();

    // Update UI elements
    updateStreakDisplay();
    initDashboardMetrics();
    renderMiniHistory();
    checkBadges();

    // Quick success toast
    showToast(
      `Saved ${savedKg.toFixed(1)} kg CO₂ today! Streak is now ${state.streak} day${state.streak !== 1 ? 's' : ''}.`
    );
  });

  // Quick Action Button on Top Bar
  document.getElementById('btn-quick-log').addEventListener('click', () => {
    // Quick scroll to log tab
    document.getElementById('nav-btn-log').click();
  });
}

function processStreak() {
  const todayStr = getLocalDateString();
  if (state.lastLoggedDate === todayStr) {
    // Already logged today, streak stays same
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (state.lastLoggedDate === yesterdayStr) {
    // Logged yesterday, increment streak
    state.streak += 1;
  } else {
    // Reset or start streak at 1
    state.streak = 1;
  }
}

function updateStreakDisplay() {
  document.getElementById('sidebar-streak').innerText = state.streak;
}

function renderMiniHistory() {
  const listEl = document.getElementById('mini-logs-history');
  if (!listEl) return;

  listEl.innerHTML = '';
  const logDates = Object.keys(state.dailyLogs).sort().reverse().slice(0, 4);

  if (logDates.length === 0) {
    listEl.innerHTML =
      '<div class="empty-history-text">No logs recorded yet. Start tracking above!</div>';
    return;
  }

  logDates.forEach((dateStr) => {
    let daySavings = 0;
    state.dailyLogs[dateStr].forEach((actionId) => {
      const cb = document.querySelector(`input[name="log-action"][value="${actionId}"]`);
      if (cb) daySavings += parseFloat(cb.getAttribute('data-saving') || 0);
    });

    const row = document.createElement('div');
    row.className = 'mini-log-row';

    // Format date string short (e.g. Jun 12)
    const parts = dateStr.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    row.innerHTML = `
      <span class="mini-log-date">${dateFormatted}</span>
      <span class="mini-log-value">+${daySavings.toFixed(1)} kg saved</span>
    `;
    listEl.appendChild(row);
  });
}

function loadEcoTip() {
  const tipEl = document.getElementById('daily-eco-tip');
  if (!tipEl) return;
  // Select tip of the day based on date day number
  const day = new Date().getDate();
  const index = day % ECO_TIPS.length;
  tipEl.innerText = ECO_TIPS[index];
}

// --- Gamification: Badges & Quests system ---
function checkBadges() {
  // 1. Carbon Pioneer
  if (state.hasCompletedCalc) {
    unlockBadge('carbon-pioneer');
  }

  // 2. Energy Guardian
  if (state.hasCompletedCalc) {
    const breakdown = calculateCarbonBreakdown();
    if (breakdown.energy <= 1.5) {
      unlockBadge('energy-guardian');
    }
  }

  // Count logs of specific types
  let pedalCommutes = 0;
  let meatlessMeals = 0;

  Object.keys(state.dailyLogs).forEach((date) => {
    const list = state.dailyLogs[date];
    if (list.includes('bike-walk-commute')) pedalCommutes++;
    if (list.includes('meatless-meals')) meatlessMeals++;
  });

  // 3. Pedal Power
  if (pedalCommutes >= 3) {
    unlockBadge('pedal-power');
  }

  // 4. Herbivore
  if (meatlessMeals >= 5) {
    unlockBadge('herbivore');
  }

  // 5. Waste Ninja
  if (state.calculator.recyclingRate >= 75) {
    unlockBadge('waste-ninja');
  }

  // 6. Eco Champion
  if (state.totalSavings >= 50.0) {
    unlockBadge('eco-champion');
  }

  // 7. Green Streak
  if (state.streak >= 5) {
    unlockBadge('green-streak');
  }

  // 8. Tree Planter (trees >= 5.0)
  if (state.totalSavings / 22.0 >= 5.0) {
    unlockBadge('tree-planter');
  }
}

function unlockBadge(badgeId) {
  if (state.unlockedBadges[badgeId]) return; // already unlocked

  const todayStr = getLocalDateString();
  state.unlockedBadges[badgeId] = todayStr;
  saveState();

  const badgeObj = BADGES.find((b) => b.id === badgeId);
  if (badgeObj) {
    showToast(`Badge Unlocked: ${badgeObj.name}!`);
  }
}

function renderBadges() {
  const container = document.getElementById('badges-container');
  if (!container) return;

  container.innerHTML = '';
  BADGES.forEach((badge) => {
    const isUnlocked = !!state.unlockedBadges[badge.id];
    const unlockedDate = state.unlockedBadges[badge.id];
    let dateHtml = '';

    if (isUnlocked && unlockedDate) {
      const parts = unlockedDate.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const dateFormatted = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
      });
      dateHtml = `<span class="badge-date">Earned ${dateFormatted}</span>`;
    }

    const card = document.createElement('div');
    card.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
    card.innerHTML = `
      <div class="badge-icon-box">
        <i data-lucide="${badge.icon}"></i>
      </div>
      <h4>${badge.name}</h4>
      <p>${badge.desc}</p>
      ${dateHtml}
    `;
    container.appendChild(card);
  });
}

function getQuestsData() {
  // Compute log categories counts
  let transportLogs = 0;
  let energyLogs = 0;
  let dietLogs = 0;
  let wasteLogs = 0;

  Object.keys(state.dailyLogs).forEach((date) => {
    const list = state.dailyLogs[date];
    list.forEach((act) => {
      if (['transit-commute', 'bike-walk-commute', 'carpool'].includes(act)) transportLogs++;
      if (['energy-standby', 'dryer-avoid', 'temp-thermostat'].includes(act)) energyLogs++;
      if (['meatless-meals', 'zero-food-waste'].includes(act)) dietLogs++;
      if (['plastic-free', 'composting'].includes(act)) wasteLogs++;
    });
  });

  return [
    {
      id: 'quest-transit',
      category: 'transport',
      title: 'Transit Specialist',
      desc: 'Log 5 shared or human-powered travel actions in the Daily Tracker.',
      progress: Math.min(transportLogs, 5),
      target: 5,
      completed: transportLogs >= 5,
    },
    {
      id: 'quest-energy',
      category: 'energy',
      title: 'Vampire Slayer',
      desc: 'Log 3 standby power shutdowns or heating optimization adjustments.',
      progress: Math.min(energyLogs, 3),
      target: 3,
      completed: energyLogs >= 3,
    },
    {
      id: 'quest-diet',
      category: 'diet',
      title: 'Green Gourmet',
      desc: 'Log 5 low-carbon meals or plant-based days in the Daily Tracker.',
      progress: Math.min(dietLogs, 5),
      target: 5,
      completed: dietLogs >= 5,
    },
    {
      id: 'quest-waste',
      category: 'waste',
      title: 'Compost Ranger',
      desc: 'Log 5 organic compostings or plastic-free grocery actions.',
      progress: Math.min(wasteLogs, 5),
      target: 5,
      completed: wasteLogs >= 5,
    },
  ];
}

function renderQuests() {
  const container = document.getElementById('quests-container');
  if (!container) return;

  container.innerHTML = '';
  const quests = getQuestsData();

  quests.forEach((quest) => {
    const pct = Math.round((quest.progress / quest.target) * 100);
    const card = document.createElement('div');
    card.className = `quest-card ${quest.completed ? 'quest-completed' : ''}`;
    card.innerHTML = `
      <div>
        <div class="quest-meta">
          <span class="category-tag ${quest.category}">${quest.category}</span>
          <span class="impact-level ${quest.completed ? 'green' : 'amber'}">
            ${quest.completed ? 'Completed' : 'Active'}
          </span>
        </div>
        <div class="quest-title-row">
          <h4>${quest.title}</h4>
          <p>${quest.desc}</p>
        </div>
      </div>
      <div class="quest-progress-section">
        <div class="quest-progress-bar-container">
          <div class="quest-progress-fill" style="width: ${pct}%"></div>
        </div>
        <div class="quest-progress-stats">
          <span>Progress</span>
          <span>${quest.progress} / ${quest.target} (${pct}%)</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Eco-Insights Generator Engine ---
function updateInsights() {
  const listEl = document.getElementById('dashboard-insights-list');
  if (!listEl) return;

  if (!state.hasCompletedCalc) {
    listEl.innerHTML = `
      <div class="insight-item">
        <div class="insight-meta">
          <span class="category-tag energy">System</span>
          <span class="impact-level green">High Priority</span>
        </div>
        <h4>Onboarding Calculator Needed</h4>
        <p>Complete the calculator in the tab section to analyze your carbon habits and receive tailored suggestions to lower emissions.</p>
      </div>
    `;
    return;
  }

  const breakdown = calculateCarbonBreakdown();

  // Find highest category
  const categories = [
    { name: 'transport', val: breakdown.transport },
    { name: 'energy', val: breakdown.energy },
    { name: 'diet', val: breakdown.diet },
    { name: 'waste', val: breakdown.waste },
  ];

  // Sort descending
  categories.sort((a, b) => b.val - a.val);
  const highest = categories[0];

  listEl.innerHTML = '';

  // Generate primary recommendation based on highest emitter
  if (highest.name === 'transport') {
    listEl.innerHTML += `
      <div class="insight-item">
        <div class="insight-meta">
          <span class="category-tag transport">Transportation</span>
          <span class="impact-level rose">Highest Output (${highest.val} t)</span>
        </div>
        <h4>Commute Overhead Optimization</h4>
        <p>Your transport emissions are currently your largest source. swapping driving for public transit or carpooling twice a week can save up to **500 kg CO₂** annually. If planning a vehicle upgrade, hybrid or electric options will reduce fuel carbon by **50% to 80%**.</p>
      </div>
      <div class="insight-item">
        <div class="insight-meta">
          <span class="category-tag transport">Air Travel</span>
          <span class="impact-level amber">Medium Priority</span>
        </div>
        <h4>Eco-Friendly Flights</h4>
        <p>Annual air travel contributes significantly. Consider substituting short-haul flights with rail journeys, or purchasing carbon offsets when booking long-haul flights to mitigate high altitude heat radiation effects.</p>
      </div>
    `;
  } else if (highest.name === 'energy') {
    listEl.innerHTML += `
      <div class="insight-item">
        <div class="insight-meta">
          <span class="category-tag energy">Home Energy</span>
          <span class="impact-level rose">Highest Output (${highest.val} t)</span>
        </div>
        <h4>Target Electricity & Gas Outages</h4>
        <p>Heating and electricity dominate your footprint. Shifting your clean energy solar percentage to even 50% through standard green energy utilities or grid switches will instantly decrease your household emission profile by **20%**.</p>
      </div>
      <div class="insight-item">
        <div class="insight-meta">
          <span class="category-tag energy">Vampire Loads</span>
          <span class="impact-level green">Easy Win</span>
        </div>
        <h4>Defeat Standing Phantom Power</h4>
        <p>Appliances left plugged in account for up to 10% of standard home utility footprints. Connect major desks or entertainment sets to single smart power strips that shut down when inactive.</p>
      </div>
    `;
  } else if (highest.name === 'diet') {
    listEl.innerHTML += `
      <div class="insight-item">
        <div class="insight-meta">
          <span class="category-tag diet">Diet & Food</span>
          <span class="impact-level rose">Highest Output (${highest.val} t)</span>
        </div>
        <h4>Transition Toward Lean Dieting</h4>
        <p>Red meat contributes to massive land use and animal methane. Transitioning from average meat eating to pescatarian or vegetarian schedules 3 times a week can prevent over **800 kg CO₂** from being produced annually.</p>
      </div>
      <div class="insight-item">
        <div class="insight-meta">
          <span class="category-tag diet">Sourcing</span>
          <span class="impact-level green">Easy Win</span>
        </div>
        <h4>Local Organic sourcing</h4>
        <p>Shipping food across continents involves heavy aviation and cargo shipping. Buying products marked local reduces shipping miles and helps support local, low-carbon farming structures.</p>
      </div>
    `;
  } else if (highest.name === 'waste') {
    listEl.innerHTML += `
      <div class="insight-item">
        <div class="insight-meta">
          <span class="category-tag waste">Waste</span>
          <span class="impact-level rose">Highest Output (${highest.val} t)</span>
        </div>
        <h4>Improve Household Recycling</h4>
        <p>When biodegradable waste is trapped in standard landfill plastics, it decays into methane, which is 25 times more warming than CO₂. Sorting metals, compost, and plastics can drop your waste impact by **50%**.</p>
      </div>
      <div class="insight-item">
        <div class="insight-meta">
          <span class="category-tag waste">Packaging</span>
          <span class="impact-level green">Eco Win</span>
        </div>
        <h4>Single-Use Plastic Mitigation</h4>
        <p>Bring canvas shopper bags to checkout and choose items with minimal cardboard/plastic casing to keep landfill quantities minimal.</p>
      </div>
    `;
  }

  // Add one general random tip as secondary recommendation
  const generalIndex = (new Date().getDate() + 1) % ECO_TIPS.length;
  listEl.innerHTML += `
    <div class="insight-item">
      <div class="insight-meta">
        <span class="category-tag energy">General Tip</span>
        <span class="impact-level green">Useful Info</span>
      </div>
      <h4>Daily Micro-Action Tip</h4>
      <p>${ECO_TIPS[generalIndex]}</p>
    </div>
  `;
}

// --- Success Notification Toast ---
function showToast(message) {
  const toast = document.getElementById('achievement-toast');
  const msgEl = document.getElementById('achievement-name');

  if (!toast || !msgEl) return;

  msgEl.innerText = message;
  toast.classList.remove('hidden');

  // Slide down or hide after 4 seconds
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}
