const STORAGE_KEY = "worklog.v8.final";
const LEGACY_STORAGE_KEYS = ["medialusoApp.v3.english", "medialusoApp.v2"];
const APP_VERSION = "v9 GitHub Pages";
const today = new Date().toISOString().slice(0, 10);
const currentMonth = today.slice(0, 7);

const ACTIVITIES = [
  "Director",
  "EVS",
  "Producer",
  "Op. Steady",
  "Camera/Jib/Drone/Equipment Op.",
  "VT/EVS/UP-Link/Make-up Op.",
  "CCU/Lighting Op.",
  "Vision Mixer",
  "Camera Assistant",
  "Technical Manager",
  "Audio Op.",
  "Audio Assistant"
];

function tariffActivity(activity) {
  return activity === "EVS" ? "VT/EVS/UP-Link/Make-up Op." : activity;
}

const CHANNELS = ["SportTV", "Porto Canal", "Canal 11", "RTP", "BTV", "TA", "Others"];
const DEFAULT_CLIENTS = ["Medialuso", "CanalLife", "FullZoom"];
const TARIFF_TYPES = ["Sports", "Football + People/Football/Rugby", "Football + People/Football"];
const SPORTS = ["Football", "Volleyball", "Basketball", "Hockey", "Handball", "Rugby", "Other"];

const SENIOR_RULES = [
  ["Producer", "SportTV", "Sports", 100],
  ["Producer", "SportTV", "Football + People/Football/Rugby", 145],
  ["Producer", "Porto Canal + TA + Others", "Sports", 95],
  ["Producer", "Porto Canal + TA + Others", "Football + People/Football", 100],
  ["Op. Steady", "SportTV", "Sports", 110],
  ["Op. Steady", "SportTV", "Football + People/Football/Rugby", 155],
  ["Op. Steady", "Porto Canal + TA + Others", "Sports", 100],
  ["Op. Steady", "Porto Canal + TA + Others", "Football + People/Football", 110],
  ["Camera/Jib/Drone/Equipment Op.", "SportTV", "Sports", 100],
  ["Camera/Jib/Drone/Equipment Op.", "SportTV", "Football + People/Football/Rugby", 145],
  ["Camera/Jib/Drone/Equipment Op.", "Porto Canal + TA + Others", "Sports", 95],
  ["Camera/Jib/Drone/Equipment Op.", "Porto Canal + TA + Others", "Football + People/Football", 100],
  ["VT/EVS/UP-Link/Make-up Op.", "SportTV", "Sports", 100],
  ["VT/EVS/UP-Link/Make-up Op.", "SportTV", "Football + People/Football/Rugby", 145],
  ["VT/EVS/UP-Link/Make-up Op.", "Porto Canal + TA + Others", "Sports", 95],
  ["VT/EVS/UP-Link/Make-up Op.", "Porto Canal + TA + Others", "Football + People/Football", 100],
  ["CCU/Lighting Op.", "SportTV", "Sports", 100],
  ["CCU/Lighting Op.", "SportTV", "Football + People/Football/Rugby", 145],
  ["CCU/Lighting Op.", "Porto Canal + TA + Others", "Sports", 95],
  ["CCU/Lighting Op.", "Porto Canal + TA + Others", "Football + People/Football", 100],
  ["Vision Mixer", "SportTV", "Sports", 100],
  ["Vision Mixer", "SportTV", "Football + People/Football/Rugby", 145],
  ["Vision Mixer", "Porto Canal + TA + Others", "Sports", 95],
  ["Vision Mixer", "Porto Canal + TA + Others", "Football + People/Football", 100],
  ["Camera Assistant", "SportTV", "Sports", 80],
  ["Camera Assistant", "SportTV", "Football + People/Football/Rugby", 85],
  ["Camera Assistant", "Porto Canal + TA + Others", "Sports", 80],
  ["Camera Assistant", "Porto Canal + TA + Others", "Football + People/Football", 80],
  ["Director", "SportTV", "Sports", 180],
  ["Director", "SportTV", "Football + People/Football/Rugby", 275],
  ["Director", "Porto Canal + TA + Others", "Sports", 150],
  ["Director", "Porto Canal + TA + Others", "Football + People/Football", 180],
  ["Technical Manager", "SportTV", "Sports", 135],
  ["Technical Manager", "SportTV", "Football + People/Football/Rugby", 180],
  ["Technical Manager", "Porto Canal + TA + Others", "Sports", 135],
  ["Technical Manager", "Porto Canal + TA + Others", "Football + People/Football", 135],
  ["Audio Op.", "SportTV", "Sports", 110],
  ["Audio Op.", "SportTV", "Football + People/Football/Rugby", 160],
  ["Audio Op.", "Porto Canal + TA + Others", "Sports", 110],
  ["Audio Op.", "Porto Canal + TA + Others", "Football + People/Football", 110],
  ["Audio Assistant", "SportTV", "Sports", 80],
  ["Audio Assistant", "SportTV", "Football + People/Football/Rugby", 110],
  ["Audio Assistant", "Porto Canal + TA + Others", "Sports", 80],
  ["Audio Assistant", "Porto Canal + TA + Others", "Football + People/Football", 80]
];

