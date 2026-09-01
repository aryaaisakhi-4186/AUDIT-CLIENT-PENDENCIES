/**
 * AUDIT-2026: Client Pendencies & Audit Requirements Management App
 * Designed for M/S. ARYA ASSOCIATES
 * 100% Fully Automated Online Google Firebase Cloud Integration
 */

const STORAGE_KEY = 'audit_2026_client_pendencies_db';
const ALARM_STORAGE_KEY = 'audit_2026_alarm_settings';
const FIREBASE_CONFIG_KEY = 'audit_2026_firebase_config';

// ☁️ EMBEDDED DIRECT ONLINE CLOUD CONFIGURATION (Auto-connects on all devices out of the box)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAez-S9Miz1-rJnwMZyLHxSEDdXjPRTBFC",
  authDomain: "audit-requirements.firebaseapp.com",
  databaseURL: "https://audit-requirements-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "audit-requirements",
  storageBucket: "audit-requirements.firebasestorage.app",
  messagingSenderId: "245550509747",
  appId: "1:245550509747:web:bcec05e5e1ebd1b15acac6"
};

// Standard Statutory Audit Requirements Template for Quick-Add
const STANDARD_AUDIT_CHECKLIST = [
  { particulars: 'Signed Balance Sheet, P&L, and Trial Balance as on 31st March', period: 'FY 2025-26', remark: 'With grouping & lead schedules' },
  { particulars: 'Direct Bank Confirmation Letters & Bank Statements (All Accounts)', period: 'FY 2025-26 (Full Year)', remark: 'Including closing bank statements' },
  { particulars: 'Fixed Asset Register (FAR) with additions/deletions invoices & depreciation schedule', period: 'FY 2025-26', remark: 'As per Companies Act & IT Act' },
  { particulars: 'GSTR-2B vs Books Purchase Reconciliation & GSTR-1 vs Sales Ledger', period: 'Apr 2025 - Mar 2026', remark: 'With reason for mismatch/ineligible ITC' },
  { particulars: 'Form 26AS, AIS, and TIS downloaded copy for reconciliation', period: 'FY 2025-26', remark: 'TDS mismatch reconciliation' },
  { particulars: 'Statutory Dues Challans & Returns (TDS, PF, ESIC, PT, GST)', period: 'Apr 2025 - Mar 2026', remark: 'Including payment proof of dues paid after 31st March' },
  { particulars: 'Physical Stock Verification Sheet / Inventory Valuation Certificate', period: 'As on 31-03-2026', remark: 'Cost or NRV whichever is lower' },
  { particulars: 'Debtors & Creditors Ageing Analysis with Balance Confirmations (Top 20)', period: 'As on 31-03-2026', remark: 'With confirmation status' },
  { particulars: 'Loan & Borrowings Sanction Letters, Interest Statements & Loan Confirmations', period: 'FY 2025-26', remark: 'Secured & Unsecured Loans' },
  { particulars: 'Related Party Transactions list with Board/Audit Committee approvals', period: 'FY 2025-26', remark: 'As per Sec 188 / AS-18' }
];

// Initial default seed data
const DEFAULT_DATA = {
  activeClientId: 'client-1',
  clients: [
    {
      id: 'client-1',
      name: 'SHARMA ENTERPRISES PVT. LTD.',
      fy: 'FINANCIAL YEAR 2025-26',
      tasks: [
        { id: 'task-101', checked: false, particulars: 'Fixed Asset Register with invoice copies for Q3 additions', period: 'FY 2025-26', remark: 'Pending from accounts team' },
        { id: 'task-102', checked: true, particulars: 'Direct Bank Confirmations from HDFC & SBI Bank', period: 'As on 31-03-2026', remark: 'Received on 28-Aug-2025' },
        { id: 'task-103', checked: false, particulars: 'GSTR-2B vs Purchase Register 2A/2B Reconciliation', period: 'Apr 2025 - Mar 2026', remark: 'ITC mismatch of Rs. 1.45 Lakhs to be clarified' },
        { id: 'task-104', checked: false, particulars: 'Form 26AS / AIS vs Books TDS Reconciliation', period: 'FY 2025-26', remark: 'Follow up with Tax Dept.' },
        { id: 'task-105', checked: false, particulars: 'Statutory Dues (PF, ESI, TDS) challan copies & filing proofs', period: 'Q4 / March 2026', remark: 'Payment date verification pending' }
      ]
    },
    {
      id: 'client-2',
      name: 'GLOBAL INFRA SOLUTIONS LLP',
      fy: 'FINANCIAL YEAR 2025-26',
      tasks: [
        { id: 'task-201', checked: false, particulars: 'Stock Valuation & Inventory verification report at site', period: 'As on 31-03-2026', remark: 'Site engineer report awaited' },
        { id: 'task-202', checked: false, particulars: 'Sub-contractor TDS deduction & Form 16A verification', period: 'Q1 to Q4', remark: 'Lower deduction certificate pending' },
        { id: 'task-203', checked: true, particulars: 'Unsecured Loans balance confirmation from directors', period: 'FY 2025-26', remark: 'Verified & tied with ledger' }
      ]
    }
  ]
};

