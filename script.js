// ดึง element ที่จำเป็น
const form = document.getElementById("entry-form");
const list = document.getElementById("entries-list");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const systemToggle = document.getElementById("system-toggle");
const darkModeToggle = document.getElementById("darkmode-toggle");
const systemStatus = document.getElementById("system-status");
const pieCtx = document.getElementById("pieChart").getContext("2d");
const langButtons = document.querySelectorAll(".lang-btn");

// โหลดข้อมูลจาก localStorage หรือเริ่มใหม่
let entries = JSON.parse(localStorage.getItem("entries")) || [];
let systemOnline = JSON.parse(localStorage.getItem("systemOnline")) || false;
let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
let selectedLang = localStorage.getItem("language") || "th";

let pieChart;

// ฟังก์ชันแสดงรายการพร้อมคำนวณยอดสรุป
function renderEntries() {
  list.innerHTML = "";
  let income = 0, expense = 0;

  entries.forEach((e, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${e.desc}: ${e.amount > 0 ? '+' : ''}${e.amount.toFixed(2)}</span>
      <button class="delete-btn" onclick="deleteEntry(${i})">🗑</button>
    `;
    list.appendChild(li);

    if (e.amount >= 0) income += e.amount;
    else expense += Math.abs(e.amount);
  });

  incomeEl.textContent = income.toFixed(2);
  expenseEl.textContent = expense.toFixed(2);
  balanceEl.textContent = (income - expense).toFixed(2);
}

// เพิ่มรายการใหม่
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!systemOnline) {
    alert(selectedLang === "th" ? "ระบบออฟไลน์ ไม่สามารถเพิ่มรายการได้" : "Offline mode: cannot add entry");
    return;
  }

  const desc = document.getElementById("desc").value.trim();
  const type = document.getElementById("type").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (!desc || isNaN(amount) || amount <= 0) return;

  const finalAmount = type === "income" ? amount : -amount;
  entries.push({ desc, amount: finalAmount, type });

  localStorage.setItem("entries", JSON.stringify(entries));
  form.reset();

  renderEntries();
  updateChart();
});

// ลบรายการตาม index
function deleteEntry(index) {
  entries.splice(index, 1);
  localStorage.setItem("entries", JSON.stringify(entries));
  renderEntries();
  updateChart();
}

// อัปเดตกราฟวงกลม
function updateChart() {
  let income = 0, expense = 0;
  entries.forEach(e => {
    if (e.amount >= 0) income += e.amount;
    else expense += Math.abs(e.amount);
  });

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: [langData[selectedLang].income, langData[selectedLang].expense],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

// สลับหน้าในเมนูล่าง
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "chart-report") updateChart();
}

// จัดการสวิตช์ระบบออนไลน์/ออฟไลน์
systemToggle.checked = systemOnline;
systemStatus.textContent = systemOnline ? (selectedLang === "th" ? "ออนไลน์" : "Online") : (selectedLang === "th" ? "ออฟไลน์" : "Offline");
systemToggle.addEventListener("change", () => {
  systemOnline = systemToggle.checked;
  systemStatus.textContent = systemOnline ? (selectedLang === "th" ? "ออนไลน์" : "Online") : (selectedLang === "th" ? "ออฟไลน์" : "Offline");
  localStorage.setItem("systemOnline", JSON.stringify(systemOnline));
});

// สวิตช์โหมดกลางคืน
darkModeToggle.checked = darkMode;
document.body.className = darkMode ? "dark" : "light";
darkModeToggle.addEventListener("change", () => {
  darkMode = darkModeToggle.checked;
  document.body.className = darkMode ? "dark" : "light";
  localStorage.setItem("darkMode", JSON.stringify(darkMode));
});

// ข้อมูลแปลภาษา
const langData = {
  th: {
    title: "FlowLedger 2025",
    descLabel: "คำอธิบาย",
    typeLabel: "ประเภท",
    income: "รายรับ",
    expense: "รายจ่าย",
    amountLabel: "จำนวนเงิน",
    add: "เพิ่มรายการ",
    language: "ภาษา",
    summary_income: "💰 รายรับ:",
    summary_expense: "💸 รายจ่าย:",
    summary_balance: "🧾 คงเหลือ:",
    menu_home: "หน้าหลัก",
    menu_chart: "รายงาน",
    menu_settings: "ตั้งค่า",
    settings: "⚙️ ตั้งค่า",
    darkmode: "โหมดกลางคืน",
    system: "ระบบ",
    chart: "📊 รายงานกราฟ"
  },
  en: {
    title: "FlowLedger 2025",
    descLabel: "Description",
    typeLabel: "Type",
    income: "Income",
    expense: "Expense",
    amountLabel: "Amount",
    add: "Add Entry",
    language: "Language",
    summary_income: "💰 Income:",
    summary_expense: "💸 Expenses:",
    summary_balance: "🧾 Balance:",
    menu_home: "Home",
    menu_chart: "Report",
    menu_settings: "Settings",
    settings: "⚙️ Settings",
    darkmode: "Dark Mode",
    system: "System",
    chart: "📊 Chart Report"
  }
};

// เปลี่ยนภาษาและไฮไลต์ปุ่ม
function applyLanguage(lang) {
  selectedLang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (langData[lang][key]) el.textContent = langData[lang][key];
  });

  localStorage.setItem("language", lang);

  // ไฮไลต์ปุ่มภาษา
  langButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // อัปเดตสถานะระบบ (ออนไลน์/ออฟไลน์)
  systemStatus.textContent = systemOnline
    ? (lang === "th" ? "ออนไลน์" : "Online")
    : (lang === "th" ? "ออฟไลน์" : "Offline");

  // อัปเดตกราฟและยอดต่าง ๆ
  renderEntries();
  updateChart();
}

// ผูก event ให้ปุ่มเปลี่ยนภาษา
langButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    applyLanguage(btn.dataset.lang);
  });
});

// เรียกเริ่มต้น
applyLanguage(selectedLang);
renderEntries();
updateChart();