const MEAL_TABLE = {
  "Portugal": { pa: 6, lunch: 17.5, dinner: 17.5 },
  "Spain": { pa: 7.5, lunch: 20, dinner: 20 },
  "Rest of the World": { pa: 7.5, lunch: 32.5, dinner: 32.5 }
};

const INTERNATIONAL_RULES = [
  { name: "International travel day", value: 110, note: "Meals included" },
  { name: "International day off", value: 0, note: "Half fee + meals" }
];

function buildSeniorRulesForClient(name) {
  return SENIOR_RULES.map(([activity, channelGroup, tariffType, value]) => ({
    id: crypto.randomUUID(),
    name,
    seniority: "Senior",
    activity,
    channelGroup,
    tariffType,
    value,
    meal: 0,
    since: "2025-06-26",
    active: true
  }));
}

function defaultState() {
  return {
    works: [],
    clientRules: DEFAULT_CLIENTS.flatMap(buildSeniorRulesForClient),
    mealRules: Object.entries(MEAL_TABLE).map(([country, values]) => ({
      id: crypto.randomUUID(), country, ...values, since: "2025-06-26", active: true
    })),
    internationalRules: INTERNATIONAL_RULES
  };
}

const state = loadState();

function loadState() {
  let saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) { saved = legacy; break; }
    }
  }
  const loaded = saved ? JSON.parse(saved) : defaultState();
  return migrateState(normalizeLegacyData(loaded));
}

function translateValue(value) {
  const map = {
    "Realizador": "Director",
    "Produtor": "Producer",
    "Op. Câmara/Grua/Drone/Material": "Camera/Jib/Drone/Equipment Op.",
    "Op. VT/EVS/UP-Linker/Make-up": "VT/EVS/UP-Link/Make-up Op.",
    "Op. Controlo Imagem (CCU)/Light": "CCU/Lighting Op.",
    "Op. Mistura": "Vision Mixer",
    "Assistente Câmara": "Camera Assistant",
    "Chefe Técnico": "Technical Manager",
    "Op. Áudio": "Audio Op.",
    "Assistente Áudio": "Audio Assistant",
    "Modalidades": "Sports",
    "Futebol + Pessoas/Futebol/Rugby": "Football + People/Football/Rugby",
    "Futebol + Pessoas/Futebol": "Football + People/Football",
    "Porto Canal + TA + Outros": "Porto Canal + TA + Others",
    "Outros": "Others",
    "Futebol": "Football",
    "Voleibol": "Volleyball",
    "Basquetebol": "Basketball",
    "Hóquei": "Hockey",
    "Andebol": "Handball",
    "Outro": "Other",
    "Espanha": "Spain",
    "Resto do Mundo": "Rest of the World",
    "Sénior": "Senior"
  };
  return map[value] || value;
}

