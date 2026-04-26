import React, { useState, useEffect } from 'react';

// --- 1. TYPES & INTERFACES ---
type ViewState = 'auth' | 'home' | 'planner' | 'mindmap' | 'habits';
type TaskCategory = 'home' | 'work';
type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

interface Task { id: string; text: string; category: TaskCategory; done: boolean; }
interface MindNode { id: string; text: string; children: MindNode[]; }
interface Meal { id: MealKey; label: string; done: boolean; }
interface Habit { id: string; name: string; totalDays: number; completed: Record<number, boolean>; }

// --- 2. INITIAL DATA ---
const INITIAL_DATA = {
  planner: { 
    wake: '07:00', sleep: '23:00', priorities: ['', '', ''], tasks: [] as Task[], water: 0, 
    meals: [
      { id: 'breakfast', label: 'Breakfast', done: false },
      { id: 'lunch', label: 'Lunch', done: false },
      { id: 'dinner', label: 'Dinner', done: false },
      { id: 'snacks', label: 'Snacks', done: false }
    ] as Meal[],
    notes: '' 
  },
  mindmap: { roots: [] as MindNode[] },
  habits: [] as Habit[]
};

export default function App() {
  // --- States ---
  const [view, setView] = useState<ViewState>(() => localStorage.getItem('isLoggedIn') === 'true' ? 'home' : 'auth');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || "");
  const [newTaskText, setNewTaskText] = useState("");
  const [currentCat, setCurrentCat] = useState<TaskCategory>('home');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hName, setHName] = useState("");
  const [hDays, setHDays] = useState(21);
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    return "Good evening,";
  };
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('master_daily_app_v27');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('master_daily_app_v27', JSON.stringify(data));
    localStorage.setItem('userName', userName);
    localStorage.setItem('isLoggedIn', view !== 'auth' ? 'true' : 'false');
  }, [data, userName, view]);

  // --- Handlers ---
  const updatePlanner = (updates: any) => setData((prev: any) => ({ ...prev, planner: { ...prev.planner, ...updates } }));

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    updatePlanner({ tasks: [...data.planner.tasks, { id: Date.now().toString(), text: newTaskText, category: currentCat, done: false }] });
    setNewTaskText("");
  };

  const handleMindBranch = (parentId: string | null = null) => {
    const newNode = { id: Date.now().toString(), text: 'New idea', children: [] };
    if (!parentId) setData((prev: any) => ({ ...prev, mindmap: { roots: [...prev.mindmap.roots, newNode] } }));
    else {
      const addToTree = (nodes: MindNode[]): MindNode[] => nodes.map(n => 
        n.id === parentId ? { ...n, children: [...n.children, newNode] } : { ...n, children: addToTree(n.children) }
      );
      setData((prev: any) => ({ ...prev, mindmap: { roots: addToTree(prev.mindmap.roots) } }));
    }
  };

  const renderMindTree = (nodes: MindNode[]) => (
    <div style={st.treeRow}>
      {nodes.map(node => (
        <div key={node.id} style={st.nodeColumn}>
          <div style={{...st.mindCard, border: selectedNodeId === node.id ? '2px solid #146654' : '1px solid #ddd'}} onClick={() => setSelectedNodeId(node.id)}>
            <input style={st.nodeInput} value={node.text} onChange={(e) => {
                const edit = (list: MindNode[]): MindNode[] => list.map(n => n.id === node.id ? {...n, text: e.target.value} : {...n, children: edit(n.children)});
                setData((prev: any) => ({...prev, mindmap: { roots: edit(prev.mindmap.roots) } }));
            }} />
          </div>
          <button style={st.branchBtn} onClick={(e) => { e.stopPropagation(); handleMindBranch(node.id); }}>+</button>
          {node.children.length > 0 && <div style={st.childContainer}>{renderMindTree(node.children)}</div>}
        </div>
      ))}
    </div>
  );

  // --- Views ---
  if (view === 'auth') return (
    <div style={st.authWrapper}>
      <div style={st.logoCircle}>☑</div>
      <h1 style={st.authTitle}>Daily Planner</h1>
      <div style={st.authCard}>
        <div style={st.authTabs}>
          <button onClick={() => setAuthMode('signin')} style={{...st.tabBtn, background: authMode === 'signin' ? '#fff' : 'transparent'}}>Sign In</button>
          <button onClick={() => setAuthMode('signup')} style={{...st.tabBtn, background: authMode === 'signup' ? '#fff' : 'transparent'}}>Sign Up</button>
        </div>
        <div style={st.inputGroup}>
          {authMode === 'signup' && <div style={st.field}>👤<input placeholder="Your name" value={userName} onChange={e => setUserName(e.target.value)} style={st.fieldInput}/></div>}
          <div style={st.field}>✉<input placeholder="Email" style={st.fieldInput}/></div>
          <div style={st.field}>🔒<input type="password" placeholder="Password" style={st.fieldInput}/></div>
        </div>
        <button style={st.submitBtn} onClick={() => setView('home')}>Start Planning</button>
      </div>
    </div>
  );

  
  if (view === 'home') return (
    <div style={st.appWrapper}>
      <header style={st.homeHeader}>
      <div>
        <p style={{color: '#888', margin: 0}}>{getGreeting()}</p>
        <h1 style={{margin: 0, fontSize: '32px'}}>{userName || "Broto"}</h1>
       </div>
       <button onClick={() => setView('auth')} style={st.logoutBtn}>📤</button>
      </header>
      <div style={st.menuCardGreen} onClick={() => setView('habits')}><div style={st.menuIconBg}>✨</div><div style={{flex: 1}}><h4 style={{margin: 0, color: '#fff'}}>Habit Tracker</h4><p style={{margin: 0, fontSize: '12px', color: '#fff', opacity: 0.8}}>Consistent Progress</p></div><span>→</span></div>
      <div style={st.menuCardWhite} onClick={() => setView('planner')}><div style={{...st.menuIconBg, background: '#e8f2f0', color: '#146654'}}>📅</div><div style={{flex: 1}}><h4 style={{margin: 0}}>Daily Planner</h4><p style={{margin: 0, fontSize: '12px', color: '#888'}}>Tasks & Schedule</p></div><span>→</span></div>
      <div style={{...st.menuCardWhite, marginTop: '15px'}} onClick={() => setView('mindmap')}><div style={{...st.menuIconBg, background: '#f5f5f5', color: '#333'}}>🧠</div><div style={{flex: 1}}><h4 style={{margin: 0}}>Mind Map</h4><p style={{margin: 0, fontSize: '12px', color: '#888'}}>Idea branching</p></div><span>→</span></div>
      <div style={st.quoteBox}>☀️ <p style={{margin: 0, fontSize: '14px', color: '#555'}}>Small steps lead to big changes.</p></div>
    </div>
  );

  return (
    <div style={st.appWrapper}>
      <button onClick={() => setView('home')} style={st.backBtn}>← Back to Home</button>

      {view === 'planner' ? (
        <div>
          <div style={st.section}><h3 style={st.secTitle}>🕒 Schedule</h3>
            <div style={st.row}>
              <div style={st.timeInputBox}><label style={st.timeLabel}>Wake up</label><input type="time" value={data.planner.wake} onChange={e => updatePlanner({wake: e.target.value})} style={st.timeInput} /></div>
              <div style={st.timeInputBox}><label style={st.timeLabel}>Sleep</label><input type="time" value={data.planner.sleep} onChange={e => updatePlanner({sleep: e.target.value})} style={st.timeInput} /></div>
            </div>
          </div>
          <div style={st.section}><h3 style={st.secTitle}>⭐ Top 3 Priorities</h3>
            {data.planner.priorities.map((p: string, i: number) => (
              <div key={i} style={st.priRow}><span style={st.badge}>{i+1}</span><input style={st.input} value={p} onChange={e => {const c=[...data.planner.priorities]; c[i]=e.target.value; updatePlanner({priorities:c});}} /><button onClick={() => {const c=[...data.planner.priorities]; c[i]=""; updatePlanner({priorities:c});}} style={st.tick}>✓</button></div>
            ))}
          </div>
          <div style={st.section}><h3 style={st.secTitle}>✔️ To-Do</h3>
            <div style={st.catRow}><button onClick={()=>setCurrentCat('home')} style={{...st.catBtn, background: currentCat==='home'?'#146654':'#eee', color: currentCat==='home'?'#fff':'#444'}}>Home</button><button onClick={()=>setCurrentCat('work')} style={{...st.catBtn, background: currentCat==='work'?'#146654':'#eee', color: currentCat==='work'?'#fff':'#444'}}>Work</button></div>
            <div style={st.inputWrap}><input style={st.input} placeholder="Add task..." value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} /><button style={st.addBtn} onClick={handleAddTask}>+</button></div>
            {['home', 'work'].map((c, idx) => (
              <div key={idx}>
                <div style={st.catLabel}>{c.toUpperCase()}</div>
                {data.planner.tasks.filter((t:any)=>t.category===c).map((t:any)=>(
                  <div key={t.id} style={st.taskRow}><input type="checkbox" checked={t.done} onChange={()=>updatePlanner({tasks:data.planner.tasks.map((x:any)=>x.id===t.id?{...x,done:!x.done}:x)})} /><span style={{flex:1, textDecoration: t.done?'line-through':'none'}}>{t.text}</span><button onClick={()=>updatePlanner({tasks:data.planner.tasks.filter((x:any)=>x.id!==t.id)})} style={st.wrongBtn}>✕</button></div>
                ))}
                {idx===0 && <hr style={st.separator}/>}
              </div>
            ))}
          </div>
          <div style={st.section}><h3 style={st.secTitle}>🍱 Meals</h3>
            <div style={st.mealGrid}>{data.planner.meals.map((m: any) => (<button key={m.id} onClick={() => updatePlanner({meals: data.planner.meals.map((x:any)=>x.id===m.id?{...x,done:!x.done}:x)})} style={{...st.mealBtn, background: m.done?'#E3F2FD':'#fff', border: m.done?'1px solid #146654':'1px solid #ddd'}}>{m.label} {m.done?'✅':''}</button>))}</div>
          </div>
          <div style={st.section}><h3 style={st.secTitle}>📝 Notes</h3>
            <textarea style={st.notesArea} value={data.planner.notes} onChange={e => updatePlanner({notes: e.target.value})} placeholder="Reflections, gratitude, or ideas..." />
          </div>
        </div>
      ) : view === 'habits' ? (
        <div>
          <div style={st.section}><h3 style={st.secTitle}>✨ New Habit</h3>
            <div style={st.inputWrap}><input style={st.input} placeholder="Habit name..." value={hName} onChange={e=>setHName(e.target.value)} /><input type="number" style={{width:'40px', border:'none'}} value={hDays} onChange={e=>setHDays(Number(e.target.value))} /><button style={st.addBtn} onClick={() => { if(!hName) return; setData({...data, habits:[...data.habits, {id:Date.now().toString(), name:hName, totalDays:hDays, completed:{}}]}); setHName(""); }}>+</button></div>
          </div>
          {data.habits.map((h: Habit) => (
            <div key={h.id} style={st.habitRowItem}><div style={st.habitNameFixed}><div style={{fontWeight: 700}}>{h.name}</div><div style={{fontSize:'11px', color:'#146654'}}>{Object.values(h.completed).filter(v=>v).length}/{h.totalDays}</div><button onClick={() => setData({...data, habits: data.habits.filter(x=>x.id!==h.id)})} style={st.delHabit}>Delete</button></div><div style={st.habitScrollGrid}>{[...Array(h.totalDays)].map((_, i) => (<button key={i} onClick={() => { const newH = data.habits.map(x => x.id === h.id ? {...x, completed: {...x.completed, [i]: !x.completed[i]}} : x); setData({...data, habits: newH}); }} style={{...st.dayCircle, color: h.completed[i] ? '#146654' : '#ccc'}}>{h.completed[i] ? '✓' : '✕'}</button>))}</div></div>
          ))}
        </div>
      ) : (
        <div style={st.mindCanvas}>
          <div style={st.treeWrapper}>{renderMindTree(data.mindmap.roots)}</div>
          <div style={st.mindFooter}>
            <button style={st.mainAdd} onClick={() => handleMindBranch()}>+ Add Root</button>
            <button style={st.delBtn} onClick={() => { if(!selectedNodeId) return; const del = (list: MindNode[]): MindNode[] => list.filter(n => n.id !== selectedNodeId).map(n => ({...n, children: del(n.children)})); setData({...data, mindmap: { roots: del(data.mindmap.roots) }}); setSelectedNodeId(null); }}>🗑️</button>
          </div>
        </div>
      )}
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  appWrapper: { maxWidth: '450px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', padding: '20px', boxSizing: 'border-box', fontFamily: 'sans-serif' },
  authWrapper: { background: '#D1D5D1', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', boxSizing: 'border-box', justifyContent: 'center' },
  logoCircle: { width: '60px', height: '60px', background: '#146654', color: '#fff', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '20px' },
  authTitle: { fontSize: '28px', marginBottom: '30px' },
  authCard: { background: 'rgba(255,255,255,0.4)', borderRadius: '25px', padding: '15px', width: '100%', maxWidth: '350px' },
  authTabs: { display: 'flex', background: '#e0e0e0', borderRadius: '12px', padding: '4px', marginBottom: '20px' },
  tabBtn: { flex: 1, border: 'none', padding: '8px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  field: { display: 'flex', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #ccc' },
  fieldInput: { border: 'none', outline: 'none', flex: 1, marginLeft: '8px', width:'100%', boxSizing:'border-box', padding:'10px', borderRadius:'10px' },
  submitBtn: { width: '100%', padding: '14px', background: '#146654', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' },
  homeHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  logoutBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' },
  menuCardGreen: { background: '#146654', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', cursor: 'pointer', color: '#fff' },
  menuCardWhite: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', border: '1px solid #ddd' },
  menuIconBg: { width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  quoteBox: { marginTop: '40px', background: '#e0e0e0', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px' },
  backBtn: { background: 'none', border: 'none', color: '#146654', fontWeight: 700, marginBottom: '20px', cursor: 'pointer' },
  section: { background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  secTitle: { color: '#146654', fontSize: '15px', marginBottom: '10px', fontWeight: 700 },
  priRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#f9f9f9', padding: '8px', borderRadius: '10px' },
  badge: { background: '#146654', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' },
  tick: { background: '#146654', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' },
  inputWrap: { display: 'flex', gap: '8px', background: '#eee', padding: '8px', borderRadius: '10px', marginBottom: '15px' },
  input: { flex: 1, border: 'none', background: 'none', outline: 'none' },
  addBtn: { background: '#146654', color: '#fff', border: 'none', borderRadius: '8px', width: '35px', height: '35px', cursor: 'pointer' },
  taskRow: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9f9f9', gap: '10px' },
  catLabel: { fontSize: '11px', color: '#888', fontWeight: 800, marginTop: '10px', marginBottom: '5px' },
  separator: { border: 'none', borderTop: '1px solid #eee', margin: '15px 0' },
  wrongBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '16px' },
  mealGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  mealBtn: { padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 },
  habitRowItem: { display: 'flex', background: '#fff', borderRadius: '15px', marginBottom: '12px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  habitNameFixed: { position: 'sticky', left: 0, background: '#fff', padding: '15px', minWidth: '100px', borderRight: '1px solid #eee', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  habitScrollGrid: { display: 'flex', overflowX: 'auto', padding: '12px', gap: '10px', alignItems: 'center' },
  dayCircle: { minWidth: '35px', height: '35px', borderRadius: '50%', border: '1px solid #eee', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  delHabit: { border: 'none', background: 'none', color: '#ff4d4d', fontSize: '10px', padding: 0, marginTop: '5px', textAlign: 'left', cursor: 'pointer' },
 mindCanvas: {
  position: 'relative',
  width: '1000px',       // Creates a huge horizontal space
  height: '500px',      // Creates a huge vertical space
  padding: '100px',
  display: 'flex',
  justifyContent: 'center'
  },
  treeWrapper: { display: 'flex', justifyContent: 'center', padding: '20px' },
  treeRow: {
  display: 'flex',
  flexDirection: 'row',  // Forces nodes to stay side-by-side
  alignItems: 'flex-start',
  gap: '50px',           // Space between the branches
},
  nodeColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  mindCard: { background: '#fff', padding: '12px', borderRadius: '12px', minWidth: '90px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer' },
  nodeInput: { border: 'none', textAlign: 'center', width: '80px', outline: 'none', fontWeight: 600, background: 'none' },
  branchBtn: { marginTop: '8px', background: '#fff', border: '1px solid #146654', color: '#146654', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer' },
  childContainer: { marginTop: '25px', borderTop: '1px solid #ddd', paddingTop: '20px' },
  mindFooter: { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' },
  mainAdd: { background: '#146654', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: 700, cursor: 'pointer' },
  delBtn: { background: '#eee', border: 'none', padding: '15px 20px', borderRadius: '15px', cursor: 'pointer' },
  notesArea: { width: '100%', minHeight: '120px', padding: '12px', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9f9', outline: 'none', resize: 'none', boxSizing: 'border-box' },
  timeInputBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  timeLabel: { fontSize: '12px', color: '#888', fontWeight: 500 },
  timeInput: { padding: '10px', borderRadius: '10px', border: '1px solid #eee', background: '#f9f9f9', outline: 'none' },
  row: { display: 'flex', gap: '10px' },
  catBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: 'pointer' },
  catRow: { display: 'flex', gap: '8px', marginBottom: '10px' },
};
