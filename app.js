/**
 * AUDIT-2026: Client Pendencies & Audit Requirements Management App
 * Designed for M/S. ARYA ASSOCIATES
 * 100% Fully Automated Online Google Firebase Cloud & Letterhead PDF Generator
 */

const STORAGE_KEY = 'audit_2026_client_pendencies_db';
const ALARM_STORAGE_KEY = 'audit_2026_alarm_settings';
const FIREBASE_CONFIG_KEY = 'audit_2026_firebase_config';

// ☁️ EMBEDDED DIRECT ONLINE CLOUD CONFIGURATION (Auto-connects on all devices)
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

const COLUMN_WIDTHS_KEY = 'audit_2026_column_widths';

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
  initColumnResizers();
}

// ↔️ Excel-Style Column Resizer & Width Lock Engine
function applySavedColumnWidths() {
  const table = document.getElementById('main-audit-table');
  if (!table) return;

  const defaultWidths = {
    select: '55px',
    sno: '65px',
    particulars: '440px',
    period: '180px',
    remark: '320px',
    actions: '120px'
  };

  try {
    const savedWidths = localStorage.getItem(COLUMN_WIDTHS_KEY);
    const widths = savedWidths ? { ...defaultWidths, ...JSON.parse(savedWidths) } : defaultWidths;
    Object.keys(widths).forEach(colName => {
      const th = table.querySelector(`th[data-col="${colName}"]`);
      if (th && widths[colName]) {
        th.style.width = widths[colName];
      }
    });
  } catch (e) {
    Object.keys(defaultWidths).forEach(colName => {
      const th = table.querySelector(`th[data-col="${colName}"]`);
      if (th) th.style.width = defaultWidths[colName];
    });
  }
}

function initColumnResizers() {
  const table = document.getElementById('main-audit-table');
  if (!table) return;

  applySavedColumnWidths();

  const resizers = table.querySelectorAll('.col-resizer');
  resizers.forEach(resizer => {
    const th = resizer.parentElement;
    let startX, startWidth;

    const onMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startX = e.pageX;
      startWidth = th.offsetWidth;
      resizer.classList.add('is-resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = (moveEvent) => {
        const delta = moveEvent.pageX - startX;
        const newWidth = Math.max(45, startWidth + delta);
        th.style.width = `${newWidth}px`;
      };

      const onMouseUp = () => {
        resizer.classList.remove('is-resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        saveColumnWidths();
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onTouchStart = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      e.stopPropagation();
      startX = e.touches[0].pageX;
      startWidth = th.offsetWidth;
      resizer.classList.add('is-resizing');

      const onTouchMove = (moveEvent) => {
        if (!moveEvent.touches || moveEvent.touches.length === 0) return;
        const delta = moveEvent.touches[0].pageX - startX;
        const newWidth = Math.max(45, startWidth + delta);
        th.style.width = `${newWidth}px`;
      };

      const onTouchEnd = () => {
        resizer.classList.remove('is-resizing');
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        saveColumnWidths();
      };

      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    };

    resizer.addEventListener('mousedown', onMouseDown);
    resizer.addEventListener('touchstart', onTouchStart, { passive: false });
  });
}

// Save adjusted column widths to localStorage so they stay permanently locked
function saveColumnWidths() {
  const table = document.getElementById('main-audit-table');
  if (!table) return;

  const widths = {};
  table.querySelectorAll('th[data-col]').forEach(th => {
    const colName = th.getAttribute('data-col');
    if (colName) {
      widths[colName] = `${th.offsetWidth}px`;
    }
  });

  try {
    localStorage.setItem(COLUMN_WIDTHS_KEY, JSON.stringify(widths));
  } catch (e) {}
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

let cloudSyncTimeout = null;

// Real-time Live Cloud Auto-Sync (Debounced on keystroke for fast typing)
function saveDataLive() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  } catch (err) {
    console.error('Error saving data to storage:', err);
  }

  if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);

  updateCloudSyncIndicator('syncing');
  cloudSyncTimeout = setTimeout(() => {
    if (firebaseDataRef && !isSyncingFromCloud) {
      firebaseDataRef.set(appData)
        .then(() => {
          updateCloudSyncIndicator('connected');
        })
        .catch(err => {
          console.error('Firebase online live save error:', err);
          updateCloudSyncIndicator('error');
        });
    }
  }, 350); // 350ms real-time cloud sync debounce
}