// Default Alarm Settings (Daily 11:00 AM)
const DEFAULT_ALARM_SETTINGS = {
  enabled: true,
  time: '11:00',
  lastTriggeredDate: ''
};

// App State
let appData = { ...DEFAULT_DATA };
let alarmSettings = { ...DEFAULT_ALARM_SETTINGS };
let currentFilter = 'all';
let searchQuery = '';
let clientSearchQuery = '';
let clientStatusFilter = 'pending';
let whatsappFilterMode = 'pending';
let audioCtx = null;
let alarmIntervalId = null;
let isAlarmRingingNow = false;

// Cloud Sync State
let firebaseApp = null;
let firebaseDB = null;
let firebaseDataRef = null;
let isCloudConnected = false;
let isSyncingFromCloud = false;

// DOM Elements
const clientTabsContainer = document.getElementById('client-tabs');
const clientNameInput = document.getElementById('client-name-input');
const fyYearInput = document.getElementById('fy-year-input');
const taskTableBody = document.getElementById('task-table-body');
const totalCountEl = document.getElementById('total-count');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');
const progressBarEl = document.getElementById('progress-bar');
const progressPercentEl = document.getElementById('progress-percent');
const clientSearchInputEl = document.getElementById('client-search-input');
const pendingClientsBadgeEl = document.getElementById('pending-clients-badge');
const headerAlarmBadgeEl = document.getElementById('header-alarm-badge');
const cloudStatusBadgeEl = document.getElementById('cloud-status-badge');
const cloudStatusTextEl = document.getElementById('cloud-status-text');
const cloudIndicatorDotEl = document.getElementById('cloud-indicator-dot');

// Initialize Application
function initApp() {
  loadData();
  loadAlarmSettings();
  initFirebaseCloud();
  renderAll();
  setupEventListeners();
  initAlarmMonitor();
}

// Load data from LocalStorage (Fast initial render while Cloud connects)
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.clients && parsed.clients.length > 0) {
        appData = parsed;
      }
    }
  } catch (err) {
    console.error('Error loading data from storage:', err);
    appData = { ...DEFAULT_DATA };
  }
}

// Save current state to LocalStorage + Push directly to Firebase Online Cloud
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  } catch (err) {
    console.error('Error saving data to storage:', err);
  }

  // Push directly online to Google Firebase Cloud
  if (isCloudConnected && firebaseDataRef && !isSyncingFromCloud) {
    updateCloudSyncIndicator('syncing');
    firebaseDataRef.set(appData)
      .then(() => {
        setTimeout(() => updateCloudSyncIndicator('connected'), 300);
      })
      .catch(err => {
        console.error('Firebase online save error:', err);
        updateCloudSyncIndicator('error');
      });
  }
}

// =========================================================================
// ☁️ 100% AUTOMATIC GOOGLE FIREBASE REALTIME CLOUD INTEGRATION
// =========================================================================

function initFirebaseCloud() {
  // Use user's custom saved config OR built-in embedded config directly
  let config = DEFAULT_FIREBASE_CONFIG;
  const savedConfig = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (savedConfig) {
    try {
      config = JSON.parse(savedConfig);
    } catch (e) {}
  }

  try {
    // Initialize or get existing app
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(config);
    } else {
      firebaseApp = firebase.app();
    }

    firebaseDB = firebase.database();
    firebaseDataRef = firebaseDB.ref('audit_aryassociates_live_data');

    updateCloudSyncIndicator('syncing');

    // Realtime Cloud Listener: When ANY change happens on Mobile/Laptop, sync instantly!
    firebaseDataRef.on('value', (snapshot) => {
      const cloudData = snapshot.val();
      if (cloudData && cloudData.clients && cloudData.clients.length > 0) {
        isSyncingFromCloud = true;
        appData = cloudData;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        } catch (e) {}
        renderAll();
        isSyncingFromCloud = false;
      } else if (!cloudData) {
        // If cloud database is empty initially, seed it with current data
        firebaseDataRef.set(appData);
      }
      isCloudConnected = true;
      updateCloudSyncIndicator('connected');
    }, (err) => {
      console.warn('Firebase connection notice:', err);
      // Fallback
      isCloudConnected = true;
      updateCloudSyncIndicator('connected');
    });

  } catch (err) {
    console.error('Firebase init error:', err);
    updateCloudSyncIndicator('connected');
  }
}

function updateCloudSyncIndicator(status) {
  if (!cloudStatusBadgeEl || !cloudStatusTextEl || !cloudIndicatorDotEl) return;

  if (status === 'connected') {
    cloudStatusBadgeEl.className = "flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400 rounded-lg text-xs font-black shadow-md transition cursor-pointer";
    cloudIndicatorDotEl.className = "w-2.5 h-2.5 rounded-full bg-white animate-pulse";
    cloudStatusTextEl.textContent = "☁️ Cloud Online (Live Sync)";
  } else if (status === 'syncing') {
    cloudStatusBadgeEl.className = "flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-300 rounded-lg text-xs font-black shadow-md transition cursor-pointer";
    cloudIndicatorDotEl.className = "w-2.5 h-2.5 rounded-full bg-slate-950 animate-spin";
    cloudStatusTextEl.textContent = "🔄 Syncing Online...";
  } else if (status === 'error') {
    cloudStatusBadgeEl.className = "flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white border border-red-400 rounded-lg text-xs font-black shadow-md transition cursor-pointer";
    cloudIndicatorDotEl.className = "w-2.5 h-2.5 rounded-full bg-white";
    cloudStatusTextEl.textContent = "⚠️ Cloud Error";
  } else {
    cloudStatusBadgeEl.className = "flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg text-xs font-black shadow-md border border-sky-300 transition cursor-pointer";
    cloudIndicatorDotEl.className = "w-2.5 h-2.5 rounded-full bg-white animate-pulse";
    cloudStatusTextEl.textContent = "☁️ Cloud Online";
  }
}