function normalizeLegacyData(data) {
  if (!data || typeof data !== "object") return data;
  (data.works || []).forEach(w => {
    w.seniority = translateValue(w.seniority);
    w.activity = translateValue(w.activity);
    w.channel = translateValue(w.channel);
    w.tariffType = translateValue(w.tariffType);
    w.sport = translateValue(w.sport);
    w.mealCountry = translateValue(w.mealCountry);
  });
  (data.clientRules || []).forEach(r => {
    r.seniority = translateValue(r.seniority);
    r.activity = translateValue(r.activity);
    r.channelGroup = translateValue(r.channelGroup);
    r.tariffType = translateValue(r.tariffType);
  });
  (data.mealRules || []).forEach(r => { r.country = translateValue(r.country); });
  return data;
}

function migrateState(data) {
  if (!data.works) data.works = [];
  if (!data.clientRules) data.clientRules = [];
  if (!data.mealRules) data.mealRules = defaultState().mealRules;
  if (!data.internationalRules) data.internationalRules = INTERNATIONAL_RULES;

  // CanalLife and FullZoom are Medialuso group companies: they receive the same senior rules.
  DEFAULT_CLIENTS.forEach(client => {
    SENIOR_RULES.forEach(([activity, channelGroup, tariffType, value]) => {
      const exists = data.clientRules.some(r =>
        r.name === client &&
        r.activity === activity &&
        r.channelGroup === channelGroup &&
        r.tariffType === tariffType
      );
      if (!exists) {
        data.clientRules.push({
          id: crypto.randomUUID(),
          name: client,
          seniority: "Senior",
          activity,
          channelGroup,
          tariffType,
          value,
          meal: 0,
          since: "2025-06-26",
          active: true
        });
      }
    });
  });

  // Keep clients visible even before configurable rates exist.
  data.clients = Array.from(new Set([...(data.clients || []), ...DEFAULT_CLIENTS, ...data.clientRules.map(r => r.name).filter(Boolean), ...data.works.map(w => w.client).filter(Boolean)])).sort();
  return data;
}

function saveState() {
  state.clients = uniqueClients();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

function euro(value) {
  return Number(value || 0).toLocaleString("en-GB", { style: "currency", currency: "EUR" });
}

function minutesBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (endMin < startMin) endMin += 24 * 60;
  return endMin - startMin;
}

function hoursLabel(start, end) {
  const mins = minutesBetween(start, end);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function channelGroup(channel) {
  if (channel === "SportTV") return "SportTV";
  return "Porto Canal + TA + Others";
}

function closeMenu() {
  sideMenu.classList.remove("open");
  menuOverlay.classList.add("hidden");
  menuButton.setAttribute("aria-expanded", "false");
}

function openMenu() {
  sideMenu.classList.add("open");
  menuOverlay.classList.remove("hidden");
  menuButton.setAttribute("aria-expanded", "true");
}

function goToScreen(screenId) {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.screen === screenId));
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active-screen", s.id === screenId));
  closeMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function workTotal(w) {
  return Number(w.value || 0) + Number(w.meal || 0);
}

function uniqueClients() {
  return [...new Set([...(state.clients || []), ...state.clientRules.map(r => r.name), ...state.works.map(w => w.client)].filter(Boolean))].sort();
}

function fillSelect(select, values, allLabel = null) {
  const current = select.value;
  select.innerHTML = "";
  if (allLabel !== null) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = allLabel;
    select.appendChild(opt);
  }
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
  if ([...select.options].some(o => o.value === current)) select.value = current;
}

