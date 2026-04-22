import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MindMapNodeView } from "@/components/MindMapNodeView";
import { useMindMap } from "@/contexts/MindMapContext";
import { useColors } from "@/hooks/useColors";

export default function MindMapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { roots, addRoot } = useMindMap();

  const onAddRoot = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    addRoot();
  };

  const webBottom = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 120 + insets.bottom + webBottom,
        }}
      >
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Tap a card to edit. Use + to branch a connected idea.
        </Text>
        {roots.length === 0 ? (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Feather name="git-branch" size={28} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                marginTop: 10,
              }}
            >
              Start your first thought
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                textAlign: "center",
                marginTop: 6,
              }}
            >
              Tap the Add button below to drop your first idea on the canvas.
            </Text>
          </View>
        ) : (
          roots.map((node) => (
            <MindMapNodeView key={node.id} node={node} depth={0} />
          ))
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16 + webBottom,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={onAddRoot}
          style={({ pressed }) => [
            styles.addBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius * 2,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Feather name="plus" size={22} color={colors.primaryForeground} />
          <Text
            style={{
              color: colors.primaryForeground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              marginLeft: 8,
            }}
          >
            Add
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: "Inter_400Regular", marginBottom: 8 },
  empty: {
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    marginTop: 20,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    minWidth: 180,
    justifyContent: "center",
  },
});
