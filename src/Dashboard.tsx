import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowUpRight, CalendarCheck, CalendarDays, ChevronRight, ClipboardCheck, Clock,
  PenLine, Sparkles, TrendingDown, TrendingUp, UserPlus, UserRound, Users, Wallet,
} from "lucide-react";

type Props = { studentCount: number; onNavigate: (s: string) => void; notify: (s: string) => void; onAdd: () => void };
const d = (i: number) => ({ "--i": i }) as React.CSSProperties;

function smooth(p: number[][]) {
  let s = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) { const [x0, y0] = p[i], [x1, y1] = p[i + 1], cx = (x0 + x1) / 2; s += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`; }
  return s;
}

function CountUp({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); prev.current = to; return; }
    const from = prev.current, t0 = performance.now(), dur = 1100; let raf = 0;
    const tick = (t: number) => { const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3); setV(from + (to - from) * e); if (k < 1) raf = requestAnimationFrame(tick); else prev.current = to; };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const id = useId().replace(/:/g, ""), w = 120, h = 40, min = Math.min(...data), rng = Math.max(...data) - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 5 - ((v - min) / rng) * (h - 12)]);
  const line = smooth(pts);
  return <svg className="dx-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
    <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".3" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
    <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>;
}

function TrendChart() {
  const id = useId().replace(/:/g, "");
  const data = [91.2, 92.4, 91.8, 93.1, 94.0, 93.2, 94.8, 95.1, 94.6, 95.7, 96.0, 96.4];
  const W = 520, H = 210, L = 46, B = 26, T = 10, R = 12, lo = 90, hi = 98;
  const x = (i: number) => L + (i / (data.length - 1)) * (W - L - R), y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const pts = data.map((v, i) => [x(i), y(v)]), line = smooth(pts), last = pts[pts.length - 1];
  return <svg viewBox={`0 0 ${W} ${H}`} className="dx-trend-svg" role="img" aria-label="Weekly attendance trend rising from 91.2% to 96.4%">
    <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1b7a55" stopOpacity=".28" /><stop offset="1" stopColor="#1b7a55" stopOpacity="0" /></linearGradient></defs>
    {[90, 92, 94, 96, 98].map(g => <g key={g}><line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke="rgba(20,50,35,.07)" strokeDasharray="3 5" /><text x={L - 8} y={y(g) + 4} textAnchor="end" fontSize="12.5" fill="#34423a" fontWeight="600">{g}%</text></g>)}
    {data.map((_, i) => i % 3 === 0 && <text key={i} x={x(i)} y={H - 5} textAnchor="middle" fontSize="12.5" fill="#34423a" fontWeight="600">W{i + 1}</text>)}
    <path d={`${line} L${last[0]},${H - B} L${L},${H - B} Z`} fill={`url(#${id})`} />
    <path d={line} fill="none" stroke="#1b7a55" strokeWidth="2.6" strokeLinecap="round" />
    <circle cx={last[0]} cy={last[1]} r="9" fill="#34d399" opacity=".25" className="dx-halo" />
    <circle cx={last[0]} cy={last[1]} r="4.5" fill="#fff" stroke="#1b7a55" strokeWidth="2.5" />
  </svg>;
}

const heat: [string, string, number][] = [
  ["Grade 9A", "ppplp", 94], ["Grade 9B", "ppppp", 97], ["Grade 10A", "pplap", 87], ["Grade 10B", "ppppp", 95],
  ["Grade 11A", "plpap", 82], ["Grade 11B", "ppppp", 94], ["Grade 12 NS", "pplpp", 91], ["Grade 12 SS", "pppap", 85],
];
const insights = [
  { tone: "amber", icon: <Clock />, t: "23 students at attendance risk", s: "Below 85% over the last 3 weeks", go: "Attendance" },
  { tone: "rose", icon: <Wallet />, t: "Fee collection is 16% behind", s: "Br 2.4M outstanding this month", go: "Finance" },
  { tone: "violet", icon: <ClipboardCheck />, t: "4 teachers have incomplete records", s: "Review and update profiles", go: "Teachers" },
  { tone: "blue", icon: <CalendarDays />, t: "Semester 1 exams in 18 days", s: "Grade 12 mock exam starts first", go: "Examinations" },
];
const events = [
  ["NOV", "30", "Grade 12 Mock Examination", "Nov 30 – Dec 4, 2026"],
  ["DEC", "04", "Parent–Teacher Meeting", "Dec 4, 2026 · 10:00 AM"],
  ["DEC", "18", "Semester 1 Exams Begin", "Dec 18, 2026"],
  ["JAN", "12", "Semester 2 Begins", "Jan 12, 2027"],
];

export default function Dashboard({ studentCount, onNavigate, notify, onAdd }: Props) {
  const hr = new Date().getHours(), greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const total = 1284 + studentCount - 6;
  return <div className="dx-grid">
    <section className="dx-hero" style={d(0)}>
      <div>
        <span className="dx-chip"><i />{today}</span>
        <h1>{greet}, Admin 👋</h1>
        <p>Attendance is up <b>2.7%</b> this term and Semester 1 exams are 18 days away. Here’s a snapshot of Greenfield High today.</p>
        <div className="dx-actions">
          <button className="dx-btn" onClick={onAdd}><UserPlus size={16} />Register student</button>
          <button className="dx-btn ghost" onClick={() => onNavigate("Attendance")}><CalendarCheck size={16} />Take attendance</button>
          <button className="dx-btn ghost" onClick={() => onNavigate("Examinations")}><PenLine size={16} />Enter marks</button>
        </div>
      </div>
      <div className="dx-hero-stats">
        {[["Present", "1,238"], ["Late", "21"], ["Absent", "25"]].map(([k, v]) => <div key={k}><strong>{v}</strong><span>{k}</span></div>)}
      </div>
    </section>

    <section className="panel dx-panel dx-ai" style={d(1)}>
      <div className="dx-head"><div><h2><Sparkles size={16} className="dx-spark-ico" /> Soma Insights</h2><p>What needs your attention today</p></div><span className="dx-badge">BETA</span></div>
      <div className="dx-insights">
        {insights.map(x => <button key={x.t} className="dx-insight" onClick={() => x.go === "Attendance" ? notify("Opening attendance risk details") : onNavigate(x.go)}>
          <span className={`dx-ico t-${x.tone}`}>{x.icon}</span><span><strong>{x.t}</strong><small>{x.s}</small></span><ChevronRight size={16} />
        </button>)}
      </div>
      <button className="dx-ai-btn" onClick={() => onNavigate("Reports")}><Sparkles size={15} /> Generate AI report <ArrowUpRight size={15} /></button>
    </section>

    <div className="dx-kpis" style={d(2)}>
      {[
        { l: "Total students", n: <CountUp to={total} />, ic: <Users />, tone: "green", up: true, dt: "12 this term", sp: [40, 44, 43, 49, 52, 51, 58, 62, 66], c: "#1b7a55" },
        { l: "Attendance rate", n: <CountUp to={96.4} decimals={1} suffix="%" />, ic: <CalendarCheck />, tone: "blue", up: true, dt: "2.7%", sp: [91, 92, 91.5, 93, 94, 93, 95, 96, 96.4], c: "#3b82f6" },
        { l: "Fee collection", n: <CountUp to={84} suffix="%" />, ic: <Wallet />, tone: "amber", up: false, dt: "16% to go", sp: [20, 31, 38, 52, 60, 68, 74, 80, 84], c: "#e2a22b" },
        { l: "Total staff", n: <CountUp to={86} />, ic: <UserRound />, tone: "violet", up: true, dt: "48 online", sp: [80, 81, 81, 83, 84, 84, 85, 86, 86], c: "#8b5cf6" },
      ].map(k => <div className="panel dx-kpi" key={k.l}>
        <div className="dx-kpi-top"><span className={`dx-ico t-${k.tone}`}>{k.ic}</span><span className={`dx-delta ${k.up ? "up" : "down"}`}>{k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{k.dt}</span></div>
        <strong>{k.n}</strong><small>{k.l}</small><Spark data={k.sp} color={k.c} />
      </div>)}
    </div>

    <section className="panel dx-panel dx-trend" style={d(3)}>
      <div className="dx-head"><div><h2>Attendance trend</h2><p>School-wide, last 12 weeks</p></div><button className="dx-link" onClick={() => onNavigate("Attendance")}>Full report <ArrowUpRight size={14} /></button></div>
      <TrendChart />
    </section>

    <section className="panel dx-panel dx-heat" style={d(4)}>
      <div className="dx-head"><div><h2>This week by class</h2><p>Daily attendance, Monday to Friday</p></div>
        <div className="dx-legend"><span><i className="p" />Present</span><span><i className="l" />Late</span><span><i className="a" />Absent</span></div></div>
      <div className="dx-heat-head"><span /><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Rate</span></div>
      {heat.map(([name, cells, rate]) => <div className="dx-heat-row" key={name}>
        <b>{name}</b>{cells.split("").map((c, i) => <i key={i} className={`dx-cell ${c}`} title={`${name} · ${["Mon", "Tue", "Wed", "Thu", "Fri"][i]}`} />)}
        <span className={`dx-rate ${rate >= 93 ? "hi" : rate >= 88 ? "mid" : "low"}`}>{rate}%</span>
      </div>)}
    </section>

    <section className="panel dx-panel dx-fee" style={d(5)}>
      <div className="dx-head"><div><h2>Fee collection</h2><p>This month</p></div><button className="dx-link" onClick={() => onNavigate("Finance")}>Details <ArrowUpRight size={14} /></button></div>
      <div className="dx-money"><strong>Br 12.4M</strong><span>of Br 14.8M expected</span></div>
      <div className="dx-progress"><i style={{ width: "84%" }} /></div>
      <div className="dx-bars">{[36, 55, 76, 91].map((v, i) => <div key={i}><i style={{ height: `${v}%` }} /><span>W{i + 1}</span></div>)}</div>
      <div className="dx-split"><span>Collected <b>Br 12.4M</b></span><span>Balance <b className="warn">Br 2.4M</b></span></div>
    </section>

    <section className="panel dx-panel dx-perf" style={d(6)}>
      <div className="dx-head"><div><h2>Performance</h2><p>Average across all subjects</p></div><button className="dx-link" onClick={() => onNavigate("Examinations")}>Results <ArrowUpRight size={14} /></button></div>
      <div className="dx-perf-body">
        <div className="dx-donut"><div><strong>72%</strong><span>Average</span></div></div>
        <div className="dx-donut-legend">{[["Excellent", "28%", "#0f8a5f"], ["Good", "32%", "#34d399"], ["Average", "25%", "#f5b942"], ["Below avg.", "10%", "#fb923c"], ["Poor", "5%", "#ef6a5b"]].map(x => <div key={x[0]}><i style={{ background: x[2] }} /><span>{x[0]}</span><b>{x[1]}</b></div>)}</div>
      </div>
    </section>

    <section className="panel dx-panel dx-events" style={d(7)}>
      <div className="dx-head"><div><h2>Upcoming</h2><p>Next on the school calendar</p></div><button className="dx-link" onClick={() => onNavigate("Academics")}>All <ArrowUpRight size={14} /></button></div>
      {events.map((e, i) => <div className={`dx-event ${i === 0 ? "next" : ""}`} key={e[2]}><div className="dx-date"><small>{e[0]}</small><strong>{e[1]}</strong></div><span><b>{e[2]}</b><small>{e[3]}</small></span></div>)}
    </section>
  </div>;
}