function findRule({ client, activity, channel, tariffType, date }) {
  const group = channelGroup(channel);
  const normalizedActivity = tariffActivity(activity);
  return state.clientRules
    .filter(r => r.active && r.name === client)
    .filter(r => !r.activity || r.activity === normalizedActivity || r.activity === activity)
    .filter(r => !r.channelGroup || r.channelGroup === group)
    .filter(r => !r.tariffType || r.tariffType === tariffType)
    .filter(r => !r.since || !date || r.since <= date)
    .sort((a, b) => (b.since || "").localeCompare(a.since || ""))[0];
}

function calculateMeal() {
  const country = workMealCountry.value;
  const rule = state.mealRules.find(r => r.active && r.country === country);
  if (!rule) return 0;
  let total = 0;
  if (workMealBreakfast.checked) total += Number(rule.pa || 0);
  if (workMealLunch.checked) total += Number(rule.lunch || 0);
  if (workMealDinner.checked) total += Number(rule.dinner || 0);
  return total;
}

function applyConfiguredValue() {
  const rule = findRule({
    client: workClient.value,
    activity: workActivity.value,
    channel: workChannel.value,
    tariffType: workTariffType.value,
    date: workDate.value
  });
  if (!rule) {
    alert("I could not find a matching active senior rule. Please check client, role, channel and production type.");
    return;
  }
  workValue.value = rule.value;
  workMeal.value = calculateMeal();
}