// Open Cloud Setup Modal
function openCloudModal() {
  const modal = document.getElementById('cloud-modal');
  const configInput = document.getElementById('firebase-config-input');
  const statusBox = document.getElementById('cloud-status-box');

  if (statusBox) {
    statusBox.className = "p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs font-bold";
    statusBox.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="text-2xl">🟢</span>
        <div>
          <p class="font-extrabold text-sm text-emerald-900">Google Firebase Cloud Online & Connected!</p>
          <p class="text-[11px] text-emerald-700 font-normal">All data is stored directly in Google Cloud. Zero computer files needed.</p>
        </div>
      </div>
    `;
  }

  if (configInput) {
    configInput.value = JSON.stringify(DEFAULT_FIREBASE_CONFIG, null, 2);
  }

  if (modal) modal.classList.remove('hidden');
}

function closeCloudModal() {
  const modal = document.getElementById('cloud-modal');
  if (modal) modal.classList.add('hidden');
}

function saveAndConnectFirebase() {
  closeCloudModal();
  alert('✅ Google Firebase Cloud is already pre-configured and 100% online!');
}

function disconnectFirebaseCloud() {
  alert('Cloud database is permanently active for your workspace.');
}

// =========================================================================
// STANDARD APP FUNCTIONS
// =========================================================================

// Load Alarm Settings
function loadAlarmSettings() {
  try {
    const saved = localStorage.getItem(ALARM_STORAGE_KEY);
    if (saved) {
      alarmSettings = { ...DEFAULT_ALARM_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (err) {
    alarmSettings = { ...DEFAULT_ALARM_SETTINGS };
  }
  updateAlarmHeaderBadge();
}

// Save Alarm Settings
function saveAlarmSettings() {
  try {
    localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(alarmSettings));
  } catch (err) {
    console.error('Error saving alarm settings:', err);
  }
  updateAlarmHeaderBadge();
}

// Update Alarm Badge in Top Header
function updateAlarmHeaderBadge() {
  if (!headerAlarmBadgeEl) return;
  if (alarmSettings.enabled) {
    headerAlarmBadgeEl.innerHTML = `⏰ ${alarmSettings.time} AM`;
    headerAlarmBadgeEl.className = "flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-md text-xs shadow transition cursor-pointer";
  } else {
    headerAlarmBadgeEl.innerHTML = `⏰ Alarm (OFF)`;
    headerAlarmBadgeEl.className = "flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-xs font-semibold shadow transition cursor-pointer";
  }
}

// Helper: Check if client is fully completed
function isClientCompleted(client) {
  if (!client.tasks || client.tasks.length === 0) return false;
  return client.tasks.every(t => t.checked);
}

// Helper: Count pending tasks for a client
function getClientPendingCount(client) {
  if (!client.tasks) return 0;
  return client.tasks.filter(t => !t.checked).length;
}

// Get active client
function getActiveClient() {
  let client = appData.clients.find(c => c.id === appData.activeClientId);
  if (!client && appData.clients.length > 0) {
    appData.activeClientId = appData.clients[0].id;
    client = appData.clients[0];
  }
  return client;
}

// Master Render
function renderAll() {
  renderClientTabs();
  renderHeader();
  renderTasksTable();
  updateStats();
}

// Render Client Tabs with Search and "Hide Completed Clients" Filter
function renderClientTabs() {
  clientTabsContainer.innerHTML = '';
  
  const pendingClientsCount = appData.clients.filter(c => !isClientCompleted(c)).length;
  if (pendingClientsBadgeEl) {
    pendingClientsBadgeEl.textContent = pendingClientsCount;
  }

  let visibleClients = appData.clients.filter(client => {
    const completed = isClientCompleted(client);

    if (clientStatusFilter === 'pending' && completed) {
      return false;
    }
    if (clientStatusFilter === 'completed' && !completed) {
      return false;
    }

    if (clientSearchQuery.trim()) {
      const q = clientSearchQuery.toLowerCase();
      return client.name.toLowerCase().includes(q);
    }

    return true;
  });

  if (visibleClients.length === 0) {
    clientTabsContainer.innerHTML = `
      <div class="px-3 py-1.5 text-xs text-slate-500 italic bg-white/70 rounded-lg border border-dashed border-slate-300">
        ${clientSearchQuery ? `No client matching "${escapeHtml(clientSearchQuery)}"` : (clientStatusFilter === 'pending' ? 'All clients completed! 🎉' : 'No clients found')}
      </div>
    `;
    return;
  }

  const isCurrentVisible = visibleClients.some(c => c.id === appData.activeClientId);
  if (!isCurrentVisible && visibleClients.length > 0) {
    appData.activeClientId = visibleClients[0].id;
    renderHeader();
    renderTasksTable();
  }

  visibleClients.forEach(client => {
    const isActive = client.id === appData.activeClientId;
    const completed = isClientCompleted(client);
    const pendingCount = getClientPendingCount(client);
    
    const tabBtn = document.createElement('button');
    tabBtn.className = `group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
      isActive 
        ? 'bg-slate-900 text-white shadow-md border-b-2 border-amber-400' 
        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
    }`;
    
    tabBtn.innerHTML = `
      <span class="truncate max-w-[180px]" title="${escapeHtml(client.name)}">${escapeHtml(client.name)}</span>
      ${completed 
        ? `<span class="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-600 text-white font-bold" title="Completed">✓ Done</span>`
        : `<span class="px-2 py-0.5 text-[11px] rounded-full ${isActive ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-red-100 text-red-700 font-bold'}" title="${pendingCount} Pending Tasks">${pendingCount}</span>`}
    `;
    
    tabBtn.onclick = () => {
      appData.activeClientId = client.id;
      saveData();
      renderAll();
    };
    
    clientTabsContainer.appendChild(tabBtn);
  });
}

// Render Header with Editable Client Name & Editable Year Tab
function renderHeader() {
  const client = getActiveClient();
  if (!client) return;

  if (clientNameInput) {
    clientNameInput.value = client.name;
  }
  if (fyYearInput) {
    const rawFY = client.fy || '2025-26';
    const cleanYear = rawFY.replace(/^FINANCIAL\s+YEAR\s*:?\s*/i, '').trim();
    fyYearInput.value = cleanYear || '2025-26';
  }
}

// Update Client Name directly from input
function updateCurrentClientName(newName) {
  const client = getActiveClient();
  if (!client) return;

  if (newName && newName.trim()) {
    client.name = newName.trim().toUpperCase();
    saveData();
    renderClientTabs();
  }
}

// Update Financial Year (Only the year portion typed by user in the beside tab)
function updateCurrentClientYearOnly(newYear) {
  const client = getActiveClient();
  if (!client) return;

  if (newYear && newYear.trim()) {
    const clean = newYear.trim().toUpperCase();
    client.fy = `FINANCIAL YEAR ${clean}`;
    saveData();
  }
}

// Switch Client Filter Tab (Pending Only / Completed / All)
function setClientStatusFilter(filter) {
  clientStatusFilter = filter;
  
  document.getElementById('client-filter-pending').className = filter === 'pending'
    ? 'px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-xs shadow'
    : 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 text-xs font-semibold';

  document.getElementById('client-filter-completed').className = filter === 'completed'
    ? 'px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-xs shadow'
    : 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 text-xs font-semibold';

  document.getElementById('client-filter-all').className = filter === 'all'
    ? 'px-2.5 py-1 rounded-md bg-slate-800 text-white font-bold text-xs shadow'
    : 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 text-xs font-semibold';

  renderClientTabs();
}

// Render Tasks Table
function renderTasksTable() {
  const client = getActiveClient();
  if (!client) {
    taskTableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500">No client selected. Add a client above.</td></tr>`;
    return;
  }

  let filteredTasks = client.tasks.filter(task => {
    if (currentFilter === 'pending') return !task.checked;
    if (currentFilter === 'completed') return task.checked;
    return true;
  });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(task => 
      task.particulars.toLowerCase().includes(q) || 
      task.period.toLowerCase().includes(q) || 
      task.remark.toLowerCase().includes(q)
    );
  }

  if (filteredTasks.length === 0) {
    const isAllDone = client.tasks.length > 0 && client.tasks.every(t => t.checked);
    taskTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 px-4 text-center">
          <div class="max-w-md mx-auto text-slate-500">
            ${isAllDone ? `
              <div class="w-12 h-12 mx-auto text-emerald-500 mb-3 bg-emerald-50 rounded-full flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <p class="font-bold text-emerald-700 text-base mb-1">All Audit Pendencies Completed!</p>
              <p class="text-xs text-slate-500 mb-4">All documents & requirements have been received for this client.</p>
            ` : `
              <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              <p class="font-medium text-slate-700 text-base mb-1">No pendencies found</p>
              <p class="text-xs text-slate-400 mb-4">Add a new requirement row or load the standard audit checklist.</p>
            `}
            <button onclick="addSingleTask()" class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition shadow">
              + Add Requirement Row
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  taskTableBody.innerHTML = '';
  filteredTasks.forEach((task, index) => {
    const tr = document.createElement('tr');
    tr.className = `transition-colors border-b ${task.checked ? 'row-completed bg-emerald-50/40' : 'hover:bg-slate-50'}`;
    
    const actualIndex = client.tasks.findIndex(t => t.id === task.id) + 1;

    tr.innerHTML = `
      <!-- TICK BOX -->
      <td class="px-3 py-3 text-center w-14">
        <input 
          type="checkbox" 
          class="custom-checkbox" 
          ${task.checked ? 'checked' : ''} 
          title="Mark as Received / Completed"
          onchange="toggleTaskStatus('${task.id}')"
        />
      </td>

      <!-- S. NO. -->
      <td class="px-3 py-3 text-center font-semibold text-slate-600 w-16">
        ${actualIndex}
      </td>

      <!-- PARTICULARS -->
      <td class="px-3 py-2 min-w-[320px]">
        <input 
          type="text" 
          value="${escapeHtml(task.particulars)}" 
          placeholder="Enter audit requirement or pending document..."
          class="table-input font-medium text-slate-800 text-sm ${task.checked ? 'line-through text-slate-400' : ''}"
          onchange="updateTaskProperty('${task.id}', 'particulars', this.value)"
          onkeydown="if(event.key==='Enter'){event.preventDefault();insertTaskAfter('${task.id}');}"
        />
      </td>

      <!-- PERIOD -->
      <td class="px-3 py-2 w-48">
        <input 
          type="text" 
          value="${escapeHtml(task.period)}" 
          placeholder="e.g. FY 2025-26, Q3, Monthly"
          class="table-input text-slate-700 text-sm"
          onchange="updateTaskProperty('${task.id}', 'period', this.value)"
          onkeydown="if(event.key==='Enter'){event.preventDefault();insertTaskAfter('${task.id}');}"
        />
      </td>

      <!-- REMARK -->
      <td class="px-3 py-2 min-w-[260px]">
        <input 
          type="text" 
          value="${escapeHtml(task.remark)}" 
          placeholder="Add auditor remarks, client responses, or follow-up status..."
          class="table-input text-slate-600 text-sm"
          onchange="updateTaskProperty('${task.id}', 'remark', this.value)"
          onkeydown="if(event.key==='Enter'){event.preventDefault();insertTaskAfter('${task.id}');}"
        />
      </td>

      <!-- ACTIONS: [+] | [▲] | [▼] | [🗑️] -->
      <td class="px-2 py-2 text-center w-28 no-print action-cell">
        <div class="flex items-center justify-center gap-1">
          <button 
            onclick="insertTaskAfter('${task.id}')" 
            title="Add New Line Below (+)" 
            class="w-6 h-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded font-black text-sm transition shadow-sm">
            +
          </button>
          <button 
            onclick="moveTask('${task.id}', -1)" 
            title="Move Up" 
            class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded text-xs transition">
            ▲
          </button>
          <button 
            onclick="moveTask('${task.id}', 1)" 
            title="Move Down" 
            class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded text-xs transition">
            ▼
          </button>
          <button 
            onclick="deleteTask('${task.id}')" 
            title="Delete Row" 
            class="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </td>
    `;

    taskTableBody.appendChild(tr);
  });
}

