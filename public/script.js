// ===============================
// API BASE (IMPORTANT)
// ===============================
const apiParam = new URLSearchParams(location.search).get('api');
if (apiParam) {
  localStorage.setItem('ozone_api', apiParam.replace(/\/+$/, ''));
}
const API_BASE = (apiParam || localStorage.getItem('ozone_api') || '').replace(/\/+$/, '');

// ===============================
// AUTH TOKEN
// ===============================
function getToken() {
  return localStorage.getItem('ozone_token');
}

// ===============================
// LOGIN FUNCTION (index.html)
// ===============================
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Login failed");
      return;
    }

    localStorage.setItem("ozone_token", data.token);
    localStorage.setItem("ozone_user", JSON.stringify(data.user));

    if (data.user.role === "admin") {
      window.location = "admin.html";
    } else {
      window.location = "dashboard.html";
    }

  } catch (err) {
    alert("Server error");
  }
}

// ===============================
// CHECK IN
// ===============================
async function checkIn() {
  try {
    const res = await fetch(`${API_BASE}/api/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Checked in at " + data.checkIn);
    loadMyRecords();

  } catch {
    alert("Error connecting server");
  }
}

// ===============================
// CHECK OUT
// ===============================
async function checkOut() {
  try {
    const res = await fetch(`${API_BASE}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Checked out at " + data.checkOut);
    loadMyRecords();

  } catch {
    alert("Error connecting server");
  }
}

// ===============================
// LOAD MY RECORDS
// ===============================
async function loadMyRecords() {
  try {
    const res = await fetch(`${API_BASE}/api/my-records`, {
      headers: {
        "Authorization": "Bearer " + getToken()
      }
    });

    const records = await res.json();

    const table = document.getElementById("recordsTable");
    if (!table) return;

    table.innerHTML = records.map(r => `
      <tr>
        <td>${r.date}</td>
        <td>${r.checkIn}</td>
        <td>${r.checkOut || "-"}</td>
      </tr>
    `).join("");

  } catch {
    console.log("Error loading records");
  }
}

// ===============================
// ADMIN OVERVIEW
// ===============================
async function loadAdmin() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/overview`, {
      headers: {
        "Authorization": "Bearer " + getToken()
      }
    });

    const data = await res.json();

    document.getElementById("totalUsers").innerText = data.users.length;
    document.getElementById("presentToday").innerText = data.presentToday;
    document.getElementById("activeToday").innerText = data.activeToday;

  } catch {
    console.log("Admin load error");
  }
}

// ===============================
// EXPORT EXCEL
// ===============================
function exportExcel() {
  window.open(`${API_BASE}/api/admin/export`, "_blank");
}

// ===============================
// LOGOUT
// ===============================
function logout() {
  localStorage.clear();
  window.location = "index.html";
}

// ===============================
// AUTO LOAD
// ===============================
window.onload = () => {
  if (document.getElementById("recordsTable")) {
    loadMyRecords();
  }

  if (document.getElementById("totalUsers")) {
    loadAdmin();
  }
};