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

type Props = { node: MindMapNode };

const BOX_WIDTH = 140;
const STEM = 14;
const ROW_GAP = 12;

export function MindMapNodeView({ node }: Props) {
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

  const hasChildren = node.children.length > 0;
  const childCount = node.children.length;

  return (
    <View style={styles.subtree}>
      <Pressable
        onLongPress={onRemove}
        onPress={() => setEditing(true)}
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
            multiline
          />
        ) : (
          <Text
            style={[styles.text, { color: colors.foreground }]}
            numberOfLines={3}
          >
            {node.text || "Tap to edit"}
          </Text>
        )}
      </Pressable>

      {/* Stem down to the + button */}
      <View
        style={[styles.vLine, { backgroundColor: colors.border, height: STEM }]}
      />
      <Pressable
        onPress={onAddChild}
        hitSlop={6}
        style={({ pressed }) => [
          styles.plusBtn,
          {
            borderColor: colors.primary,
            backgroundColor: colors.background,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="plus" size={14} color={colors.primary} />
      </Pressable>

      {hasChildren ? (
        <>
          <View
            style={[styles.vLine, { backgroundColor: colors.border, height: STEM }]}
          />
          <View style={styles.childrenRow}>
            {node.children.map((c, i) => {
              const isFirst = i === 0;
              const isLast = i === childCount - 1;
              const single = childCount === 1;
              return (
                <View key={c.id} style={styles.childCol}>
                  {/* Top connector: left half if not first, right half if not last */}
                  <View style={styles.connectorRow}>
                    <View
                      style={{
                        flex: 1,
                        height: 2,
                        backgroundColor:
                          single || isFirst ? "transparent" : colors.border,
                      }}
                    />
                    <View
                      style={{
                        flex: 1,
                        height: 2,
                        backgroundColor:
                          single || isLast ? "transparent" : colors.border,
                      }}
                    />
                  </View>
                  {/* Vertical drop into the child subtree */}
                  <View
                    style={[
                      styles.vLine,
                      { backgroundColor: colors.border, height: STEM },
                    ]}
                  />
                  <MindMapNodeView node={c} />
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  subtree: { alignItems: "center" },
  box: {
    width: BOX_WIDTH,
    minHeight: 56,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0a2a22",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  text: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  input: {
    width: "100%",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    padding: 0,
  },
  vLine: {
    width: 2,
  },
  plusBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  childrenRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 0,
    gap: ROW_GAP,
  },
  childCol: {
    alignItems: "center",
    minWidth: BOX_WIDTH,
  },
  connectorRow: {
    flexDirection: "row",
    width: "100%",
    height: 2,
  },
});
