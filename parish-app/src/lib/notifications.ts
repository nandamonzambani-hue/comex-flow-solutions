import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { supabase } from "@/lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Pede permissão e registra o token Expo Push do dispositivo para o membro logado. */
export async function registerPushToken(profileId: string) {
  if (!Device.isDevice) return; // simuladores não recebem push

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  const token = tokenResponse.data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await supabase.from("push_tokens").upsert(
    {
      profile_id: profileId,
      token,
      device_type: Platform.OS,
    },
    { onConflict: "token" },
  );
}

/** Chama a Edge Function que dispara notificações (uso restrito a staff/admin). */
export async function sendNotification(params: {
  title: string;
  message: string;
  target_type: "all" | "group" | "role";
  target_id?: string;
}) {
  const { data, error } = await supabase.functions.invoke("send-push-notification", {
    body: params,
  });
  if (error) throw error;
  return data as { sent: number };
}
