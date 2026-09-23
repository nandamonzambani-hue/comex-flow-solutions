import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { DownloadItem } from "@/types/database";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function DownloadsScreen() {
  const { t } = useTranslation();
  const parishId = useParishId();
  const [items, setItems] = useState<DownloadItem[]>([]);

  useEffect(() => {
    if (!parishId) return;
    supabase
      .from("downloads")
      .select("*")
      .eq("parish_id", parishId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as DownloadItem[]) ?? []));
  }, [parishId]);

  async function handleDownload(item: DownloadItem) {
    const localUri = FileSystem.documentDirectory + item.title.replace(/\s+/g, "_");
    const { uri } = await FileSystem.downloadAsync(item.file_url, localUri);
    await supabase
      .from("downloads")
      .update({ download_count: item.download_count + 1 })
      .eq("id", item.id);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  }

  return (
    <ScreenContainer>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("downloads.empty")} />}
        renderItem={({ item }) => (
          <Card onPress={() => handleDownload(item)}>
            <Text style={styles.title}>{item.title}</Text>
            {item.description && <Text style={styles.description}>{item.description}</Text>}
            <Text style={styles.meta}>
              {item.file_type?.toUpperCase()} · {formatSize(item.file_size_bytes)}
            </Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "700", color: colors.textPrimary, fontSize: 15 },
  description: { color: colors.textSecondary, marginTop: 4 },
  meta: { color: colors.primary, marginTop: 6, fontSize: 12, fontWeight: "600" },
});