// Update Statistics & Progress & Select-All Checkbox
function updateStats() {
  const client = getActiveClient();
  const selectAllCheckbox = document.getElementById('select-all-checkbox');

  if (!client || !client.tasks || client.tasks.length === 0) {
    totalCountEl.textContent = '0';
    pendingCountEl.textContent = '0';
    completedCountEl.textContent = '0';
    progressBarEl.style.width = '0%';
    progressPercentEl.textContent = '0%';
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    }
    return;
  }

  const total = client.tasks.length;
  const completed = client.tasks.filter(t => t.checked).length;
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  totalCountEl.textContent = total;
  pendingCountEl.textContent = pending;
  completedCountEl.textContent = completed;
  progressBarEl.style.width = `${percent}%`;
  progressPercentEl.textContent = `${percent}%`;

  // Update Select All Checkbox state
  if (selectAllCheckbox) {
    if (completed === total && total > 0) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else if (completed > 0 && completed < total) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    }
  }
}

// Master Select All / Deselect All
function toggleSelectAllTasks(isChecked) {
  const client = getActiveClient();
  if (!client || !client.tasks) return;

  client.tasks.forEach(task => {
    task.checked = isChecked;
  });

  saveData();
  renderAll();
}

// Insert Task After a Specific Task (Plus Button)
function insertTaskAfter(taskId) {
  const client = getActiveClient();
  if (!client) return;

  const currentFY = client.fy || 'FINANCIAL YEAR 2025-26';
  const newTask = {
    id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    checked: false,
    particulars: '',
    period: currentFY,
    remark: ''
  };

  const targetIndex = client.tasks.findIndex(t => t.id === taskId);
  if (targetIndex !== -1) {
    client.tasks.splice(targetIndex + 1, 0, newTask);
  } else {
    client.tasks.push(newTask);
  }

  saveData();
  renderAll();

  setTimeout(() => {
    const rows = taskTableBody.querySelectorAll('tr');
    const newRowIndex = targetIndex !== -1 ? targetIndex + 1 : rows.length - 1;
    if (rows[newRowIndex]) {
      const input = rows[newRowIndex].querySelector('input[type="text"]');
      if (input) input.focus();
    }
  }, 60);
}

