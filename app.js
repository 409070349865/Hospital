const state = {
  patients: [],
  sort: { key: null, dir: 1 },
  streamTimer: null,
  liveVitals: { hr: 0, steps: 0, spo2: 0 }
};

const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

function init() {
  seed();
  bindTabs();
  bindTableSort();
  bindFilters();
  bindAdd();
  bindEdit();
  bindExport();
  bindImport();
  bindSensors();
  renderAll();
}
function seed() {
  const sample = [
    {name:'Aarav Sharma',age:62,gender:'Male',bloodType:'A+',medicalCondition:'CHF',dateOfAdmission:'2025-09-15',doctor:'Dr. Mehta',hospital:'Nanded General',insuranceProvider:'HDFC Ergo',billingAmount:185000,roomNumber:'3B-12',admissionType:'Emergency',dischargeDate:'2025-09-24',medication:['Furosemide','ACE inhibitor'],testResults:['BNP High','Echo EF 35%']},
    {name:'Isha Patil',age:41,gender:'Female',bloodType:'O-',medicalCondition:'Pneumonia',dateOfAdmission:'2025-09-20',doctor:'Dr. Kulkarni',hospital:'MH City Care',insuranceProvider:'ICICI Lombard',billingAmount:75000,roomNumber:'2A-07',admissionType:'Elective',dischargeDate:'2025-09-25',medication:['Azithromycin'],testResults:['CRP Elevated','X-ray Consolidation']},
    {name:'Rahul Deshmukh',age:73,gender:'Male',bloodType:'B+',medicalCondition:'COPD Exacerbation',dateOfAdmission:'2025-09-10',doctor:'Dr. Joshi',hospital:'Nanded General',insuranceProvider:'Star Health',billingAmount:120000,roomNumber:'4C-21',admissionType:'Emergency',dischargeDate:'2025-09-18',medication:['Prednisone','Bronchodilator'],testResults:['ABG: CO2 High']}
  ];
  state.patients = sample.map(p => ({...p, riskScore: computeRisk(p)}));
  persist();
}
function persist() {
  localStorage.setItem('patients', JSON.stringify(state.patients));
}
function load() {
  const data = localStorage.getItem('patients');
  if (data) state.patients = JSON.parse(data);
}
function bindTabs() {
  qsa('nav button').forEach(b => b.addEventListener('click', () => {
    qsa('.tab').forEach(s => s.classList.remove('active'));
    qs(`#${b.dataset.tab}`).classList.add('active');
  }));
}
function bindTableSort() {
  qsa('#patientsTable th[data-sort]').forEach(th => th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (state.sort.key === key) state.sort.dir *= -1; else state.sort = { key, dir: 1 };
    renderTable();
  }));
}
function bindFilters() {
  qs('#search').addEventListener('input', renderTable);
  qs('#filterAdmission').addEventListener('change', renderTable);
  qs('#filterDoctor').addEventListener('change', renderTable);
  qs('#filterHospital').addEventListener('change', renderTable);
  qs('#clearFilters').addEventListener('click', () => {
    qs('#search').value = '';
    qs('#filterAdmission').value = '';
    qs('#filterDoctor').value = '';
    qs('#filterHospital').value = '';
    renderTable();
  });
}
function bindAdd() {
  qs('#addForm').addEventListener('submit', e => {
    e.preventDefault();
    const p = {
      name: qs('#name').value.trim(),
      age: Number(qs('#age').value),
      gender: qs('#gender').value,
      bloodType: qs('#bloodType').value,
      medicalCondition: qs('#medicalCondition').value.trim(),
      dateOfAdmission: qs('#dateOfAdmission').value,
      doctor: qs('#doctor').value.trim(),
      hospital: qs('#hospital').value.trim(),
      insuranceProvider: qs('#insuranceProvider').value.trim(),
      billingAmount: Number(qs('#billingAmount').value),
      roomNumber: qs('#roomNumber').value.trim(),
      admissionType: qs('#admissionType').value,
      dischargeDate: qs('#dischargeDate').value || '',
      medication: splitList(qs('#medication').value),
      testResults: splitList(qs('#testResults').value)
    };
    p.riskScore = computeRisk(p);
    state.patients.push(p);
    persist();
    renderAll();
    qs('#addForm').reset();
    qs('nav button[data-tab="patients"]').click();
  });
}
function bindEdit() {
  qs('#closeModal').addEventListener('click', closeModal);
  qs('#editForm').addEventListener('submit', e => {
    e.preventDefault();
    const i = Number(qs('#editForm').dataset.index);
    const p = state.patients[i];
    p.name = qs('#e_name').value.trim();
    p.age = Number(qs('#e_age').value);
    p.gender = qs('#e_gender').value;
    p.bloodType = qs('#e_bloodType').value;
    p.medicalCondition = qs('#e_medicalCondition').value.trim();
    p.dateOfAdmission = qs('#e_dateOfAdmission').value;
    p.doctor = qs('#e_doctor').value.trim();
    p.hospital = qs('#e_hospital').value.trim();
    p.insuranceProvider = qs('#e_insuranceProvider').value.trim();
    p.billingAmount = Number(qs('#e_billingAmount').value);
    p.roomNumber = qs('#e_roomNumber').value.trim();
    p.admissionType = qs('#e_admissionType').value;
    p.dischargeDate = qs('#e_dischargeDate').value || '';
    p.medication = splitList(qs('#e_medication').value);
    p.testResults = splitList(qs('#e_testResults').value);
    p.riskScore = computeRisk(p);
    persist();
    closeModal();
    renderAll();
  });
}
function openModal(i) {
  const p = state.patients[i];
  qs('#e_name').value = p.name;
  qs('#e_age').value = p.age;
  qs('#e_gender').value = p.gender;
  qs('#e_bloodType').value = p.bloodType;
  qs('#e_medicalCondition').value = p.medicalCondition;
  qs('#e_dateOfAdmission').value = p.dateOfAdmission;
  qs('#e_doctor').value = p.doctor;
  qs('#e_hospital').value = p.hospital;
  qs('#e_insuranceProvider').value = p.insuranceProvider;
  qs('#e_billingAmount').value = p.billingAmount;
  qs('#e_roomNumber').value = p.roomNumber;
  qs('#e_admissionType').value = p.admissionType;
  qs('#e_dischargeDate').value = p.dischargeDate;
  qs('#e_medication').value = p.medication.join(', ');
  qs('#e_testResults').value = p.testResults.join(', ');
  qs('#editForm').dataset.index = i;
  qs('#modal').style.display = 'flex';
}
function closeModal() { qs('#modal').style.display = 'none' }