function renderDashboard() {
  const monthWorks = state.works.filter(w => w.date?.startsWith(currentMonth));
  const services = monthWorks.reduce((s, w) => s + Number(w.value || 0), 0);
  const meals = monthWorks.reduce((s, w) => s + Number(w.meal || 0), 0);
  const nextWorks = [...state.works].filter(w => w.date >= today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
  const latestWorks = [...state.works].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  dashJobs.textContent = monthWorks.length;
  dashServices.textContent = euro(services);
  dashMeals.textContent = euro(meals);
  dashTotal.textContent = euro(services + meals);
  if (document.getElementById("dashRecent")) {
    const list = nextWorks.length ? nextWorks : latestWorks;
    dashRecent.innerHTML = list.length ? list.map(w => `
      <button class="work-card mini" onclick="editWork('${w.id}')">
        <span>${w.date} · ${w.client}</span>
        <strong>${w.event || w.activity || "Job"}</strong>
        <em>${w.channel || "-"} · ${w.sport || "-"} · ${euro(workTotal(w))}</em>
      </button>`).join("") : '<p class="empty">No jobs registered yet.</p>';
  }
}

function renderWorksTable() {
  const table = worksTable;
  const month = filterMonth.value;
  const client = filterClient.value;
  let works = [...state.works].sort((a, b) => b.date.localeCompare(a.date));
  if (month) works = works.filter(w => w.date?.startsWith(month));
  if (client) works = works.filter(w => w.client === client);
  if (!works.length) { table.innerHTML = `<tr><td class="empty">No jobs to show yet.</td></tr>`; worksCards.innerHTML = `<p class="empty">No jobs to show yet.</p>`; return; }
  worksCards.innerHTML = works.map(w => `
    <article class="work-card">
      <button class="card-main" onclick="editWork('${w.id}')">
        <span>${w.date} · ${w.client}</span>
        <strong>${w.event || w.activity || "Job"}</strong>
        <em>${w.activity || "-"} · ${w.channel || "-"} · ${w.sport || "-"}</em>
        <b>${euro(workTotal(w))}</b>
      </button>
      <div class="card-actions">
        <button class="ghost small" onclick="editWork('${w.id}')">Edit</button>
        <button class="danger small" onclick="deleteWork('${w.id}')">Delete</button>
      </div>
    </article>`).join("");
  table.innerHTML = `
    <thead><tr><th>Date</th><th>Client</th><th>Role</th><th>Channel</th><th>Type</th><th>Sport</th><th>Event</th><th>Hours</th><th>Fee</th><th>Meals</th><th></th></tr></thead>
    <tbody>${works.map(w => `
      <tr>
        <td>${w.date}</td><td>${w.client}</td><td>${w.activity || "-"}</td><td>${w.channel || "-"}</td><td>${w.tariffType || "-"}</td><td>${w.sport || "-"}</td><td>${w.event || "-"}</td>
        <td>${w.start} → ${w.end}<br><small>${hoursLabel(w.start, w.end)}</small></td>
        <td>${euro(w.value)}</td><td>${euro(w.meal)}</td>
        <td class="row-actions"><button class="ghost small" onclick="editWork('${w.id}')">Edit</button><button class="danger small" onclick="deleteWork('${w.id}')">Delete</button></td>
      </tr>`).join("")}</tbody>`;
}

function renderClientsTable() {
  const table = clientsTable;
  if (document.getElementById("clientChips")) {
    clientChips.innerHTML = uniqueClients().map(c => `<span class="chip">${c}</span>`).join("");
  }
  if (!state.clientRules.length) { table.innerHTML = `<tr><td class="empty">No rules yet.</td></tr>`; return; }
  table.innerHTML = `
    <thead><tr><th>Client</th><th>Level</th><th>Role</th><th>Channel</th><th>Type</th><th>Fee</th><th>Since</th><th>Status</th><th></th></tr></thead>
    <tbody>${state.clientRules.map(r => `
      <tr>
        <td>${r.name}</td><td>${r.seniority || "Senior"}</td><td>${r.activity || "Any"}</td><td>${r.channelGroup || "Any"}</td><td>${r.tariffType || "Any"}</td>
        <td>${euro(r.value)}</td><td>${r.since}</td><td>${r.active ? "Active" : "Inactive"}</td>
        <td class="row-actions"><button class="danger small" onclick="deleteRule('${r.id}')">Delete</button></td>
      </tr>`).join("")}</tbody>`;
}

function renderMealsTable() {
  const table = mealsTable;
  table.innerHTML = `
    <thead><tr><th>Location</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th></tr></thead>
    <tbody>${state.mealRules.map(r => `<tr><td>${r.country}</td><td>${euro(r.pa)}</td><td>${euro(r.lunch)}</td><td>${euro(r.dinner)}</td></tr>`).join("")}</tbody>`;
}

function renderCalendar() {
  const month = calendarMonth.value || currentMonth;
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const start = new Date(first);
  const weekday = (first.getDay() + 6) % 7;
  start.setDate(first.getDate() - weekday);
  let html = "";
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dayWorks = state.works.filter(w => w.date === iso);
    html += `<div class="day ${iso.slice(0, 7) === month ? "" : "other-month"}"><div class="day-number">${d.getDate()}</div>${dayWorks.map(w => `<div class="event-pill"><strong>${w.activity || w.client}</strong><br>${w.channel || ""} · ${w.sport || ""}<br>${euro(Number(w.value || 0) + Number(w.meal || 0))}</div>`).join("")}</div>`;
  }
  calendarGrid.innerHTML = html;
}

function renderReceipt(result = null) {
  if (!result) {
    receiptResult.innerHTML = "<p>Choose a period and a client to calculate the receipt amount.</p>";
    return;
  }
  receiptResult.innerHTML = `
    <h3>Receipt summary</h3>
    <p>Period: <strong>${result.from}</strong> to <strong>${result.to}</strong>${result.client ? ` · Client: <strong>${result.client}</strong>` : ""}</p>
    <div class="receipt-total">
      <div><span>Jobs</span><br><strong>${result.works.length}</strong></div>
      <div><span>Services</span><br><strong>${euro(result.services)}</strong></div>
      <div><span>Meals</span><br><strong>${euro(result.meals)}</strong></div>
      <div><span>Receipt total</span><br><strong>${euro(result.total)}</strong></div>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Role</th><th>Channel</th><th>Sport</th><th>Event</th><th>Fee</th><th>Meals</th><th>Total</th></tr></thead>
      <tbody>${result.works.map(w => `<tr><td>${w.date}</td><td>${w.activity || "-"}</td><td>${w.channel || "-"}</td><td>${w.sport || "-"}</td><td>${w.event || "-"}</td><td>${euro(w.value)}</td><td>${euro(w.meal)}</td><td>${euro(Number(w.value || 0) + Number(w.meal || 0))}</td></tr>`).join("")}</tbody>
    </table></div>`;
}