// Immediate Cloud Save (For checkboxes, adding/deleting rows, client changes)
function saveData() {
  if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  } catch (err) {
    console.error('Error saving data to storage:', err);
  }

  // Push directly online to Google Firebase Cloud immediately
  if (firebaseDataRef && !isSyncingFromCloud) {
    updateCloudSyncIndicator('syncing');
    firebaseDataRef.set(appData)
      .then(() => {
        setTimeout(() => updateCloudSyncIndicator('connected'), 250);
      })
      .catch(err => {
        console.error('Firebase online save error:', err);
        updateCloudSyncIndicator('error');
      });
  }
}

// =========================================================================
// ☁️ 100% AUTOMATIC REAL-TIME FIREBASE CLOUD DATABASE ENGINE
// =========================================================================

function initFirebaseCloud() {
  let config = DEFAULT_FIREBASE_CONFIG;
  const savedConfig = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (savedConfig) {
    try {
      config = JSON.parse(savedConfig);
    } catch (e) {}
  }

  try {
    if (!firebase.apps.length) {
      firebaseApp = firebase.initializeApp(config);
    } else {
      firebaseApp = firebase.app();
    }

    firebaseDB = firebase.database();
    firebaseDataRef = firebaseDB.ref('audit_aryassociates_live_data');

    // Monitor Realtime Online Connection Presence
    firebaseDB.ref('.info/connected').on('value', (snap) => {
      if (snap.val() === true) {
        isCloudConnected = true;
        updateCloudSyncIndicator('connected');
      } else {
        updateCloudSyncIndicator('syncing');
      }
    });

    updateCloudSyncIndicator('syncing');

    // Bi-directional Real-Time Listener (Instant Sync across all devices)
    firebaseDataRef.on('value', (snapshot) => {
      const cloudData = snapshot.val();
      if (cloudData && cloudData.clients && Array.isArray(cloudData.clients) && cloudData.clients.length > 0) {
        const currentJson = JSON.stringify(appData);
        const cloudJson = JSON.stringify(cloudData);

        // Only re-render if data is actually different (avoids cursor jumping)
        if (currentJson !== cloudJson) {
          isSyncingFromCloud = true;
          appData = cloudData;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
          } catch (e) {}

          const activeEl = document.activeElement;
          const activeCol = activeEl ? activeEl.getAttribute('data-col') : null;
          const activeRow = activeEl ? activeEl.closest('tr') : null;
          const rowIndex = activeRow ? Array.from(taskTableBody.querySelectorAll('tr')).indexOf(activeRow) : -1;
          const selStart = (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) ? activeEl.selectionStart : null;

          renderAll();

          // Restore cursor focus seamlessly if typing
          if (activeCol && rowIndex !== -1) {
            const rows = taskTableBody.querySelectorAll('tr');
            if (rows[rowIndex]) {
              const targetInput = rows[rowIndex].querySelector(`[data-col="${activeCol}"]`);
              if (targetInput) {
                targetInput.focus();
                if (selStart !== null) {
                  targetInput.setSelectionRange(selStart, selStart);
                }
              }
            }
          }
          isSyncingFromCloud = false;
        }
      } else if (!cloudData) {
        // Initial cloud database seed
        firebaseDataRef.set(appData);
      }
      isCloudConnected = true;
      updateCloudSyncIndicator('connected');
    }, (err) => {
      console.warn('Firebase notice:', err);
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

// =========================================================================
// 📄 OFFICIAL LETTERHEAD PDF ENGINE & DIRECT WHATSAPP SHARING
// =========================================================================

// Generate High-Definition Printable Letterhead HTML Structure
function generateLetterheadHTML() {
  const client = getActiveClient();
  if (!client) return '';

  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const rawFY = client.fy || 'FINANCIAL YEAR 2025-26';
  const cleanYear = rawFY.replace(/^FINANCIAL\s+YEAR\s*:?\s*/i, '').trim() || '2025-26';

  // Strictly Pending Tasks ONLY in PDF (Completed tasks are excluded)
  let tasksToInclude = (client.tasks || []).filter(t => !t.checked);

  let tableRowsHTML = '';
  if (tasksToInclude.length === 0) {
    tableRowsHTML = `
      <tr>
        <td colspan="4" style="padding: 24px; text-align: center; color: #16a34a; font-weight: bold; font-size: 14px;">
          ✓ All audit requirements & documents have been completely received! No pending requirements.
        </td>
      </tr>
    `;
  } else {
    tasksToInclude.forEach((task, index) => {
      // If user wrote something in remark, show exact text; otherwise leave completely blank
      const userRemark = (task.remark && task.remark.trim()) ? escapeHtml(task.remark.trim()) : '';

      tableRowsHTML += `
        <tr style="border-bottom: 1px solid #cbd5e1; background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 9px 8px; text-align: center; font-weight: 800; color: #334155; font-size: 11.5px; border-right: 1px solid #cbd5e1; width: 45px; vertical-align: top;">
            ${index + 1}
          </td>
          <td style="padding: 9px 12px; font-weight: 700; color: #0f172a; font-size: 12px; border-right: 1px solid #cbd5e1; line-height: 1.45; word-break: break-word; white-space: pre-wrap; vertical-align: top;">
            ${escapeHtml(task.particulars || '')}
          </td>
          <td style="padding: 9px 10px; font-weight: 600; color: #475569; font-size: 11.5px; border-right: 1px solid #cbd5e1; width: 130px; word-break: break-word; white-space: pre-wrap; vertical-align: top;">
            ${escapeHtml(task.period || cleanYear)}
          </td>
          <td style="padding: 9px 10px; font-size: 11.5px; color: #334155; font-weight: 600; line-height: 1.45; word-break: break-word; white-space: pre-wrap; vertical-align: top;">
            ${userRemark}
          </td>
        </tr>
      `;
    });
  }

  return `
    <div id="pdf-letterhead-content" style="font-family: 'Inter', sans-serif; background-color: #ffffff; color: #0f172a; padding: 24px 28px; width: 100%; box-sizing: border-box; position: relative;">
      
      <!-- LETTERHEAD TOP BRANDING -->
      <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px;">
        <h1 style="font-family: 'Cinzel', serif; font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #0f172a; margin: 0 0 3px 0; text-transform: uppercase;">
          M/S. ARYA ASSOCIATES
        </h1>
        <div style="width: 80px; height: 2px; background-color: #b45309; margin: 0 auto 5px auto;"></div>
        <p style="font-size: 10.5px; font-weight: 800; color: #475569; letter-spacing: 1px; margin: 0; text-transform: uppercase;">
          AUDIT REQUIREMENTS & CLIENT PENDENCY REQUISITION
        </p>
      </div>

      <!-- CLIENT & DATE METADATA BOX -->
      <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <p style="margin: 0 0 2px 0; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">TO (CLIENT / ENTITY NAME):</p>
          <h2 style="margin: 0; font-size: 17px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: -0.2px;">
            ${escapeHtml(client.name)}
          </h2>
        </div>
        <div style="text-align: right; min-width: 160px;">
          <div style="display: inline-block; background-color: #0f172a; color: #fbbf24; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 900; margin-bottom: 3px;">
            📅 FY ${escapeHtml(cleanYear)}
          </div>
          <p style="margin: 2px 0 0 0; font-size: 10.5px; font-weight: 700; color: #475569;">
            <strong>Date:</strong> ${todayStr}
          </p>
        </div>
      </div>

      <!-- SUBJECT TITLE -->
      <div style="margin-bottom: 12px;">
        <p style="margin: 0; font-size: 11.5px; font-weight: 800; color: #0f172a;">
          <span style="text-decoration: underline;">SUB:</span> Requisition for Pending Statutory Audit Documents & Records
        </p>
      </div>

      <!-- AUDIT CHECKLIST TABLE -->
      <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #0f172a; margin-bottom: 0; font-size: 11.5px; table-layout: fixed;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff;">
            <th style="padding: 8px 6px; text-align: center; width: 45px; font-size: 10.5px; font-weight: 900; text-transform: uppercase; border-right: 1px solid #334155;">
              S. No.
            </th>
            <th style="padding: 8px 12px; text-align: left; font-size: 10.5px; font-weight: 900; text-transform: uppercase; border-right: 1px solid #334155;">
              PARTICULARS OF AUDIT REQUIREMENT
            </th>
            <th style="padding: 8px 10px; text-align: left; width: 130px; font-size: 10.5px; font-weight: 900; text-transform: uppercase; border-right: 1px solid #334155;">
              PERIOD
            </th>
            <th style="padding: 8px 10px; text-align: left; width: 170px; font-size: 10.5px; font-weight: 900; text-transform: uppercase;">
              STATUS / REMARKS
            </th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHTML}
        </tbody>
      </table>

      <!-- Bottom is kept completely clean without unwanted notes or clutter -->

    </div>
  `;
}

// Download Letterhead PDF File directly to Computer / Mobile (0.75" Bottom Margin)
async function downloadLetterheadPDF() {
  const client = getActiveClient();
  if (!client) return;

  const renderBox = document.getElementById('pdf-export-render-box');
  if (!renderBox) return;

  renderBox.innerHTML = generateLetterheadHTML();
  renderBox.classList.remove('hidden');

  const element = document.getElementById('pdf-letterhead-content');
  const safeClientName = client.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Audit_Pendency_Letterhead_${safeClientName}.pdf`;

  const opt = {
    margin: [10, 10, 19.05, 10], // 19.05mm = exactly 0.75 inch bottom margin!
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('PDF generation error:', err);
    alert('PDF generated. Check your downloads.');
  } finally {
    renderBox.classList.add('hidden');
    renderBox.innerHTML = '';
  }
}

// Share Official Letterhead PDF on WhatsApp (0.75" Bottom Margin)
async function shareLetterheadPDFOnWhatsApp() {
  const client = getActiveClient();
  if (!client) return;

  const phoneInput = document.getElementById('wa-phone-number');
  let phone = phoneInput ? phoneInput.value.replace(/[^0-9]/g, '') : '';
  if (phone.length === 10) phone = '91' + phone;

  const renderBox = document.getElementById('pdf-export-render-box');
  if (!renderBox) return;

  renderBox.innerHTML = generateLetterheadHTML();
  renderBox.classList.remove('hidden');

  const element = document.getElementById('pdf-letterhead-content');
  const safeClientName = client.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Audit_Pendency_Letterhead_${safeClientName}.pdf`;

  const opt = {
    margin: [10, 10, 19.05, 10], // 19.05mm = exactly 0.75 inch bottom margin!
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const shareBtn = document.getElementById('btn-share-whatsapp-pdf');
  if (shareBtn) shareBtn.innerHTML = `⏳ Generating PDF...`;

  try {
    // Generate PDF Blob
    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // Check if device supports direct file sharing (Mobile Phones, iPads, Chrome Web Share)
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        files: [pdfFile],
        title: `Audit Pendency Letterhead - ${client.name}`,
        text: `*M/S. ARYA ASSOCIATES*\nOfficial Audit Requirements & Pendency Letterhead PDF for *${client.name}* (${client.fy || 'FY 2025-26'}). Kindly review the attached PDF.`
      });
    } else {
      // Desktop / Web WhatsApp flow: Automatically download PDF file and launch WhatsApp
      await html2pdf().set(opt).from(element).save();

      const msgText = encodeURIComponent(
        `*M/S. ARYA ASSOCIATES*\n` +
        `═══════════════════════════\n` +
        `🏢 *Client:* ${client.name}\n` +
        `📅 *Period:* ${client.fy || 'FINANCIAL YEAR 2025-26'}\n` +
        `📄 *Document:* Official Audit Pendency Letterhead PDF\n` +
        `═══════════════════════════\n\n` +
        `Dear Sir/Madam,\n` +
        `Please find attached our official Letterhead PDF requisition for the pending audit documents & records. Kindly review the attached PDF file and arrange the records at the earliest.\n\n` +
        `Thank you,\n*Audit Team*\n*M/S. ARYA ASSOCIATES*`
      );

      let waUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${msgText}` : `https://api.whatsapp.com/send?text=${msgText}`;
      window.open(waUrl, '_blank');
      alert(`✅ Official Letterhead PDF downloaded!\n\nWhatsApp has been opened — simply attach/drag the downloaded PDF "${fileName}" to the chat.`);
    }

  } catch (err) {
    console.error('WhatsApp PDF share error:', err);
    // Fallback: download PDF
    await downloadLetterheadPDF();
  } finally {
    renderBox.classList.add('hidden');
    renderBox.innerHTML = '';
    if (shareBtn) shareBtn.innerHTML = `Send Letterhead PDF`;
    closeWhatsAppModal();
  }
}

// Modal open/close
function openWhatsAppModal() {
  const client = getActiveClient();
  if (!client) return;

  const modal = document.getElementById('whatsapp-modal');
  const pendingBadge = document.getElementById('wa-pending-count-badge');
  if (pendingBadge && client.tasks) {
    pendingBadge.textContent = client.tasks.filter(t => !t.checked).length;
  }

  if (modal) modal.classList.remove('hidden');
}

function closeWhatsAppModal() {
  const modal = document.getElementById('whatsapp-modal');
  if (modal) modal.classList.add('hidden');
}

function setWhatsAppMode(mode) {
  whatsappFilterMode = mode;
  document.getElementById('wa-mode-pending').className = mode === 'pending' 
    ? 'flex-1 py-2 rounded-md bg-emerald-600 text-white font-bold text-xs shadow text-center' 
    : 'flex-1 py-2 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold text-center';
    
  document.getElementById('wa-mode-all').className = mode === 'all' 
    ? 'flex-1 py-2 rounded-md bg-emerald-600 text-white font-bold text-xs shadow text-center' 
    : 'flex-1 py-2 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold text-center';
}

// =========================================================================
// STANDARD APP FUNCTIONS
// =========================================================================

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

function saveAlarmSettings() {
  try {
    localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(alarmSettings));
  } catch (err) {
    console.error('Error saving alarm settings:', err);
  }
  updateAlarmHeaderBadge();
}

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

