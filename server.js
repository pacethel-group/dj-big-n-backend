const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let bookings = [];
let messages = [];

// Health
app.get('/', (req,res)=> res.json({status:'DJ Big N Backend Running', owner:'Philip Amadi', year:2026}));

// Booking endpoint
app.post('/api/book', (req,res)=>{
  const {name, phone, date, event} = req.body;
  if(!name || !phone || !date) return res.status(400).json({error:'Missing fields'});
  const b = {id: Date.now(), name, phone, date, event, time: new Date()};
  bookings.push(b);
  console.log('New booking:', b);
  res.json({success:true, booking:b});
});

// Get bookings
app.get('/api/bookings', (req,res)=> res.json(bookings));

// Contact message
app.post('/api/contact', (req,res)=>{
  const {name, message} = req.body;
  const m = {id: Date.now(), name, message, time: new Date()};
  messages.push(m);
  res.json({success:true});
});

app.get('/api/messages', (req,res)=> res.json(messages));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Backend running on port '+PORT));