function bindExport() {
  qs('#exportJson').addEventListener('click', () => download('patients.json', JSON.stringify(state.patients, null, 2)));
  qs('#exportCsv').addEventListener('click', () => download('patients.csv', toCsv(state.patients)));
}
function bindImport() {
  qs('#importJson').addEventListener('change', async e => {
    const text = await e.target.files[0].text();
    const data = JSON.parse(text);
    ingest(data);
  });
  qs('#importCsv').addEventListener('change', async e => {
    const text = await e.target.files[0].text();
    const data = parseCsv(text);
    ingest(data);
  });
  qs('#downloadTemplateJson').addEventListener('click', () => {
    const t = [{name:'',age:0,gender:'',bloodType:'',medicalCondition:'',dateOfAdmission:'',doctor:'',hospital:'',insuranceProvider:'',billingAmount:0,roomNumber:'',admissionType:'',dischargeDate:'',medication:[],testResults:[]}];
    download('template.json', JSON.stringify(t, null, 2));
  });
  qs('#downloadTemplateCsv').addEventListener('click', () => {
    const t = toCsv([{name:'',age:0,gender:'',bloodType:'',medicalCondition:'',dateOfAdmission:'',doctor:'',hospital:'',insuranceProvider:'',billingAmount:0,roomNumber:'',admissionType:'',dischargeDate:'',medication:'',testResults:''}]);
    download('template.csv', t);
  });
}
function ingest(arr) {
  const cleaned = arr.map(normalizeRecord).map(p => ({...p, riskScore: computeRisk(p)}));
  state.patients = cleaned;
  persist();
  renderAll();
  qs('nav button[data-tab="patients"]').click();
}

