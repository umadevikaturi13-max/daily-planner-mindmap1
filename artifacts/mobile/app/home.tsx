import { Feather } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
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

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut, ready } = useAuth();

  if (ready && !user) return <Redirect href="/" />;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const go = (path: "/mindmap" | "/planner") => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    router.push(path);
  };

  const webTop = Platform.OS === "web" ? 67 : 0;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 16 + webTop,
        paddingBottom: insets.bottom + 24 + webBottom,
        paddingHorizontal: 20,
      }}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {greeting},
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user?.name ?? "there"}
          </Text>
        </View>
        <Pressable
          onPress={signOut}
          hitSlop={10}
          style={({ pressed }) => [
            styles.signOut,
            {
              backgroundColor: colors.muted,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="log-out" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <Text style={[styles.lead, { color: colors.foreground }]}>
        What would you like to work on?
      </Text>

      <Pressable
        onPress={() => go("/mindmap")}
        style={({ pressed }) => [
          styles.bigCard,
          {
            backgroundColor: colors.primary,
            borderRadius: colors.radius * 1.4,
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        <View style={styles.cardIconWrap}>
          <Feather name="git-branch" size={28} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.primaryForeground }]}>
            Mind Map
          </Text>
          <Text
            style={[styles.cardSubtitle, { color: colors.primaryForeground }]}
          >
            Branch out ideas and connect them
          </Text>
        </View>
        <Feather name="arrow-right" size={22} color={colors.primaryForeground} />
      </Pressable>

      <Pressable
        onPress={() => go("/planner")}
        style={({ pressed }) => [
          styles.bigCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: colors.radius * 1.4,
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.cardIconWrap,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Feather name="calendar" size={28} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Daily Planner
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
            Priorities, tasks, water and meals
          </Text>
        </View>
        <Feather name="arrow-right" size={22} color={colors.foreground} />
      </Pressable>

      <View
        style={[
          styles.tipCard,
          {
            backgroundColor: colors.secondary,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Feather name="sun" size={18} color={colors.accent} />
        <Text style={{ color: colors.secondaryForeground, flex: 1 }}>
          Small steps every day add up to something remarkable.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 15 },
  name: { fontFamily: "Inter_700Bold", fontSize: 26, marginTop: 2 },
  signOut: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  lead: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    marginBottom: 16,
  },
  bigCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 14,
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 19 },
  cardSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 3,
    opacity: 0.9,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginTop: 10,
  },
});
