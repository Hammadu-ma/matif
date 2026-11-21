import { useMemo, useState } from "react";
import { AlertCircle, ArrowDownToLine, ArrowRight, Check, ChevronDown, Copy, Download, FileSpreadsheet, Info, Plus, Save, Settings2, ShieldCheck, Trash2 } from "lucide-react";

type Component = { id: string; name: string; max: number };
type EntryStatus = "scored" | "absent" | "exempt" | "pending";
type Mark = { value: string; status: EntryStatus };
type StudentRow = { id: string; name: string; admission: string };

const students: StudentRow[] = [
  { id: "s1", name: "Abel Tadesse", admission: "2026-0001" },
  { id: "s2", name: "Amina Mohammed", admission: "2026-0002" },
  { id: "s3", name: "Dawit Bekele", admission: "2026-0003" },
  { id: "s4", name: "Hana Girma", admission: "2026-0004" },
  { id: "s5", name: "Khalid Ibrahim", admission: "2026-0005" },
  { id: "s6", name: "Liya Worku", admission: "2026-0006" },
];
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const starter: Record<string, Component[]> = {
  Biology: [{ id: "b1", name: "Assignment", max: 10 }, { id: "b2", name: "Quiz", max: 10 }, { id: "b3", name: "Midterm", max: 20 }, { id: "b4", name: "Final exam", max: 60 }],
  Mathematics: [{ id: "m1", name: "Quiz 1", max: 10 }, { id: "m2", name: "Quiz 2", max: 10 }, { id: "m3", name: "Classwork", max: 10 }, { id: "m4", name: "Midterm", max: 30 }, { id: "m5", name: "Final exam", max: 40 }],
  English: [{ id: "e1", name: "Assignment", max: 15 }, { id: "e2", name: "Oral assessment", max: 15 }, { id: "e3", name: "Midterm", max: 30 }, { id: "e4", name: "Final exam", max: 40 }],
};
const initialMarks: Record<string, Record<string, Mark>> = {
  s1: { b1: { value: "8", status: "scored" }, b2: { value: "9", status: "scored" }, b3: { value: "16", status: "scored" }, b4: { value: "52", status: "scored" } },
  s2: { b1: { value: "9", status: "scored" }, b2: { value: "10", status: "scored" }, b3: { value: "18", status: "scored" }, b4: { value: "55", status: "scored" } },
  s3: { b1: { value: "7", status: "scored" }, b2: { value: "8", status: "scored" }, b3: { value: "14", status: "scored" }, b4: { value: "45", status: "scored" } },
  s4: { b1: { value: "", status: "pending" }, b2: { value: "", status: "pending" }, b3: { value: "", status: "pending" }, b4: { value: "", status: "pending" } },
  s5: { b1: { value: "", status: "pending" }, b2: { value: "", status: "pending" }, b3: { value: "", status: "pending" }, b4: { value: "", status: "pending" } },
  s6: { b1: { value: "", status: "pending" }, b2: { value: "", status: "pending" }, b3: { value: "", status: "pending" }, b4: { value: "", status: "pending" } },
};

