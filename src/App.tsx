import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, BookOpen, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Download,
  GraduationCap, LayoutDashboard, Menu, MoreHorizontal, Plus, Search,
  Settings, ShieldCheck, SlidersHorizontal, Users, X, FileText, UserRound,
  BookMarked, TrendingUp, CircleHelp, LogOut, Wallet, CalendarCheck, Sparkles, Clock,
  Bus, Library, Megaphone, ClipboardCheck, Shield, GraduationCap as GradIcon
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import AssessmentWorkspace from "./AssessmentWorkspace";

type Student = { id: number; name: string; admission: string; grade: string; section: string; status: string; phone: string; joined: string; initials: string; };
const initialStudents: Student[] = [
  {id:1,name:"Abel Tadesse",admission:"2026-0001",grade:"Grade 10",section:"A",status:"Active",phone:"+251 911 234 567",joined:"Sep 12, 2026",initials:"AT"},
  {id:2,name:"Amina Mohammed",admission:"2026-0002",grade:"Grade 11",section:"B",status:"Active",phone:"+251 922 345 678",joined:"Sep 12, 2026",initials:"AM"},
  {id:3,name:"Dawit Bekele",admission:"2026-0003",grade:"Grade 9",section:"A",status:"Active",phone:"+251 933 456 789",joined:"Sep 13, 2026",initials:"DB"},
  {id:4,name:"Hana Girma",admission:"2026-0004",grade:"Grade 12",section:"Natural Science",status:"Active",phone:"+251 944 567 890",joined:"Sep 14, 2026",initials:"HG"},
  {id:5,name:"Khalid Ibrahim",admission:"2026-0005",grade:"Grade 10",section:"B",status:"Pending",phone:"+251 955 678 901",joined:"Sep 15, 2026",initials:"KI"},
  {id:6,name:"Liya Worku",admission:"2026-0006",grade:"Grade 9",section:"B",status:"Active",phone:"+251 966 789 012",joined:"Sep 16, 2026",initials:"LW"},
];
const nav = [
  {label:"",items:[["Dashboard",LayoutDashboard],["Students",Users],["Attendance",CalendarCheck],["Academics",BookOpen],["Examinations",ClipboardList],["Finance",Wallet],["Teachers",UserRound],["Classes",GradIcon],["Communication",Megaphone],["Transport",Bus],["Library",Library],["Reports",FileText],["Settings",Settings]]},
] as const;