function bindSensors() {
  qs('#startStream').addEventListener('click', () => {
    if (state.streamTimer) return;
    state.streamTimer = setInterval(() => {
      state.liveVitals.hr = clamp(randn(78, 12), 42, 160) | 0;
      state.liveVitals.steps = Math.max(0, state.liveVitals.steps + Math.floor(Math.random() * 8));
      state.liveVitals.spo2 = clamp(randn(97, 2), 82, 100).toFixed(0);
      qs('#hr').textContent = `${state.liveVitals.hr} bpm`;
      qs('#steps').textContent = `${state.liveVitals.steps}`;
      qs('#spo2').textContent = `${state.liveVitals.spo2}%`;
      const adj = liveRiskAdjustment(state.liveVitals);
      qs('#liveRisk').textContent = `${(adj * 100).toFixed(1)}%`;
    }, 1200);
  });
  qs('#stopStream').addEventListener('click', () => {
    clearInterval(state.streamTimer);
    state.streamTimer = null;
  });
}

function renderAll() {
  load();
  renderFilters();
  renderTable();
  renderAnalytics();
}

function renderFilters() {
  const docs = Array.from(new Set(state.patients.map(p => p.doctor))).sort();
  const hosps = Array.from(new Set(state.patients.map(p => p.hospital))).sort();
  const dSel = qs('#filterDoctor');
  const hSel = qs('#filterHospital');
  dSel.innerHTML = `<option value="">Doctor</option>` + docs.map(d => `<option>${d}</option>`).join('');
  hSel.innerHTML = `<option value="">Hospital</option>` + hosps.map(h => `<option>${h}</option>`).join('');
}

