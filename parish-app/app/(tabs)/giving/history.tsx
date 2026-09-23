import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Badge, Card, EmptyState, ScreenContainer } from "@/components/ui";
import { colors } from "@/theme/colors";
import type { Donation } from "@/types/database";

const STATUS_LABEL: Record<Donation["payment_status"], string> = {
  pending: "Pendente",
  processing: "Processando",
  completed: "Confirmado",
  failed: "Falhou",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
};

export default function GivingHistoryScreen() {
  const { profile } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);

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
        ListEmptyComponent={<EmptyState message="Você ainda não fez nenhuma contribuição." />}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.amount}>R$ {item.amount.toFixed(2)}</Text>
            <Text style={styles.date}>{format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</Text>
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