function renderAll() {
  const previousWorkClient = workClient.value;
  fillSelect(workClient, uniqueClients());
  if (!previousWorkClient && [...workClient.options].some(o => o.value === "Medialuso")) workClient.value = "Medialuso";
  fillSelect(filterClient, uniqueClients(), "All");
  fillSelect(receiptClient, uniqueClients(), "All");
  renderDashboard();
  renderWorksTable();
  renderClientsTable();
  renderMealsTable();
  renderCalendar();
}

function resetWorkForm() {
  workForm.reset();
  workEditId.value = "";
  workDate.value = today;
  initSelects();
  workActivity.value = "Director";
  saveWorkButton.textContent = "Save job";
  cancelEditButton.classList.add("hidden");
}

function editWork(id) {
  const w = state.works.find(item => item.id === id);
  if (!w) return;
  workEditId.value = w.id;
  workDate.value = w.date || today;
  workClient.value = w.client || "";
  workActivity.value = w.activity || "Director";
  workChannel.value = w.channel || "SportTV";
  workTariffType.value = w.tariffType || "Sports";
  workSport.value = w.sport || "Football";
  workEvent.value = w.event || "";
  workPlace.value = w.place || "";
  workStart.value = w.start || "";
  workEnd.value = w.end || "";
  workValue.value = w.value || 0;
  workMealCountry.value = w.mealCountry || "Portugal";
  workMealBreakfast.checked = !!w.meals?.pa;
  workMealLunch.checked = !!w.meals?.lunch;
  workMealDinner.checked = !!w.meals?.dinner;
  workMeal.value = w.meal || 0;
  workNotes.value = w.notes || "";
  saveWorkButton.textContent = "Update job";
  cancelEditButton.classList.remove("hidden");
  goToScreen("novo");
}

function deleteWork(id) {
  if (!confirm("Delete this job?")) return;
  state.works = state.works.filter(w => w.id !== id);
  saveState();
}

function deleteRule(id) {
  if (!confirm("Delete this client/fee rule?")) return;
  state.clientRules = state.clientRules.filter(r => r.id !== id);
  saveState();
}

