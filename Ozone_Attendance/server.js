const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
const SECRET = "ozone_secret";
// ✅ MongoDB (replace later with Atlas)
mongoose.connect("mongodb://127.0.0.1:27017/attendance")
.then(()=>console.log("DB Connected"));
// Models
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  role: String
});
const Attendance = mongoose.model("Attendance", {
  userId: String,
  date: String,
  checkIn: String,
  checkOut: String
});
// Register
app.post("/register", async (req,res)=>{
  const hashed = await bcrypt.hash(req.body.password,10);
  const user = new User({...req.body, password: hashed});
  await user.save();
  res.send("User created");
});
// Login
app.post("/login", async (req,res)=>{
  const user = await User.findOne({email:req.body.email});
  if(!user) return res.status(400).send("User not found");
  const valid = await bcrypt.compare(req.body.password,user.password);
  if(!valid) return res.status(400).send("Wrong password");
  const token = jwt.sign({id:user._id, role:user.role}, SECRET);
  res.json({token, role:user.role});
});
// Auth middleware
function auth(req,res,next){
  const token = req.headers.authorization;
  if(!token) return res.sendStatus(403);
  try{
    req.user = jwt.verify(token, SECRET);
    next();
  }catch{
    res.sendStatus(401);
  }
}
// Check-in
app.post("/checkin", auth, async (req,res)=>{
  const date = new Date().toLocaleDateString();
  const exist = await Attendance.findOne({userId:req.user.id, date});
  if(exist) return res.send("Already checked in");
  const record = new Attendance({
    userId:req.user.id,
    date,
    checkIn:new Date().toLocaleTimeString()
  });
  await record.save();
  res.send("Checked In");
});
// Check-out
app.post("/checkout", auth, async (req,res)=>{
  const date = new Date().toLocaleDateString();
  await Attendance.findOneAndUpdate(
    {userId:req.user.id, date},
    {checkOut:new Date().toLocaleTimeString()}
  );
  res.send("Checked Out");
});
// My records
app.get("/my-records", auth, async (req,res)=>{
  const data = await Attendance.find({userId:req.user.id});
  res.json(data);
});
// Export Excel
app.get("/export", async (req,res)=>{
  const data = await Attendance.find();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");
  sheet.columns = [
    { header: "User ID", key: "userId" },
    { header: "Date", key: "date" },
    { header: "Check In", key: "checkIn" },
    { header: "Check Out", key: "checkOut" }
  ];
  data.forEach(d => sheet.addRow(d));
  res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition","attachment; filename=attendance.xlsx");
  await workbook.xlsx.write(res);
  res.end();
});
app.listen(3000, ()=>console.log("Server running on http://localhost:3000"));
