OZONE ATTENDANCE
================

A login-based company attendance tracker. Users log in with email +
password, get a JWT, and land on either the employee dashboard or an
admin page depending on their role. Data is stored in MongoDB.

SETUP
-----
1. Install Node.js (v18+) if you don't already have it.
2. Install and start MongoDB locally (default connection used here is
   mongodb://127.0.0.1:27017/attendance).
3. In this folder, run:
     npm install
4. Start the server:
     npm start
5. Open http://localhost:3000 in your browser.

FILE STRUCTURE
--------------
ozone-attendance/
├── server.js          Express API: register, login, checkin,
│                       checkout, my-records, export (Excel)
├── package.json        Dependencies
├── README.txt           This file
└── public/
    ├── index.html        Login page
    ├── dashboard.html     Employee view: check in/out (alerts show
    │                       the server's response), table of my records
    ├── admin.html          Admin view: a single "Download Excel" button
    └── style.css           Shared plain styling for dashboard/admin

CREATING YOUR FIRST USER
--------------------------
There's no register page yet — index.html is login-only. To create a
user (including the first admin), POST to /register directly, e.g.
with curl:

  curl -X POST http://localhost:3000/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Asha Menon\",\"email\":\"asha@ozone.co\",\"password\":\"changeme\",\"role\":\"admin\"}"

Set "role" to "admin" or "employee" depending on who you're creating.
Anyone who logs in with role "admin" is sent to admin.html; everyone
else goes to dashboard.html.

KNOWN GAPS
----------
- No register UI — only the curl workaround above.
- No "all records" view for admins — server.js doesn't expose that
  route, so admin.html only offers the Excel export.
- Check in / check out results show as browser alert() popups rather
  than inline messages.
- No password-reset or account-management screens.
- The JWT secret is hardcoded in server.js ("ozone_secret") — replace
  it with an environment variable before this goes anywhere real.
