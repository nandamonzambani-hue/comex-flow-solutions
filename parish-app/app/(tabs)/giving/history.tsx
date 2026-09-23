import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useDateLocale } from "@/lib/dateLocale";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Donation } from "@/types/database";

export default function GivingHistoryScreen() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const { profile } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);

  const STATUS_LABEL: Record<Donation["payment_status"], string> = {
    pending: t("giving.status.pending"),
    processing: t("giving.status.processing"),
    completed: t("giving.status.completed"),
    failed: t("giving.status.failed"),
    refunded: t("giving.status.refunded"),
    cancelled: t("giving.status.cancelled"),
  };

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("donations")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setDonations((data as Donation[]) ?? []));
  }, [profile]);

  return (
    <ScreenContainer>
      <FlatList
        data={donations}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={t("giving.emptyHistory")} />}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.amount}>R$ {item.amount.toFixed(2)}</Text>
            <Text style={styles.date}>{format(new Date(item.created_at), "dd/MM/yyyy · HH:mm", { locale: dateLocale })}</Text>
            <Badge
              label={STATUS_LABEL[item.payment_status]}
              tone={item.payment_status === "completed" ? "success" : item.payment_status === "failed" ? "warning" : "default"}
            />
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  amount: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  date: { color: colors.textSecondary, marginBottom: 8, marginTop: 2 },
});