function renderTable() {
  let rows = state.patients.slice();
  const q = qs('#search').value.toLowerCase();
  const fa = qs('#filterAdmission').value;
  const fd = qs('#filterDoctor').value;
  const fh = qs('#filterHospital').value;
  if (q) rows = rows.filter(p =>
    [p.name,p.medicalCondition,p.doctor,p.hospital,p.insuranceProvider,p.roomNumber].some(v => String(v).toLowerCase().includes(q))
  );
  if (fa) rows = rows.filter(p => p.admissionType === fa);
  if (fd) rows = rows.filter(p => p.doctor === fd);
  if (fh) rows = rows.filter(p => p.hospital === fh);
  if (state.sort.key) {
    const k = state.sort.key;
    rows.sort((a,b) => {
      const av = a[k], bv = b[k];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * state.sort.dir;
      return String(av).localeCompare(String(bv)) * state.sort.dir;
    });
  }
  const tbody = qs('#patientsTable tbody');
  tbody.innerHTML = rows.map((p,i) => `
    <tr>
      <td>${p.name}</td>
      <td>${p.age}</td>
      <td>${p.gender}</td>
      <td>${p.bloodType}</td>
      <td>${p.medicalCondition}</td>
      <td>${p.dateOfAdmission || ''}</td>
      <td>${p.doctor}</td>
      <td>${p.hospital}</td>
      <td>${p.insuranceProvider}</td>
      <td>₹${Number(p.billingAmount).toLocaleString('en-IN')}</td>
      <td>${p.roomNumber}</td>
      <td>${p.admissionType}</td>
      <td>${p.dischargeDate || ''}</td>
      <td>${Array.isArray(p.medication)?p.medication.join(', '):p.medication}</td>
      <td>${Array.isArray(p.testResults)?p.testResults.join(', '):p.testResults}</td>
      <td>${(p.riskScore*100).toFixed(1)}%</td>
      <td>
        <button class="row-btn" onclick="openModal(${state.patients.indexOf(p)})">Edit</button>
        <button class="row-btn" onclick="removePatient(${state.patients.indexOf(p)})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderAnalytics() {
  const n = state.patients.length || 1;
  const avgBilling = state.patients.reduce((s,p)=>s+Number(p.billingAmount||0),0)/n;
  const avgLos = state.patients.reduce((s,p)=>s+lengthOfStay(p),0)/n;
  const avgRisk = state.patients.reduce((s,p)=>s+(p.riskScore||0),0)/n;
  const emergencyRate = state.patients.filter(p=>p.admissionType==='Emergency').length / n;

  qs('#avgBilling').textContent = `₹${avgBilling.toLocaleString('en-IN', {maximumFractionDigits:0})}`;
  qs('#avgLos').textContent = `${avgLos.toFixed(1)} days`;
  qs('#avgRisk').textContent = `${(avgRisk*100).toFixed(1)}%`;
  qs('#emergencyRate').textContent = `${(emergencyRate*100).toFixed(1)}%`;

  const byHospital = groupSum(state.patients, 'hospital', p => Number(p.billingAmount||0));
  drawBar('billingByHospital', 'Billing by Hospital', Object.keys(byHospital), Object.values(byHospital), '#4f7df3');

  const byCond = groupAvg(state.patients, 'medicalCondition', p => p.riskScore);
  drawBar('riskByCondition', 'Avg Risk by Condition', Object.keys(byCond), Object.values(byCond).map(x=>x*100), '#22c55e');

  const byDate = groupCount(state.patients, 'dateOfAdmission');
  drawLine('admissionsOverTime', 'Admissions Over Time', Object.keys(byDate), Object.values(byDate), '#ef4444');
}

function removePatient(i) {
  state.patients.splice(i,1);
  persist();
  renderAll();
}

function splitList(s) {
  return s.split(',').map(x=>x.trim()).filter(Boolean);
}
function lengthOfStay(p) {
  if (!p.dateOfAdmission) return 0;
  const start = new Date(p.dateOfAdmission);
  const end = p.dischargeDate ? new Date(p.dischargeDate) : new Date();
  return Math.max(0, (end - start) / (1000*60*60*24));
}

function severityWeight(cond) {
  const map = {
    'CHF': 0.8,'AMI':0.85,'COPD Exacerbation':0.7,'Pneumonia':0.6,'Sepsis':0.9,'Stroke':0.88
  };
  return map[cond] ?? 0.5;
}
function admissionWeight(type) {
  return type === 'Emergency' ? 1.0 : type === 'Transfer' ? 0.8 : 0.6;
}
function ageWeight(age) {
  if (age >= 80) return 1.0;
  if (age >= 65) return 0.85;
  if (age >= 50) return 0.7;
  return 0.5;
}
function losWeight(days) {
  if (days >= 14) return 1.0;
  if (days >= 7) return 0.8;
  if (days >= 3) return 0.6;
  return 0.4;
}
function computeRisk(p) {
  const x1 = ageWeight(Number(p.age||0));
  const x2 = severityWeight(p.medicalCondition||'');
  const x3 = admissionWeight(p.admissionType||'Elective');
  const x4 = losWeight(lengthOfStay(p));
  const z = 0.3*x1 + 0.35*x2 + 0.2*x3 + 0.15*x4;
  return clamp(z, 0, 1);
}
function liveRiskAdjustment(v) {
  const hrAdj = v.hr > 110 ? 0.15 : v.hr < 50 ? 0.1 : 0.02;
  const spoAdj = v.spo2 < 92 ? 0.2 : 0.03;
  const stepsAdj = v.steps < 50 ? 0.1 : 0.04;
  return clamp(hrAdj + spoAdj + stepsAdj, 0, 1);
}

function groupSum(arr, key, valFn) {
  const out = {};
  arr.forEach(p => out[p[key]] = (out[p[key]]||0) + valFn(p));
  return out;
}
function groupAvg(arr, key, valFn) {
  const sum = {}, count = {};
  arr.forEach(p => {
    sum[p[key]] = (sum[p[key]]||0) + valFn(p);
    count[p[key]] = (count[p[key]]||0) + 1;
  });
  const out = {};
  Object.keys(sum).forEach(k => out[k] = sum[k]/count[k]);
  return out;
}
function groupCount(arr, key) {
  const out = {};
  arr.forEach(p => out[p[key]] = (out[p[key]]||0) + 1);
  const sortedKeys = Object.keys(out).sort((a,b) => new Date(a) - new Date(b));
  const sorted = {};
  sortedKeys.forEach(k => sorted[k] = out[k]);
  return sorted;
}

function drawBar(id, label, labels, data, color) {
  const ctx = qs(`#${id}`).getContext('2d');
  if (ctx._chart) ctx._chart.destroy();
  ctx._chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label, data, backgroundColor: color }] },
    options: { plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
  });
}
function drawLine(id, label, labels, data, color) {
  const ctx = qs(`#${id}`).getContext('2d');
  if (ctx._chart) ctx._chart.destroy();
  ctx._chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label, data, borderColor: color, fill:false, tension:.2 }] },
    options: { plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
  });
}

