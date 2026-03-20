import { useState, useRef, useEffect } from "react";

// ── Profile Setup Component ───────────────────────────────────────
function ProfileSetup({ isNew, existing, onSave, onBack, c, serif }) {
  const [draft, setDraft] = useState({
    name: existing?.name || "",
    values: existing?.values || "",
    goals: existing?.goals || "",
    nonNeg: existing?.nonNeg || ""
  });
  const [reflections, setReflections] = useState({ values: "", goals: "", nonNeg: "" });
  const [reflecting, setReflecting] = useState({ values: false, goals: false, nonNeg: false });

  const reflect = async (field, value) => {
    if (!value.trim() || value.trim().length < 20) return;
    setReflecting(p => ({ ...p, [field]: true }));
    setReflections(p => ({ ...p, [field]: "" }));

    const prompts = {
      values: `A busy working mum just answered "what matters most to you" with: "${value}"

Write 1-2 warm sentences reflecting back what you hear as her core values. Be specific to what she wrote. Sound like a coach who truly listened — not a summary, a reflection. Start with "It sounds like..." or "What I hear is..." or similar.`,
      goals: `A busy working mum just wrote her current goals as: "${value}"

Write 1-2 warm sentences reflecting back what you hear she's really working toward. Be specific. Sound like a coach. Start with "It sounds like..." or "What I'm hearing is..." or similar.`,
      nonNeg: `A busy working mum wrote her non-negotiables as: "${value}"

Write 1-2 warm sentences reflecting back what you hear she needs to protect. Be specific. Sound like a coach who gets it. Start with "What I hear you protecting is..." or "It sounds like..." or similar.`
    };

    try {
      const isArtifactEnv = typeof window !== 'undefined' && typeof window.storage !== 'undefined';
      const apiUrl = isArtifactEnv ? 'https://api.anthropic.com/v1/messages' : '/api/claude';
      const headers = isArtifactEnv
        ? { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }
        : { 'Content-Type': 'application/json' };

      const r = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompts[field] }]
        })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      const text = (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
      setReflections(p => ({ ...p, [field]: text.trim() }));
    } catch(e) {
      setReflections(p => ({ ...p, [field]: "Couldn't load reflection — but your words are saved!" }));
    } finally {
      setReflecting(p => ({ ...p, [field]: false }));
    }
  };

  const handleBlur = (field, value) => reflect(field, value);

  const btn = (bg, col="white", extra={}) => ({
    padding: "12px 20px", background: bg, color: col,
    border: bg === "transparent" ? `1px solid ${c.border}` : "none",
    borderRadius: 12, fontFamily: "system-ui", fontSize: 14,
    fontWeight: 500, cursor: "pointer", ...extra
  });

  const SEASONS = [
    { id: "baby", label: "👶 New baby / postpartum" },
    { id: "toddler", label: "🧸 Toddler years" },
    { id: "school", label: "🎒 School-age kids" },
    { id: "teen", label: "🧑 Teenagers" },
    { id: "pregnant", label: "🤰 Pregnant" },
    { id: "matleave", label: "🌸 Mat leave / returning to work" },
    { id: "carer", label: "💙 Caring for a parent or family member" },
    { id: "other", label: "✨ Other / mix of the above" },
  ];

  const fields = [
    {
      key: "values",
      icon: "💛",
      label: "What matters most to you",
      prompt: "What does a really good week look like? What keeps getting squeezed that you wish it didn't? What would you protect if something had to give?",
      placeholder: "Being present with the girls after school. Not burning out again. Building something I'm proud of. Protecting my sleep. Feeling like I'm doing a good job — not just surviving.",
      rows: 4
    },
    {
      key: "goals",
      icon: "🎯",
      label: "What you're working toward right now",
      prompt: "What are you actually trying to achieve in the next few months — at work, at home, for yourself? What would feel like real progress?",
      placeholder: "Launch my AI offer. Get on top of work before it gets on top of me. Be more present and less distracted when I'm with the kids. Have one thing a week that's just for me.",
      rows: 4
    },
    {
      key: "nonNeg",
      icon: "🌿",
      label: "Your non-negotiables",
      prompt: "What are your hard limits — times, energy, boundaries you need to protect? What's the thing that, when it gets crossed, you know the week has gone wrong?",
      placeholder: "School pickup by 3:30 wherever possible. Weekends are for the family, not work emails. I need to be in bed by 10. I don't want to be the only one thinking about dinner every night.",
      rows: 4
    }
  ];

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: c.cream, minHeight: "100vh", padding: "28px 16px 80px" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>

        <button onClick={onBack} style={{ ...btn("transparent", c.soft), padding: "7px 13px", marginBottom: 24, fontSize: 13 }}>← Back</button>

        <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease both" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: c.terra, fontWeight: 500, marginBottom: 8 }}>Your profile</div>
          <h2 style={{ ...serif, fontSize: 26, fontWeight: 400, color: c.dark, marginBottom: 8, lineHeight: 1.3 }}>
            Make it <em style={{ color: c.terra }}>actually yours.</em>
          </h2>
          <p style={{ fontSize: 14, color: c.mid, lineHeight: 1.7 }}>
            The more honest you are here, the smarter the sorting gets. No right answers — just what's actually true right now.
          </p>
        </div>

        {/* Name */}
        <div style={{ background: c.warm, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20, marginBottom: 12, animation: "fadeUp 0.4s ease 0.05s both" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: c.soft, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Your name (optional)</div>
          <input value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
            placeholder="What should I call you?"
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${c.border}`, borderRadius: 10, fontFamily: "system-ui", fontSize: 15, background: c.cream, outline: "none" }} />
        </div>

        {/* Season of life */}
        <div style={{ background: c.warm, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20, marginBottom: 12, animation: "fadeUp 0.4s ease 0.08s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>🌱</span>
            <div style={{ fontSize: 12, fontWeight: 600, color: c.dark }}>Where are you at right now?</div>
          </div>
          <p style={{ fontSize: 12, color: c.terra, lineHeight: 1.7, marginBottom: 12, fontStyle: "italic" }}>
            This helps us use the right language and defaults for your season of life.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {SEASONS.map(s => (
              <button key={s.id} onClick={() => setDraft(p => ({ ...p, season: draft.season === s.id ? "" : s.id }))}
                style={{ padding: "6px 12px", background: draft.season === s.id ? c.terra : c.cream, color: draft.season === s.id ? "white" : c.mid,
                  border: `1px solid ${draft.season === s.id ? c.terra : c.border}`, borderRadius: 20, fontFamily: "system-ui", fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* The three fields */}
        {fields.map((f, i) => (
          <div key={f.key} style={{ background: c.warm, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20, marginBottom: 12, animation: `fadeUp 0.4s ease ${0.1*(i+1)}s both` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.dark }}>{f.label}</div>
            </div>
            <p style={{ fontSize: 12, color: c.terra, lineHeight: 1.7, marginBottom: 12, fontStyle: "italic" }}>
              {f.prompt}
            </p>
            <textarea
              value={draft[f.key]}
              onChange={e => setDraft(p => ({ ...p, [f.key]: e.target.value }))}
              onBlur={e => handleBlur(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={f.rows}
              style={{ width: "100%", padding: "11px 13px", border: `1px solid ${c.border}`, borderRadius: 10, fontFamily: "system-ui", fontSize: 14, background: c.cream, resize: "vertical", outline: "none", lineHeight: 1.7, color: c.dark }}
            />

            {/* AI reflection */}
            {reflecting[f.key] && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0,0.15,0.3].map((d,i) => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: c.terra, animation: `pulse 1.2s ease ${d}s infinite` }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: c.soft, fontStyle: "italic" }}>Reading what you wrote...</span>
              </div>
            )}
            {reflections[f.key] && !reflecting[f.key] && (
              <div style={{ marginTop: 10, padding: "12px 14px", background: `linear-gradient(135deg, ${c.terraLight}, ${c.sageLight})`, borderRadius: 10, borderLeft: `3px solid ${c.terra}`, animation: "fadeUp 0.4s ease both" }}>
                <p style={{ ...serif, fontSize: 13, fontStyle: "italic", color: c.dark, lineHeight: 1.7 }}>
                  {reflections[f.key]}
                </p>
              </div>
            )}
          </div>
        ))}

        <button onClick={() => onSave(draft)}
          style={{ ...btn(c.terra), width: "100%", fontSize: 15, marginTop: 6 }}>
          Save my profile ✓
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: c.soft, marginTop: 14, lineHeight: 1.6 }}>
          You can update this any time — your profile gets smarter as your life changes.
        </p>
      </div>
    </div>
  );
}


// ── Storage helpers ──────────────────────────────────────────────
// Uses artifact storage in Claude, Supabase in deployed app
const isArtifact = typeof window !== "undefined" && typeof window.storage !== "undefined";

// Generate or retrieve a stable user ID
const getUserId = () => {
  let id = localStorage.getItem("ml-user-id");
  if (!id) { id = "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("ml-user-id", id); }
  return id;
};

// In-memory cache so we don't hammer the DB
let dbCache = null;
let dbDirty = false;
let saveTimer = null;

const store = {
  get: async (key) => {
    if (isArtifact) {
      try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; } catch(e) { return null; }
    }
    // Try in-memory cache first
    if (dbCache && dbCache[key] !== undefined) return dbCache[key];
    // Try localStorage as fast fallback
    try { const v = localStorage.getItem("ml_" + key); if (v) return JSON.parse(v); } catch(e) {}
    return null;
  },
  set: async (key, val) => {
    if (isArtifact) {
      try { await window.storage.set(key, JSON.stringify(val)); } catch(e) {}
      return;
    }
    // Update cache and localStorage immediately
    if (!dbCache) dbCache = {};
    dbCache[key] = val;
    try { localStorage.setItem("ml_" + key, JSON.stringify(val)); } catch(e) {}
    // Debounce DB save — batch writes every 2 seconds
    dbDirty = true;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store._flushToDb(), 2000);
  },
  _flushToDb: async () => {
    if (!dbDirty || !dbCache) return;
    dbDirty = false;
    try {
      const userId = getUserId();
      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", userId, data: dbCache })
      });
    } catch(e) { /* silent fail — localStorage still has the data */ }
  },
  loadAll: async () => {
    if (isArtifact) return; // artifact storage loads per-key
    const userId = getUserId();
    try {
      const r = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "load", userId })
      });
      const data = await r.json();
      if (data) {
        dbCache = data;
        // Also sync to localStorage as backup
        Object.entries(data).forEach(([k, v]) => {
          if (!["user_id","updated_at","id"].includes(k)) {
            try { localStorage.setItem("ml_" + k, JSON.stringify(v)); } catch(e) {}
          }
        });
      } else {
        // No DB record yet — load from localStorage into cache
        dbCache = {};
        ["ml-profile","ml-tasks","ml-wins","ml-history","ml-invisible"].forEach(key => {
          try {
            const v = localStorage.getItem("ml_" + key);
            if (v) dbCache[key] = JSON.parse(v);
          } catch(e) {}
        });
      }
    } catch(e) {
      // DB unavailable — fall back to localStorage
      dbCache = {};
      ["ml-profile","ml-tasks","ml-wins","ml-history","ml-invisible"].forEach(key => {
        try {
          const v = localStorage.getItem("ml_" + key);
          if (v) dbCache[key] = JSON.parse(v);
        } catch(e) {}
      });
    }
  }
};

const KEYS = { profile: "ml-profile", tasks: "ml-tasks", wins: "ml-wins", history: "ml-history", invisible: "ml-invisible" };

const WEEK_MODES = [
  { id: "normal", emoji: "😊", label: "Normal week", desc: "The usual juggle", maxDoNow: 3, tone: "warm and practical" },
  { id: "crazy", emoji: "🤯", label: "Crazy week", desc: "A lot on at work or home", maxDoNow: 2, tone: "warm, validating — acknowledge it's a big week" },
  { id: "holidays", emoji: "🏖️", label: "School holidays", desc: "Kids are home", maxDoNow: 2, tone: "gentle — she has less capacity and that's okay" },
  { id: "sickday", emoji: "🤒", label: "Sick kid day", desc: "Everything's on hold", maxDoNow: 1, tone: "very gentle — survival mode, not productivity mode" },
  { id: "lowcap", emoji: "🪫", label: "Low capacity", desc: "Running on empty", maxDoNow: 1, tone: "compassionate — she's doing enough just by showing up" },
];

const DAY_MODES = [
  { id: "firing", emoji: "⚡", label: "Firing on all cylinders", tone: "energising and action-oriented", maxDoNow: 3 },
  { id: "some",   emoji: "🌤️", label: "Got some energy", tone: "warm and encouraging", maxDoNow: 2 },
  { id: "empty",  emoji: "🪫", label: "Running on empty", tone: "very gentle — one thing is enough today", maxDoNow: 1 },
];

// ── Task age helper ────────────────────────────────────────────────
const taskAge = (added) => {
  if (!added) return null;
  const days = (Date.now() - new Date(added).getTime()) / (1000 * 60 * 60 * 24);
  if (days >= 30) return { level: "month", label: "👀 a month+", color: "#C97B5A", bg: "#F5EDE6", tip: "This one's been here a while. Is it actually yours to do?" };
  if (days >= 14) return { level: "fortnight", label: "📌 2 weeks", color: "#B8A86E", bg: "#EDE8D5", tip: "Needs a decision — schedule it, delegate it, or drop it." };
  if (days >= 7)  return { level: "week", label: "⏳ 1 week", color: "#B8A86E", bg: "#FDF6E3", tip: "Been here a week. Worth a proper look." };
  if (days >= 3)  return { level: "days", label: "· waiting", color: "#A8A8A8", bg: "#F0F0F0", tip: "Still waiting." };
  return null;
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState("home"); // home | profile | results | summary | invisible
  const [profile, setProfile] = useState({ name: "", values: "", goals: "", nonNeg: "", season: "" });
  const [profileDraft, setProfileDraft] = useState({ name: "", values: "", goals: "", nonNeg: "", season: "" });
  const [activeTasks, setActiveTasks] = useState([]);
  const [newInput, setNewInput] = useState("");
  const [invisibleDump, setInvisibleDump] = useState("");
  const [savedInvisible, setSavedInvisible] = useState("");
  const [inputMode, setInputMode] = useState("type");
  const [sortMode, setSortMode] = useState("warm"); // warm | quick
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Reading between the lines...");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState({});
  const [guiltDropped, setGuiltDropped] = useState(false);
  const [wins, setWins] = useState({ total: 0, week: 0 });
  const [history, setHistory] = useState([]); // [{date, tasks, cleared, recurring}]
  const [showWins, setShowWins] = useState(false);
  const [deadlines, setDeadlines] = useState(""); // freeform "anything due soon?"
  const [showDeadlines, setShowDeadlines] = useState(false);
  const [weekMode, setWeekMode] = useState(null); // null | "normal" | "crazy" | "holidays" | "sickday" | "lowcap"
  const [dayMode, setDayMode] = useState(null);   // null | "empty" | "some" | "firing"
  const [showModeCheck, setShowModeCheck] = useState(true); // show check-in on home screen
  const [schedulingTask, setSchedulingTask] = useState(null);
  const [movingTask, setMovingTask] = useState(null); // {task, note, fromQuadrant}
  const [snoozeTask, setSnoozeTask] = useState(null); // {task, note} for snooze reminder
  const [emailingTask, setEmailingTask] = useState(null); // {task, note} for pass it on
  const [emailDraft, setEmailDraft] = useState(null); // {to, subject, body}
  const [emailInput, setEmailInput] = useState(""); // task being scheduled
  const [calendarStatus, setCalendarStatus] = useState({}); // {taskText: "scheduled"|"loading"|"error"}
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Boot: load all persisted data ───────────────────────────────
  useEffect(() => {
    (async () => {
      await store.loadAll(); // load from Supabase (or localStorage fallback) into cache
      const [p, t, w, h, inv] = await Promise.all([
        store.get(KEYS.profile), store.get(KEYS.tasks),
        store.get(KEYS.wins), store.get(KEYS.history),
        store.get(KEYS.invisible)
      ]);
      if (p) { setProfile(p); setProfileDraft(p); }
      if (t) setActiveTasks(Array.isArray(t) ? t : []);
      if (w) setWins(w);
      if (h) { setHistory(h); }
      if (inv) setSavedInvisible(inv);
      setReady(true);
    })();
  }, []);



  const persist = async (key, val) => { await store.set(key, val); };

  const saveProfile = async () => {
    setProfile(profileDraft);
    await persist(KEYS.profile, profileDraft);
    setScreen("home");
  };

  const mergeInput = async (text) => {
    const incoming = text.split("\n").map(t => t.trim()).filter(Boolean);
    const updated = [...activeTasks];
    incoming.forEach(t => {
      if (!updated.find(a => a.text.toLowerCase() === t.toLowerCase())) {
        updated.push({ text: t, id: Date.now() + Math.random(), added: new Date().toISOString() });
      }
    });
    setActiveTasks(updated);
    await persist(KEYS.tasks, updated);
    return updated;
  };

  const addWins = async (count) => {
    const updated = { total: wins.total + count, week: wins.week + count };
    setWins(updated);
    await persist(KEYS.wins, updated);
  };

  const saveToHistory = async (taskList, clearedCount) => {
    const entry = {
      date: new Date().toISOString(),
      tasks: taskList.map(t => t.text),
      cleared: clearedCount,
    };
    const updated = [...history.slice(-11), entry]; // keep last 12 sessions
    setHistory(updated);
    await persist(KEYS.history, updated);
  };

  const countChecked = () => Object.values(checked).filter(Boolean).length;

  // ── Voice ────────────────────────────────────────────────────────
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Voice isn't supported here — try Chrome or Safari."); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = "en-AU";
    let final = newInput;
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += (final ? "\n" : "") + e.results[i][0].transcript;
        else interim = e.results[i][0].transcript;
      }
      setNewInput(final + (interim ? "\n" + interim : ""));
    };
    r.onerror = (e) => { setError("Mic error: " + e.error); setRecording(false); };
    r.onend = () => setRecording(false);
    recognitionRef.current = r;
    r.start(); setRecording(true); setError("");
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setRecording(false); };

  // ── Photo ────────────────────────────────────────────────────────
  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setLoadingMsg("Reading your list from the photo..."); setError("");
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const response = await fetch(typeof window !== "undefined" && typeof window.storage !== "undefined" ? "https://api.anthropic.com/v1/messages" : "/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001", max_tokens: 500,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } },
            { type: "text", text: "Extract all tasks or to-do items from this image. Return them one per line, no bullets or numbers, just the raw task text." }
          ]}]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const extracted = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      setNewInput(prev => prev ? prev + "\n" + extracted : extracted);
      setInputMode("type");
    } catch(e) { setError("Couldn't read the photo: " + e.message); }
    finally { setLoading(false); setLoadingMsg("Reading between the lines..."); }
  };

  const addToList = async () => {
    if (!newInput.trim()) return;
    await mergeInput(newInput);
    setNewInput(""); setInputMode("type");
  };

  const removeTask = async (id) => {
    const updated = activeTasks.filter(t => t.id !== id);
    setActiveTasks(updated);
    await persist(KEYS.tasks, updated);
  };

  // ── Sort ─────────────────────────────────────────────────────────
  const sort = async () => {
    // Build definitive task list
    const base = [...activeTasks];
    const extra = newInput.trim()
      ? newInput.split("\n").map(t => t.trim()).filter(Boolean)
          .filter(t => !base.find(a => a.text.toLowerCase() === t.toLowerCase()))
          .map(t => ({ text: t, id: Date.now() + Math.random(), added: new Date().toISOString() }))
      : [];
    const allTasks = [...base, ...extra];

    if (allTasks.length === 0) { setError("Pop some tasks in first."); return; }
    if (extra.length > 0) { setActiveTasks(allTasks); await persist(KEYS.tasks, allTasks); setNewInput(""); }

    setError(""); setResult(null); setLoading(true); setChecked({}); setGuiltDropped(false);
    setLoadingMsg("Sorting your actual list...");

    // Build numbered task string — this is what gets sent
    const numbered = allTasks.map((t, i) => `${i + 1}. ${t.text.replace(/^[\*\-•\s]+/, '')}`).join("\n");
    
    const hasProfile = profile.values || profile.goals || profile.nonNeg;
    const seasonNote = profile.season ? `- Season of life: ${profile.season}` : "";
    const ctx = hasProfile ? `Context about her:
${profile.name ? `- Name: ${profile.name}` : ""}
${profile.values ? `- Values: ${profile.values}` : ""}
${profile.goals ? `- Goals: ${profile.goals}` : ""}
${profile.nonNeg ? `- Non-negotiables: ${profile.nonNeg}` : ""}
${seasonNote}` : "";

    const aged = allTasks.filter(t => t.added && (Date.now() - new Date(t.added)) / 86400000 >= 7);
    const agedNote = aged.length > 0 ? `\nLong-standing tasks (7+ days): ${aged.map(t => t.text).join(", ")}` : "";
    const deadlineNote = deadlines.trim() ? `\nDeadlines: ${deadlines}` : "";
    const ack = sortMode === "quick" ? "One brief sentence." : "2-3 warm specific sentences referencing her actual tasks by name.";
    const close = sortMode === "quick" ? "One punchy sentence." : "One coaching sentence about what she is carrying.";
    const tone = sortMode === "quick" ? "Brief and practical." : "Warm, coach-like, specific.";

    const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const wm = WEEK_MODES.find(m => m.id === weekMode) || WEEK_MODES[0];
    const dm = DAY_MODES.find(m => m.id === dayMode) || DAY_MODES[1];
    const effectiveMaxDoNow = Math.min(wm.maxDoNow, dm.maxDoNow);
    const effectiveTone = dayMode === "empty" || weekMode === "sickday" || weekMode === "lowcap"
      ? dm.tone
      : `${wm.tone}; ${dm.tone}`;
    const prompt = `Today's date is ${today}.${weekModeNote}${dayModeNote} Sort this exact task list. Use ONLY these tasks — do not invent any new ones.

${ctx}${agedNote}${deadlineNote}

Tone: ${effectiveTone}. This is important — match the energy she has described.

Rules:
- doNow: urgent AND important, MAX 3
- schedule: important, not urgent  
- delegate: someone else — partner, kid, friend, service — could handle this. Think practically about who.
- delete: optional only, never health/safety/kids
- guiltList: ONLY tasks that have been on her list for ages with zero consequence if never done — think "learn calligraphy" not "remember crazy hair day". Reminders, health tasks, kid tasks, work tasks NEVER go here. When in doubt use empty array.
- Every task must appear in exactly one list
- Copy task text exactly as written

Tasks to sort:
${numbered}

Reply with ONLY a JSON object. No markdown. No explanation. Start with { end with }.
Keys: acknowledgment (string), doNow (array), schedule (array), delegate (array), delete (array), guiltList (array of strings), closingNote (string).
Each array item (except guiltList) has "task" (exact text from the numbered list above) and "note" (reason).
acknowledgment should be: ${ack}
closingNote should be: ${close}`;

    try {
      const body = {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }]
      };

      const isArtifactEnv = typeof window !== "undefined" && typeof window.storage !== "undefined";
      const apiUrl = isArtifactEnv ? "https://api.anthropic.com/v1/messages" : "/api/claude";
      const apiHeaders = isArtifactEnv
        ? { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }
        : { "Content-Type": "application/json" };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const data = await response.json();
      if (data.type === "error" || data.error) throw new Error(data.error?.message || JSON.stringify(data));
      
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON in response: " + text.slice(0, 200));
      
      const parsed = JSON.parse(match[0]);
      setResult(parsed);
      setScreen("results");
      await saveToHistory(allTasks, 0);
    } catch(e) {
      if (e.name === 'AbortError') {
        setError("The sort took too long — try again with a shorter list, or check your connection.");
      } else {
        setError("Something went wrong: " + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Finish ───────────────────────────────────────────────────────
  const scheduleTask = async (task, dayChoice) => {
    setCalendarStatus(p => ({ ...p, [task]: "loading" }));
    setSchedulingTask(null);

    // Work out the date from day choice
    const now = new Date();
    const tz = "Australia/Canberra";
    let targetDate = new Date();
    if (dayChoice === "today") targetDate = now;
    else if (dayChoice === "tomorrow") targetDate.setDate(now.getDate() + 1);
    else if (dayChoice === "thisweekend") {
      const day = now.getDay();
      targetDate.setDate(now.getDate() + (6 - day));
    } else if (dayChoice === "nextweek") {
      targetDate.setDate(now.getDate() + (8 - now.getDay()));
    }

    // Default to 10am for 30 mins
    targetDate.setHours(10, 0, 0, 0);
    const start = targetDate.toISOString();
    const end = new Date(targetDate.getTime() + 30 * 60000).toISOString();

    try {
      const response = await fetch(typeof window !== "undefined" && typeof window.storage !== "undefined" ? "https://api.anthropic.com/v1/messages" : "/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          messages: [{ role: "user", content: `Create a Google Calendar event for this task: "${task}". Schedule it for ${start} to ${end} in timezone ${tz}. Use the gcal_create_event tool.` }],
          mcp_servers: [{ type: "url", url: "https://gcal.mcp.claude.com/mcp", name: "gcal" }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setCalendarStatus(p => ({ ...p, [task]: "scheduled" }));
    } catch(e) {
      setCalendarStatus(p => ({ ...p, [task]: "error" }));
    }
  };

  const draftEmail = async (task, note) => {
    setEmailingTask(task);
    setEmailDraft(null);
    setEmailInput("");
    // Pre-generate a draft using AI
    try {
      const response = await fetch(typeof window !== "undefined" && typeof window.storage !== "undefined" ? "https://api.anthropic.com/v1/messages" : "/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          messages: [{ role: "user", content: `Write a short, warm, casual message asking for help with this task: "${task}". Context: ${note}. Keep it under 3 sentences, conversational, not corporate. Return ONLY a JSON object: {"subject": "short subject line", "body": "the message text"}` }]
        })
      });
      const data = await response.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (match) setEmailDraft(JSON.parse(match[0]));
    } catch(e) { setEmailDraft({ subject: task, body: `Hey, could you help with this one? ${task}` }); }
  };

  const openEmail = (to, subject, body) => {
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    setEmailingTask(null);
    setEmailDraft(null);
    setEmailInput("");
  };

  const moveTask = (task, note, fromQ, toQ) => {
    if (fromQ === toQ) { setMovingTask(null); return; }
    setResult(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      // Remove from source
      updated[fromQ] = (updated[fromQ] || []).filter(i => i.task !== task);
      // Add to destination
      updated[toQ] = [...(updated[toQ] || []), { task, note }];
      return updated;
    });
    setMovingTask(null);
  };

  const snoozeReminder = async (task, minutes) => {
    setSnoozeTask(null);
    const snoozeTime = new Date(Date.now() + minutes * 60000);
    const endTime = new Date(snoozeTime.getTime() + 5 * 60000);
    try {
      await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 50,
          messages: [{ role: 'user', content: `Create a Google Calendar reminder event titled "⏰ ${task}" at ${snoozeTime.toISOString()} for 5 minutes. Use gcal_create_event.` }],
          mcp_servers: [{ type: 'url', url: 'https://gcal.mcp.claude.com/mcp', name: 'gcal' }]
        })
      });
    } catch(e) {}
  };

  const finishAndCelebrate = async () => {
    const winCount = countChecked();
    const toRemove = new Set();
    if (result) {
      ["doNow","schedule","delegate","delete"].forEach(q => {
        (result[q]||[]).forEach((item, i) => { if (checked[`${q}-${i}`]) toRemove.add(item.task.toLowerCase()); });
      });
      if (guiltDropped) (result.guiltList||[]).forEach(t => toRemove.add(t.toLowerCase()));
    }
    const remaining = activeTasks.filter(t => !toRemove.has(t.text.toLowerCase()));
    setActiveTasks(remaining);
    await persist(KEYS.tasks, remaining);
    if (winCount > 0) {
      await addWins(winCount);
      await saveToHistory(activeTasks, winCount);
      setShowWins(true);
    } else {
      setScreen("home"); setResult(null); setChecked({}); setGuiltDropped(false);
    }
  };

  const clearAllTasks = async () => {
    setActiveTasks([]); await persist(KEYS.tasks, []);
    setResult(null); setChecked({}); setGuiltDropped(false); setScreen("home");
  };

  const saveInvisible = async () => {
    setSavedInvisible(invisibleDump);
    await persist(KEYS.invisible, invisibleDump);
    setScreen("home");
  };

  // ── Week summary data ────────────────────────────────────────────
  const weekSummary = () => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = history.filter(h => new Date(h.date) > weekAgo);
    const totalCleared = thisWeek.reduce((sum, h) => sum + (h.cleared || 0), 0);
    const allTasks = thisWeek.flatMap(h => h.tasks || []);
    const freq = {};
    allTasks.forEach(t => { const k = t.toLowerCase(); freq[k] = (freq[k] || 0) + 1; });
    const kept = Object.entries(freq).filter(([,v]) => v > 1).map(([k]) => k);
    return { sessions: thisWeek.length, totalCleared, kept, wins: wins.week };
  };

  // ── Styles ───────────────────────────────────────────────────────
  const c = { cream: "#FAF7F2", warm: "#FFFEF9", border: "#E8E2D9", terra: "#C97B5A", sage: "#8A9E8C", gold: "#B8A86E", mid: "#6B6B6B", soft: "#A8A8A8", dark: "#2C2C2C", terraLight: "#F5EDE6", sageLight: "#DDE8DE", goldLight: "#EDE8D5" };
  const card = (extra = {}) => ({ background: c.warm, border: `1px solid ${c.border}`, borderRadius: 16, padding: 22, marginBottom: 14, ...extra });
  const serif = { fontFamily: "Georgia, serif" };
  const btn = (bg, color = "white", extra = {}) => ({ padding: "12px 18px", background: bg, color, border: bg === "transparent" ? `1px solid ${c.border}` : "none", borderRadius: 12, fontFamily: "system-ui", fontSize: 14, fontWeight: 500, cursor: "pointer", ...extra });
  const quadrants = result ? [
    { id: "doNow", label: "Do Now", sub: "Urgent + Important", icon: "🔥", col: c.terra, bg: c.terraLight, items: result.doNow },
    { id: "schedule", label: "Schedule It", sub: "Important, not urgent", icon: "📅", col: c.sage, bg: c.sageLight, items: result.schedule },
    { id: "delegate", label: "Pass It On", sub: "Ask for help or hand it off", icon: "🤝", col: c.gold, bg: c.goldLight, items: result.delegate },
    { id: "delete", label: "Let It Go", sub: "Not urgent or essential", icon: "🗑️", col: c.soft, bg: "#EBEBEB", items: result.delete },
  ] : [];

  if (!ready) return (
    <div style={{ fontFamily: "system-ui", background: c.cream, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
        <p style={{ ...serif, fontStyle: "italic", color: c.mid }}>Getting your list ready...</p>
      </div>
    </div>
  );

  // ── INVISIBLE LOAD SCREEN ────────────────────────────────────────
  if (screen === "invisible") return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: c.cream, minHeight: "100vh", padding: "24px 16px 80px" }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <button onClick={() => setScreen("home")} style={{ ...btn("transparent", c.mid), padding: "7px 13px", marginBottom: 20, fontSize: 13 }}>← Back</button>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: c.terra, fontWeight: 500, marginBottom: 8 }}>The invisible load</div>
          <h2 style={{ ...serif, fontSize: 26, fontWeight: 400, color: c.dark, marginBottom: 10 }}>The stuff that <em style={{ color: c.terra }}>never makes the list.</em></h2>
          <p style={{ fontSize: 14, color: c.mid, lineHeight: 1.8 }}>The mental checklist that lives in your head rent-free. It doesn't need to become a to-do. It just needs to get out of your head and somewhere safe. Dump it here.</p>
        </div>
        <div style={card()}>
          <textarea value={invisibleDump} onChange={e => setInvisibleDump(e.target.value)}
            placeholder={"Remember to check if school photos are next week\nFigure out what to get mum for her birthday\nThink about whether to change the girls' daycare day\nFollow up on that thing with work\nWonder if I should call the doctor about that..."}
            rows={10} style={{ width: "100%", padding: "12px 14px", border: `1px solid ${c.border}`, borderRadius: 10, fontFamily: "system-ui", fontSize: 14, background: c.cream, resize: "vertical", outline: "none", lineHeight: 1.7 }} />
        </div>
        {savedInvisible && (
          <div style={{ ...card({ background: c.sageLight, border: `1px solid ${c.sage}` }), marginBottom: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.sage, fontWeight: 500, marginBottom: 8 }}>Previously held</div>
            <p style={{ fontSize: 13, color: c.mid, lineHeight: 1.7, fontStyle: "italic", whiteSpace: "pre-wrap" }}>{savedInvisible}</p>
          </div>
        )}
        <button onClick={saveInvisible} style={{ ...btn(c.terra), width: "100%" }}>Hold it for me — done 🌿</button>
      </div>
    </div>
  );

  // ── WEEK SUMMARY SCREEN ──────────────────────────────────────────
  if (screen === "summary") {
    const s = weekSummary();
    return (
      <div style={{ fontFamily: "system-ui,sans-serif", background: c.cream, minHeight: "100vh", padding: "24px 16px 80px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <button onClick={() => setScreen("home")} style={{ ...btn("transparent", c.mid), padding: "7px 13px", marginBottom: 20, fontSize: 13 }}>← Back</button>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: c.terra, fontWeight: 500, marginBottom: 8 }}>Your week</div>
            <h2 style={{ ...serif, fontSize: 26, fontWeight: 400, color: c.dark }}>Here's what you <em style={{ color: c.terra }}>carried.</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Tasks cleared", value: s.totalCleared, icon: "✅", col: c.sage },
              { label: "Total wins ever", value: wins.total, icon: "🏆", col: c.gold },
              { label: "Sort sessions", value: s.sessions, icon: "📋", col: c.terra },
              { label: "Still on the go", value: activeTasks.length, icon: "🔄", col: c.mid },
            ].map(stat => (
              <div key={stat.label} style={{ background: c.warm, border: `1px solid ${c.border}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.col, fontFamily: "Georgia, serif" }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: c.soft, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          {s.kept.length > 0 && (
            <div style={card()}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.soft, fontWeight: 500, marginBottom: 8 }}>Kept showing up this week</div>
              <p style={{ fontSize: 13, color: c.mid, marginBottom: 12, lineHeight: 1.6 }}>These appeared across multiple sessions. Worth a honest look at whether they're actually getting done — or whether something's in the way.</p>
              {s.kept.map((t, i) => <div key={i} style={{ padding: "8px 12px", background: c.cream, borderRadius: 8, fontSize: 13, color: c.mid, fontStyle: "italic", marginBottom: 6 }}>· {t}</div>)}
            </div>
          )}
          {activeTasks.filter(t => taskAge(t.added)?.level === "month").length > 0 && (
            <div style={card({ background: c.terraLight, border: `1px solid ${c.terra}` })}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.terra, fontWeight: 500, marginBottom: 8 }}>Been here a month+</div>
              <p style={{ fontSize: 13, color: c.mid, lineHeight: 1.6, marginBottom: 12 }}>These have been on your list for over a month. Something's in the way — capacity, avoidance, or they were never really yours to do.</p>
              {activeTasks.filter(t => taskAge(t.added)?.level === "month").map((t, i) => <div key={i} style={{ padding: "8px 12px", background: c.warm, borderRadius: 8, fontSize: 13, color: c.mid, fontStyle: "italic", marginBottom: 6 }}>👀 {t.text}</div>)}
            </div>
          )}
          <div style={{ ...card({ textAlign: "center", background: "linear-gradient(135deg,#F5EDE6,#DDE8DE)" }), marginTop: 8 }}>
            <p style={{ ...serif, fontSize: 16, fontStyle: "italic", lineHeight: 1.8, color: c.dark }}>
              {s.totalCleared === 0 ? "This week was about carrying things, not clearing them. That counts too." :
               s.totalCleared < 5 ? `You cleared ${s.totalCleared} things this week. More than you probably gave yourself credit for.` :
               `${s.totalCleared} tasks cleared this week. You're doing better than you think — even when it doesn't feel like it.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── PROFILE SCREEN ───────────────────────────────────────────────
  if (screen === "profile") {
    const isNewProfile = !profile.values && !profile.goals && !profile.nonNeg;
    return (
      <ProfileSetup
        isNew={isNewProfile}
        existing={profile}
        onSave={async (p) => {
          setProfile(p); setProfileDraft(p);
          await persist(KEYS.profile, p);
          setScreen("home");
        }}
        onBack={() => { setProfileDraft(profile); setScreen("home"); }}
        c={c} serif={serif}
      />
    );
  }


  // ── WINS SCREEN ──────────────────────────────────────────────────
  if (showWins) return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: c.cream, minHeight: "100vh", padding: "24px 16px 80px", display: "flex", alignItems: "center" }}>
      <div style={{ maxWidth: 440, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h2 style={{ ...serif, fontSize: 28, fontWeight: 400, color: c.dark, marginBottom: 10 }}>
          You cleared <em style={{ color: c.terra }}>{countChecked()} thing{countChecked() > 1 ? "s" : ""}.</em>
        </h2>
        <p style={{ fontSize: 14, color: c.mid, lineHeight: 1.7, marginBottom: 6 }}>{wins.week} done this week. {wins.total} all up.</p>
        <p style={{ ...serif, fontStyle: "italic", fontSize: 16, color: c.dark, marginBottom: 28, lineHeight: 1.7 }}>That's not nothing. That's you, showing up.</p>
        {activeTasks.length > 0 && <p style={{ fontSize: 13, color: c.soft, marginBottom: 14 }}>{activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""} still on the go — they're waiting.</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setShowWins(false); setScreen("home"); setResult(null); setChecked({}); setGuiltDropped(false); }} style={{ ...btn(c.terra), flex: 1 }}>
            {activeTasks.length > 0 ? "Back to my list" : "Start fresh"} →
          </button>
          <button onClick={() => { setShowWins(false); setScreen("summary"); }} style={{ ...btn("transparent", c.mid), flex: 1 }}>See my week</button>
        </div>
      </div>
    </div>
  );

  // ── RESULTS SCREEN ───────────────────────────────────────────────
  if (screen === "results" && result) return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: c.cream, minHeight: "100vh", padding: "24px 16px 80px" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div style={{ background: `linear-gradient(135deg,${c.terraLight},${c.sageLight})`, borderRadius: 16, padding: 26, marginBottom: 16, borderLeft: `3px solid ${c.terra}`, animation: "fadeUp 0.4s ease both" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: c.terra, fontWeight: 500, marginBottom: 10 }}>Before we sort anything</div>
          <p style={{ ...serif, fontSize: 16, lineHeight: 1.8, fontStyle: "italic", color: c.dark }}>{result.acknowledgment}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {quadrants.map((q, qi) => (
            <div key={q.id} style={{ background: c.warm, border: `1px solid ${c.border}`, borderRadius: 14, padding: 14, borderTop: `3px solid ${q.col}`, animation: `fadeUp 0.4s ease ${0.08*qi}s both` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: q.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{q.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...serif, fontSize: 12, fontWeight: 600 }}>{q.label}</div>
                  <div style={{ fontSize: 9, color: c.soft, textTransform: "uppercase", letterSpacing: "0.05em" }}>{q.sub}</div>
                </div>
              </div>
              {!q.items?.length
                ? <div style={{ fontSize: 11, color: c.soft, fontStyle: "italic", textAlign: "center", padding: "4px 0" }}>Nothing here 🎉</div>
                : q.items.map((item, i) => {
                    const id = `${q.id}-${i}`;
                    const activeTask = activeTasks.find(t => t.text.toLowerCase() === item.task.toLowerCase());
                    const age = activeTask ? taskAge(activeTask.added) : null;
                    return (
                      <div key={id} style={{ marginBottom: 4 }}>
                        <div onClick={() => setChecked(p => ({ ...p, [id]: !p[id] }))}
                          style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "7px 9px", background: c.cream, borderRadius: 7, cursor: "pointer", opacity: checked[id] ? 0.35 : 1, transition: "opacity 0.25s" }}>
                          <div style={{ width: 13, height: 13, borderRadius: 3, border: checked[id] ? "none" : `1.5px solid ${c.border}`, background: checked[id] ? c.sage : "transparent", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "white", fontWeight: 700 }}>{checked[id] ? "✓" : ""}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, lineHeight: 1.5, textDecoration: checked[id] ? "line-through" : "none", color: checked[id] ? c.soft : c.dark }}>
                              {item.task.replace(/^[\*\-•\s]+/, '')}
                              {age && !checked[id] && <span style={{ marginLeft: 5, fontSize: 9, color: age.color, background: age.bg, borderRadius: 4, padding: "1px 5px" }}>{age.label}</span>}
                            </div>
                            {item.note && <div style={{ fontSize: 10, color: c.soft, fontStyle: "italic", marginTop: 1 }}>{item.note}</div>}
                            {age && age.level !== "days" && !checked[id] && <div style={{ fontSize: 10, color: age.color, marginTop: 2, fontStyle: "italic" }}>{age.tip}</div>}
                          </div>
                          {!checked[id] && (
                            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                              <button onClick={e => { e.stopPropagation(); setSnoozeTask(snoozeTask?.task === item.task ? null : { task: item.task, note: item.note }); setMovingTask(null); setSchedulingTask(null); setEmailingTask(null); }}
                                title="Remind me later"
                                style={{ background: "none", border: `1px solid ${c.border}`, borderRadius: 5, padding: "2px 5px", fontSize: 10, color: c.soft, cursor: "pointer" }}>⏰</button>
                              <button onClick={e => { e.stopPropagation(); setMovingTask(movingTask?.task === item.task ? null : { task: item.task, note: item.note, fromQ: q.id }); setSnoozeTask(null); setSchedulingTask(null); setEmailingTask(null); }}
                                title="Move to another list"
                                style={{ background: movingTask?.task === item.task ? c.terra : "none", border: `1px solid ${movingTask?.task === item.task ? c.terra : c.border}`, borderRadius: 5, padding: "2px 5px", fontSize: 10, color: movingTask?.task === item.task ? "white" : c.soft, cursor: "pointer" }}>↕</button>
                            </div>
                          )}
                          {q.id === "schedule" && !checked[id] && (
                            calendarStatus[item.task] === "scheduled"
                              ? <span style={{ fontSize: 10, color: c.sage, flexShrink: 0, marginTop: 2 }}>✓ cal</span>
                              : calendarStatus[item.task] === "loading"
                              ? <span style={{ fontSize: 10, color: c.soft, flexShrink: 0, marginTop: 2 }}>...</span>
                              : <button onClick={e => { e.stopPropagation(); setSchedulingTask(schedulingTask === item.task ? null : item.task); setEmailingTask(null); }}
                                  style={{ background: c.sageLight, border: `1px solid ${c.sage}`, borderRadius: 5, padding: "2px 6px", fontSize: 10, color: c.sage, cursor: "pointer", flexShrink: 0, marginTop: 1 }}>📅</button>
                          )}
                          {q.id === "delegate" && !checked[id] && (
                            <button onClick={e => { e.stopPropagation(); setEmailingTask(emailingTask === item.task ? null : item.task); setEmailDraft(null); setDoneLooksLike(""); setMustHappen(""); setSchedulingTask(null); setMovingTask(null); setSnoozeTask(null); }}
                              style={{ background: emailingTask === item.task ? c.gold : c.goldLight, border: `1px solid ${c.gold}`, borderRadius: 5, padding: "2px 6px", fontSize: 10, color: emailingTask === item.task ? "white" : c.gold, cursor: "pointer", flexShrink: 0, marginTop: 1 }}>📤</button>
                          )}
                        </div>
                        {schedulingTask === item.task && (
                          <div style={{ background: c.sageLight, borderRadius: "0 0 7px 7px", padding: "8px 10px", display: "flex", gap: 5, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: c.sage, fontWeight: 500, width: "100%", marginBottom: 4 }}>When?</span>
                            {[["today","Today"],["tomorrow","Tomorrow"],["thisweekend","This weekend"],["nextweek","Next week"]].map(([val, lbl]) => (
                              <button key={val} onClick={() => scheduleTask(item.task, val)}
                                style={{ background: "white", border: `1px solid ${c.sage}`, borderRadius: 6, padding: "4px 8px", fontSize: 11, color: c.sage, cursor: "pointer" }}>
                                {lbl}
                              </button>
                            ))}
                          </div>
                        )}
                        {emailingTask === item.task && (
                          <div style={{ background: c.goldLight, borderRadius: "0 0 7px 7px", padding: "12px" }}>

                            {/* Step 1 — What does done look like? */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 11, color: "#9A7A3A", fontWeight: 600, marginBottom: 4 }}>
                                🏁 What does done look like?
                              </div>
                              <div style={{ fontSize: 10, color: "#B8904A", marginBottom: 8, lineHeight: 1.5, fontStyle: "italic" }}>
                                Define the outcome, not the method. They get full agency on how to get there.
                              </div>
                              <textarea
                                value={doneLooksLike}
                                onChange={e => setDoneLooksLike(e.target.value)}
                                placeholder="e.g. The kids have shoes that fit and are ready for the school term. Brand, shop, budget all up to you."
                                rows={2}
                                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${c.gold}`, borderRadius: 7, fontFamily: "system-ui", fontSize: 12, background: "white", outline: "none", lineHeight: 1.6, resize: "none" }}
                              />
                            </div>

                            {/* Step 1b - must happen */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 11, color: "#9A7A3A", fontWeight: 600, marginBottom: 4 }}>
                                Any non-negotiables? <span style={{ fontWeight: 400, color: "#B8904A", fontStyle: "italic" }}>optional</span>
                              </div>
                              <div style={{ fontSize: 10, color: "#B8904A", marginBottom: 8, lineHeight: 1.5, fontStyle: "italic" }}>
                                Budget, deadline, a specific constraint. Everything else is completely up to them.
                              </div>
                              <textarea value={mustHappen} onChange={e => setMustHappen(e.target.value)}
                                placeholder="e.g. Budget is $40 max. Needs to happen before Saturday."
                                rows={2}
                                style={{ width: "100%", padding: "8px 10px", border: `1px solid ${c.gold}`, borderRadius: 7, fontFamily: "system-ui", fontSize: 12, background: "white", outline: "none", lineHeight: 1.6, resize: "none" }} />
                            </div>

                            {/* Step 2 — Who + generate */}
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 11, color: "#9A7A3A", fontWeight: 600, marginBottom: 6 }}>Who is owning this?</div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <input value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="Their email address..."
                                  style={{ flex: 1, padding: "7px 10px", border: `1px solid ${c.gold}`, borderRadius: 7, fontFamily: "system-ui", fontSize: 12, background: "white", outline: "none" }} />
                                <button
                                  onClick={() => doneLooksLike.trim() && draftEmail(item.task, item.note || "", doneLooksLike, mustHappen)}
                                  disabled={!doneLooksLike.trim()}
                                  style={{ padding: "7px 12px", background: doneLooksLike.trim() ? c.gold : "#E8E2D9", color: "white", border: "none", borderRadius: 7, fontFamily: "system-ui", fontSize: 11, fontWeight: 500, cursor: doneLooksLike.trim() ? "pointer" : "not-allowed" }}>
                                  Draft →
                                </button>
                              </div>
                            </div>

                            {/* Step 3 — Review + send */}
                            {emailDraft && doneLooksLike && (
                              <div style={{ animation: "fadeUp 0.3s ease both" }}>
                                <div style={{ background: "white", borderRadius: 7, padding: "10px 12px", marginBottom: 8, fontSize: 11, color: c.dark, lineHeight: 1.7 }}>
                                  <div style={{ fontWeight: 600, color: "#9A7A3A", marginBottom: 6, fontSize: 12 }}>📤 {emailDraft.subject}</div>
                                  <textarea value={emailDraft.body} onChange={e => setEmailDraft(d => ({...d, body: e.target.value}))} rows={4}
                                    style={{ width: "100%", border: "none", fontFamily: "system-ui", fontSize: 11, resize: "none", outline: "none", lineHeight: 1.7 }} />
                                </div>
                                <div style={{ fontSize: 10, color: "#9A7A3A", marginBottom: 8, fontStyle: "italic", lineHeight: 1.5 }}>
                                  ✓ Outcome defined. The method is entirely theirs — except what you noted above. Edit anything before sending.
                                </div>
                                <button onClick={() => openEmail(emailInput, emailDraft.subject, emailDraft.body)}
                                  style={{ background: c.gold, color: "white", border: "none", borderRadius: 7, padding: "8px 14px", fontSize: 11, fontFamily: "system-ui", fontWeight: 500, cursor: "pointer", width: "100%" }}>
                                  Open in email and send →
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* MOVE PANEL */}
                        {movingTask?.task === item.task && (
                          <div style={{ background: "#F5F0FF", borderRadius: "0 0 7px 7px", padding: "10px", border: `1px solid #C4B5E8` }}>
                            <span style={{ fontSize: 11, color: "#7C5CBF", fontWeight: 500, display: "block", marginBottom: 8 }}>Move to...</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {quadrants.filter(dest => dest.id !== q.id).map(dest => (
                                <button key={dest.id} onClick={() => moveTask(item.task, item.note, q.id, dest.id)}
                                  style={{ padding: "6px 10px", background: "white", border: `1px solid ${dest.col}`, borderRadius: 7, fontFamily: "system-ui", fontSize: 11, color: dest.col, cursor: "pointer", fontWeight: 500 }}>
                                  {dest.icon} {dest.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SNOOZE PANEL */}
                        {snoozeTask?.task === item.task && (
                          <div style={{ background: "#FFF8F0", borderRadius: "0 0 7px 7px", padding: "10px", border: `1px solid #F0C080` }}>
                            <span style={{ fontSize: 11, color: "#B07020", fontWeight: 500, display: "block", marginBottom: 8 }}>⏰ Remind me in...</span>
                            <div style={{ display: "flex", gap: 6 }}>
                              {[[15,"15 min"],[30,"30 min"],[60,"1 hour"],[120,"2 hours"]].map(([mins, label]) => (
                                <button key={mins} onClick={() => snoozeReminder(item.task, mins)}
                                  style={{ flex: 1, padding: "7px 4px", background: "white", border: "1px solid #F0C080", borderRadius: 7, fontFamily: "system-ui", fontSize: 11, color: "#B07020", cursor: "pointer", fontWeight: 500 }}>
                                  {label}
                                </button>
                              ))}
                            </div>
                            <p style={{ fontSize: 10, color: "#B07020", marginTop: 8, fontStyle: "italic", opacity: 0.8 }}>
                              Creates a calendar reminder at that time so you don't forget.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
              }
            </div>
          ))}
        </div>
        {result.guiltList?.length > 0 && !guiltDropped && (
          <div style={{ ...card(), animation: "fadeUp 0.4s ease 0.35s both" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.soft, fontWeight: 500, marginBottom: 5 }}>Worth a honest look</div>
            <h4 style={{ ...serif, fontSize: 15, marginBottom: 5 }}>The guilt list 👀</h4>
            <p style={{ fontSize: 13, color: c.mid, marginBottom: 10, lineHeight: 1.6 }}>These keep showing up but probably don't need to happen. You're allowed to let them go.</p>
            {result.guiltList.map((item, i) => <div key={i} style={{ padding: "7px 11px", background: c.cream, borderRadius: 7, fontSize: 13, color: c.mid, fontStyle: "italic", marginBottom: 5 }}>· {item}</div>)}
            <button onClick={() => setGuiltDropped(true)} style={{ ...btn(c.terra), width: "100%", marginTop: 10, fontSize: 13 }}>Drop them all — gone 🗑️</button>
          </div>
        )}
        {guiltDropped && <div style={{ background: c.sageLight, border: `1px solid ${c.sage}`, borderRadius: 12, padding: 16, marginBottom: 14, textAlign: "center" }}><p style={{ ...serif, fontStyle: "italic", color: c.dark, fontSize: 14 }}>Gone — you're welcome. 🙌</p></div>}
        <div style={{ ...card({ textAlign: "center" }), animation: "fadeUp 0.4s ease 0.45s both" }}>
          <p style={{ ...serif, fontSize: 15, fontStyle: "italic", lineHeight: 1.8, color: c.dark }}>{result.closingNote}</p>
        </div>
        <div style={{ background: c.terraLight, borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: c.terra, lineHeight: 1.6 }}>
          ✓ Tick off what's done — unticked tasks stay on your list.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={finishAndCelebrate} style={{ ...btn(c.terra), flex: 2, fontSize: 14 }}>
            {countChecked() > 0 ? `Record ${countChecked()} win${countChecked() > 1 ? "s" : ""} ✓` : "Done for now →"}
          </button>
          <button onClick={() => setScreen("home")} style={{ ...btn("transparent", c.mid), flex: 1, fontSize: 13 }}>Add more</button>
        </div>
      </div>
    </div>
  );

  // ── HOME SCREEN ──────────────────────────────────────────────────
  const s = weekSummary();
  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: c.cream, minHeight: "100vh", padding: "24px 16px 80px" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: c.terra, fontWeight: 500 }}>mental load</div>
            {profile.name && <div style={{ fontSize: 13, color: c.mid, marginTop: 2 }}>Hey {profile.name} 👋</div>}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {wins.total > 0 && <button onClick={() => setScreen("summary")} style={{ background: c.sageLight, border: `1px solid ${c.sage}`, borderRadius: 20, padding: "4px 11px", fontSize: 11, color: c.sage, fontWeight: 500, cursor: "pointer" }}>🏆 {wins.total}</button>}
            <button onClick={() => setScreen("invisible")} style={{ ...btn(savedInvisible ? c.goldLight : c.cream, savedInvisible ? c.gold : c.soft), padding: "6px 11px", fontSize: 11, border: `1px solid ${savedInvisible ? c.gold : c.border}` }}>🧠 Invisible</button>
            <button onClick={() => { setProfileDraft(profile); setScreen("profile"); }} style={{ ...btn(profile.values ? c.sageLight : c.terraLight, profile.values ? c.sage : c.terra), padding: "6px 11px", fontSize: 11 }}>
              {profile.values ? "✓ Profile" : "Set up profile"}
            </button>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24, animation: "fadeUp 0.4s ease both" }}>
          <h1 style={{ ...serif, fontSize: "clamp(22px,5vw,34px)", fontWeight: 400, lineHeight: 1.2, marginBottom: 8, color: c.dark }}>
            Brain dump.<br /><em style={{ color: c.terra }}>Find what actually matters.</em>
          </h1>
          <p style={{ fontSize: 13, color: c.mid, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
            Add tasks as they come up. Sort when ready. Unticked tasks stay until you're done with them.
          </p>
        </div>



        {/* Active task list */}
        {activeTasks.length > 0 && (
          <div style={{ ...card(), animation: "fadeUp 0.4s ease 0.05s both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.terra, fontWeight: 500 }}>Your current list</div>
                <div style={{ fontSize: 12, color: c.soft, marginTop: 2 }}>{activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""} on the go</div>
              </div>
              <button onClick={clearAllTasks} style={{ ...btn("transparent", c.soft), padding: "4px 10px", fontSize: 11 }}>Let it all go</button>
            </div>
            {activeTasks.map(task => {
              const age = taskAge(task.added);
              return (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: age ? age.bg : c.cream, borderRadius: 8, marginBottom: 5, border: age && age.level !== "days" ? `1px solid ${age.color}22` : "none" }}
                title={age ? age.tip : ""}>
                <div style={{ flex: 1, fontSize: 13, color: c.dark, lineHeight: 1.5 }}>
                  {task.text.replace(/^[\*\-•\s]+/, '')}
                  {age && <span style={{ marginLeft: 6, fontSize: 9, color: age.color, background: "white", borderRadius: 4, padding: "1px 6px", border: `1px solid ${age.color}44` }}>{age.label}</span>}
                </div>
                <button onClick={() => removeTask(task.id)} style={{ background: "none", border: "none", color: c.soft, fontSize: 16, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>×</button>
              </div>
              );
            })}
          </div>
        )}

        {/* Week + Day check-in */}
        {showModeCheck && (
          <div style={{ animation: "fadeUp 0.4s ease 0.08s both" }}>

            {/* Week mode */}
            <div style={{ background: c.warm, border: `1px solid ${c.border}`, borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.terra, fontWeight: 500 }}>How's your week looking?</div>
                  <div style={{ fontSize: 12, color: c.soft, marginTop: 2 }}>This adjusts how much we put on your plate</div>
                </div>
                {weekMode && <span style={{ fontSize: 11, color: c.sage }}>✓ set</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {WEEK_MODES.map(m => (
                  <button key={m.id} onClick={() => setWeekMode(weekMode === m.id ? null : m.id)}
                    style={{ padding: "7px 11px", background: weekMode === m.id ? c.terra : c.cream, color: weekMode === m.id ? "white" : c.mid,
                      border: `1px solid ${weekMode === m.id ? c.terra : c.border}`, borderRadius: 20, fontFamily: "system-ui", fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Day mode */}
            <div style={{ background: c.warm, border: `1px solid ${c.border}`, borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.terra, fontWeight: 500 }}>How are you feeling today?</div>
                  <div style={{ fontSize: 12, color: c.soft, marginTop: 2 }}>Adjusts your Do Now list to match your energy</div>
                </div>
                {dayMode && <span style={{ fontSize: 11, color: c.sage }}>✓ set</span>}
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                {DAY_MODES.map(m => (
                  <button key={m.id} onClick={() => setDayMode(dayMode === m.id ? null : m.id)}
                    style={{ flex: 1, padding: "10px 6px", background: dayMode === m.id ? c.terra : c.cream, color: dayMode === m.id ? "white" : c.mid,
                      border: `1px solid ${dayMode === m.id ? c.terra : c.border}`, borderRadius: 10, fontFamily: "system-ui", fontSize: 11, cursor: "pointer", textAlign: "center", transition: "all 0.15s", lineHeight: 1.4 }}>
                    <div style={{ fontSize: 18, marginBottom: 3 }}>{m.emoji}</div>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gentle mode banner */}
            {(weekMode === "sickday" || weekMode === "lowcap" || dayMode === "empty") && (
              <div style={{ background: c.sageLight, border: `1px solid ${c.sage}`, borderRadius: 12, padding: "11px 14px", marginBottom: 12, fontSize: 13, color: c.sage, lineHeight: 1.6 }}>
                🌿 Survival mode activated. We're only surfacing the one thing that actually has to happen today.
              </div>
            )}

          </div>
        )}

        {/* Add tasks */}
        <div style={{ ...card(), animation: "fadeUp 0.4s ease 0.1s both" }}>
          <h3 style={{ ...serif, fontSize: 16, fontWeight: 400, marginBottom: 5 }}>
            {activeTasks.length > 0 ? "Add more tasks" : "Everything in your head, right now"}
          </h3>
          <p style={{ fontSize: 12, color: c.mid, marginBottom: 12, lineHeight: 1.6 }}>
            {activeTasks.length > 0 ? "What else just landed on your plate?" : "Work, home, kids, errands — messy is fine."}
          </p>
          <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
            {[["type","⌨️ Type"],["voice","🎙 Voice"],["photo","📷 Photo"]].map(([mode,label]) => (
              <button key={mode} onClick={() => { setInputMode(mode); setError(""); }}
                style={{ flex: 1, padding: "7px 4px", background: inputMode === mode ? c.terra : c.cream, color: inputMode === mode ? "white" : c.mid, border: `1px solid ${inputMode === mode ? c.terra : c.border}`, borderRadius: 7, fontFamily: "system-ui", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          {inputMode === "type" && (
            <textarea value={newInput} onChange={e => setNewInput(e.target.value)}
              placeholder={activeTasks.length > 0 ? "Add more, one per line..." : "Buy dog food\nCall mum back\nFinish the proposal..."}
              rows={activeTasks.length > 0 ? 3 : 6}
              style={{ width: "100%", padding: "11px 13px", border: `1px solid ${c.border}`, borderRadius: 9, fontFamily: "system-ui", fontSize: 14, background: c.cream, resize: "vertical", outline: "none", lineHeight: 1.6 }} />
          )}
          {inputMode === "voice" && (
            <div>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <button onClick={recording ? stopVoice : startVoice}
                  style={{ width: 64, height: 64, borderRadius: "50%", background: recording ? "#E85555" : c.terra, border: "none", cursor: "pointer", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", boxShadow: recording ? "0 0 0 8px rgba(232,85,85,0.2)" : "none", animation: recording ? "pulse 1.5s ease infinite" : "none" }}>
                  {recording ? "⏹" : "🎙"}
                </button>
                <p style={{ fontSize: 13, color: recording ? "#E85555" : c.mid, fontWeight: recording ? 500 : 400 }}>{recording ? "Listening... tap to stop" : "Tap to start talking"}</p>
              </div>
              {newInput && <textarea value={newInput} onChange={e => setNewInput(e.target.value)} rows={3} style={{ width: "100%", padding: "11px 13px", border: `1px solid ${c.border}`, borderRadius: 9, fontFamily: "system-ui", fontSize: 13, background: c.cream, resize: "vertical", outline: "none", lineHeight: 1.6 }} />}
            </div>
          )}
          {inputMode === "photo" && (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ width: 64, height: 64, borderRadius: "50%", background: c.terra, border: "none", cursor: "pointer", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>📷</button>
                <p style={{ fontSize: 13, color: c.mid }}>Snap your handwritten list</p>
                <p style={{ fontSize: 11, color: c.soft, marginTop: 3 }}>Or upload from your camera roll</p>
              </div>
              {loading && <p style={{ textAlign: "center", fontSize: 12, color: c.terra, fontStyle: "italic" }}>Reading your list...</p>}
              {newInput && <div><p style={{ fontSize: 11, color: c.sage, marginBottom: 6, fontWeight: 500 }}>✓ Extracted — edit if needed:</p><textarea value={newInput} onChange={e => setNewInput(e.target.value)} rows={4} style={{ width: "100%", padding: "11px 13px", border: `1px solid ${c.sage}`, borderRadius: 9, fontFamily: "system-ui", fontSize: 13, background: c.cream, resize: "vertical", outline: "none", lineHeight: 1.6 }} /></div>}
            </div>
          )}
          {newInput.trim() && <button onClick={addToList} style={{ ...btn(c.sageLight, c.sage), width: "100%", marginTop: 10, fontSize: 13 }}>+ Add to my list</button>}
        </div>

        {/* Deadlines */}
        <div style={{ marginBottom: 14 }}>
          <button onClick={() => setShowDeadlines(!showDeadlines)}
            style={{ ...btn("transparent", showDeadlines ? c.terra : c.soft), width: "100%", fontSize: 13, padding: "10px", border: `1px solid ${showDeadlines ? c.terra : c.border}` }}>
            {showDeadlines ? "▲" : "▼"} Anything due soon? (optional)
          </button>
          {showDeadlines && (
            <div style={{ background: c.warm, border: `1px solid ${c.border}`, borderRadius: "0 0 12px 12px", padding: 16, borderTop: "none" }}>
              <p style={{ fontSize: 12, color: c.mid, marginBottom: 8, lineHeight: 1.6 }}>Tell me what's actually urgent — this makes the Do Now list much more accurate.</p>
              <textarea value={deadlines} onChange={e => setDeadlines(e.target.value)} placeholder={"e.g. Perri's baby shower is this Saturday\nProposal due Thursday\nWiggle's vet is tomorrow"} rows={3}
                style={{ width: "100%", padding: "10px 12px", border: `1px solid ${c.border}`, borderRadius: 9, fontFamily: "system-ui", fontSize: 13, background: c.cream, resize: "vertical", outline: "none", lineHeight: 1.6 }} />
            </div>
          )}
        </div>

        {/* Sort mode toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["warm", "💛 Talk to me"], ["quick", "⚡ Just sort it"]].map(([mode, label]) => (
            <button key={mode} onClick={() => setSortMode(mode)}
              style={{ flex: 1, padding: "9px", background: sortMode === mode ? (mode === "warm" ? c.terraLight : c.sageLight) : c.cream, color: sortMode === mode ? (mode === "warm" ? c.terra : c.sage) : c.soft, border: `1px solid ${sortMode === mode ? (mode === "warm" ? c.terra : c.sage) : c.border}`, borderRadius: 9, fontFamily: "system-ui", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>

        {error && <div style={{ background: "#FFF0EC", border: "1px solid #F5C4B5", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: c.terra, marginBottom: 12, lineHeight: 1.5, wordBreak: "break-word" }}>{error}</div>}

        <button onClick={sort} disabled={loading || (activeTasks.length === 0 && !newInput.trim())}
          style={{ ...btn(c.terra), width: "100%", fontSize: 15, opacity: (loading || (activeTasks.length === 0 && !newInput.trim())) ? 0.5 : 1 }}>
          {loading ? loadingMsg : `Sort it out for me${activeTasks.length > 0 ? ` (${activeTasks.length}${newInput.trim() ? "+" : ""} tasks)` : ""} →`}
        </button>

        {/* Privacy note for invisible load */}

        {wins.week > 0 && (
          <div style={{ textAlign: "center", marginTop: 16, padding: "11px", background: c.sageLight, borderRadius: 10, fontSize: 12, color: c.sage, cursor: "pointer" }} onClick={() => setScreen("summary")}>
            🌿 {wins.week} tasks cleared this week — tap to see your full summary
          </div>
        )}

      </div>
    </div>
  );
}