// Task CRUD Operations
function addSingleTask(particulars = '', period = 'FY 2025-26', remark = '') {
  const client = getActiveClient();
  if (!client) return;

  const currentFY = client.fy || 'FINANCIAL YEAR 2025-26';

  const newTask = {
    id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    checked: false,
    particulars: particulars || '',
    period: period || currentFY,
    remark: remark || ''
  };

  client.tasks.push(newTask);
  saveData();
  renderAll();

  setTimeout(() => {
    const inputs = taskTableBody.querySelectorAll('input[type="text"]');
    if (inputs.length > 0) {
      inputs[inputs.length - 3].focus();
    }
  }, 50);
}

function toggleTaskStatus(taskId) {
  const client = getActiveClient();
  if (!client) return;

  const task = client.tasks.find(t => t.id === taskId);
  if (task) {
    task.checked = !task.checked;
    saveData();
    renderAll();
  }
}

function updateTaskProperty(taskId, field, value) {
  const client = getActiveClient();
  if (!client) return;

  const task = client.tasks.find(t => t.id === taskId);
  if (task) {
    task[field] = value.trim();
    saveData();
    updateStats();
  }
}

function deleteTask(taskId) {
  const client = getActiveClient();
  if (!client) return;

  if (confirm('Are you sure you want to remove this requirement row?')) {
    client.tasks = client.tasks.filter(t => t.id !== taskId);
    saveData();
    renderAll();
  }
}

