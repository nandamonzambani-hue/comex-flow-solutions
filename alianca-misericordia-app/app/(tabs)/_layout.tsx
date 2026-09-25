import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors, useTheme } from "@/theme/colors";

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("tabs.home"), tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="videos"
        options={{ title: t("tabs.videos"), tabBarIcon: ({ color, size }) => <Ionicons name="play-circle" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="events"
        options={{ title: t("tabs.events"), tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="groups"
        options={{ title: t("tabs.groups"), tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: t("tabs.more"), tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
