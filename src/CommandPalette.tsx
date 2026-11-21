import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";

export type Cmd = { id: string; label: string; group: string; icon: React.ReactNode; hint?: string; run: () => void };

export default function CommandPalette({ open, onClose, items }: { open: boolean; onClose: () => void; items: Cmd[] }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter(x => `${x.label} ${x.hint ?? ""} ${x.group}`.toLowerCase().includes(s)) : items;
  }, [q, items]);

  useEffect(() => { if (open) { setQ(""); setI(0); window.setTimeout(() => input.current?.focus(), 20); } }, [open]);
  useEffect(() => setI(0), [q]);
  useEffect(() => { document.querySelector('[data-sel="true"]')?.scrollIntoView({ block: "nearest" }); }, [i, list]);
  if (!open) return null;

  const run = (c?: Cmd) => { if (!c) return; onClose(); c.run(); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setI(v => Math.min(v + 1, list.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setI(v => Math.max(v - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); run(list[i]); }
    else if (e.key === "Escape") onClose();
  };

  return (
    <div className="cmdk-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cmdk" role="dialog" aria-label="Command palette" onKeyDown={onKey}>
        <div className="cmdk-input"><Search size={18} /><input ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search pages, students, actions…" /><kbd>esc</kbd></div>
        <div className="cmdk-list">
          {list.length === 0 && <div className="cmdk-empty">No results for “{q}”</div>}
          {list.map((c, idx) => (
            <div key={c.id}>
              {(idx === 0 || list[idx - 1].group !== c.group) && <p className="cmdk-group">{c.group}</p>}
              <button className={`cmdk-item ${idx === i ? "sel" : ""}`} data-sel={idx === i} onMouseMove={() => setI(idx)} onClick={() => run(c)}>
                <span className="cmdk-ico">{c.icon}</span><span className="cmdk-label">{c.label}</span>
                {c.hint && <small>{c.hint}</small>}
                {idx === i && <CornerDownLeft size={14} />}
              </button>
            </div>
          ))}
        </div>
        <div className="cmdk-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span></div>
      </div>
    </div>
  );
}