function toCsv(arr) {
  const headers = ['name','age','gender','bloodType','medicalCondition','dateOfAdmission','doctor','hospital','insuranceProvider','billingAmount','roomNumber','admissionType','dischargeDate','medication','testResults'];
  const lines = [headers.join(',')].concat(arr.map(p => headers.map(h => {
    const v = p[h];
    if (Array.isArray(v)) return `"${v.join(';')}"`;
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  }).join(',')));
  return lines.join('\n');
}
function parseCsv(text) {
  const rows = text.trim().split('\n');
  const headers = rows[0].split(',').map(h=>h.trim());
  return rows.slice(1).map(line => {
    const cols = parseCsvLine(line);
    const obj = {};
    headers.forEach((h,i) => obj[h] = cols[i] ?? '');
    obj.medication = typeof obj.medication === 'string' ? splitCsvList(obj.medication) : [];
    obj.testResults = typeof obj.testResults === 'string' ? splitCsvList(obj.testResults) : [];
    obj.age = Number(obj.age||0);
    obj.billingAmount = Number(obj.billingAmount||0);
    return obj;
  });
}
function parseCsvLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i=0;i<line.length;i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out.map(x=>x.trim());
}
function splitCsvList(s) {
  return s ? s.split(/;|,/).map(x=>x.trim()).filter(Boolean) : [];
}
function normalizeRecord(p) {
  return {
    name: p.name||'',
    age: Number(p.age||0),
    gender: p.gender||'',
    bloodType: p.bloodType||'',
    medicalCondition: p.medicalCondition||'',
    dateOfAdmission: p.dateOfAdmission||'',
    doctor: p.doctor||'',
    hospital: p.hospital||'',
    insuranceProvider: p.insuranceProvider||'',
    billingAmount: Number(p.billingAmount||0),
    roomNumber: p.roomNumber||'',
    admissionType: p.admissionType||'',
    dischargeDate: p.dischargeDate||'',
    medication: Array.isArray(p.medication)?p.medication:splitCsvList(p.medication||''),
    testResults: Array.isArray(p.testResults)?p.testResults:splitCsvList(p.testResults||'')
  };
}

function download(filename, data) {
  const blob = new Blob([data], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function clamp(x, a, b) { return Math.max(a, Math.min(b, x)) }
function randn(mu, sigma) {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  const z = Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
  return mu + sigma*z;
}

document.addEventListener('DOMContentLoaded', init);


function bindTabs() {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      const current = document.querySelector('.tab.active');
      const next = document.getElementById(targetId);

      if (current && current !== next) {
        current.classList.remove('active');
        current.classList.add('leaving');
        setTimeout(() => current.classList.remove('leaving'), 600); // match CSS duration
      }

      next.classList.add('active');

      // update aria attributes for accessibility
      document.querySelectorAll('nav button').forEach(b => b.setAttribute('aria-selected','false'));
      btn.setAttribute('aria-selected','true');
    });
  });
}
