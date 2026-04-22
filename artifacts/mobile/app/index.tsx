import { Feather } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, ready, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) {
    return (
      <View
        style={[styles.center, { backgroundColor: colors.background, flex: 1 }]}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (user) return <Redirect href="/home" />;

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") await signIn(email, password);
      else await signUp(name, email, password);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {},
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const webTop = Platform.OS === "web" ? 67 : 0;
  const webBottom = Platform.OS === "web" ? 34 : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 24 + webTop,
            paddingBottom: insets.bottom + 24 + webBottom,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.logoCircle,
            { backgroundColor: colors.primary, borderRadius: colors.radius * 2 },
          ]}
        >
          <Feather name="check-square" size={28} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Daily Planner
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Plan your day. Map your mind.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View
            style={[
              styles.tabs,
              { backgroundColor: colors.muted, borderRadius: colors.radius - 4 },
            ]}
          >
            {(["signin", "signup"] as const).map((m) => {
              const active = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => {
                    setMode(m);
                    setError(null);
                  }}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: active ? colors.card : "transparent",
                      borderRadius: colors.radius - 6,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                      color: active ? colors.foreground : colors.mutedForeground,
                    }}
                  >
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mode === "signup" ? (
            <Field
              icon="user"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          ) : null}
          <Field
            icon="mail"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            icon="lock"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <Text style={{ color: colors.destructive, marginTop: 4 }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={busy}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius,
                opacity: busy || pressed ? 0.85 : 1,
              },
            ]}
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text
                style={{
                  color: colors.primaryForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                }}
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Your data stays on this device.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field(props: {
  icon: keyof typeof Feather.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (s: string) => void;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words";
  secureTextEntry?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.field,
        {
          borderColor: colors.border,
          borderRadius: colors.radius - 4,
          backgroundColor: colors.background,
        },
      ]}
    >
      <Feather name={props.icon} size={18} color={colors.mutedForeground} />
      <TextInput
        style={[styles.input, { color: colors.foreground }]}
        placeholder={props.placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        secureTextEntry={props.secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, alignItems: "stretch", gap: 12 },
  center: { alignItems: "center", justifyContent: "center" },
  logoCircle: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  tabs: { flexDirection: "row", padding: 4, marginBottom: 6 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular" },
  primaryBtn: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
  },
  hint: { textAlign: "center", marginTop: 16, fontFamily: "Inter_400Regular" },
});