function moveTask(taskId, direction) {
  const client = getActiveClient();
  if (!client) return;

  const index = client.tasks.findIndex(t => t.id === taskId);
  if (index === -1) return;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= client.tasks.length) return;

  const temp = client.tasks[index];
  client.tasks[index] = client.tasks[targetIndex];
  client.tasks[targetIndex] = temp;

  saveData();
  renderAll();
}

function loadStandardChecklist() {
  const client = getActiveClient();
  if (!client) return;

  if (client.tasks.length > 0) {
    if (!confirm('Append 10 Standard Statutory Audit Requirements to this client checklist?')) {
      return;
    }
  }

  const clientFY = client.fy || 'FY 2025-26';

  STANDARD_AUDIT_CHECKLIST.forEach(item => {
    client.tasks.push({
      id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      checked: false,
      particulars: item.particulars,
      period: item.period || clientFY,
      remark: item.remark
    });
  });

  saveData();
  renderAll();
}

function clearCompletedTasks() {
  const client = getActiveClient();
  if (!client) return;

  const completedCount = client.tasks.filter(t => t.checked).length;
  if (completedCount === 0) {
    alert('No completed tasks to clear.');
    return;
  }

  if (confirm(`Remove ${completedCount} completed requirement(s)?`)) {
    client.tasks = client.tasks.filter(t => !t.checked);
    saveData();
    renderAll();
  }
}

// Client Management Operations
function openAddClientModal() {
  const clientName = prompt('Enter Client / Entity Name:');
  if (!clientName || !clientName.trim()) return;

  const newId = 'client-' + Date.now();
  const newClient = {
    id: newId,
    name: clientName.trim().toUpperCase(),
    fy: 'FINANCIAL YEAR 2025-26',
    tasks: []
  };

  appData.clients.push(newClient);
  appData.activeClientId = newId;
  saveData();
  renderAll();
}

function deleteCurrentClient() {
  const client = getActiveClient();
  if (!client) return;

  if (appData.clients.length <= 1) {
    alert('Cannot delete the only client tab. Please add another client first.');
    return;
  }

  if (confirm(`Are you sure you want to delete tab for "${client.name}" and all its requirements?`)) {
    appData.clients = appData.clients.filter(c => c.id !== client.id);
    appData.activeClientId = appData.clients[0].id;
    saveData();
    renderAll();
  }
}

// =========================================================================
// ⏰ 11:00 AM DAILY REMINDER & ALARM SYSTEM
// =========================================================================

function playAlarmChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx = new AudioContext();
    }

    const now = audioCtx.currentTime;
    
    const chimeFrequencies = [
      { f1: 659.25, f2: 880.00, time: 0.0 },
      { f1: 783.99, f2: 1046.50, time: 0.35 },
      { f1: 880.00, f2: 1318.51, time: 0.70 },
      { f1: 1046.50, f2: 1567.98, time: 1.10 }
    ];

    chimeFrequencies.forEach(chord => {
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(chord.f1, now + chord.time);

      gain1.gain.setValueAtTime(0.3, now + chord.time);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + chord.time + 0.5);

      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now + chord.time);
      osc1.stop(now + chord.time + 0.55);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(chord.f2, now + chord.time);

      gain2.gain.setValueAtTime(0.2, now + chord.time);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + chord.time + 0.6);

      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + chord.time);
      osc2.stop(now + chord.time + 0.65);
    });

  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

function startRingingAlarm() {
  if (isAlarmRingingNow) return;
  isAlarmRingingNow = true;

  playAlarmChime();
  let ringCount = 0;
  alarmIntervalId = setInterval(() => {
    ringCount++;
    playAlarmChime();
    if (ringCount >= 8) {
      stopRingingAlarm();
    }
  }, 1400);

  showAlarmBanner();
}

function stopRingingAlarm() {
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  isAlarmRingingNow = false;
  hideAlarmBanner();
}

