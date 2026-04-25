import React, { useState, useEffect } from 'react';

// --- Types ---
type TaskCategory = 'home' | 'work';
type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

interface Task { id: string; text: string; category: TaskCategory; done: boolean; }
interface MindNode { id: string; text: string; children: MindNode[]; }
interface Meal { id: MealKey; label: string; done: boolean; }

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'mindmap'>('planner');
  
  // --- Unified State (Restoring All Original Features) ---
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('complete_daily_app_data');
    return saved ? JSON.parse(saved) : {
      planner: { 
        wake: '07:00', 
        sleep: '23:00', 
        priorities: ['', '', ''], 
        tasks: [] as Task[], 
        water: 0, 
        meals: [
          { id: 'breakfast', label: 'Breakfast', done: false },
          { id: 'lunch', label: 'Lunch', done: false },
          { id: 'dinner', label: 'Dinner', done: false },
          { id: 'snacks', label: 'Snacks', done: false },
        ] as Meal[], 
        notes: '' 
      },
      mindmap: { roots: [] as MindNode[] }
    };
  });

  const [newTaskText, setNewTaskText] = useState("");
  const [currentCat, setCurrentCat] = useState<TaskCategory>('home');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Auto-sync for Offline/Online Mode
  useEffect(() => { localStorage.setItem('complete_daily_app_data', JSON.stringify(data)); }, [data]);

  const updatePlanner = (updates: any) => setData({ ...data, planner: { ...data.planner, ...updates } });

  // --- FEATURE: Priority Tick-to-Delete ---
  const handlePriorityTick = (index: number) => {
    const p = [...data.planner.priorities];
    p[index] = ""; 
    updatePlanner({ priorities: p });
  };

  // --- FEATURE: Tree Branching & Management ---
  const addNode = (parentId: string | null = null) => {
    const newNode = { id: Date.now().toString(), text: 'New idea', children: [] };
    if (!parentId) {
      setData({ ...data, mindmap: { roots: [...data.mindmap.roots, newNode] } });
    } else {
      const addToTree = (nodes: MindNode[]): MindNode[] => nodes.map(n => 
        n.id === parentId ? { ...n, children: [...n.children, newNode] } : { ...n, children: addToTree(n.children) }
      );
      setData({ ...data, mindmap: { roots: addToTree(data.mindmap.roots) } });
    }
  };

  const renderMindTree = (nodes: MindNode[]) => (
    <div style={st.treeRow}>
      {nodes.map(node => (
        <div key={node.id} style={st.nodeColumn}>
          <div style={{...st.mindCard, border: selectedNodeId === node.id ? '2px solid #146654' : '1px solid #ddd'}} onClick={() => setSelectedNodeId(node.id)}>
            <input 
              style={st.nodeInput} 
              value={node.text} 
              onChange={(e) => {
                const edit = (list: MindNode[]): MindNode[] => list.map(n => n.id === node.id ? {...n, text: e.target.value} : {...n, children: edit(n.children)});
                setData({...data, mindmap: { roots: edit(data.mindmap.roots) }});
              }}
            />
          </div>
          <button style={st.branchBtn} onClick={() => addNode(node.id)}>+</button>
          {node.children.length > 0 && <div style={st.childContainer}>{renderMindTree(node.children)}</div>}
        </div>
      ))}
    </div>
  );

  return (
    <div style={st.app}>
      <nav style={st.tabs}>
        <button onClick={() => setActiveTab('planner')} style={{...st.tabBtn, color: activeTab === 'planner' ? '#146654' : '#888'}}>📅 Planner</button>
        <button onClick={() => setActiveTab('mindmap')} style={{...st.tabBtn, color: activeTab === 'mindmap' ? '#146654' : '#888'}}>🧠 Mind Map</button>
      </nav>

      <div style={st.content}>
        {activeTab === 'planner' ? (
          <div>
            {/* Schedule Section */}
            <div style={st.section}>
              <h3 style={st.secTitle}>🕒 Schedule</h3>
              <div style={st.row}>
                 <div style={st.timeBlock}><label>Wake</label><input type="time" value={data.planner.wake} onChange={e => updatePlanner({wake: e.target.value})} style={st.timeInput} /></div>
                 <div style={st.timeBlock}><label>Sleep</label><input type="time" value={data.planner.sleep} onChange={e => updatePlanner({sleep: e.target.value})} style={st.timeInput} /></div>
              </div>
            </div>

            {/* Priorities (Tick-to-Delete) */}
            <div style={st.section}>
              <h3 style={st.secTitle}>⭐ Top 3 Priorities</h3>
              {data.planner.priorities.map((p: string, i: number) => (
                <div key={i} style={st.priRow}>
                  <span style={st.badge}>{i+1}</span>
                  <input style={st.input} value={p} placeholder="Set priority..." onChange={(e) => {
                    const copy = [...data.planner.priorities]; copy[i] = e.target.value; updatePlanner({ priorities: copy });
                  }} />
                  <button onClick={() => handlePriorityTick(i)} style={st.tick}>✓</button>
                </div>
              ))}
            </div>

            {/* To-Do (X-to-Remove) */}
            <div style={st.section}>
              <h3 style={st.secTitle}>✔️ To-Do</h3>
              <div style={st.catRow}>
                <button onClick={() => setCurrentCat('home')} style={{...st.catBtn, background: currentCat === 'home' ? '#146654' : '#eee', color: currentCat === 'home' ? '#fff' : '#444'}}>🏠 Home</button>
                <button onClick={() => setCurrentCat('work')} style={{...st.catBtn, background: currentCat === 'work' ? '#146654' : '#eee', color: currentCat === 'work' ? '#fff' : '#444'}}>🏢 Work</button>
              </div>
              <div style={st.inputWrap}>
                <input style={st.input} placeholder={`Add ${currentCat} task...`} value={newTaskText} onChange={e => setNewTaskText(e.target.value)} onKeyDown={e => e.key === 'Enter' && (()=>{
                    const nt = { id: Date.now().toString(), text: newTaskText, category: currentCat, done: false };
                    updatePlanner({ tasks: [...data.planner.tasks, nt] }); setNewTaskText("");
                })()} />
              </div>
              {['home', 'work'].map(c => (
                <div key={c} style={{marginTop: '15px'}}>
                   <div style={st.catLabel}>{c.toUpperCase()} {data.planner.tasks.filter((t:any)=>t.category===c && t.done).length}/{data.planner.tasks.filter((t:any)=>t.category===c).length}</div>
                   {data.planner.tasks.filter((t:any) => t.category === c).map((t:any) => (
                     <div key={t.id} style={st.taskRow}>
                        <input type="checkbox" checked={t.done} onChange={() => updatePlanner({ tasks: data.planner.tasks.map((x:any) => x.id === t.id ? {...x, done: !x.done} : x) })} />
                        <span style={{flex: 1, textDecoration: t.done ? 'line-through' : 'none'}}>{t.text}</span>
                        <button style={st.wrongBtn} onClick={() => updatePlanner({ tasks: data.planner.tasks.filter((x:any)=>x.id !== t.id) })}>✕</button>
                     </div>
                   ))}
                </div>
              ))}
            </div>

            {/* Water Tracking */}
            <div style={st.section}>
              <h3 style={st.secTitle}>💧 Water Intake ({data.planner.water}/8)</h3>
              <div style={st.waterGrid}>
                {[...Array(8)].map((_, i) => (
                  <button key={i} onClick={() => updatePlanner({ water: i + 1 === data.planner.water ? i : i + 1 })}
                    style={{...st.cup, background: i < data.planner.water ? '#146654' : '#eee'}} />
                ))}
              </div>
            </div>

            {/* Meal Tracking */}
            <div style={st.section}>
              <h3 style={st.secTitle}>🍱 Meals</h3>
              <div style={st.mealGrid}>
                {data.planner.meals.map((meal: Meal) => (
                  <button key={meal.id} onClick={() => updatePlanner({ meals: data.planner.meals.map((m:any) => m.id === meal.id ? {...m, done: !m.done} : m) })}
                    style={{...st.mealBtn, background: meal.done ? '#E3F2FD' : '#fff', border: meal.done ? '1px solid #146654' : '1px solid #ddd'}}>
                    {meal.label} {meal.done ? '✅' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={st.section}>
              <h3 style={st.secTitle}>📝 Notes</h3>
              <textarea style={st.notesArea} value={data.planner.notes} onChange={e => updatePlanner({notes: e.target.value})} placeholder="Reflections..." />
            </div>
          </div>
        ) : (
          /* Mind Map Section */
          <div style={st.mindCanvas}>
            <div style={st.treeWrapper}>{renderMindTree(data.mindmap.roots)}</div>
            <div style={st.mindFooter}>
              <button style={st.mainAdd} onClick={() => addNode()}>+ Add Root</button>
              <button style={st.delBtn} onClick={() => {
                const del = (list: MindNode[]): MindNode[] => list.filter(n => n.id !== selectedNodeId).map(n => ({...n, children: del(n.children)}));
                setData({...data, mindmap: { roots: del(data.mindmap.roots) }}); setSelectedNodeId(null);
              }}>🗑️</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  app: { maxWidth: '450px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh', fontFamily: 'sans-serif' },
  tabs: { display: 'flex', background: '#fff', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 100 },
  tabBtn: { flex: 1, padding: '15px', border: 'none', background: 'none', fontWeight: 700, cursor: 'pointer' },
  content: { padding: '15px', paddingBottom: '100px' },
  section: { background: '#fff', borderRadius: '15px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  secTitle: { fontSize: '15px', color: '#146654', marginBottom: '12px', fontWeight: 700 },
  row: { display: 'flex', gap: '15px' },
  timeBlock: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  timeInput: { padding: '10px', borderRadius: '8px', border: '1px solid #eee' },
  priRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  badge: { background: '#146654', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' },
  input: { flex: 1, border: 'none', borderBottom: '1px solid #eee', padding: '8px', outline: 'none' },
  tick: { background: '#146654', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' },
  catRow: { display: 'flex', gap: '8px', marginBottom: '12px' },
  catBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600 },
  inputWrap: { background: '#f5f5f5', padding: '8px', borderRadius: '12px' },
  taskRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f9f9f9' },
  wrongBtn: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' },
  waterGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  cup: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer' },
  mealGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  mealBtn: { padding: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 },
  notesArea: { width: '100%', minHeight: '80px', borderRadius: '12px', border: '1px solid #eee', padding: '10px', resize: 'none' },
  // Mindmap
  mindCanvas: { position: 'relative', overflowX: 'auto' },
  treeWrapper: { display: 'flex', justifyContent: 'center', padding: '20px' },
  treeRow: { display: 'flex', gap: '25px', alignItems: 'flex-start' },
  nodeColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  mindCard: { background: '#fff', padding: '12px', borderRadius: '12px', minWidth: '90px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  nodeInput: { border: 'none', textAlign: 'center', width: '80px', outline: 'none', fontWeight: 600 },
  branchBtn: { marginTop: '8px', background: '#fff', border: '1px solid #146654', color: '#146654', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer' },
  childContainer: { marginTop: '25px', borderTop: '1px solid #ddd', paddingTop: '20px' },
  mindFooter: { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', width: '90%', maxWidth: '400px' },
  mainAdd: { flex: 4, background: '#146654', color: '#fff', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 700, cursor: 'pointer' },
  delBtn: { flex: 1, background: '#eee', border: 'none', borderRadius: '15px', cursor: 'pointer' },
  catLabel: { fontSize: '11px', color: '#888', fontWeight: 700 }
};
