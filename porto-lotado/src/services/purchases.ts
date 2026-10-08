import { Purchases, LOG_LEVEL, type PurchasesPackage, type CustomerInfo } from '@revenuecat/purchases-capacitor';
import { ENTITLEMENT_NO_ADS, PRODUCTS, REVENUECAT_KEY, isNative } from '../config';

export type ProductId = (typeof PRODUCTS)[keyof typeof PRODUCTS];
export type BuyResult = 'ok' | 'cancelled' | 'error';

/** Sem chave do RevenueCat (navegador ou build de desenvolvimento) a loja é simulada e não cobra nada. */
export const storeSimulated = !isNative || !REVENUECAT_KEY;

const FALLBACK_PRICES: Record<ProductId, string> = { no_ads: 'R$ 14,90', coins_500: 'R$ 4,90' };
const packages = new Map<string, PurchasesPackage>();

export async function initPurchases(): Promise<void> {
  if (storeSimulated) return;
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
    await Purchases.configure({ apiKey: REVENUECAT_KEY! });
    const offerings = await Purchases.getOfferings();
    for (const p of offerings.current?.availablePackages ?? []) packages.set(p.product.identifier, p);
  } catch (e) {
    console.warn('[iap] init falhou', e);
  }
}

export function priceOf(id: ProductId): string {
  const p = packages.get(id);
  return p ? p.product.priceString : FALLBACK_PRICES[id];
}

const hasNoAds = (info: CustomerInfo) => !!info.entitlements.active[ENTITLEMENT_NO_ADS];

export async function buy(id: ProductId): Promise<BuyResult> {
  if (storeSimulated) return 'ok';
  const aPackage = packages.get(id);
  if (!aPackage) return 'error';
  try {
    await Purchases.purchasePackage({ aPackage });
    return 'ok';
  } catch (e) {
    return (e as { userCancelled?: boolean }).userCancelled ? 'cancelled' : 'error';
  }
}

/** Consulta a loja: a compra de "Remover anúncios" continua valendo se o jogador reinstalar o app ou trocar de aparelho. */
export async function ownsNoAds(): Promise<boolean | null> {
  if (storeSimulated) return null;
  try { return hasNoAds((await Purchases.getCustomerInfo()).customerInfo); }
  catch { return null; }
}

export async function restore(): Promise<boolean | null> {
  if (storeSimulated) return null;
  try { return hasNoAds((await Purchases.restorePurchases()).customerInfo); }
  catch { return null; }
}
