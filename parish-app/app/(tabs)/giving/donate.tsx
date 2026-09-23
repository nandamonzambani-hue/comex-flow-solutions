import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button, Card } from "@/components/ui";
import { colors } from "@/theme/colors";

const QUICK_AMOUNTS = [20, 50, 100, 200];

export default function DonateScreen() {
  const params = useLocalSearchParams<{ kind?: string; campaignId?: string }>();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<{ code: string; qrBase64?: string } | null>(null);

  async function handlePay() {
    const numericAmount = Number(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: {
        amount: numericAmount,
        campaign_id: params.campaignId,
        payment_method: "pix",
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Erro ao gerar Pix", error.message);
      return;
    }
    if (data?.pix_qr_code) {
      setPix({ code: data.pix_qr_code, qrBase64: data.pix_qr_code_base64 });
    } else {
      Alert.alert("Pagamento em processamento", "Verifique seu histórico em instantes.");
    }
  }

  async function copyCode() {
    if (!pix) return;
    await Clipboard.setStringAsync(pix.code);
    Alert.alert("Copiado", "Código Pix copiado. Cole no app do seu banco para concluir o pagamento.");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>
        {params.kind === "dizimo" ? "Valor do dízimo" : "Valor da contribuição"}
      </Text>

      <View style={styles.quickRow}>
        {QUICK_AMOUNTS.map((v) => (
          <Text key={v} style={styles.quickAmount} onPress={() => setAmount(String(v))}>
            R$ {v}
          </Text>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="R$ 0,00"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      {!pix ? (
        <Button title="Gerar Pix" onPress={handlePay} loading={loading} disabled={!amount} />
      ) : (
        <Card>
          <Text style={styles.pixTitle}>Escaneie ou copie o código Pix</Text>
          {pix.qrBase64 && (
            <Image
              source={{ uri: `data:image/png;base64,${pix.qrBase64}` }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.pixCode} numberOfLines={3}>
            {pix.code}
          </Text>
          <Button title="Copiar código Pix" onPress={copyCode} variant="secondary" />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: colors.background, flexGrow: 1, gap: 12 },
  label: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  quickRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  quickAmount: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: colors.primary,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  pixTitle: { fontWeight: "700", color: colors.textPrimary, marginBottom: 10, textAlign: "center" },
  qrImage: { width: 220, height: 220, alignSelf: "center", marginBottom: 10 },
  pixCode: { color: colors.textSecondary, marginBottom: 12, textAlign: "center" },
});
