import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useLocalizedField } from "@/lib/localized";
import { Button } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Campaign } from "@/types/database";

export default function CampaignDetailScreen() {
  const { t } = useTranslation();
  const localize = useLocalizedField();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setCampaign(data as Campaign));
  }, [id]);

  if (!campaign) return null;

  const progress = campaign.goal_amount ? Math.min(campaign.current_amount / campaign.goal_amount, 1) : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {campaign.cover_image_url && (
        <Image source={{ uri: campaign.cover_image_url }} style={styles.cover} contentFit="cover" />
      )}
      <Text style={styles.title}>{localize(campaign, "name")}</Text>
      {campaign.description && <Text style={styles.description}>{localize(campaign, "description")}</Text>}

      {campaign.goal_amount && (
        <View style={{ marginVertical: 16 }}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {t("giving.campaignProgress", {
              current: campaign.current_amount.toFixed(2),
              goal: campaign.goal_amount.toFixed(2),
              percent: Math.round(progress * 100),
            })}
          </Text>
        </View>
      )}

      <Button
        title={t("giving.contributeToCampaign")}
        onPress={() => router.push({ pathname: "/(tabs)/giving/donate", params: { campaignId: campaign.id } })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  cover: { width: "100%", height: 180, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  description: { color: colors.textSecondary, marginTop: 10, lineHeight: 21 },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: colors.border, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.secondary },
  progressText: { color: colors.textSecondary, marginTop: 8 },
});
