import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { type MindMapNode, useMindMap } from "@/contexts/MindMapContext";

type Props = { node: MindMapNode; depth: number };

export function MindMapNodeView({ node, depth }: Props) {
  const colors = useColors();
  const { addChild, updateText, removeNode } = useMindMap();
  const [editing, setEditing] = useState(node.text === "");
  const [draft, setDraft] = useState(node.text);

  const commit = () => {
    updateText(node.id, draft.trim());
    setEditing(false);
  };

  const onAddChild = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    addChild(node.id);
  };

  const onRemove = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    removeNode(node.id);
  };

  return (
    <View style={[styles.wrap, depth > 0 && { marginLeft: 22 }]}>
      <View style={styles.row}>
        {depth > 0 ? (
          <View
            style={[
              styles.connector,
              { borderColor: colors.border, backgroundColor: "transparent" },
            ]}
          />
        ) : null}
        <View
          style={[
            styles.box,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          {editing ? (
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onBlur={commit}
              onSubmitEditing={commit}
              autoFocus
              placeholder="Idea…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              returnKeyType="done"
            />
          ) : (
            <Pressable onPress={() => setEditing(true)} style={styles.textWrap}>
              <Text
                style={[styles.text, { color: colors.foreground }]}
                numberOfLines={2}
              >
                {node.text || "Tap to edit"}
              </Text>
            </Pressable>
          )}
          <View style={styles.actions}>
            <Pressable
              onPress={onAddChild}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            </Pressable>
            <Pressable
              onPress={onRemove}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconBtn,
                {
                  backgroundColor: colors.muted,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      </View>
      {node.children.length > 0 ? (
        <View style={styles.children}>
          {node.children.map((c) => (
            <MindMapNodeView key={c.id} node={c} depth={depth + 1} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  connector: {
    width: 14,
    height: 2,
    borderTopWidth: 2,
    marginRight: 4,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#0a2a22",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  textWrap: { flex: 1 },
  text: { fontSize: 15, fontFamily: "Inter_500Medium" },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    padding: 0,
  },
  actions: { flexDirection: "row", gap: 6 },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  children: {
    borderLeftWidth: 2,
    borderLeftColor: "transparent",
    paddingLeft: 0,
  },
});
