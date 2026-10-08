import {
  AdMob, AdmobConsentStatus, InterstitialAdPluginEvents, RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { ADMOB, isNative, platform } from '../config';

export type AdKind = 'rewarded' | 'interstitial';
/** Mostra um anúncio falso na interface (navegador e desenvolvimento). Resolve `true` se o jogador assistiu até o fim. */
export type AdSimulator = (kind: AdKind) => Promise<boolean>;

let simulator: AdSimulator = async () => true;
let ready = false;
let rewardedLoaded = false;
let interstitialLoaded = false;

export const adsSimulated = !isNative;
export const setAdSimulator = (fn: AdSimulator) => { simulator = fn; };

export async function initAds(): Promise<void> {
  if (!isNative) return;
  try {
    // Consentimento LGPD/GDPR (formulário UMP do Google) antes de qualquer pedido de anúncio.
    const consent = await AdMob.requestConsentInfo();
    if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
      await AdMob.showConsentForm();
    }
    // iOS: pedido de permissão de rastreamento (ATT).
    if (platform === 'ios') {
      const { status } = await AdMob.trackingAuthorizationStatus();
      if (status === 'notDetermined') await AdMob.requestTrackingAuthorization();
    }
    await AdMob.initialize({ initializeForTesting: ADMOB.testing });

    await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => { rewardedLoaded = false; void preloadRewarded(); });
    await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => { rewardedLoaded = false; });
    await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => { interstitialLoaded = false; void preloadInterstitial(); });
    await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => { interstitialLoaded = false; });

    ready = true;
    void preloadRewarded();
    void preloadInterstitial();
  } catch (e) {
    console.warn('[ads] init falhou', e);
  }
}

async function preloadRewarded() {
  if (!ready || rewardedLoaded) return;
  try { await AdMob.prepareRewardVideoAd({ adId: ADMOB.rewarded, isTesting: ADMOB.testing }); rewardedLoaded = true; }
  catch { rewardedLoaded = false; }
}

async function preloadInterstitial() {
  if (!ready || interstitialLoaded) return;
  try { await AdMob.prepareInterstitial({ adId: ADMOB.interstitial, isTesting: ADMOB.testing }); interstitialLoaded = true; }
  catch { interstitialLoaded = false; }
}

/** Anúncio com recompensa. Resolve `true` só se o jogador ganhou a recompensa. */
export async function showRewarded(): Promise<boolean> {
  if (!isNative) return simulator('rewarded');
  if (!ready) return false;
  try {
    if (!rewardedLoaded) await preloadRewarded();
    if (!rewardedLoaded) return false;
    rewardedLoaded = false;
    const reward = await AdMob.showRewardVideoAd();
    return !!reward && reward.amount > 0;
  } catch (e) {
    console.warn('[ads] rewarded falhou', e);
    return false;
  }
}

/** Anúncio entre níveis. Nunca bloqueia o jogo: se não houver anúncio pronto, segue em frente. */
export async function showInterstitial(): Promise<void> {
  if (!isNative) { await simulator('interstitial'); return; }
  if (!ready || !interstitialLoaded) { void preloadInterstitial(); return; }
  try { interstitialLoaded = false; await AdMob.showInterstitial(); }
  catch (e) { console.warn('[ads] interstitial falhou', e); }
}