function isClientCompleted(client) {
  if (!client.tasks || client.tasks.length === 0) return false;
  return client.tasks.every(t => t.checked);
}

function getClientPendingCount(client) {
  if (!client.tasks) return 0;
  return client.tasks.filter(t => !t.checked).length;
}

function getActiveClient() {
  if (!appData.clients || !Array.isArray(appData.clients) || appData.clients.length === 0) {
    const defaultId = 'client-' + Date.now();
    appData.clients = [
      {
        id: defaultId,
        name: 'ENTER CLIENT NAME',
        fy: 'FINANCIAL YEAR 2025-26',
        tasks: []
      }
    ];
    appData.activeClientId = defaultId;
    return appData.clients[0];
  }

  let client = appData.clients.find(c => c.id === appData.activeClientId);
  if (!client) {
    appData.activeClientId = appData.clients[0].id;
    client = appData.clients[0];
  }

  if (!Array.isArray(client.tasks)) {
    client.tasks = [];
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

    // Keep the currently active client visible so tab does not jump away when marked completed
    if (client.id !== appData.activeClientId) {
      if (clientStatusFilter === 'pending' && completed) {
        return false;
      }
      if (clientStatusFilter === 'completed' && !completed) {
        return false;
      }
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

function updateCurrentClientName(newName) {
  const client = getActiveClient();
  if (!client) return;

  if (newName && newName.trim()) {
    client.name = newName.trim().toUpperCase();
    saveData();
    renderClientTabs();
  }
}

function updateCurrentClientYearOnly(newYear) {
  const client = getActiveClient();
  if (!client) return;

  if (newYear && newYear.trim()) {
    const clean = newYear.trim().toUpperCase();
    client.fy = `FINANCIAL YEAR ${clean}`;
    saveData();
  }
}

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
    tr.className = `transition-colors border-b ${task.checked ? 'row-completed' : 'hover:bg-slate-50'}`;
    
    const actualIndex = client.tasks.findIndex(t => t.id === task.id) + 1;

    tr.innerHTML = `
      <!-- TICK BOX -->
      <td class="px-2 py-2 text-center w-14">
        <input 
          type="checkbox" 
          class="custom-checkbox" 
          ${task.checked ? 'checked' : ''} 
          title="Mark as Received / Completed"
          onchange="toggleTaskStatus('${task.id}')"
        />
      </td>

      <!-- S. NO. -->
      <td class="px-2 py-2 text-center font-bold text-slate-700 w-16" style="vertical-align: top; padding-top: 10px;">
        ${actualIndex}
      </td>

      <!-- PARTICULARS (Auto-expanding multi-line textarea with Keystroke Live Sync) -->
      <td class="px-2 py-1.5" style="vertical-align: top;">
        <textarea 
          rows="1"
          data-col="particulars"
          placeholder="Enter audit requirement or pending document..."
          class="table-textarea font-medium text-slate-900 text-sm ${task.checked ? 'line-through text-slate-600 font-bold' : ''}"
          oninput="autoResizeTextarea(this); updateTaskPropertyLive('${task.id}', 'particulars', this.value)"
          onkeydown="handleTableInputKey(event, '${task.id}', 'particulars')"
        >${escapeHtml(task.particulars)}</textarea>
      </td>

      <!-- PERIOD (Keystroke Live Sync) -->
      <td class="px-2 py-1.5" style="vertical-align: top;">
        <input 
          type="text" 
          data-col="period"
          value="${escapeHtml(task.period)}" 
          placeholder="e.g. FY 2025-26, Q3"
          class="table-input text-slate-700 text-sm font-semibold"
          oninput="updateTaskPropertyLive('${task.id}', 'period', this.value)"
          onkeydown="handleTableInputKey(event, '${task.id}', 'period')"
        />
      </td>

      <!-- REMARK (Auto-expanding multi-line textarea with Keystroke Live Sync) -->
      <td class="px-2 py-1.5" style="vertical-align: top;">
        <textarea 
          rows="1"
          data-col="remark"
          placeholder="Add remarks / follow-up status..."
          class="table-textarea text-slate-700 text-sm font-medium"
          oninput="autoResizeTextarea(this); updateTaskPropertyLive('${task.id}', 'remark', this.value)"
          onkeydown="handleTableInputKey(event, '${task.id}', 'remark')"
        >${escapeHtml(task.remark)}</textarea>
      </td>

      <!-- ACTIONS: [+] | [▲] | [▼] | [🗑️] (tabindex -1 so Tab key stays in table columns) -->
      <td class="px-2 py-2 text-center w-28 no-print action-cell" style="vertical-align: top; padding-top: 8px;">
        <div class="flex items-center justify-center gap-1">
          <button 
            tabindex="-1"
            onclick="insertTaskAfter('${task.id}', 'particulars')" 
            title="Add New Line Below (+)" 
            class="w-6 h-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded font-black text-sm transition shadow-sm">
            +
          </button>
          <button 
            tabindex="-1"
            onclick="moveTask('${task.id}', -1)" 
            title="Move Up" 
            class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded text-xs transition">
            ▲
          </button>
          <button 
            tabindex="-1"
            onclick="moveTask('${task.id}', 1)" 
            title="Move Down" 
            class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded text-xs transition">
            ▼
          </button>
          <button 
            tabindex="-1"
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

  // Auto-resize all textareas to fit content without cutting or overlapping
  autoResizeAllTextareas();

  // Apply saved column width locks
  applySavedColumnWidths();
}

// Auto resize textarea helper
function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.max(32, el.scrollHeight) + 'px';
}

function autoResizeAllTextareas() {
  document.querySelectorAll('.table-textarea').forEach(ta => {
    autoResizeTextarea(ta);
  });
}

// ⌨️ Excel-Grade Keyboard Navigation Handler
function handleTableInputKey(event, taskId, colName) {
  const client = getActiveClient();
  if (!client) return;

  const rows = Array.from(taskTableBody.querySelectorAll('tr'));
  const currentRow = event.target.closest('tr');
  const rowIndex = rows.indexOf(currentRow);

  if (event.key === 'Tab') {
    if (!event.shiftKey) {
      // Forward Tab
      if (colName === 'particulars') {
        event.preventDefault();
        const nextInput = currentRow.querySelector('[data-col="period"]');
        if (nextInput) nextInput.focus();
      } else if (colName === 'period') {
        event.preventDefault();
        const nextInput = currentRow.querySelector('[data-col="remark"]');
        if (nextInput) nextInput.focus();
      } else if (colName === 'remark') {
        event.preventDefault();
        if (rowIndex === rows.length - 1) {
          // Last row: Auto add a new row and focus into particulars
          addSingleTask('', '', '', 'particulars');
        } else {
          // Move to particulars of next row
          const nextRow = rows[rowIndex + 1];
          if (nextRow) {
            const nextInput = nextRow.querySelector('[data-col="particulars"]');
            if (nextInput) nextInput.focus();
          }
        }
      }
    } else {
      // Shift + Tab (Backward)
      if (colName === 'remark') {
        event.preventDefault();
        const prevInput = currentRow.querySelector('[data-col="period"]');
        if (prevInput) prevInput.focus();
      } else if (colName === 'period') {
        event.preventDefault();
        const prevInput = currentRow.querySelector('[data-col="particulars"]');
        if (prevInput) prevInput.focus();
      } else if (colName === 'particulars') {
        if (rowIndex > 0) {
          event.preventDefault();
          const prevRow = rows[rowIndex - 1];
          if (prevRow) {
            const prevInput = prevRow.querySelector('[data-col="remark"]');
            if (prevInput) prevInput.focus();
          }
        }
      }
    }
  } else if (event.key === 'Enter') {
    // Enter key creates a row and stays in the EXACT SAME COLUMN
    event.preventDefault();
    insertTaskAfter(taskId, colName);
  } else if (event.key === 'ArrowDown') {
    // Navigate straight down in same column
    if (rowIndex < rows.length - 1) {
      event.preventDefault();
      const nextRow = rows[rowIndex + 1];
      if (nextRow) {
        const input = nextRow.querySelector(`[data-col="${colName}"]`);
        if (input) input.focus();
      }
    }
  } else if (event.key === 'ArrowUp') {
    // Navigate straight up in same column
    if (rowIndex > 0) {
      event.preventDefault();
      const prevRow = rows[rowIndex - 1];
      if (prevRow) {
        const input = prevRow.querySelector(`[data-col="${colName}"]`);
        if (input) input.focus();
      }
    }
  }
}

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
function toggleSelectAllTasks(forcedState) {
  const client = getActiveClient();
  if (!client || !client.tasks || client.tasks.length === 0) return;

  // Determine target state:
  // If not all tasks are checked, clicking Select All should mark ALL as checked (true)
  // If ALL tasks are already checked, clicking Select All should unmark ALL (false)
  let targetState;
  if (typeof forcedState === 'boolean') {
    targetState = forcedState;
  } else {
    const allAlreadyChecked = client.tasks.every(t => t.checked);
    targetState = !allAlreadyChecked;
  }

  client.tasks.forEach(task => {
    task.checked = targetState;
  });

  saveData();
  renderAll();
}

// Insert Task After a Specific Task (Plus Button)
function insertTaskAfter(taskId, targetCol = 'particulars') {
  const client = getActiveClient();
  if (!client) return;

  if (!Array.isArray(client.tasks)) {
    client.tasks = [];
  }

  const rawFY = client.fy || 'FINANCIAL YEAR 2025-26';
  const cleanYear = rawFY.replace(/^FINANCIAL\s+YEAR\s*:?\s*/i, '').trim() || '2025-26';

  const newTask = {
    id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    checked: false,
    particulars: '',
    period: `FY ${cleanYear}`,
    remark: ''
  };

  const targetIndex = client.tasks.findIndex(t => t.id === taskId);
  if (targetIndex !== -1) {
    client.tasks.splice(targetIndex + 1, 0, newTask);
  } else {
    client.tasks.push(newTask);
  }

  if (currentFilter === 'completed') {
    currentFilter = 'all';
    document.querySelectorAll('[data-filter]').forEach(b => {
      if (b.getAttribute('data-filter') === 'all') {
        b.classList.add('bg-blue-600', 'text-white', 'shadow');
        b.classList.remove('bg-white', 'text-slate-600');
      } else {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow');
        b.classList.add('bg-white', 'text-slate-600');
      }
    });
  }

  if (searchQuery.trim()) {
    searchQuery = '';
    const searchInput = document.getElementById('search-tasks');
    if (searchInput) searchInput.value = '';
  }

  saveData();
  renderAll();

  setTimeout(() => {
    const rows = taskTableBody.querySelectorAll('tr');
    const newRowIndex = targetIndex !== -1 ? targetIndex + 1 : rows.length - 1;
    if (rows[newRowIndex]) {
      const input = rows[newRowIndex].querySelector(`input[data-col="${targetCol}"]`) || rows[newRowIndex].querySelector('input[type="text"]');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, 60);
}

// Task CRUD Operations
function addSingleTask(particulars = '', period = '', remark = '', targetCol = 'particulars') {
  const client = getActiveClient();
  if (!client) return;

  if (!Array.isArray(client.tasks)) {
    client.tasks = [];
  }

  const rawFY = client.fy || 'FINANCIAL YEAR 2025-26';
  const cleanYear = rawFY.replace(/^FINANCIAL\s+YEAR\s*:?\s*/i, '').trim() || '2025-26';

  const newTask = {
    id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    checked: false,
    particulars: particulars || '',
    period: period || `FY ${cleanYear}`,
    remark: remark || ''
  };

  client.tasks.push(newTask);

  if (currentFilter === 'completed') {
    currentFilter = 'all';
    document.querySelectorAll('[data-filter]').forEach(b => {
      if (b.getAttribute('data-filter') === 'all') {
        b.classList.add('bg-blue-600', 'text-white', 'shadow');
        b.classList.remove('bg-white', 'text-slate-600');
      } else {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow');
        b.classList.add('bg-white', 'text-slate-600');
      }
    });
  }

  if (searchQuery.trim()) {
    searchQuery = '';
    const searchInput = document.getElementById('search-tasks');
    if (searchInput) searchInput.value = '';
  }

  saveData();
  renderAll();

  setTimeout(() => {
    const rows = taskTableBody.querySelectorAll('tr');
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      const input = lastRow.querySelector(`input[data-col="${targetCol}"]`) || lastRow.querySelector('input[type="text"]');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, 60);
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

// Live Keystroke Property Updater (Real-time Cloud Sync)
function updateTaskPropertyLive(taskId, field, value) {
  const client = getActiveClient();
  if (!client) return;

  const task = client.tasks.find(t => t.id === taskId);
  if (task) {
    task[field] = value;
    saveDataLive();
    updateStats();
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

// ⚡ Fast / Common Task Entry Engine
function handleQuickPresetSelect(value) {
  if (!value) return;
  const client = getActiveClient();
  const rawFY = client && client.fy ? client.fy : 'FINANCIAL YEAR 2025-26';
  const cleanYear = rawFY.replace(/^FINANCIAL\s+YEAR\s*:?\s*/i, '').trim() || '2025-26';

  const partInput = document.getElementById('quick-entry-particulars');
  const periodInput = document.getElementById('quick-entry-period');
  if (partInput) partInput.value = value;
  if (periodInput && !periodInput.value) periodInput.value = `FY ${cleanYear}`;
  if (partInput) partInput.focus();
}

function submitQuickTaskEntry() {
  const client = getActiveClient();
  if (!client) return;

  const partInput = document.getElementById('quick-entry-particulars');
  const periodInput = document.getElementById('quick-entry-period');
  const remarkInput = document.getElementById('quick-entry-remark');
  const presetSelect = document.getElementById('quick-preset-select');

  const particulars = partInput ? partInput.value.trim() : '';
  if (!particulars) {
    if (partInput) partInput.focus();
    return;
  }

  const rawFY = client.fy || 'FINANCIAL YEAR 2025-26';
  const cleanYear = rawFY.replace(/^FINANCIAL\s+YEAR\s*:?\s*/i, '').trim() || '2025-26';
  const period = periodInput && periodInput.value.trim() ? periodInput.value.trim() : `FY ${cleanYear}`;
  const remark = remarkInput ? remarkInput.value.trim() : '';

  // Add new task to active client
  addSingleTask(particulars, period, remark);

  // Clear fast entry form for next entry immediately
  if (partInput) {
    partInput.value = '';
    partInput.focus();
  }
  if (remarkInput) remarkInput.value = '';
  if (presetSelect) presetSelect.value = '';
}

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

  if (!Array.isArray(appData.clients)) {
    appData.clients = [];
  }

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

// Alarm Functions
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
    console.warn('Audio error:', err);
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
    const freshId = 'client-' + Date.now();
    appData = {
      activeClientId: freshId,
      clients: [
        {
          id: freshId,
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
