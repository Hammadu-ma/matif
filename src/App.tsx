import { useEffect, useMemo, useState } from "react";
import {
  Bell, BookMarked, BookOpen, CalendarCheck, Check, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardList, Download, FileText, GraduationCap as GradIcon, LayoutDashboard, Library, Megaphone,
  Menu, MoreHorizontal, Plus, Search, Settings, Shield, SlidersHorizontal, UserPlus, UserRound,
  Users, Wallet, Bus, X, PenLine
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import AssessmentWorkspace from "./AssessmentWorkspace";
import Dashboard from "./Dashboard";
import CommandPalette, { type Cmd } from "./CommandPalette";

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
  {label:"Overview",items:[["Dashboard",LayoutDashboard]]},
  {label:"People",items:[["Students",Users],["Teachers",UserRound],["Classes",GradIcon]]},
  {label:"Academics",items:[["Attendance",CalendarCheck],["Academics",BookOpen],["Examinations",ClipboardList]]},
  {label:"Operations",items:[["Finance",Wallet],["Communication",Megaphone],["Transport",Bus],["Library",Library]]},
  {label:"System",items:[["Reports",FileText],["Settings",Settings]]},
] as const;

export default function App() {
  const [active,setActive] = useState("Dashboard");
  const [students,setStudents] = useState(initialStudents);
  const [query,setQuery] = useState("");
  const [showAdd,setShowAdd] = useState(false);
  const [mobileNav,setMobileNav] = useState(false);
  const [toast,setToast] = useState("");
  const [palette,setPalette] = useState(false);
  useEffect(()=>{ const h=(e:KeyboardEvent)=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setPalette(p=>!p)} }; window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); },[]);
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
  const cmds:Cmd[] = [
    {id:"a-add",group:"Actions",label:"Register a student",icon:<UserPlus size={16}/>,run:()=>setShowAdd(true)},
    {id:"a-marks",group:"Actions",label:"Enter exam marks",icon:<PenLine size={16}/>,run:()=>setActive("Examinations")},
    ...nav.flatMap(g=>g.items.map(([label,Icon])=>({id:`p-${label}`,group:"Go to",label,icon:<Icon size={16}/>,hint:g.label,run:()=>setActive(label)}))),
    ...students.map(s=>({id:`s-${s.id}`,group:"Students",label:s.name,icon:<div className="cmdk-av">{s.initials}</div>,hint:`${s.admission} · ${s.grade}`,run:()=>{setQuery(s.name);setActive("Students")}})),
  ];
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?"sidebar-open":""}`}>
      <div className="brand"><div className="brand-mark"><Shield size={23}/></div><div><strong>Soma</strong><span> SCHOOL OS</span></div><button className="mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      
      <nav className="side-nav">{nav.map(group=><div className="nav-group" key={group.label}>{group.label&&<p>{group.label}</p>}{group.items.map(([label,Icon])=><button key={label} className={`nav-link ${active===label?"active":""}`} onClick={()=>{setActive(label);setMobileNav(false)}}><Icon size={18}/><span>{label}</span>{label==="Students"&&<span className="nav-count">{students.length}</span>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="school-switch"><div className="school-avatar"><Shield size={18}/></div><div className="school-copy"><strong>Greenfield High School</strong><span>Semester 1 · 2026/27</span></div><ChevronDown size={14}/></div></div>
    </aside>
    {mobileNav&&<div className="scrim" onClick={()=>setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="mobile-menu" onClick={()=>setMobileNav(true)}><Menu/></button><div className="header-title">{active==="Dashboard"?"School Overview":active}</div></div><div className="top-actions">{!isSupabaseConfigured&&<div className="demo-indicator" title="Connect Supabase to enable persistence"><span/> Demo data</div>}<button className="cmd-trigger" onClick={()=>setPalette(true)} aria-label="Open command palette"><Search size={16}/><span>Search or jump to…</span><kbd>⌘K</kbd></button><button className="icon-button notify-button" aria-label="Notifications" onClick={()=>notify("You're all caught up")}><Bell size={19}/><i/></button><div className="top-profile"><div className="top-avatar">A</div><div><strong>Admin User</strong><span>Super Admin</span></div><ChevronDown size={15}/></div></div></header>
      <div className="page-content">
        {active==="Dashboard"?<Dashboard studentCount={students.length} onNavigate={setActive} notify={notify} onAdd={()=>setShowAdd(true)}/>:active==="Students"?<StudentsPage students={filtered} query={query} setQuery={setQuery} onAdd={()=>setShowAdd(true)} />:active==="Examinations"?<AssessmentWorkspace notify={notify}/>:<GenericPage active={active} notify={notify}/>}
      </div>
    </main>
    {showAdd&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}><form className="modal" onSubmit={addStudent}><div className="modal-head"><div><span className="eyebrow">STUDENT ADMISSIONS</span><h2>Register a student</h2><p>Add a new student to the school record.</p></div><button type="button" className="icon-button" onClick={()=>setShowAdd(false)}><X size={18}/></button></div><div className="form-section"><h3>Personal information</h3><div className="form-grid"><Field label="Student full name" required><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Enter full name"/></Field><Field label="Mother's full name"><input value={form.mother} onChange={e=>setForm({...form,mother:e.target.value})} placeholder="Enter mother's name"/></Field><Field label="Date of birth"><input type="date" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})}/></Field><Field label="Home address"><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Town, kebele, house number"/></Field></div></div><div className="form-section"><h3>Guardian information</h3><div className="form-grid"><Field label="Guardian full name" required><input required value={form.guardian} onChange={e=>setForm({...form,guardian:e.target.value})} placeholder="Enter guardian name"/></Field><Field label="Guardian phone" required><input required value={form.guardianPhone} onChange={e=>setForm({...form,guardianPhone:e.target.value})} placeholder="+251 ..."/></Field><Field label="Relationship"><select value={form.relation} onChange={e=>setForm({...form,relation:e.target.value})}><option value="">Select relationship</option><option>Father</option><option>Mother</option><option>Sibling</option><option>Relative</option><option>Other</option></select></Field></div></div><div className="form-section"><h3>Academic placement</h3><div className="form-grid"><Field label="Grade"><select value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}>{["Grade 9","Grade 10","Grade 11","Grade 12"].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Section"><select value={form.section} onChange={e=>setForm({...form,section:e.target.value})}>{["A","B","C","Natural Science","Social Science"].map(x=><option key={x}>{x}</option>)}</select></Field></div></div><div className="modal-foot"><span>Admission number is assigned automatically.</span><button type="button" className="btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn-primary" type="submit"><Plus size={16}/> Register student</button></div></form></div>}
    <CommandPalette open={palette} onClose={()=>setPalette(false)} items={cmds}/>
    {toast&&<div className="toast"><Check size={17}/>{toast}</div>}
    
  </div>;
}
function Field({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}){return <label className="field"><span>{label}{required&&<b> *</b>}</span>{children}</label>}
function StudentsPage({students,query,setQuery,onAdd}:{students:Student[];query:string;setQuery:(s:string)=>void;onAdd:()=>void}){
  return <><div className="page-heading"><div><span className="eyebrow">SCHOOL DIRECTORY</span><h1>Students</h1><p>Manage student records, admissions, and class placements.</p></div><button className="btn-primary" onClick={onAdd}><Plus size={16}/> Register student</button></div><div className="list-summary"><div><strong>{students.length}</strong><span> students found</span></div><div className="list-actions"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name or admission no."/></div><button className="btn-secondary" onClick={()=>setQuery("")}><SlidersHorizontal size={15}/> Clear filters</button><button className="btn-secondary" onClick={()=>window.print()}><Download size={15}/> Export</button></div></div><section className="panel table-panel"><div className="table-toolbar"><div><h2>All students</h2><p>Student directory · 2026 / 2027</p></div><button className="more-button"><MoreHorizontal/></button></div><StudentTable students={students}/><div className="pagination"><span>Showing <strong>{students.length?1:0}–{students.length}</strong> of <strong>{students.length}</strong> students</span><div><button disabled><ChevronLeft size={16}/></button><button className="current-page">1</button><button disabled><ChevronRight size={16}/></button></div></div></section></>;
}
function StudentTable({students,compact=false}:{students:Student[];compact?:boolean}){return <div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Select all"/></th><th>Student</th><th>Admission no.</th><th>Grade & section</th><th>Guardian phone</th><th>Status</th>{!compact&&<th>Admission date</th>}</tr></thead><tbody>{students.map(s=><tr key={s.id}><td><input type="checkbox" aria-label={`Select ${s.name}`}/></td><td><div className="student-cell"><div className="student-avatar">{s.initials}</div><div><strong>{s.name}</strong><span>Student ID · {String(s.id).slice(-4)}</span></div></div></td><td className="mono">{s.admission}</td><td>{s.grade}<span className="sub-cell">Section {s.section}</span></td><td>{s.phone}</td><td><span className={`status ${s.status==="Active"?"status-active":"status-pending"}`}><i/>{s.status}</span></td>{!compact&&<td>{s.joined}</td>}</tr>)}</tbody></table>{students.length===0&&<div className="empty-state"><Users size={24}/><strong>No students found</strong><span>Try another search or register a new student.</span></div>}</div>}
function GenericPage({active,notify}:{active:string;notify:(s:string)=>void}){const descriptions:Record<string,string>={"Teachers":"Manage teaching staff, profiles, and classroom assignments.","Academic years":"Configure academic calendars and semester periods.","Grades & sections":"Organize grade levels, streams, and classroom sections.","Subjects":"Create subjects and assign them to grade levels.","Assessments":"Configure assessment structures, enter marks, and manage grading.","Results":"Review semester performance and annual academic results.","Reports":"Generate school, class, and student academic reports.","Settings":"Manage school information, user access, and system preferences."};return <><div className="page-heading"><div><span className="eyebrow">SCHOOL MANAGEMENT</span><h1>{active}</h1><p>{descriptions[active]||"Manage your school workspace."}</p></div><button className="btn-primary" onClick={()=>notify(`${active} setup is the next implementation module.`)}><Plus size={16}/> Add new</button></div><div className="panel coming-panel"><div className="coming-icon"><BookMarked size={25}/></div><h2>{active} workspace</h2><p>This module is included in the application architecture and is ready for its dedicated implementation. The next development phase will connect it to the live Supabase database.</p><div className="coming-points"><span><Check size={15}/> Shared design system</span><span><Check size={15}/> Role-aware navigation</span><span><Check size={15}/> Supabase integration foundation</span></div></div></>}
