// ============================================================
// Laurel prototype — mock data + helpers
// ============================================================

// Harmonious class identity hues — one cool, muted family (consistent L≈0.56, C≈0.055).
// Deliberately kept clear of status hues: present(165) late(70) absent(33) gold(79).
const CLASS_HUES = {
  chem: 'oklch(0.56 0.055 200)',  // teal
  math: 'oklch(0.56 0.055 232)',  // blue
  cs:   'oklch(0.55 0.058 262)',  // indigo
  phil: 'oklch(0.55 0.058 294)',  // violet
  art:  'oklch(0.57 0.055 326)',  // plum
};

const CLASSES = [
  { id:'chem', name:'Organic Chemistry II', code:'CHEM 210', room:'Boas 114', prof:'Dr. Okafor', target:90, days:['Mon','Wed','Fri'], time:'9:00', semTotal:45, held:32, present:27, late:2, absent:3, hue:CLASS_HUES.chem },
  { id:'math', name:'Linear Algebra',        code:'MATH 221', room:'Hayes 207', prof:'Dr. Lindqvist', target:80, days:['Tue','Thu'], time:'11:00', semTotal:30, held:21, present:20, late:1, absent:0, hue:CLASS_HUES.math },
  { id:'phil', name:'Intro to Philosophy',   code:'PHIL 101', room:'Wright 12', prof:'Prof. Adeyemi', target:75, days:['Mon','Wed','Fri'], time:'13:00', semTotal:45, held:30, present:22, late:3, absent:5, hue:CLASS_HUES.phil },
  { id:'cs',   name:'Data Structures',       code:'CS 250',   room:'Eng 330',  prof:'Dr. Hartmann', target:85, days:['Tue','Thu'], time:'14:30', semTotal:30, held:20, present:15, late:1, absent:4, hue:CLASS_HUES.cs },
  { id:'art',  name:'Art History',           code:'ARTH 150', room:'Stone 5',  prof:'Prof. Mori', target:70, days:['Wed'], time:'16:00', semTotal:15, held:11, present:10, late:0, absent:1, hue:CLASS_HUES.art },
];

// Today's schedule (Monday) — some already logged, some pending
const TODAY = [
  { id:'t1', classId:'chem', time:'9:00',  status:'present' },
  { id:'t2', classId:'math', time:'11:00', status:'late' },
  { id:'t3', classId:'phil', time:'13:00', status:null },
  { id:'t4', classId:'cs',   time:'14:30', status:null },
  { id:'t5', classId:'art',  time:'16:00', status:null },
];

const USER = { name:'Maya', level:12, rank:'Junior', xp:740, xpMax:1000, streak:23, weekXP:560, totalXP:11740, freezes:2, premium:false };

// Rank ladder
const LADDER = [
  { name:'Freshman',      lvl:1,  done:true },
  { name:'Sophomore',     lvl:5,  done:true },
  { name:'Junior',        lvl:10, done:true, current:true },
  { name:'Senior',        lvl:18, done:false },
  { name:'Honors',        lvl:26, done:false },
  { name:"Dean's List",   lvl:35, done:false },
  { name:'Valedictorian', lvl:50, done:false },
];

const BADGES = [
  { id:'b1', name:'Perfect Week',  desc:'Attend every class for a week', icon:'sparkles', unlocked:true,  rarity:'Common' },
  { id:'b2', name:'On a Roll',     desc:'7-day check-in streak',          icon:'flame',    unlocked:true,  rarity:'Common' },
  { id:'b3', name:'Full House',    desc:'All classes present in one day', icon:'present',  unlocked:true,  rarity:'Common' },
  { id:'b4', name:'Early Bird',    desc:'10 classes before 9 AM',         icon:'today',    unlocked:true,  rarity:'Uncommon' },
  { id:'b5', name:'Buffer Saver',  desc:'Recover a class from danger',    icon:'target',   unlocked:true,  rarity:'Uncommon' },
  { id:'b6', name:'Scholar',       desc:'Hit 95% in any class',           icon:'book',     unlocked:false, progress:0.93, rarity:'Rare' },
  { id:'b7', name:'Unshakeable',   desc:'30-day streak',                  icon:'bolt',     unlocked:false, progress:23/30, rarity:'Rare' },
  { id:'b8', name:'Flawless Month',desc:'Zero absences in a month',       icon:'laurel',   unlocked:false, progress:0.6, rarity:'Epic' },
  { id:'b9', name:'Dean\u2019s Pace', desc:'Maintain 90%+ all semester',  icon:'crown',    unlocked:false, progress:0.78, rarity:'Epic' },
];