function exportCsv() {
  const rows = [["Date", "Client", "Role", "Channel", "Medialuso Type", "Sport", "Event", "Location", "Departure", "Arrival", "Hours", "Fee", "Meals", "Total", "Notes"]];
  state.works.forEach(w => rows.push([w.date, w.client, w.activity, w.channel, w.tariffType, w.sport, w.event, w.place, w.start, w.end, hoursLabel(w.start, w.end), w.value, w.meal, Number(w.value || 0) + Number(w.meal || 0), w.notes]));
  const csv = rows.map(row => row.map(cell => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `registo-medialuso-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup-registo-medialuso-${today}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!imported.works || !imported.clientRules) throw new Error("Invalid format");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      location.reload();
    } catch (error) {
      alert("I could not import this JSON backup.");
    }
  };
  reader.readAsText(file);
}

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => goToScreen(button.dataset.screen));
});

menuButton.addEventListener("click", () => {
  if (sideMenu.classList.contains("open")) closeMenu();
  else openMenu();
});
closeMenuButton.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);
window.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMenu();
});

document.querySelectorAll("[data-jump]").forEach(button => {
  button.addEventListener("click", () => goToScreen(button.dataset.jump));
});

function initSelects() {
  fillSelect(workActivity, ACTIVITIES);
  workActivity.value = "Director";
  fillSelect(clientActivity, ACTIVITIES, "Any");
  fillSelect(workChannel, CHANNELS);
  fillSelect(clientChannelGroup, ["SportTV", "Porto Canal + TA + Others"], "Any");
  fillSelect(workTariffType, TARIFF_TYPES);
  fillSelect(clientTariffType, TARIFF_TYPES, "Any");
  fillSelect(workSport, SPORTS);
  fillSelect(workMealCountry, Object.keys(MEAL_TABLE));
}

initSelects();
workDate.value = today;
clientSince.value = today;
filterMonth.value = currentMonth;
calendarMonth.value = currentMonth;
receiptFrom.value = currentMonth + "-01";
receiptTo.value = today;

[workMealCountry, workMealBreakfast, workMealLunch, workMealDinner].forEach(el => el.addEventListener("change", () => {
  workMeal.value = calculateMeal();
}));
autoValueButton.addEventListener("click", applyConfiguredValue);
exportCsvButton.addEventListener("click", exportCsv);
exportBackupButton.addEventListener("click", exportBackup);
importBackupInput.addEventListener("change", event => importBackup(event.target.files[0]));
filterMonth.addEventListener("change", renderWorksTable);
filterClient.addEventListener("change", renderWorksTable);
calendarMonth.addEventListener("change", renderCalendar);

workForm.addEventListener("submit", event => {
  event.preventDefault();
  const payload = {
    id: workEditId.value || crypto.randomUUID(),
    date: workDate.value,
    client: workClient.value,
    seniority: "Senior",
    activity: workActivity.value,
    channel: workChannel.value,
    tariffType: workTariffType.value,
    sport: workSport.value,
    event: workEvent.value.trim(),
    place: workPlace.value.trim(),
    start: workStart.value,
    end: workEnd.value,
    value: Number(workValue.value || 0),
    meal: Number(workMeal.value || 0),
    mealCountry: workMealCountry.value,
    meals: { pa: workMealBreakfast.checked, lunch: workMealLunch.checked, dinner: workMealDinner.checked },
    notes: workNotes.value.trim()
  };
  const index = state.works.findIndex(w => w.id === payload.id);
  if (index >= 0) state.works[index] = payload;
  else state.works.push(payload);
  state.clients = uniqueClients();
  resetWorkForm();
  saveState();
  goToScreen("trabalhos");
  alert(index >= 0 ? "Job updated." : "Job saved.");
});

cancelEditButton.addEventListener("click", resetWorkForm);

clientForm.addEventListener("submit", event => {
  event.preventDefault();
  const client = clientName.value.trim();
  state.clients = Array.from(new Set([...(state.clients || []), client])).sort();
  state.clientRules.push({
    id: crypto.randomUUID(),
    name: client,
    seniority: "Senior",
    activity: clientActivity.value,
    channelGroup: clientChannelGroup.value,
    tariffType: clientTariffType.value,
    value: Number(clientValue.value || 0),
    meal: 0,
    since: clientSince.value,
    active: clientActive.value === "true"
  });
  event.target.reset();
  clientSince.value = today;
  saveState();
});

receiptForm.addEventListener("submit", event => {
  event.preventDefault();
  const from = receiptFrom.value;
  const to = receiptTo.value;
  const client = receiptClient.value;
  const works = state.works
    .filter(w => w.date >= from && w.date <= to)
    .filter(w => !client || w.client === client)
    .sort((a, b) => a.date.localeCompare(b.date));
  const services = works.reduce((s, w) => s + Number(w.value || 0), 0);
  const meals = works.reduce((s, w) => s + Number(w.meal || 0), 0);
  renderReceipt({ from, to, client, works, services, meals, total: services + meals });
});


renderAll();
renderReceipt();
window.deleteWork = deleteWork;
window.deleteRule = deleteRule;
window.editWork = editWork;

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
