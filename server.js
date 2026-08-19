import express from 'express';
import cors from 'cors';
import fs from 'fs';
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const REJECT_PATTERNS = [
  /school fee/i,
  /help.*school/i,
  /sponsor my business/i,
  /sponsor me/i,
  /need.*₦/i,
  /need.*naira/i,
  /need.*500,?000/i,
  /i need money/i,
  /urgently/i,
  /give me money/i,
  /dash me/i,
  /abeg/i,
  /owo/i,
  /borrow/i,
  /help me with money/i,
  /financial help/i
];

const BANK_PATTERNS = [
  /\b\d{10}\b/,
  /account number/i,
  /acct number/i,
  /acc no/i,
  /my account/i,
  /bank account/i,
  /bvn/i,
  /sort code/i,
  /opay/i,
  /palmpay/i,
  /kuda/i,
  /moniepoint/i,
  /gtb/i,
  /gtbank/i,
  /first bank/i,
  /uba/i,
  /access bank/i,
  /zenith/i,
  /wema/i,
  /fidelity/i,
  /union bank/i,
  /ecobank/i,
  /fcmb/i,
  /sterling/i
];

const REVIEW_PATTERNS = [
  /meet.*personally/i,
  /meet dj big n/i,
  /one on one/i,
  /partnership/i,
  /potential partnership/i,
  /discuss.*partnership/i,
  /collab/i
];

function classify(text){
  const lower = text.toLowerCase();
  if (BANK_PATTERNS.some(rx=>rx.test(text)) || REJECT_PATTERNS.some(rx=>rx.test(text))) return {status:'REJECT'};
  if (REVIEW_PATTERNS.some(rx=>rx.test(text))) return {status:'REVIEW'};
  if (/(concert|wedding|birthday|club|festival|corporate|gig|show)/i.test(text)) return {status:'ACCEPT'};
  return {status:'REVIEW'};
}

app.post('/api/book', (req,res)=>{
  const {date, location, budget, audience, eventType, name, email, phone} = req.body;
  const fullText = `${audience||''} ${eventType||''} ${location||''} ${budget||''} ${name||''}`.trim();
  const result = classify(fullText);

  if (result.status === 'REJECT') {
    return res.status(400).json({
      ok:false,
      status:'REJECT',
      message: 'Request Not Eligible\nThis booking portal is reserved for professional event bookings and business enquiries. Please provide details of your event, venue, date and expected audience.'
    });
  }

  if (!date || !location || !budget) {
    return res.status(400).json({
      ok:false,
      status:'REJECT',
      message: 'Request Not Eligible\nThis booking portal is reserved for professional event bookings and business enquiries. Please provide details of your event, venue, date and expected audience.'
    });
  }

  const bookings = JSON.parse(fs.existsSync('bookings.json')?fs.readFileSync('bookings.json'):'[]');
  const entry = { id: Date.now(), ...req.body, classification: result.status, createdAt: new Date().toISOString() };
  bookings.push(entry);
  fs.writeFileSync('bookings.json', JSON.stringify(bookings,null,2));

  if (result.status === 'REVIEW') {
    return res.json({ok:true, status:'REVIEW', message:'Your request has been flagged for manual review before reaching DJ Big N.'});
  }
  return res.json({ok:true, status:'ACCEPT', message:'Booking sent to DJ Big N'});
});

app.get('/api/bookings', (req,res)=>{
  const bookings = JSON.parse(fs.existsSync('bookings.json')?fs.readFileSync('bookings.json'):'[]');
  res.json(bookings);
});

app.listen(3000, ()=>console.log('DJ Big N backend v2 running on http://localhost:3000'));
