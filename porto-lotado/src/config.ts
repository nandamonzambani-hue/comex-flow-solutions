import { Capacitor } from '@capacitor/core';

export const platform = Capacitor.getPlatform() as 'android' | 'ios' | 'web';
export const isNative = platform !== 'web';

const env = import.meta.env;
const pick = (android: string | undefined, ios: string | undefined, fallback: { android: string; ios: string }) =>
  platform === 'ios' ? ios || fallback.ios : android || fallback.android;

// IDs de teste públicos do Google. Só servem anúncios de teste e nunca geram receita.
const TEST = {
  rewarded: { android: 'ca-app-pub-3940256099942544/5224354917', ios: 'ca-app-pub-3940256099942544/1712485313' },
  interstitial: { android: 'ca-app-pub-3940256099942544/1033173712', ios: 'ca-app-pub-3940256099942544/4411468910' },
};

export const ADMOB = {
  rewarded: pick(env.VITE_ADMOB_REWARDED_ANDROID, env.VITE_ADMOB_REWARDED_IOS, TEST.rewarded),
  interstitial: pick(env.VITE_ADMOB_INTERSTITIAL_ANDROID, env.VITE_ADMOB_INTERSTITIAL_IOS, TEST.interstitial),
  testing: env.VITE_ADMOB_TESTING !== 'false',
};

export const REVENUECAT_KEY = platform === 'ios' ? env.VITE_REVENUECAT_IOS : env.VITE_REVENUECAT_ANDROID;

// Identificadores que precisam existir iguais no Google Play Console, no App Store Connect e no RevenueCat.
export const PRODUCTS = {
  noAds: 'no_ads', // não consumível
  coins500: 'coins_500', // consumível
} as const;
export const ENTITLEMENT_NO_ADS = 'no_ads';

// Economia do jogo, em um só lugar para ajustar com base nos dados.
export const ECONOMY = {
  freeUndosPerLevel: 3,
  undosPerAd: 3,
  interstitialEvery: 3, // níveis
  interstitialFromLevel: 3,
  goldHullPrice: 300,
  coinPack: 500,
};