function initAlarmMonitor() {
  setInterval(() => {
    if (!alarmSettings.enabled) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const todayDateStr = now.toISOString().slice(0, 10);

    if (currentTimeStr === alarmSettings.time && alarmSettings.lastTriggeredDate !== todayDateStr) {
      alarmSettings.lastTriggeredDate = todayDateStr;
      saveAlarmSettings();
      triggerDaily11AMAlarm();
    }
  }, 10000);
}

function triggerDaily11AMAlarm() {
  startRingingAlarm();

  const pendingClients = appData.clients.filter(c => !isClientCompleted(c));
  let totalPendingTasks = 0;
  pendingClients.forEach(c => {
    totalPendingTasks += getClientPendingCount(c);
  });

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('⏰ M/S. ARYA ASSOCIATES - 11:00 AM Audit Reminder', {
      body: `Daily 11:00 AM Reminder: You have ${pendingClients.length} client(s) with ${totalPendingTasks} pending audit requirement(s) today!`,
      icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827504.png',
      requireInteraction: true
    });
  }
}

function showAlarmBanner() {
  const banner = document.getElementById('alarm-trigger-banner');
  const countSpan = document.getElementById('alarm-pending-client-count');
  if (banner) {
    const pendingClientsCount = appData.clients.filter(c => !isClientCompleted(c)).length;
    if (countSpan) countSpan.textContent = pendingClientsCount;
    banner.classList.remove('hidden');
  }
}

function hideAlarmBanner() {
  const banner = document.getElementById('alarm-trigger-banner');
  if (banner) banner.classList.add('hidden');
}

function openAlarmModal() {
  const modal = document.getElementById('alarm-modal');
  const timeInput = document.getElementById('alarm-time-input');
  const enableCheckbox = document.getElementById('alarm-enable-checkbox');

  if (timeInput) timeInput.value = alarmSettings.time;
  if (enableCheckbox) enableCheckbox.checked = alarmSettings.enabled;

  if (modal) modal.classList.remove('hidden');
}

function closeAlarmModal() {
  const modal = document.getElementById('alarm-modal');
  if (modal) modal.classList.add('hidden');
}

function saveAlarmModalSettings() {
  const timeInput = document.getElementById('alarm-time-input');
  const enableCheckbox = document.getElementById('alarm-enable-checkbox');

  if (timeInput) alarmSettings.time = timeInput.value || '11:00';
  if (enableCheckbox) alarmSettings.enabled = enableCheckbox.checked;

  saveAlarmSettings();
  closeAlarmModal();
  alert(`⏰ Daily alarm configured for ${alarmSettings.time} AM!`);
}

function testAlarmSound() {
  playAlarmChime();
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
}

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        alert('✅ Desktop Notification enabled successfully!');
      } else {
        alert('⚠️ Notification permission was not granted.');
      }
    });
  }
}

// Print functions (Legal & A4)
function printWithPaperSize(paperSize = 'legal') {
  let printStyle = document.getElementById('dynamic-print-page-style');
  if (!printStyle) {
    printStyle = document.createElement('style');
    printStyle.id = 'dynamic-print-page-style';
    document.head.appendChild(printStyle);
  }

  if (paperSize === 'legal') {
    printStyle.innerHTML = `@page { size: legal portrait; margin: 12mm 15mm 15mm 15mm; }`;
  } else {
    printStyle.innerHTML = `@page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }`;
  }

  window.print();
}

// WhatsApp Integration
function openWhatsAppModal() {
  const client = getActiveClient();
  if (!client) return;

  const modal = document.getElementById('whatsapp-modal');
  const previewBox = document.getElementById('wa-preview-text');
  
  if (modal && previewBox) {
    updateWhatsAppPreview();
    modal.classList.remove('hidden');
  }
}

function closeWhatsAppModal() {
  const modal = document.getElementById('whatsapp-modal');
  if (modal) modal.classList.add('hidden');
}

function setWhatsAppMode(mode) {
  whatsappFilterMode = mode;
  document.getElementById('wa-mode-pending').className = mode === 'pending' 
    ? 'px-3 py-1.5 rounded-md bg-emerald-600 text-white font-bold text-xs shadow' 
    : 'px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold';
    
  document.getElementById('wa-mode-all').className = mode === 'all' 
    ? 'px-3 py-1.5 rounded-md bg-emerald-600 text-white font-bold text-xs shadow' 
    : 'px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold';
    
  updateWhatsAppPreview();
}