export default function AssessmentWorkspace({ notify }: { notify: (message: string) => void }) {
  const [year, setYear] = useState("2026/2027");
  const [semester, setSemester] = useState("First Semester");
  const [grade, setGrade] = useState("Grade 9");
  const [section, setSection] = useState("A");
  const [subject, setSubject] = useState("Biology");
  const [structures, setStructures] = useState<Record<string, Component[]>>(() => Object.fromEntries(Object.entries(starter).map(([k,v])=>[`${year}|${semester}|${grade}|${k}`,v])));
  const [marks, setMarks] = useState<Record<string, Record<string, Mark>>>(initialMarks);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Component[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [savedAt, setSavedAt] = useState("Just now");
  const [submitted, setSubmitted] = useState(false);
  const key = `${year}|${semester}|${grade}|${subject}`;
  const components = structures[key] || [];
  const totalMax = components.reduce((sum,c)=>sum+c.max,0);
  const shownStudents = useMemo(()=>students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()) || s.admission.includes(search)),[search]);
  const readMark = (studentId:string, componentId:string):Mark => marks[studentId]?.[componentId] || {value:"",status:"pending"};
  const updateMark = (studentId:string, component:Component, raw:string) => {
    if (raw !== "" && (!/^\d*(\.\d{0,2})?$/.test(raw) || Number(raw) > component.max)) return;
    setMarks(prev=>({...prev,[studentId]:{...prev[studentId],[component.id]:{value:raw,status:raw===""?"pending":"scored"}}}));
    setSavedAt("Saving…");
    window.setTimeout(()=>setSavedAt("Saved just now"),350);
  };
  const totalFor = (studentId:string) => components.reduce((sum,c)=>{const m=readMark(studentId,c.id);return m.status==="scored"&&m.value!==""?sum+Number(m.value):sum;},0);
  const completed = shownStudents.filter(s=>components.length>0&&components.every(c=>readMark(s.id,c.id).status!=="pending")).length;
  const scoredComplete = students.filter(s=>components.length>0&&components.every(c=>readMark(s.id,c.id).status==="scored"&&readMark(s.id,c.id).value!==""));
  const classAverage = scoredComplete.length&&totalMax ? `${Math.round(scoredComplete.reduce((sum,s)=>sum+totalFor(s.id),0)/scoredComplete.length/totalMax*100)}%` : "—";
  const invalidCount = shownStudents.reduce((sum,s)=>sum+components.filter(c=>{const m=readMark(s.id,c.id);return m.status==="scored"&&m.value!==""&&Number(m.value)>c.max;}).length,0);
  const startEdit = () => { setDraft(components.map(c=>({...c}))); setEditing(true); };
  const saveStructure = () => {
    if (!draft.length || draft.some(c=>!c.name.trim()||!Number.isFinite(c.max)||c.max<=0)) { notify("Each assessment needs a name and a maximum mark greater than zero."); return; }
    if (draft.reduce((sum,c)=>sum+c.max,0)<=0) return;
    setStructures(prev=>({...prev,[key]:draft.map(c=>({...c,name:c.name.trim()}))}));
    setEditing(false); setSubmitted(false); notify(`${subject} assessment structure saved for ${grade} · ${semester}.`);
  };
  const addComponent = () => setDraft(prev=>[...prev,{id:makeId(),name:"New assessment",max:10}]);
  const copyPrevious = () => {
    const previousYear = semester === "First Semester" ? (Number(year.slice(0,4))-1)+"/"+(Number(year.slice(0,4))) : year;
    const previousKey = `${previousYear}|${semester==="First Semester"?"Second Semester":"First Semester"}|${grade}|${subject}`;
    const source = structures[previousKey] || starter[subject] || starter.Biology;
    setDraft(source.map(c=>({...c,id:makeId()}))); setEditing(true); notify("Previous assessment structure copied. Review it before saving.");
  };
  const exportCsv = () => {
    const header=["Admission number","Student",...components.map(c=>`${c.name} / ${c.max}`),"Total"];
    const rows=students.map(s=>[s.admission,s.name,...components.map(c=>{const m=readMark(s.id,c.id);return m.status==="scored"?m.value:m.status.toUpperCase();}),String(totalFor(s.id))]);
    const csv=[header,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download=`${grade}-${subject}-${semester}-marks.csv`;a.click();URL.revokeObjectURL(url);
  };
  const submitMarks = () => {
    const pending=students.filter(s=>components.some(c=>readMark(s.id,c.id).status==="pending"));
    if(pending.length){notify(`${pending.length} student record(s) still have missing marks. Complete or mark them absent/exempt first.`);return;}
    setSubmitted(true);notify("Marks are ready for review. Connect the approval workflow before publishing live results.");
  };
  return <div className="assessment-workspace">
    <div className="page-heading assessment-page-heading"><div><span className="eyebrow">ACADEMIC MANAGEMENT</span><h1>Assessment & mark entry</h1><p>Configure assessment components independently for each subject, then enter student marks.</p></div><button className="btn-secondary" onClick={exportCsv}><Download size={15}/> Export marks</button></div>
    <section className="panel assessment-context">
      <div className="assessment-context-head"><div><span className="eyebrow">MARK ENTRY WORKSPACE</span><h2>Choose academic context</h2><p>Your assessment structure is specific to this grade, subject, and semester.</p></div><span className="context-status"><i/> Draft workspace</span></div>
      <div className="assessment-select-grid">
        <label><span>Academic year</span><select value={year} onChange={e=>{setYear(e.target.value);setSubmitted(false)}}><option>2026/2027</option><option>2025/2026</option></select></label>
        <label><span>Semester</span><select value={semester} onChange={e=>{setSemester(e.target.value);setSubmitted(false)}}><option>First Semester</option><option>Second Semester</option></select></label>
        <label><span>Grade</span><select value={grade} onChange={e=>{setGrade(e.target.value);setSubmitted(false)}}>{["Grade 9","Grade 10","Grade 11","Grade 12"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label><span>Section</span><select value={section} onChange={e=>setSection(e.target.value)}><option>A</option><option>B</option><option>C</option></select></label>
        <label><span>Subject</span><select value={subject} onChange={e=>{setSubject(e.target.value);setSubmitted(false)}}>{["Biology","Mathematics","English","Physics","Chemistry","History","Geography"].map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
    </section>

    <section className="panel structure-panel">
      <div className="structure-top"><div><span className="eyebrow">SUBJECT ASSESSMENT STRUCTURE</span><h2>{subject} <span>· {grade}</span></h2><p>Set the assessment types and maximum marks used to calculate this subject's semester result.</p></div><div className="structure-actions"><button className="btn-secondary" onClick={copyPrevious}><Copy size={14}/> Copy previous semester</button><button className="btn-primary" onClick={startEdit}><Settings2 size={15}/> Configure assessments</button></div></div>
      {components.length? <><div className="component-chips">{components.map((c,i)=><div className="component-chip" key={c.id}><span className="component-index">{String(i+1).padStart(2,"0")}</span><span className="component-name">{c.name}</span><strong>{c.max} <small>marks</small></strong></div>)}</div><div className="structure-total"><span>{components.length} assessment components</span><strong>Total possible mark <b>{totalMax}</b></strong></div></>:<div className="assessment-empty"><Info size={20}/><div><strong>No assessment structure configured</strong><span>Configure the assessments for {subject} in {grade} before entering marks.</span></div><button className="btn-primary" onClick={()=>{setDraft((starter[subject]||[]).map(c=>({...c,id:makeId()})));setEditing(true)}}>Set up structure</button></div>}
    </section>

    {editing&&<section className="panel configure-panel"><div className="configure-heading"><div><span className="eyebrow">CONFIGURATION</span><h2>Build {subject}'s assessment structure</h2><p>These components apply only to {grade} · {subject} · {semester}.</p></div><button className="icon-button" onClick={()=>setEditing(false)} aria-label="Close">×</button></div><div className="config-table-wrap"><table className="config-table"><thead><tr><th>Assessment component</th><th>Maximum mark</th><th></th></tr></thead><tbody>{draft.map((c,i)=><tr key={c.id}><td><input aria-label="Assessment name" value={c.name} onChange={e=>setDraft(prev=>prev.map(x=>x.id===c.id?{...x,name:e.target.value}:x))} placeholder="e.g. Assignment"/><span className="config-order">{i+1}</span></td><td><div className="max-input"><input type="number" min="0.01" step="0.5" value={c.max} onChange={e=>setDraft(prev=>prev.map(x=>x.id===c.id?{...x,max:Number(e.target.value)}:x))}/><span>marks</span></div></td><td><button className="icon-button remove-component" aria-label={`Remove ${c.name}`} onClick={()=>setDraft(prev=>prev.filter(x=>x.id!==c.id))}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div><div className="configure-bottom"><button className="btn-secondary" onClick={addComponent}><Plus size={14}/> Add component</button><div className="configure-total">Total possible marks <strong>{draft.reduce((sum,c)=>sum+(Number(c.max)||0),0)}</strong></div><button className="btn-primary" onClick={saveStructure}><Check size={15}/> Save structure</button></div><p className="config-note"><Info size={13}/> Component maximums determine the subject's total. The system does not assume every subject has the same assessments.</p></section>}

    <section className="assessment-summary-grid"><div className="assessment-summary-card"><span>Students in section</span><strong>{students.length}</strong><small>{grade} · Section {section}</small></div><div className="assessment-summary-card"><span>Marks completed</span><strong>{completed}<small> / {shownStudents.length}</small></strong><small>All components entered</small></div><div className="assessment-summary-card"><span>Class average</span><strong>{classAverage}</strong><small>Based on entered scores</small></div><div className="assessment-summary-card"><span>Maximum subject mark</span><strong>{totalMax||"—"}</strong><small>{components.length} configured components</small></div></section>

    <section className="panel marks-panel"><div className="marks-heading"><div><span className="eyebrow">STUDENT SCORE SHEET</span><h2>Enter student marks</h2><p>Enter a score in each assessment column. Use the status menu when a student was absent or exempt.</p></div><div className="save-state"><span className="save-dot"/><span>{savedAt}</span></div></div>
      {!components.length?<div className="marks-no-structure"><AlertCircle size={18}/> Configure this subject's assessment structure to generate the mark-entry columns.</div>:<>
        <div className="marks-toolbar"><div className="marks-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a student..."/></div><div className="marks-toolbar-right"><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All students</option><option value="pending">Missing marks</option><option value="complete">Completed</option></select><button className="btn-secondary" onClick={exportCsv}><FileSpreadsheet size={14}/> Download sheet</button></div></div>
        <div className="marks-table-wrap"><table className="marks-table"><thead><tr><th className="sticky-student">STUDENT</th>{components.map(c=><th key={c.id}><span>{c.name}</span><small> / {c.max}</small></th>)}<th className="total-column">TOTAL / {totalMax}</th><th>COMPLETION</th></tr></thead><tbody>{shownStudents.filter(s=>filter==="all"||(filter==="complete"?components.every(c=>readMark(s.id,c.id).status!=="pending"):components.some(c=>readMark(s.id,c.id).status==="pending"))).map((s,i)=>{const done=components.filter(c=>readMark(s.id,c.id).status!=="pending").length;return <tr key={s.id}><td className="sticky-student"><div className="mark-student"><span>{s.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</span><div><strong>{s.name}</strong><small>{s.admission}</small></div></div></td>{components.map(c=>{const m=readMark(s.id,c.id);return <td key={c.id}><div className={`mark-input-wrap ${m.status!=="scored"&&m.status!=="pending"?"mark-special":""}`}><input aria-label={`${s.name} ${c.name} mark`} inputMode="decimal" value={m.value} placeholder="—" onChange={e=>updateMark(s.id,c,e.target.value)} disabled={m.status==="absent"||m.status==="exempt"}/><select aria-label={`${s.name} ${c.name} status`} value={m.status} onChange={e=>setMarks(prev=>({...prev,[s.id]:{...prev[s.id],[c.id]:{value:e.target.value==="scored"?m.value:"",status:(e.target.value==="scored"&&m.value===""?"pending":e.target.value) as EntryStatus}}}))}><option value="scored">Scored</option><option value="pending">Pending</option><option value="absent">Absent</option><option value="exempt">Exempt</option></select></div></td>})}<td className="total-cell">{totalFor(s.id).toFixed(2).replace(/\.00$/,"")} <small>/ {totalMax}</small></td><td><span className={`completion-pill ${done===components.length?"complete":"incomplete"}`}><i/>{done}/{components.length}</span></td></tr>})}</tbody></table>{shownStudents.length===0&&<div className="empty-state">No students match your search.</div>}</div>
        <div className="marks-footer"><div className="marks-footnote"><ShieldCheck size={15}/><span>Scores above each component's maximum are blocked. Missing marks are not treated as zero.</span></div><div className="marks-footer-actions"><button className="btn-secondary" onClick={()=>notify("Draft marks remain in this demo session. Supabase persistence is not connected yet.")}><Save size={14}/> Save draft</button><button className="btn-primary" onClick={submitMarks} disabled={submitted}>{submitted?<><Check size={14}/> Ready for review</>:<>Review & submit <ArrowRight size={14}/></>}</button></div></div>
      </>}
    </section>
    <div className="assessment-disclaimer"><Info size={14}/> Demo workspace: marks and assessment configurations currently remain in local application state. Apply the included Supabase migration and implement school/teacher authorization policies before using real student records.</div>
  </div>;
}