// ---- helpers ----
function rate(c){ return c.held ? (c.present + c.late) / c.held : 1; }
function pct(c){ return Math.round(rate(c) * 100); }
function buffer(c){
  const base = (c.reqMode === 'count' && c.maxAbsences != null)
    ? c.maxAbsences
    : Math.floor(c.semTotal * (1 - c.target/100));
  const allowed = base + (c.excused || 0);
  return Math.max(0, allowed - c.absent);
}
function riskOf(c){
  const b = buffer(c);
  if (b <= 0) return 'danger';
  if (c.reqMode !== 'count' && pct(c) < c.target) return 'danger';
  if (b <= 1) return 'watch';
  return 'safe';
}
const RISK = {
  safe:   { label:'On track', c:'var(--present)', soft:'var(--present-soft)' },
  watch:  { label:'Watch',    c:'var(--late)',    soft:'var(--late-soft)' },
  danger: { label:'At risk',  c:'var(--risk-danger)', soft:'var(--absent-soft)' },
};
function classById(id){ return CLASSES.find(c => c.id === id); }

// 12-week attendance heatmap per day (0 none,1 absent,2 late,3 present)
const HEAT = (() => {
  const seed = [3,3,2,3,3,1,3,3,3,3,2,3,3,3,1,3,3,3,3,2,3,3,3,3,3,1,2,3,3,3,3,3,3,2,3,1,3,3,3,3,3,3,2,3,3,3,3,3,1,3,3,3,3,3,3,3,2,3,3,3];
  return seed;
})();
const WEEK_TREND = [78,82,80,86,84,88,91,89,93,90,94,92];

// ---- deeper analytics data ----
// per-class punctuality and time-of-day
const CLASS_TIME = { chem:'9:00', math:'11:00', phil:'13:00', cs:'14:30', art:'16:00' };
// attendance rate by weekday (Mon..Fri), 0..1
const DOW_RATE = [0.82, 0.94, 0.88, 0.90, 0.79];
// attendance rate by class start hour bucket
const HOUR_BUCKETS = [
  { label:'Before 10a', rate:0.81, n:14 },
  { label:'10a–12p',    rate:0.93, n:9 },
  { label:'12–2p',      rate:0.88, n:11 },
  { label:'2–4p',       rate:0.79, n:8 },
  { label:'After 4p',   rate:0.86, n:5 },
];
// monthly overall attendance (Jan..May), %
const MONTHLY = [
  { m:'Jan', v:84 }, { m:'Feb', v:88 }, { m:'Mar', v:91 }, { m:'Apr', v:90 }, { m:'May', v:93 },
];
// streak history (longest runs, in days)
const STREAKS = { current:23, longest:31, freezesLeft:2, thisTermAvg:14 };
// punctuality: present-on-time vs late share per class
function punctuality(c){ const logged = c.present + c.late; return logged ? c.present / logged : 1; }
// letter grade equivalent for an attendance %
function attendGrade(p){
  if (p>=95) return 'A+'; if (p>=90) return 'A'; if (p>=87) return 'A-';
  if (p>=83) return 'B+'; if (p>=80) return 'B'; if (p>=77) return 'B-';
  if (p>=73) return 'C+'; if (p>=70) return 'C'; return 'D';
}
// confidence band for a projection (tighter when more classes already held)
function projConfidence(c){ const done = c.held / c.semTotal; return Math.round(60 + done*38); }

Object.assign(window, { CLASSES, TODAY, USER, LADDER, BADGES, CLASS_HUES, HEAT, WEEK_TREND, RISK, rate, pct, buffer, riskOf, classById,
  CLASS_TIME, DOW_RATE, HOUR_BUCKETS, MONTHLY, STREAKS, punctuality, attendGrade, projConfidence });
