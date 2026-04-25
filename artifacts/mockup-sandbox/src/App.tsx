import React, { useState, useEffect } from 'react';

// --- Types ---
type TaskCategory = 'home' | 'work';
interface Task { id: string; text: string; category: TaskCategory; done: boolean; }
interface MindNode { id: string; text: string; children: MindNode[]; }

export default function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'mindmap'>('planner');
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('daily_app_data');
    return saved ? JSON.parse(saved) : {
      planner: { wake: '07:00', sleep: '23:00', priorities: ['', '', ''], tasks: [], water: 0, meals: { breakfast: false, lunch: false, dinner: false, snacks: false }, notes: '' },
      mindmap: { roots: [] as MindNode[] }
    };
  });

  const [newTaskText, setNewTaskText] = useState("");
  const [currentCat, setCurrentCat] = useState<TaskCategory>('home');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('daily_app_data', JSON.stringify(data)); }, [data]);

  // --- Planner Logic ---
  const updatePlanner = (updates: any) => setData({ ...data, planner: { ...data.planner, ...updates } });
  
  const handlePriorityTick = (index: number) => {
    const p = [...data.planner.priorities];
    p[index] = ""; // Clear text on tick
    updatePlanner({ priorities: p });
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = { id: Date.now().toString(), text: newTaskText, category: currentCat, done: false };
    updatePlanner({ tasks: [...data.planner.tasks, newTask] });
    setNewTaskText("");
  };

  const removeTask = (id: string) => updatePlanner({ tasks: data.planner.tasks.filter((t: Task) => t.id !== id) });

  // --- Mind Map Tree Logic ---
  const addNode = (parentId: string | null = null) => {
    const newNode = { id: Date.now().toString(), text: 'Tap to edit', children: [] };
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
          <div style={{...st.mindCard, border: selectedNodeId === node.id ? '2px solid #000' : '1px solid #ddd'}} onClick={() => setSelectedNodeId(node.id)}>
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
          {node.children.length > 0 && (
            <div style={st.childContainer}>{renderMindTree(node.children)}</div>
          )}
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
            <div style={st.section}>
              <h3 style={st.secTitle}>⭐ Top 3 Priorities</h3>
              {data.planner.priorities.map((p: string, i: number) => (
                <div key={i} style={st.priRow}>
                  <span style={st.badge}>{i+1}</span>
                  <input style={st.input} value={p} placeholder={`Priority ${i+1}`} onChange={(e) => {
                    const copy = [...data.planner.priorities]; copy[i] = e.target.value; updatePlanner({ priorities: copy });
                  }} />
                  <button onClick={() => handlePriorityTick(i)} style={st.tick}>✓</button>
                </div>
              ))}
            </div>

            <div style={st.section}>
              <h3 style={st.secTitle}>✔️ To-Do</h3>
              <div style={st.catRow}>
                <button onClick={() => setCurrentCat('home')} style={{...st.catBtn, background: currentCat === 'home' ? '#146654' : '#eee', color: currentCat === 'home' ? '#fff' : '#444'}}>🏠 Home</button>
                <button onClick={() => setCurrentCat('work')} style={{...st.catBtn, background: currentCat === 'work' ? '#146654' : '#eee', color: currentCat === 'work' ? '#fff' : '#444'}}>🏢 Work</button>
              </div>
              <div style={st.inputWrap}>
                <input style={st.input} placeholder={`Add a ${currentCat} task`} value={newTaskText} onChange={e => setNewTaskText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
                <button style={st.addBtn} onClick={addTask}>+</button>
              </div>
              {['home', 'work'].map(c => (
                <div key={c} style={{marginTop: '15px'}}>
                   <div style={st.catLabel}>{c === 'home' ? '🏠 Home' : '🏢 Work'} {data.planner.tasks.filter((t:any)=>t.category===c && t.done).length}/{data.planner.tasks.filter((t:any)=>t.category===c).length}</div>
                   {data.planner.tasks.filter((t:any) => t.category === c).map((t:any) => (
                     <div key={t.id} style={st.taskRow}>
                        <input type="checkbox" checked={t.done} onChange={() => {
                           updatePlanner({ tasks: data.planner.tasks.map((x:any) => x.id === t.id ? {...x, done: !x.done} : x) });
                        }} />
                        <span style={{flex: 1, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#aaa' : '#333'}}>{t.text}</span>
                        <button style={st.wrongBtn} onClick={() => removeTask(t.id)}>✕</button>
                     </div>
                   ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={st.mindCanvas}>
            <p style={st.hint}>Tap cards to edit. Use + to branch ideas.</p>
            <div style={st.treeWrapper}>{renderMindTree(data.mindmap.roots)}</div>
            <div style={st.mindFooter}>
              <button style={st.mainAdd} onClick={() => addNode()}>+ Add Root</button>
              <button style={st.delBtn} onClick={() => {
                const del = (list: MindNode[]): MindNode[] => list.filter(n => n.id !== selectedNodeId).map(n => ({...n, children: del(n.children)}));
                setData({...data, mindmap: { roots: del(data.mindmap.roots) }});
                setSelectedNodeId(null);
              }}>🗑️</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  app: { maxWidth: '450px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', fontFamily: 'sans-serif' },
  tabs: { display: 'flex', background: '#fff', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 10 },
  tabBtn: { flex: 1, padding: '15px', border: 'none', background: 'none', fontWeight: 700, cursor: 'pointer' },
  content: { padding: '15px' },
  section: { background: '#fff', borderRadius: '15px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  secTitle: { fontSize: '16px', color: '#146654', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  priRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', background: '#f9f9f9', padding: '8px', borderRadius: '10px' },
  badge: { background: '#146654', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' },
  input: { flex: 1, border: 'none', background: 'none', outline: 'none', padding: '5px' },
  tick: { background: '#146654', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' },
  catRow: { display: 'flex', gap: '10px', marginBottom: '12px' },
  catBtn: { flex: 1, padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600 },
  inputWrap: { display: 'flex', background: '#eee', padding: '8px', borderRadius: '12px', alignItems: 'center' },
  addBtn: { background: '#146654', color: '#fff', border: 'none', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer' },
  catLabel: { fontSize: '12px', color: '#888', fontWeight: 600, marginBottom: '5px' },
  taskRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #eee' },
  wrongBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer' },
  // Mindmap
  mindCanvas: { position: 'relative', minHeight: '80vh' },
  hint: { fontSize: '12px', color: '#888', textAlign: 'center' },
  treeWrapper: { display: 'flex', justifyContent: 'center', marginTop: '20px', overflowX: 'auto', paddingBottom: '100px' },
  treeRow: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  nodeColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  mindCard: { background: '#fff', padding: '15px', borderRadius: '12px', cursor: 'pointer', minWidth: '100px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  nodeInput: { border: 'none', textAlign: 'center', outline: 'none', width: '80px', fontWeight: 600 },
  branchBtn: { marginTop: '5px', background: '#fff', border: '1px solid #146654', color: '#146654', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer' },
  childContainer: { marginTop: '20px', borderTop: '2px solid #ddd', paddingTop: '20px' },
  mindFooter: { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', width: '90%', maxWidth: '400px' },
  mainAdd: { flex: 4, background: '#146654', color: '#fff', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: 700, cursor: 'pointer' },
  delBtn: { flex: 1, background: '#eee', border: 'none', borderRadius: '15px', cursor: 'pointer' }
};
