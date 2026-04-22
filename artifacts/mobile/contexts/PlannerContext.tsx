import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Task = { id: string; text: string; done: boolean };
export type MealKey = "breakfast" | "lunch" | "dinner" | "snacks";
export type Meal = { id: MealKey; label: string; done: boolean };

export type DayPlan = {
  date: string; // yyyy-mm-dd
  priorities: [string, string, string];
  tasks: Task[];
  water: number; // glasses (0-8)
  meals: Meal[];
  notes: string;
  wakeTime: string;
  sleepTime: string;
};

const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const defaultPlan = (date: string): DayPlan => ({
  date,
  priorities: ["", "", ""],
  tasks: [],
  water: 0,
  meals: [
    { id: "breakfast", label: "Breakfast", done: false },
    { id: "lunch", label: "Lunch", done: false },
    { id: "dinner", label: "Dinner", done: false },
    { id: "snacks", label: "Snacks", done: false },
  ],
  notes: "",
  wakeTime: "07:00",
  sleepTime: "23:00",
});

type Ctx = {
  plan: DayPlan;
  ready: boolean;
  setPriority: (index: 0 | 1 | 2, value: string) => void;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  setWater: (n: number) => void;
  toggleMeal: (id: MealKey) => void;
  setNotes: (text: string) => void;
  setWakeTime: (t: string) => void;
  setSleepTime: (t: string) => void;
};

const PlannerContext = createContext<Ctx | null>(null);

const keyFor = (date: string) => `planner.day.${date}`;

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [date] = useState(() => todayKey());
  const [plan, setPlan] = useState<DayPlan>(() => defaultPlan(date));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(keyFor(date));
        if (raw) {
          const parsed = JSON.parse(raw) as DayPlan;
          setPlan({ ...defaultPlan(date), ...parsed });
        }
      } finally {
        setReady(true);
      }
    })();
  }, [date]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(keyFor(date), JSON.stringify(plan)).catch(() => {});
  }, [plan, ready, date]);

  const setPriority = useCallback((index: 0 | 1 | 2, value: string) => {
    setPlan((p) => {
      const priorities = [...p.priorities] as [string, string, string];
      priorities[index] = value;
      return { ...p, priorities };
    });
  }, []);

  const addTask = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setPlan((p) => ({
      ...p,
      tasks: [...p.tasks, { id: newId(), text: t, done: false }],
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setPlan((p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }, []);

  const removeTask = useCallback((id: string) => {
    setPlan((p) => ({ ...p, tasks: p.tasks.filter((t) => t.id !== id) }));
  }, []);

  const setWater = useCallback((n: number) => {
    setPlan((p) => ({ ...p, water: Math.max(0, Math.min(8, n)) }));
  }, []);

  const toggleMeal = useCallback((id: MealKey) => {
    setPlan((p) => ({
      ...p,
      meals: p.meals.map((m) => (m.id === id ? { ...m, done: !m.done } : m)),
    }));
  }, []);

  const setNotes = useCallback((text: string) => {
    setPlan((p) => ({ ...p, notes: text }));
  }, []);

  const setWakeTime = useCallback((t: string) => {
    setPlan((p) => ({ ...p, wakeTime: t }));
  }, []);
  const setSleepTime = useCallback((t: string) => {
    setPlan((p) => ({ ...p, sleepTime: t }));
  }, []);

  const value = useMemo(
    () => ({
      plan,
      ready,
      setPriority,
      addTask,
      toggleTask,
      removeTask,
      setWater,
      toggleMeal,
      setNotes,
      setWakeTime,
      setSleepTime,
    }),
    [
      plan,
      ready,
      setPriority,
      addTask,
      toggleTask,
      removeTask,
      setWater,
      toggleMeal,
      setNotes,
      setWakeTime,
      setSleepTime,
    ],
  );

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}
