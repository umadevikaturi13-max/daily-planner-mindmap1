import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  type MealKey,
  type TaskCategory,
  usePlanner,
} from "@/contexts/PlannerContext";
import { useColors } from "@/hooks/useColors";

const MEAL_ICONS: Record<MealKey, keyof typeof MaterialCommunityIcons.glyphMap> = {
  breakfast: "coffee",
  lunch: "food",
  dinner: "food-turkey",
  snacks: "food-apple",
};

export default function PlannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    plan,
    setPriority,
    addTask,
    toggleTask,
    removeTask,
    setWater,
    toggleMeal,
    setNotes,
    setWakeTime,
    setSleepTime,
  } = usePlanner();
  const [newTask, setNewTask] = useState("");
  const [taskCategory, setTaskCategory] = useState<TaskCategory>("home");

  const dateLabel = new Date(plan.date + "T00:00:00").toLocaleDateString(
    undefined,
    { weekday: "long", month: "long", day: "numeric" },
  );

  const submitTask = () => {
    if (!newTask.trim()) return;
    addTask(newTask, taskCategory);
    setNewTask("");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const onWater = (n: number) => {
    setWater(n);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const webBottom = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 18,
        paddingBottom: insets.bottom + 24 + webBottom,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Text style={[styles.dateBig, { color: colors.foreground }]}>
          {dateLabel}
        </Text>
        <Text style={{ color: colors.mutedForeground }}>Today's plan</Text>
      </View>

      {/* Schedule */}
      <Section title="Schedule" icon="clock" colors={colors}>
        <View style={styles.row2}>
          <TimeField
            label="Wake up"
            value={plan.wakeTime}
            onChange={setWakeTime}
          />
          <TimeField
            label="Sleep"
            value={plan.sleepTime}
            onChange={setSleepTime}
          />
        </View>
      </Section>

      {/* Priorities */}
      <Section title="Top 3 Priorities" icon="star" colors={colors}>
        {[0, 1, 2].map((i) => {
          const idx = i as 0 | 1 | 2;
          const value = plan.priorities[idx];
          const empty = value.trim() === "";
          return (
            <View
              key={i}
              style={[
                styles.priorityRow,
                {
                  borderColor: colors.border,
                  borderRadius: colors.radius - 4,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <View
                style={[
                  styles.priorityNum,
                  { backgroundColor: colors.primary, borderRadius: 14 },
                ]}
              >
                <Text
                  style={{
                    color: colors.primaryForeground,
                    fontFamily: "Inter_700Bold",
                  }}
                >
                  {i + 1}
                </Text>
              </View>
              <TextInput
                value={value}
                onChangeText={(t) => setPriority(idx, t)}
                placeholder={`Priority ${i + 1}`}
                placeholderTextColor={colors.mutedForeground}
                style={[styles.priorityInput, { color: colors.foreground }]}
              />
              <Pressable
                onPress={() => {
                  if (empty) return;
                  setPriority(idx, "");
                  if (Platform.OS !== "web") {
                    Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Success,
                    ).catch(() => {});
                  }
                }}
                disabled={empty}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.priorityDone,
                  {
                    borderColor: empty ? colors.border : colors.primary,
                    backgroundColor: empty ? "transparent" : colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Feather
                  name="check"
                  size={16}
                  color={empty ? colors.mutedForeground : colors.primaryForeground}
                />
              </Pressable>
            </View>
          );
        })}
      </Section>

      {/* Tasks */}
      <Section title="To-Do" icon="check-circle" colors={colors}>
        <View style={styles.tabsRow}>
          {(["home", "work"] as TaskCategory[]).map((cat) => {
            const active = taskCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setTaskCategory(cat)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.muted,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: colors.radius - 6,
                  },
                ]}
              >
                <Feather
                  name={cat === "home" ? "home" : "briefcase"}
                  size={14}
                  color={active ? colors.primaryForeground : colors.mutedForeground}
                />
                <Text
                  style={{
                    color: active ? colors.primaryForeground : colors.mutedForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  {cat === "home" ? "Home" : "Work"}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View
          style={[
            styles.addTaskRow,
            {
              borderColor: colors.border,
              borderRadius: colors.radius - 4,
              backgroundColor: colors.background,
            },
          ]}
        >
          <TextInput
            value={newTask}
            onChangeText={setNewTask}
            onSubmitEditing={submitTask}
            placeholder={`Add a ${taskCategory} task`}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.taskInput, { color: colors.foreground }]}
            returnKeyType="done"
          />
          <Pressable
            onPress={submitTask}
            style={({ pressed }) => [
              styles.addBtnSm,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius - 6,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="plus" size={18} color={colors.primaryForeground} />
          </Pressable>
        </View>
        {(["home", "work"] as TaskCategory[]).map((cat) => {
          const items = plan.tasks.filter((t) => t.category === cat);
          return (
            <View key={cat} style={{ marginTop: 6 }}>
              <View style={styles.groupHeader}>
                <Feather
                  name={cat === "home" ? "home" : "briefcase"}
                  size={13}
                  color={colors.primary}
                />
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  {cat === "home" ? "Home" : "Work"}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                  {items.filter((t) => t.done).length}/{items.length}
                </Text>
              </View>
              {items.length === 0 ? (
                <Text
                  style={{
                    color: colors.mutedForeground,
                    paddingVertical: 6,
                    fontSize: 13,
                  }}
                >
                  No {cat} tasks yet.
                </Text>
              ) : (
                items.map((t) => (
                  <View
                    key={t.id}
                    style={[styles.taskRow, { borderBottomColor: colors.border }]}
                  >
                    <Pressable
                      onPress={() => {
                        toggleTask(t.id);
                        if (Platform.OS !== "web") {
                          Haptics.selectionAsync().catch(() => {});
                        }
                      }}
                      style={[
                        styles.checkbox,
                        {
                          borderColor: t.done ? colors.primary : colors.border,
                          backgroundColor: t.done ? colors.primary : "transparent",
                        },
                      ]}
                    >
                      {t.done ? (
                        <Feather
                          name="check"
                          size={14}
                          color={colors.primaryForeground}
                        />
                      ) : null}
                    </Pressable>
                    <Text
                      style={[
                        styles.taskText,
                        {
                          color: t.done ? colors.mutedForeground : colors.foreground,
                          textDecorationLine: t.done ? "line-through" : "none",
                        },
                      ]}
                    >
                      {t.text}
                    </Text>
                    <Pressable onPress={() => removeTask(t.id)} hitSlop={8}>
                      <Feather name="x" size={18} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </Section>

      {/* Water */}
      <Section title="Water" icon="droplet" colors={colors}>
        <Text
          style={{
            color: colors.mutedForeground,
            marginBottom: 10,
          }}
        >
          {plan.water} of 8 glasses
        </Text>
        <View style={styles.waterRow}>
          {Array.from({ length: 8 }).map((_, i) => {
            const filled = i < plan.water;
            return (
              <Pressable
                key={i}
                onPress={() => onWater(i + 1 === plan.water ? i : i + 1)}
                style={[
                  styles.waterCup,
                  {
                    backgroundColor: filled ? colors.primary : colors.muted,
                    borderColor: filled ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name="droplet"
                  size={16}
                  color={filled ? colors.primaryForeground : colors.mutedForeground}
                />
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* Meals */}
      <Section title="Meals" icon="coffee" colors={colors}>
        <Text style={{ color: colors.mutedForeground, marginBottom: 10 }}>
          {plan.meals.filter((m) => m.done).length} of {plan.meals.length} eaten
        </Text>
        <View style={styles.mealRow}>
          {plan.meals.map((m) => {
            const icon = MEAL_ICONS[m.id];
            return (
              <Pressable
                key={m.id}
                onPress={() => {
                  toggleMeal(m.id);
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync().catch(() => {});
                  }
                }}
                style={[
                  styles.mealCell,
                  {
                    backgroundColor: m.done ? colors.primary : colors.muted,
                    borderColor: m.done ? colors.primary : colors.border,
                    borderRadius: colors.radius - 4,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={icon}
                  size={26}
                  color={m.done ? colors.primaryForeground : colors.mutedForeground}
                />
                <Text
                  style={{
                    color: m.done ? colors.primaryForeground : colors.mutedForeground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* Notes */}
      <Section title="Notes" icon="edit-3" colors={colors}>
        <TextInput
          value={plan.notes}
          onChangeText={setNotes}
          multiline
          placeholder="Reflections, gratitude, ideas…"
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.notes,
            {
              color: colors.foreground,
              borderColor: colors.border,
              backgroundColor: colors.background,
              borderRadius: colors.radius - 4,
            },
          ]}
        />
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  icon,
  children,
  colors,
}: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionIcon,
            { backgroundColor: colors.secondary, borderRadius: 10 },
          ]}
        >
          <Feather name={icon} size={16} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
}) {
  const colors = useColors();
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: colors.mutedForeground,
          fontFamily: "Inter_500Medium",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="HH:MM"
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.timeInput,
          {
            color: colors.foreground,
            borderColor: colors.border,
            backgroundColor: colors.background,
            borderRadius: colors.radius - 4,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dateBig: { fontFamily: "Inter_700Bold", fontSize: 22, marginBottom: 2 },
  section: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  row2: { flexDirection: "row", gap: 12 },
  timeInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  priorityNum: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    marginBottom: 2,
  },
  addTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  taskInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
  },
  addBtnSm: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  taskText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  waterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  waterCup: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mealRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mealCell: {
    flexBasis: "47%",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderWidth: 1,
  },
  priorityDone: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  notes: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 100,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
  },
});