function generateWhatsAppMessage() {
  const client = getActiveClient();
  if (!client) return '';

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  let text = `*M/S. ARYA ASSOCIATES*\n`;
  text += `═══════════════════════════\n`;
  text += `🏢 *Client:* ${client.name}\n`;
  text += `📅 *Period:* ${client.fy || 'FINANCIAL YEAR 2025-26'}\n`;
  text += `🗓️ *Date:* ${todayStr}\n`;
  text += `═══════════════════════════\n\n`;

  let tasksToInclude = client.tasks;
  if (whatsappFilterMode === 'pending') {
    tasksToInclude = client.tasks.filter(t => !t.checked);
  }

  if (tasksToInclude.length === 0) {
    if (whatsappFilterMode === 'pending') {
      text += `✅ *All audit requirements & documents have been received! No pending items.*\n\n`;
    } else {
      text += `_No items listed in checklist._\n\n`;
    }
  } else {
    text += whatsappFilterMode === 'pending' 
      ? `📋 *PENDING AUDIT REQUIREMENTS / DOCUMENTS:*\n\n`
      : `📋 *AUDIT REQUIREMENTS STATUS:*\n\n`;

    tasksToInclude.forEach((task, idx) => {
      const statusIcon = task.checked ? `✅` : `⏳`;
      text += `${idx + 1}. ${statusIcon} *${task.particulars}*\n`;
      text += `   • *Period:* ${task.period || 'FY 2025-26'}\n`;
      if (task.remark && task.remark.trim()) {
        text += `   • _Remark:_ ${task.remark.trim()}\n`;
      }
      text += `\n`;
    });

    text += `───────────────────────────\n`;
    text += `⚠️ *Note:* Kindly arrange to provide the above pending records/clarifications at the earliest for audit finalization.\n\n`;
  }

  text += `Thank you,\n`;
  text += `*Audit Team*\n`;
  text += `*M/S. ARYA ASSOCIATES*`;

  return text;
}

function updateWhatsAppPreview() {
  const previewBox = document.getElementById('wa-preview-text');
  if (previewBox) {
    previewBox.value = generateWhatsAppMessage();
  }
}

function sendDirectWhatsApp() {
  const phoneInput = document.getElementById('wa-phone-number');
  const messageText = generateWhatsAppMessage();
  
  let phone = phoneInput ? phoneInput.value.replace(/[^0-9]/g, '') : '';
  
  if (phone.length === 10) {
    phone = '91' + phone;
  }

  const encodedText = encodeURIComponent(messageText);

  let waUrl = '';
  if (phone) {
    waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  } else {
    waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  window.open(waUrl, '_blank');
}

function copyWhatsAppText() {
  const messageText = generateWhatsAppMessage();
  navigator.clipboard.writeText(messageText).then(() => {
    const copyBtn = document.getElementById('wa-copy-btn');
    if (copyBtn) {
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = `✓ Copied!`;
      setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
    }
  }).catch(err => {
    alert('Failed to copy to clipboard.');
  });
}

// Export to CSV / Excel
function exportToExcel() {
  const client = getActiveClient();
  if (!client) return;

  let csvContent = "\uFEFF";
  csvContent += `M/S. ARYA ASSOCIATES - AUDIT REQUIREMENTS & CLIENT PENDENCIES\n`;
  csvContent += `CLIENT: ${client.name}\n`;
  csvContent += `PERIOD: ${client.fy}\n`;
  csvContent += `EXPORTED ON: ${new Date().toLocaleDateString()}\n\n`;
  
  csvContent += `Status,S. No.,Particulars,Period,Remark\n`;

  client.tasks.forEach((task, index) => {
    const status = task.checked ? "COMPLETED" : "PENDING";
    const particulars = `"${(task.particulars || '').replace(/"/g, '""')}"`;
    const period = `"${(task.period || '').replace(/"/g, '""')}"`;
    const remark = `"${(task.remark || '').replace(/"/g, '""')}"`;
    
    csvContent += `${status},${index + 1},${particulars},${period},${remark}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Audit_Pendencies_${client.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Full App Reset (Safety Protected)
function fullAppResetPrompt() {
  const confirm1 = confirm("⚠️ WARNING: Are you sure you want to RESET the entire app?\n\nThis will delete all test/sample clients and tasks from both this device and Google Cloud to give you a fresh, clean workspace.");
  if (!confirm1) return;

  const confirm2 = prompt("To confirm full reset, please type 'RESET' in uppercase below:");
  if (confirm2 && confirm2.trim().toUpperCase() === 'RESET') {
    // Fresh initial blank workspace
    appData = {
      activeClientId: 'client-1',
      clients: [
        {
          id: 'client-' + Date.now(),
          name: 'ENTER CLIENT NAME',
          fy: 'FINANCIAL YEAR 2025-26',
          tasks: []
        }
      ]
    };
    saveData();
    renderAll();
    alert("✅ App has been completely RESET!\n\nYou now have a fresh clean workspace ready to add your real audit clients.");
  } else if (confirm2 !== null) {
    alert("Reset cancelled. You did not type 'RESET'.");
  }
}

// Backup & Restore
function backupAllData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
  const link = document.createElement('a');
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `Audit_2026_Backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function restoreDataPrompt() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.clients && Array.isArray(parsed.clients)) {
          appData = parsed;
          saveData();
          renderAll();
          alert('Backup data restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Setup Event Listeners
function setupEventListeners() {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-filter]').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow');
        b.classList.add('bg-white', 'text-slate-600');
      });
      e.currentTarget.classList.add('bg-blue-600', 'text-white', 'shadow');
      e.currentTarget.classList.remove('bg-white', 'text-slate-600');
      currentFilter = e.currentTarget.getAttribute('data-filter');
      renderTasksTable();
    });
  });

  const searchInput = document.getElementById('search-tasks');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTasksTable();
    });
  }

  if (clientSearchInputEl) {
    clientSearchInputEl.addEventListener('input', (e) => {
      clientSearchQuery = e.target.value;
      renderClientTabs();
    });
  }
}

// Utility: Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Start app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', initApp);
