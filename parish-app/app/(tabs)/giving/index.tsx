import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useParishId } from "@/hooks/useParish";
import { Button, Card, SectionTitle } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Campaign } from "@/types/database";

export default function GivingScreen() {
  const parishId = useParishId();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!parishId) return;
    supabase
      .from("campaigns")
      .select("*")
      .eq("parish_id", parishId)
      .eq("status", "active")
      .then(({ data }) => setCampaigns((data as Campaign[]) ?? []));
  }, [parishId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.intro}>
        "Cada um contribua segundo o que decidiu no seu coração" (2Cor 9,7). Sua contribuição sustenta a vida e as
        obras da nossa paróquia.
      </Text>

      <View style={{ gap: 10 }}>
        <Button title="Dízimo mensal" onPress={() => router.push({ pathname: "/(tabs)/giving/donate", params: { kind: "dizimo" } })} />
        <Button
          title="Fazer uma oferta"
          variant="secondary"
          onPress={() => router.push({ pathname: "/(tabs)/giving/donate", params: { kind: "oferta" } })}
        />
        <Button title="Ver meu histórico" variant="outline" onPress={() => router.push("/(tabs)/giving/history")} />
      </View>

      <SectionTitle>Campanhas e festas ativas</SectionTitle>
      {campaigns.map((campaign) => {
        const progress = campaign.goal_amount ? Math.min(campaign.current_amount / campaign.goal_amount, 1) : 0;
        return (
          <Card key={campaign.id} onPress={() => router.push(`/(tabs)/giving/campaign/${campaign.id}`)}>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            {campaign.goal_amount && (
              <>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  R$ {campaign.current_amount.toFixed(2)} de R$ {campaign.goal_amount.toFixed(2)}
                </Text>
              </>
            )}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1 },
  intro: { color: colors.textSecondary, fontStyle: "italic", marginBottom: 20, lineHeight: 20 },
  campaignName: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.secondary },
  progressText: { color: colors.textSecondary, marginTop: 6, fontSize: 13 },
});
