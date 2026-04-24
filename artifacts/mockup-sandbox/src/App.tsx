import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Circle, Home, Briefcase, 
  Droplets, Coffee, Edit3, Trash2, Plus, GitBranch,
  ChevronRight, BrainCircuit
} from 'lucide-react';

// --- SHARED STYLES & CONSTANTS ---
const COLORS = {
  primary: '#3b82f6',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  muted: '#64748b',
  border: '#e2e8f0',
  success: '#22c55e'
};

const MEAL_ICONS = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍱',
  snacks: '🍎'
};

export default function CombinedApp() {
  const [activeTab, setActiveTab] = useState('planner');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* TOP NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex justify-around shadow-sm">
        <button 
          onClick={() => setActiveTab('planner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${activeTab === 'planner' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Calendar size={18} />
          <span className="font-medium">Planner</span>
        </button>
        <button 
          onClick={() => setActiveTab('mindmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${activeTab === 'mindmap' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <BrainCircuit size={18} />
          <span className="font-medium">Mindmap</span>
        </button>
      </nav>

      {/* APP CONTENT */}
      <div className="max-w-md mx-auto mt-4 px-4">
        {activeTab === 'planner' ? <PlannerView /> : <MindmapView />}
      </div>
    </div>
  );
}

// --- PLANNER COMPONENT ---
function PlannerView() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Morning Exercise', done: true, category: 'home' },
    { id: 2, text: 'Team Sync', done: false, category: 'work' },
  ]);
  const [water, setWater] = useState(3);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask, done: false, category: 'home' }]);
    setNewTask('');
  };

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Daily Focus</h1>
        <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* Priorities Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h2 className="flex items-center gap-2 font-semibold mb-4 text-blue-600">
          <CheckCircle2 size={18} /> Top 3 Priorities
        </h2>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
            <span className="text-slate-300 font-bold text-lg">{i}</span>
            <input type="text" placeholder="Set priority..." className="w-full bg-transparent border-b border-slate-100 focus:border-blue-400 outline-none py-1 transition" />
          </div>
        ))}
      </div>

      {/* Water Tracker */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h2 className="flex items-center gap-2 font-semibold mb-4 text-cyan-500">
          <Droplets size={18} /> Water <span className="text-slate-400 font-normal ml-auto text-xs">{water}/8 glasses</span>
        </h2>
        <div className="flex justify-between">
          {[...Array(8)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => setWater(i + 1)}
              className={`transition-all duration-300 ${i < water ? 'text-cyan-500 scale-110' : 'text-slate-200'}`}
            >
              <Droplets size={24} fill={i < water ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 font-semibold">
          <Plus size={18} className="text-blue-500" />
          <input 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a quick task..." 
            className="w-full bg-transparent outline-none" 
          />
        </div>
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 group">
              <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t))}>
                {task.done ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-slate-300" />}
              </button>
              <span className={`flex-1 ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.text}</span>
              <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- MINDMAP COMPONENT ---
function MindmapView() {
  const [nodes, setNodes] = useState([
    { id: 1, text: 'Main Idea', color: '#3b82f6' }
  ]);

  const addNode = () => {
    setNodes([...nodes, { id: Date.now(), text: 'New Thought', color: '#94a3b8' }]);
  };

  return (
    <div className="flex flex-col items-center pt-8">
      <div className="text-center mb-8">
        <GitBranch size={48} className="mx-auto text-blue-500 mb-2 opacity-50" />
        <p className="text-slate-400 text-sm italic italic">Capture your thoughts visually</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 w-full">
        {nodes.map(node => (
          <div 
            key={node.id} 
            className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-100/50 border-2 border-slate-100 min-w-[140px] text-center animate-in zoom-in-90 duration-300"
          >
            <input 
              defaultValue={node.text}
              className="font-bold text-center bg-transparent outline-none text-slate-700 w-full"
            />
            <div className="flex justify-center gap-2 mt-4">
              <button className="p-1 text-slate-300 hover:text-blue-500"><Plus size={16}/></button>
              <button 
                onClick={() => setNodes(nodes.filter(n => n.id !== node.id))}
                className="p-1 text-slate-300 hover:text-red-400"
              ><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={addNode}
          className="flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-slate-200 text-slate-300 hover:border-blue-300 hover:text-blue-400 transition-all active:scale-95"
        >
          <Plus size={32} />
          <span className="text-xs font-semibold mt-2 uppercase tracking-widest">Add Root</span>
        </button>
      </div>
    </div>
  );
      }


