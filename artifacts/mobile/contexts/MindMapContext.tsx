import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type MindMapNode = {
  id: string;
  text: string;
  children: MindMapNode[];
};

type Ctx = {
  roots: MindMapNode[];
  ready: boolean;
  addRoot: () => string;
  addChild: (parentId: string) => string;
  updateText: (id: string, text: string) => void;
  removeNode: (id: string) => void;
};

const MindMapContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "mindmap.roots.v1";

const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

const createNode = (): MindMapNode => ({
  id: newId(),
  text: "",
  children: [],
});

function addChildIn(
  nodes: MindMapNode[],
  parentId: string,
  child: MindMapNode,
): MindMapNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) return { ...n, children: [...n.children, child] };
    return { ...n, children: addChildIn(n.children, parentId, child) };
  });
}

function updateTextIn(
  nodes: MindMapNode[],
  id: string,
  text: string,
): MindMapNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, text };
    return { ...n, children: updateTextIn(n.children, id, text) };
  });
}

function removeIn(nodes: MindMapNode[], id: string): MindMapNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: removeIn(n.children, id) }));
}

export function MindMapProvider({ children }: { children: React.ReactNode }) {
  const [roots, setRoots] = useState<MindMapNode[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setRoots(JSON.parse(raw));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(roots)).catch(() => {});
  }, [roots, ready]);

  const addRoot = useCallback(() => {
    const node = createNode();
    setRoots((prev) => [...prev, node]);
    return node.id;
  }, []);

  const addChild = useCallback((parentId: string) => {
    const node = createNode();
    setRoots((prev) => addChildIn(prev, parentId, node));
    return node.id;
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    setRoots((prev) => updateTextIn(prev, id, text));
  }, []);

  const removeNode = useCallback((id: string) => {
    setRoots((prev) => removeIn(prev, id));
  }, []);

  const value = useMemo(
    () => ({ roots, ready, addRoot, addChild, updateText, removeNode }),
    [roots, ready, addRoot, addChild, updateText, removeNode],
  );

  return (
    <MindMapContext.Provider value={value}>{children}</MindMapContext.Provider>
  );
}

export function useMindMap() {
  const ctx = useContext(MindMapContext);
  if (!ctx) throw new Error("useMindMap must be used within MindMapProvider");
  return ctx;
}