export default function App() {
  const [active,setActive] = useState("Dashboard");
  const [students,setStudents] = useState(initialStudents);
  const [query,setQuery] = useState("");
  const [showAdd,setShowAdd] = useState(false);
  const [mobileNav,setMobileNav] = useState(false);
  const [toast,setToast] = useState("");
  const [form,setForm] = useState({name:"",mother:"",dob:"",address:"",guardian:"",guardianPhone:"",relation:"",grade:"Grade 9",section:"A"});
  const filtered = useMemo(()=>students.filter(s => [s.name,s.admission,s.grade,s.section].join(" ").toLowerCase().includes(query.toLowerCase())),[students,query]);
  const notify = (message:string) => { setToast(message); window.setTimeout(()=>setToast(""),2800); };
  const addStudent = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!form.name.trim() || !form.guardian.trim() || !form.guardianPhone.trim()) return;
    const n = students.length + 1;
    const student:Student = {id:Date.now(),name:form.name,admission:`2026-${String(n).padStart(4,"0")}`,grade:form.grade,section:form.section,status:"Active",phone:form.guardianPhone,joined:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),initials:form.name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()};
    // Demo mode is local state. Production admission numbering must be generated transactionally on the server/database.
    if(isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("students").insert({ full_name:form.name, mothers_name:form.mother || null, date_of_birth:form.dob || null, home_address:form.address || null, admission_number:student.admission, grade_label:form.grade, section_label:form.section });
      if(error){ notify(`Could not save student: ${error.message}`); return; }
    }
    setStudents(prev=>[student,...prev]); setShowAdd(false); setForm({name:"",mother:"",dob:"",address:"",guardian:"",guardianPhone:"",relation:"",grade:"Grade 9",section:"A"}); notify("Student added successfully");
  };
  const title = active;
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"sidebar-open":""}`}>
      <div className="brand"><div className="brand-mark"><Shield size={23}/></div><div><strong>Soma</strong><span> SCHOOL OS</span></div><button className="mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      
      <nav className="side-nav">{nav.map(group=><div className="nav-group" key={group.label}>{group.items.map(([label,Icon])=><button key={label} className={`nav-link ${active===label?"active":""}`} onClick={()=>{setActive(label);setMobileNav(false)}}><Icon size={18}/><span>{label}</span>{label==="Students"&&<span className="nav-count">{students.length}</span>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="school-switch"><div className="school-avatar"><Shield size={18}/></div><div className="school-copy"><strong>Greenfield High School</strong><span>2024/2025 Academic Session</span></div><ChevronDown size={14}/></div></div>
    </aside>
    {mobileNav&&<div className="scrim" onClick={()=>setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="mobile-menu" onClick={()=>setMobileNav(true)}><Menu/></button><div className="header-title">{active==="Dashboard"?"School Overview":active}</div></div><div className="top-actions"><div className="global-search"><Search size={16}/><input placeholder="Search students, staff, classes..."/><kbd>⌘ K</kbd></div><button className="icon-button notify-button" aria-label="Notifications" onClick={()=>notify("You're all caught up")}><Bell size={19}/><i/></button><div className="top-profile"><div className="top-avatar">A</div><div><strong>Admin User</strong><span>Super Admin</span></div><ChevronDown size={15}/></div></div></header>
      <div className="page-content">
        {active==="Dashboard"?<Dashboard students={students} onNavigate={setActive}/>:active==="Students"?<StudentsPage students={filtered} query={query} setQuery={setQuery} onAdd={()=>setShowAdd(true)} />:active==="Examinations"?<AssessmentWorkspace notify={notify}/>:<GenericPage active={active} notify={notify}/>}
      </div>
    </main>
    {showAdd&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}><form className="modal" onSubmit={addStudent}><div className="modal-head"><div><span className="eyebrow">STUDENT ADMISSIONS</span><h2>Register a student</h2><p>Add a new student to the school record.</p></div><button type="button" className="icon-button" onClick={()=>setShowAdd(false)}><X size={18}/></button></div><div className="form-section"><h3>Personal information</h3><div className="form-grid"><Field label="Student full name" required><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Enter full name"/></Field><Field label="Mother's full name"><input value={form.mother} onChange={e=>setForm({...form,mother:e.target.value})} placeholder="Enter mother's name"/></Field><Field label="Date of birth"><input type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/></Field><Field label="Home address"><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Town, kebele, house number"/></Field></div></div><div className="form-section"><h3>Guardian information</h3><div className="form-grid"><Field label="Guardian full name" required><input required value={form.guardian} onChange={e=>setForm({...form,guardian:e.target.value})} placeholder="Enter guardian name"/></Field><Field label="Guardian phone" required><input required value={form.guardianPhone} onChange={e=>setForm({...form,guardianPhone:e.target.value})} placeholder="+251 ..."/></Field><Field label="Relationship"><select value={form.relation} onChange={e=>setForm({...form,relation:e.target.value})}><option value="">Select relationship</option><option>Father</option><option>Mother</option><option>Sibling</option><option>Relative</option><option>Other</option></select></Field></div></div><div className="form-section"><h3>Academic placement</h3><div className="form-grid"><Field label="Grade"><select value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}>{["Grade 9","Grade 10","Grade 11","Grade 12"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Section"><select value={form.section} onChange={e=>setForm({...form,section:e.target.value})}>{["A","B","C","Natural Science","Social Science"].map(x=><option key={x}>{x}</option>)}</select></Field></div></div><div className="modal-foot"><span>Admission number is assigned automatically.</span><button type="button" className="btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn-primary" type="submit"><Plus size={16}/> Register student</button></div></form></div>}
    {toast&&<div className="toast"><Check size={17}/>{toast}</div>}
    {!isSupabaseConfigured&&<div className="demo-indicator"><span/> Demo data · Connect Supabase to enable persistence</div>}
  </div>;
}
function Field({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}){return <label className="field"><span>{label}{required&&<b> *</b>}</span>{children}</label>}
function Dashboard({students,onNavigate}:{students:Student[];onNavigate:(s:string)=>void}){
 const attendance=[
  ["JSS 1A","green","green","green","gold","green","blank","32","2","1","94%"],
  ["JSS 1B","green","green","green","green","green","blank","31","3","1","91%"],
  ["JSS 2A","green","green","gold","red","green","blank","30","1","4","87%"],
  ["JSS 2B","green","green","green","green","green","blank","33","2","0","97%"],
  ["SSS 1A","green","gold","green","red","green","blank","28","4","3","82%"],
  ["SSS 1B","green","green","green","green","green","blank","32","1","2","94%"],
  ["SSS 2A","green","green","gold","green","green","blank","31","3","1","91%"],
  ["SSS 3A","green","green","green","red","green","blank","29","2","4","85%"]
 ];
 return <>
  <div className="welcome-row"><div><h1>Welcome back, Admin</h1><p>Here’s what’s happening at your school today.</p></div><select className="term-select"><option>This Term</option><option>This Year</option><option>Last Term</option></select></div>
  <div className="soma-stats">
   <Stat label="Total Students" value="1,284" change="↑ 12 this term" note="" icon={<Users/>} trend="up"/>
   <Stat label="Attendance Rate" value="96.4%" change="↑ 2.7% vs last term" note="" icon={<CalendarCheck/>} trend="up"/>
   <Stat label="Fee Collection" value="84%" change="₦12.4M of ₦14.8M" note="" icon={<Wallet/>}/>
   <Stat label="Total Staff" value="86" change="48 online" note="" icon={<UserRound/>}/>
   <Stat label="Active Classes" value="134" change="Across all levels" note="" icon={<BookOpen/>}/>
  </div>
  <div className="soma-middle">
   <section className="panel attendance-panel"><div className="panel-heading"><div><h2>Attendance Overview</h2></div><div className="panel-tools"><select><option>This Week</option><option>Last Week</option></select><button onClick={()=>onNavigate("Attendance")}>View full report</button></div></div>
    <div className="attendance-table-wrap"><table className="attendance-table"><thead><tr><th>Class / Day</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Present</th><th>Late</th><th>Absent</th><th>Rate</th></tr></thead><tbody>{attendance.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{j===0?v:j>=7?<span className={j===8?"late-num":j===9?"absent-num":""}>{v}</span>:<i className={`attendance-cell ${v}`}/>}</td>)}</tr>)}</tbody></table></div>
    <div className="attendance-legend"><span><i className="green"/>Present</span><span><i className="gold"/>Late</span><span><i className="red"/>Absent</span><span><i className="blank"/>No Data</span></div>
   </section>
   <section className="panel assistant-panel"><div className="assistant-title"><div><Sparkles size={17}/><h2>Soma AI Assistant</h2></div><span>BETA</span><button aria-label="Close" onClick={()=>notify("AI assistant panel minimized")}>×</button></div><p>Here are key insights for today</p>
    <div className="insight-list"><button onClick={()=>notify("Opening attendance risk details")}><span className="insight-icon gold-bg"><Clock/></span><span><strong>23 students are at risk</strong><small>Due to low attendance</small></span><ChevronRight/></button><button onClick={()=>onNavigate("Finance")}><span className="insight-icon gold-bg"><Wallet/></span><span><strong>Fee collection is below target</strong><small>You are 16% behind this month’s target</small></span><ChevronRight/></button><button onClick={()=>onNavigate("Teachers")}><span className="insight-icon lilac-bg"><ClipboardCheck/></span><span><strong>4 teachers have incomplete records</strong><small>Please review and update</small></span><ChevronRight/></button><button onClick={()=>onNavigate("Examinations")}><span className="insight-icon gold-bg"><CalendarDays/></span><span><strong>Exams start in 18 days</strong><small>SSS 3 First Term Examination</small></span><ChevronRight/></button></div>
    <button className="ai-report" onClick={()=>onNavigate("Reports")}><Sparkles size={14}/> Generate AI Report <ArrowUpRight size={15}/></button>
   </section>
  </div>
  <div className="soma-bottom">
   <section className="panel mini-panel fee-panel"><div className="mini-heading"><h2>Fee Collection Summary</h2><select><option>This Month</option></select></div><div className="fee-summary"><div><strong>₦12,400,000</strong><span>of ₦14,800,000 collected</span></div><div className="small-ring"><span>84%</span></div></div><div className="fee-chart"><div className="fee-axis"><span>₦15M</span><span>₦10M</span><span>₦5M</span><span>₦0</span></div><div className="fee-bars">{[36,55,76,91].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><span>Week {i+1}</span></div>)}</div></div><div className="fee-breakdown"><span>Amount Collected <b>₦12,400,000</b></span><span>Total Expected <b>₦14,800,000</b></span><span>Balance <b>₦2,400,000</b></span></div><button className="panel-link" onClick={()=>onNavigate("Finance")}>View finance report <ArrowUpRight size={14}/></button></section>
   <section className="panel mini-panel performance-panel"><div className="mini-heading"><h2>Student Performance Overview</h2><select><option>This Term</option></select></div><div className="performance-content"><div className="performance-ring"><div><strong>72%</strong><span>Average Performance</span></div></div><div className="performance-legend">{[["Excellent","28%","#80b88c"],["Good","32%","#65a875"],["Average","25%","#d6b45b"],["Below Average","10%","#d97966"],["Poor","5%","#c66b5e"]].map(x=><div key={x[0]}><i style={{background:x[2]}}/><span>{x[0]}</span><b>{x[1]}</b></div>)}</div></div><button className="panel-link" onClick={()=>onNavigate("Results")}>View academic report <ArrowUpRight size={14}/></button></section>
   <section className="panel mini-panel events-panel"><div className="mini-heading"><h2>Upcoming Events</h2><button onClick={()=>onNavigate("Academics")}>View all</button></div>{[["MAY","25","SSS 3 Mock Examination","May 25 – May 30, 2025"],["MAY","28","PTA Meeting","May 28, 2025 · 10:00 AM"],["JUN","02","Children’s Day Celebration","June 2, 2025"],["JUN","10","Second Term Begins","June 10, 2025"]].map(e=><div className="event-row" key={e[2]}><div><small>{e[0]}</small><strong>{e[1]}</strong></div><span><b>{e[2]}</b><small>{e[3]}</small></span></div>)}</section>
   <section className="panel mini-panel staff-panel"><div className="mini-heading"><h2>Staff Overview</h2><button onClick={()=>onNavigate("Teachers")}>View all</button></div><div className="staff-content"><div className="staff-ring"><div><strong>86</strong><span>Total Staff</span></div></div><div className="staff-legend"><span><i/>Teaching Staff <b>58 (67%)</b></span><span><i/>Non-Teaching <b>20 (23%)</b></span><span><i/>Support Staff <b>8 (10%)</b></span></div></div><button className="panel-link" onClick={()=>onNavigate("Teachers")}>View staff directory <ArrowUpRight size={14}/></button></section>
  </div>
 </>;
}
function Stat({label,value,change,note,icon,trend}:{label:string;value:string;change:string;note:string;icon:React.ReactNode;trend?:string}){return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon">{icon}</div></div><div className="stat-value">{value}</div><div className="stat-foot">{trend&&<span className="trend"><ArrowUpRight size={13}/>{change}</span>}{!trend&&<span className="neutral-change">{change}</span>}<span>{note}</span></div></div>}
function StudentsPage({students,query,setQuery,onAdd}:{students:Student[];query:string;setQuery:(s:string)=>void;onAdd:()=>void}){
  return <><div className="page-heading"><div><span className="eyebrow">SCHOOL DIRECTORY</span><h1>Students</h1><p>Manage student records, admissions, and class placements.</p></div><button className="btn-primary" onClick={onAdd}><Plus size={16}/> Register student</button></div><div className="list-summary"><div><strong>{students.length}</strong><span> students found</span></div><div className="list-actions"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name or admission no."/></div><button className="btn-secondary" onClick={()=>setQuery("")}><SlidersHorizontal size={15}/> Clear filters</button><button className="btn-secondary" onClick={()=>window.print()}><Download size={15}/> Export</button></div></div><section className="panel table-panel"><div className="table-toolbar"><div><h2>All students</h2><p>Student directory · 2026 / 2027</p></div><button className="more-button"><MoreHorizontal/></button></div><StudentTable students={students}/><div className="pagination"><span>Showing <strong>{students.length?1:0}–{students.length}</strong> of <strong>{students.length}</strong> students</span><div><button disabled><ChevronLeft size={16}/></button><button className="current-page">1</button><button disabled><ChevronRight size={16}/></button></div></div></section></>;
}
function StudentTable({students,compact=false}:{students:Student[];compact?:boolean}){return <div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select all"/></th><th>Student</th><th>Admission no.</th><th>Grade & section</th><th>Guardian phone</th><th>Status</th>{!compact&&<th>Admission date</th>}</tr></thead><tbody>{students.map(s=><tr key={s.id}><td><input type="checkbox" aria-label={`Select ${s.name}`}/></td><td><div className="student-cell"><div className="student-avatar">{s.initials}</div><div><strong>{s.name}</strong><span>Student ID · {String(s.id).slice(-4)}</span></div></div></td><td className="mono">{s.admission}</td><td>{s.grade}<span className="sub-cell">Section {s.section}</span></td><td>{s.phone}</td><td><span className={`status ${s.status==="Active"?"status-active":"status-pending"}`}><i/>{s.status}</span></td>{!compact&&<td>{s.joined}</td>}</tr>)}</tbody></table>{students.length===0&&<div className="empty-state"><Users size={24}/><strong>No students found</strong><span>Try another search or register a new student.</span></div>}</div>}
function GenericPage({active,notify}:{active:string;notify:(s:string)=>void}){const descriptions:Record<string,string>={"Teachers":"Manage teaching staff, profiles, and classroom assignments.","Academic years":"Configure academic calendars and semester periods.","Grades & sections":"Organize grade levels, streams, and classroom sections.","Subjects":"Create subjects and assign them to grade levels.","Assessments":"Configure assessment structures, enter marks, and manage grading.","Results":"Review semester performance and annual academic results.","Reports":"Generate school, class, and student academic reports.","Settings":"Manage school information, user access, and system preferences."};return <><div className="page-heading"><div><span className="eyebrow">SCHOOL MANAGEMENT</span><h1>{active}</h1><p>{descriptions[active]||"Manage your school workspace."}</p></div><button className="btn-primary" onClick={()=>notify(`${active} setup is the next implementation module.`)}><Plus size={16}/> Add new</button></div><div className="panel coming-panel"><div className="coming-icon"><BookMarked size={25}/></div><h2>{active} workspace</h2><p>This module is included in the application architecture and is ready for its dedicated implementation. The next development phase will connect it to the live Supabase database.</p><div className="coming-points"><span><Check size={15}/> Shared design system</span><span><Check size={15}/> Role-aware navigation</span><span><Check size={15}/> Supabase integration foundation</span></div></div></>}
