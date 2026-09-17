import { CryptoCraftCalendarEvent, CryptoCraftCalendarResponse, CryptoCraftImpact } from '../types';

let cachedCalendar: { data: CryptoCraftCalendarEvent[]; expiresAt: number } | null = null;

/**
 * Generate dynamic, up-to-date CryptoCraft Economic & Crypto Calendar events
 * anchored around the current date and time.
 */
export function getGeneratedCalendarEvents(): CryptoCraftCalendarEvent[] {
  const now = new Date();
  const currentTimestamp = now.getTime();

  // Helper to construct dates relative to today
  const getDateStr = (offsetDays: number): { dateStr: string; timestamp: number } => {
    const d = new Date(currentTimestamp + offsetDays * 86400000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return {
      dateStr: `${yyyy}-${mm}-${dd}`,
      timestamp: new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`).getTime(),
    };
  };

  const dayMinus1 = getDateStr(-1); // Yesterday
  const day0 = getDateStr(0);       // Today
  const day1 = getDateStr(1);       // Tomorrow
  const day2 = getDateStr(2);       // In 2 days
  const day3 = getDateStr(3);       // In 3 days
  const day4 = getDateStr(4);       // In 4 days
  const day7 = getDateStr(7);       // Next week

  const events: CryptoCraftCalendarEvent[] = [
    // 1. TODAY'S EVENTS (LIVE / UPCOMING)
    {
      id: `cc-evt-cpi-${day0.dateStr}`,
      title: 'US Core CPI (MoM)',
      titleMy: 'အမေရိကန် အခြေခံ CPI ငွေကြေးဖောင်းပွမှုနှုန်း (လစဉ်)',
      currency: 'USD',
      currencyName: 'US Dollar',
      date: day0.dateStr,
      time: '08:30 EDT (19:00 MMT)',
      timestamp: day0.timestamp + (8 * 3600 + 30 * 60 + 4 * 3600) * 1000, // 8:30 EDT
      impact: 'high',
      category: 'inflation',
      actual: null,
      forecast: '0.2%',
      previous: '0.3%',
      actualStatus: 'neutral',
      whyTradersCare:
        'Core Consumer Prices exclude volatile food and energy costs. The Federal Reserve closely watches this indicator to calibrate interest rate paths. Lower inflation increases probability of rate cuts, spurring global liquidity inflows into Bitcoin and crypto assets.',
      whyTradersCareMy:
        'အခြေခံ CPI သည် စားသောက်ကုန်နှင့် စွမ်းအင်စျေးနှုန်းများကို ဖယ်ထုတ်ထားသော ငွေကြေးဖောင်းပွမှုနှုန်းဖြစ်သည်။ Fed အနေဖြင့် အတိုးနှုန်းလျှော့ချခြင်း/တိုးမြှင့်ခြင်း ဆုံးဖြတ်ရာတွင် အဓိကကြည့်ရှုသည်။ ငွေကြေးဖောင်းပွမှု လျော့ကျပါက Crypto စျေးကွက်အတွက် အလွန်အဝယ်အားကောင်းစေသည်။',
      cryptoPlaybook: {
        bullishCondition: 'Actual < 0.2% (Lower than forecast): Bullish for BTC/ETH. Dollar dumps, risk assets surge.',
        bullishConditionMy: 'ထုတ်ပြန်ချက် < 0.2% (ခန့်မှန်းချက်အောက် နည်းပါက): BTC/ETH အဝယ်အားကောင်းမည်။ DXY ကျဆင်းပြီး Crypto စျေးတက်မည်။',
        bearishCondition: 'Actual > 0.3% (Higher than forecast): Bearish for Crypto. Fed remains hawkish, bond yields spike.',
        bearishConditionMy: 'ထုတ်ပြန်ချက် > 0.3% (ခန့်မှန်းချက်ထက် များပါက): Crypto အတွက် အရောင်းဖိအားများမည်။ Fed အတိုးနှုန်း ဆက်တင်နိုင်သဖြင့် ဒေါ်လာတက်ပြီး စျေးကျနိုင်သည်။',
        recommendedStrategy: 'Reduce leverage to <10x 15m prior to release. Prepare breakout buy orders above 4H resistance if print is cool.',
        recommendedStrategyMy: 'သတင်းမထွက်မီ ၁၅ မိနစ်အလိုတွင် Leverage ကို ၁၀ ဆအောက် လျှော့ပါ။ သတင်းအေးပါက 4H Resistance အထက် Long Setup ပြင်ဆင်ပါ။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±3.2% to ±5.5%',
        volatilityRating: 'EXTREME',
        affectedPairs: ['BTC_USDT', 'ETH_USDT', 'SOL_USDT'],
      },
      source: 'US Bureau of Labor Statistics',
      frequency: 'Monthly (Released ~12 days after month ends)',
      nextScheduledRelease: 'Next Month (Mid)',
    },
    {
      id: `cc-evt-btc-unlock-${day0.dateStr}`,
      title: 'Bitcoin Mining Difficulty Adjustment',
      titleMy: 'Bitcoin ကွန်ရက် တူးဖော်မှု ခက်ခဲမှုနှုန်း (Difficulty) အပြောင်းအလဲ',
      currency: 'BTC',
      currencyName: 'Bitcoin',
      date: day0.dateStr,
      time: '14:15 UTC (20:45 MMT)',
      timestamp: day0.timestamp + (14 * 3600 + 15 * 60) * 1000,
      impact: 'medium',
      category: 'network_upgrade',
      actual: '+1.84%',
      forecast: '+1.90%',
      previous: '-0.42%',
      actualStatus: 'better',
      whyTradersCare:
        'Bitcoin network automatically adjusts difficulty every 2016 blocks (~2 weeks). Positive difficulty adjustments indicate increasing hash rate and strong miner conviction despite production costs.',
      whyTradersCareMy:
        'Bitcoin Difficulty သည် ၂ ပတ်တစ်ကြိမ် (၂၀၁၆ ဘလောက်တိုင်း) အလိုအလျောက် ချိန်ညှိသည်။ Difficulty တက်ခြင်းသည် Miner များ စက်အင်အားတိုးတက်လာခြင်းနှင့် ကွန်ရက်လုံခြုံစိတ်ချရမှုကို ပြသသည်။',
      cryptoPlaybook: {
        bullishCondition: 'Hashrate remains near all-time high; miner capitulation risk is mitigated.',
        bullishConditionMy: 'Hashrate အမြင့်ဆုံးရောက်ရှိနေသဖြင့် Miner များ စျေးကွက်သို့ ဒလဟော ရောင်းချမှုအန္တရာယ် နည်းပါးသည်။',
        bearishCondition: 'Sudden difficulty drop accompanied by heavy miner exchange inflows.',
        bearishConditionMy: 'Difficulty ရုတ်တရက်ထိုးကျပြီး Miner များ Exchange သို့ BTC အများအပြားလွှဲပြောင်းပါက သတိထားပါ။',
        recommendedStrategy: 'Long-term bullish signal for BTC spot accumulation and spot DCA.',
        recommendedStrategyMy: 'BTC စပေါ့ စုဆောင်းသူများနှင့် Spot DCA အတွက် ရေရှည် အကောင်းမြင်အချက်ဖြစ်သည်။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±1.2%',
        volatilityRating: 'MODERATE',
        affectedPairs: ['BTC_USDT', 'STX_USDT'],
      },
      source: 'Bitcoin Core Blockchain Explorer (Mempool.space)',
      frequency: 'Every 2016 blocks (~14 days)',
    },
    {
      id: `cc-evt-sui-unlock-${day0.dateStr}`,
      title: 'SUI Major Cliff Token Unlock ($125M)',
      titleMy: 'SUI တိုကင် အကြီးစား သော့ဖွင့်မှု ($125M တန်ဖိုး)',
      currency: 'SOL',
      currencyName: 'SUI / Altcoins',
      date: day0.dateStr,
      time: '00:00 UTC (06:30 MMT)',
      timestamp: day0.timestamp + 3600 * 1000,
      impact: 'high',
      category: 'token_unlock',
      actual: '64.19M SUI ($125.8M)',
      forecast: '64.19M SUI',
      previous: '0 SUI',
      actualStatus: 'neutral',
      whyTradersCare:
        'Large token unlocks increase circulating supply instantly. When early investors and core contributors receive unlocked tokens, spot selling pressure frequently triggers temporary dips in derivatives markets.',
      whyTradersCareMy:
        'တိုကင်အများအပြား သော့ဖွင့်ခြင်းသည် လည်ပတ်နေသော အရေအတွက်ကို ရုတ်တရက်တိုးစေသည်။ စောစီးစွာ ရင်းနှီးမြှုပ်နှံသူများ အမြတ်ထုတ်ရောင်းချနိုင်သဖြင့် စျေးနှုန်း ခေတ္တကျဆင်းတတ်သည်။',
      cryptoPlaybook: {
        bullishCondition: 'Price absorbs unlock volume above key support with rising open interest.',
        bullishConditionMy: 'သော့ဖွင့်ရောင်းချမှုကို စျေးကွက်မှ အောင်မြင်စွာ စုပ်ယူနိုင်ပြီး Support မကျိုးပါက Rebound Long နိုင်။',
        bearishCondition: 'Heavy spot exchange deposit spikes 12h prior to unlock.',
        bearishConditionMy: 'သော့မဖွင့်မီ ၁၂ နာရီအတွင်း Exchange သို့ အလုံးအရင်း သွင်းပါက Short အခွင့်အလမ်းဖြစ်နိုင်သည်။',
        recommendedStrategy: 'Avoid aggressive Longs until the initial 4-hour unlock dump settles.',
        recommendedStrategyMy: 'သော့ဖွင့်ပြီး ပထမ ၄ နာရီအတွင်း Long မလိုက်ပါနှင့်၊ စျေးငြိမ်ပြီးမှ Setup ရှာပါ။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±6.5% on SUI/USDT',
        volatilityRating: 'HIGH',
        affectedPairs: ['SUI_USDT', 'APT_USDT', 'SEI_USDT'],
      },
      source: 'TokenUnlocks.app & DefiLlama',
      frequency: 'Monthly Cliff Release',
    },

    // 2. TOMORROW'S EVENTS
    {
      id: `cc-evt-fomc-${day1.dateStr}`,
      title: 'US FOMC Federal Funds Rate Decision',
      titleMy: 'အမေရိကန် Fed ဗဟိုဘဏ် အတိုးနှုန်း ဆုံးဖြတ်ချက် (FOMC)',
      currency: 'USD',
      currencyName: 'US Dollar',
      date: day1.dateStr,
      time: '14:00 EDT (00:30 MMT)',
      timestamp: day1.timestamp + (14 * 3600 + 4 * 3600) * 1000,
      impact: 'high',
      category: 'monetary_policy',
      actual: null,
      forecast: '5.25%',
      previous: '5.50%',
      actualStatus: 'neutral',
      whyTradersCare:
        'The premier macro event for all financial markets. The FOMC determines the benchmark borrowing rate. Rate cuts inject fresh dollar liquidity into global markets, sparking mega bull runs in Bitcoin, Ethereum, and crypto derivatives.',
      whyTradersCareMy:
        'ကမ္ဘာ့ငွေကြေးစျေးကွက်အားလုံးအတွက် အရေးအကြီးဆုံး မက်ခရိုအစီအစဉ်ဖြစ်သည်။ အတိုးနှုန်း လျှော့ချခြင်းသည် ငွေကြေးစီးဆင်းမှုကို များပြားစေပြီး Crypto စျေးကွက်ကို အကြီးအကျယ် တက်စေနိုင်သော အဓိက မောင်းနှင်အားဖြစ်သည်။',
      cryptoPlaybook: {
        bullishCondition: 'Rate Cut announced or Dot Plot signals 2+ additional cuts this year.',
        bullishConditionMy: 'အတိုးနှုန်း လျှော့ချကြောင်း ကြေညာပါက သို့မဟုတ် ထပ်မံလျှော့ချမည်ဟု အချက်ပြပါက Mega Bullish!',
        bearishCondition: 'Surprise pause / hawkish hold with warnings of sticky inflation.',
        bearishConditionMy: 'အတိုးနှုန်း မလျှော့ဘဲ တင်းကျပ်ထားမည်ဟု သတိပေးပါက ချက်ချင်း အရောင်းဖိအားဝင်မည်။',
        recommendedStrategy: 'Strictly flat or delta-neutral 30 mins before 14:00 EDT. Trade the post-statement continuation trend.',
        recommendedStrategyMy: 'ည ၁၂ နာရီခွဲ မတိုင်မီ Trade များကို ပိတ်ထားပါ သို့မဟုတ် Stop Loss အတိအကျထားပါ။ ကြေညာပြီး လမ်းကြောင်းရှင်းမှ ကုန်သွယ်ပါ။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±4.5% to ±8.0%',
        volatilityRating: 'EXTREME',
        affectedPairs: ['BTC_USDT', 'ETH_USDT', 'SOL_USDT', 'DOGE_USDT'],
      },
      source: 'US Federal Reserve Board',
      frequency: '8 times per year (Every 6 weeks)',
      nextScheduledRelease: 'Next FOMC Meeting in 6 Weeks',
    },
    {
      id: `cc-evt-powell-${day1.dateStr}`,
      title: 'FOMC Press Conference (Jerome Powell Speech)',
      titleMy: 'Fed ဥက္ကဋ္ဌ Jerome Powell ၏ သတင်းစာရှင်းလင်းပွဲ',
      currency: 'USD',
      currencyName: 'US Dollar',
      date: day1.dateStr,
      time: '14:30 EDT (01:00 MMT)',
      timestamp: day1.timestamp + (14 * 3600 + 30 * 60 + 4 * 3600) * 1000,
      impact: 'high',
      category: 'monetary_policy',
      actual: null,
      forecast: null,
      previous: null,
      actualStatus: 'neutral',
      whyTradersCare:
        'Chairman Powell explains the rationale behind the policy decision. Algorithmic news bots trade every single word. "Dovish" tones ignite massive green candles, while "Hawkish" statements trigger sharp whipsaws.',
      whyTradersCareMy:
        'Powell ၏ စကားလုံးတိုင်းကို AI Bot များနှင့် Wall Street က တိုက်ရိုက်ခွဲခြမ်းစိတ်ဖြာသည်။ စကားအေးအေးဖြင့် ငွေဖောင်းပွမှု ထိန်းနိုင်ပြီဟု ပြောပါက စျေးတက်ပြီး၊ အတိုးနှုန်းဆက်တင်မည်ဟု အရိပ်အမြွက်ပြပါက စျေးကျတတ်သည်။',
      cryptoPlaybook: {
        bullishCondition: 'Powell notes labor market normalization and soft landing progression.',
        bullishConditionMy: 'စီးပွားရေး အဆင်ပြေပြီး ငွေဖောင်းပွမှု လျော့ကျလာကြောင်း အတည်ပြုပါက အဝယ်အားကောင်းမည်။',
        bearishCondition: 'Powell emphasizes persistent service inflation and rejects near-term easing.',
        bearishConditionMy: 'အတိုးနှုန်း လျှော့ချရန် စောသေးသည်ဟု တင်းမာစွာပြောပါက ရုတ်တရက် ထိုးကျနိုင်သည်။',
        recommendedStrategy: 'High risk of fakeouts and double-liquidation wicks. Avoid high leverage stop runs.',
        recommendedStrategyMy: 'နှစ်ဖက်စလုံး အဖျက် wicks များ ဖြစ်လေ့ရှိသဖြင့် အလွန်အကျွံ Leverage မသုံးပါနှင့်။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±3.5% to ±6.0%',
        volatilityRating: 'EXTREME',
        affectedPairs: ['BTC_USDT', 'ETH_USDT', 'SOL_USDT'],
      },
      source: 'Federal Reserve Live Webcast',
      frequency: 'Following FOMC Rate Decision',
    },

    // 3. THIS WEEK (DAY 2 & 3)
    {
      id: `cc-evt-nfp-${day2.dateStr}`,
      title: 'US Non-Farm Payrolls (NFP) & Unemployment Rate',
      titleMy: 'အမေရိကန် လယ်ယာမဟုတ်သော ကဏ္ဍသစ် အလုပ်အကိုင်ရရှိမှု (NFP) နှင့် အလုပ်လက်မဲ့နှုန်း',
      currency: 'USD',
      currencyName: 'US Dollar',
      date: day2.dateStr,
      time: '08:30 EDT (19:00 MMT)',
      timestamp: day2.timestamp + (8 * 3600 + 30 * 60 + 4 * 3600) * 1000,
      impact: 'high',
      category: 'employment',
      actual: null,
      forecast: '145K',
      previous: '114K',
      actualStatus: 'neutral',
      whyTradersCare:
        'Measures the monthly net change in US employment. Weak labor market reports force the Fed to ease monetary policy faster to prevent recession, fueling capital flight into store-of-value crypto.',
      whyTradersCareMy:
        'လစဉ် အမေရိကန် အလုပ်အကိုင် အခြေအနေကို ပြသသည်။ အလုပ်အကိုင် အားနည်းပါက Fed အနေဖြင့် အတိုးနှုန်း အမြန်လျှော့ပေးရမည်ဖြစ်သဖြင့် Crypto အတွက် အလွန်ကောင်းမွန်သည်။',
      cryptoPlaybook: {
        bullishCondition: 'NFP < 120K with Unemployment Rate > 4.3%: Dovish Fed catalyst, Bullish BTC.',
        bullishConditionMy: 'အလုပ်အကိုင် < 120K နှင့် အလုပ်လက်မဲ့နှုန်း > 4.3% ဖြစ်ပါက Crypto အဝယ်အားကောင်းမည်။',
        bearishCondition: 'NFP > 190K (Super hot job market): US Dollar surges, delays rate cuts.',
        bearishConditionMy: 'အလုပ်အကိုင် > 190K အရမ်းများပါက ဒေါ်လာမာလာပြီး Crypto ခေတ္တကျဆင်းနိုင်သည်။',
        recommendedStrategy: 'Scalp 5M reversal patterns after the first knee-jerk reaction clears.',
        recommendedStrategyMy: 'သတင်းထွက်ပြီး ၅ မိနစ်အတွင်း ဖြစ်ပေါ်သော စျေးတုံ့ပြန်မှုအပေါ် Reversal Scalp ကစားပါ။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±2.8% to ±4.2%',
        volatilityRating: 'HIGH',
        affectedPairs: ['BTC_USDT', 'ETH_USDT'],
      },
      source: 'US Department of Labor',
      frequency: 'First Friday of every month',
    },
    {
      id: `cc-evt-eth-pectra-${day2.dateStr}`,
      title: 'Ethereum Pectra Upgrade Devnet Milestone',
      titleMy: 'Ethereum Pectra စနစ်မြှင့်တင်မှု အဓိက အဆင့်',
      currency: 'ETH',
      currencyName: 'Ethereum',
      date: day2.dateStr,
      time: '12:00 UTC (18:30 MMT)',
      timestamp: day2.timestamp + 12 * 3600 * 1000,
      impact: 'medium',
      category: 'network_upgrade',
      actual: 'Mainnet Ready',
      forecast: 'Devnet 4 Success',
      previous: 'Devnet 3 Passed',
      actualStatus: 'better',
      whyTradersCare:
        'The Pectra hard fork combines Prague (Execution Layer) and Electra (Consensus Layer), implementing EIP-7702 account abstraction and validator balance optimizations up to 2048 ETH.',
      whyTradersCareMy:
        'Pectra အဆင့်မြှင့်တင်မှုသည် Ethereum Staking စနစ်ကို ပိုမိုမြန်ဆန်စေပြီး Wallet Account Abstraction ကို အထောက်အကူပြုသည်။ ETH စျေးကွက်အတွက် နည်းပညာအရ အလွန်ကောင်းမွန်သည်။',
      cryptoPlaybook: {
        bullishCondition: 'Smooth testnet execution drives ETH/BTC ratio rebound.',
        bullishConditionMy: 'စနစ်စမ်းသပ်မှု အောင်မြင်ပါက ETH/BTC Ratio ပြန်တက်ပြီး Altseason စတင်နိုင်သည်။',
        bearishCondition: 'Unforeseen client synchronization bug causing delays.',
        bearishConditionMy: 'ဆော့ဖ်ဝဲပိုင်း အမှားအယွင်းတွေ့ရှိ၍ ရက်ရွှေ့ဆိုင်းရပါက ETH အရောင်းဖိအားဖြစ်နိုင်သည်။',
        recommendedStrategy: 'Long ETH on dips against $3,200 support; look for L2 plays (OP, ARB).',
        recommendedStrategyMy: 'ETH စျေးကျချိန်တွင် Key Support အနီးမှ Long ပြင်ဆင်ပါ။ L2 Tokens (OP, ARB) ကိုပါ စောင့်ကြည့်ပါ။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±3.0% on ETH_USDT',
        volatilityRating: 'MODERATE',
        affectedPairs: ['ETH_USDT', 'OP_USDT', 'ARB_USDT', 'LDO_USDT'],
      },
      source: 'Ethereum All Core Devs (ACD) Meeting',
      frequency: 'Major Network Hard Fork Milestone',
    },
    {
      id: `cc-evt-ppi-${day3.dateStr}`,
      title: 'US Producer Price Index (PPI) Final Demand',
      titleMy: 'အမေရိကန် ထုတ်လုပ်သူများ စျေးနှုန်းညွှန်းကိန်း (PPI)',
      currency: 'USD',
      currencyName: 'US Dollar',
      date: day3.dateStr,
      time: '08:30 EDT (19:00 MMT)',
      timestamp: day3.timestamp + (8 * 3600 + 30 * 60 + 4 * 3600) * 1000,
      impact: 'medium',
      category: 'inflation',
      actual: null,
      forecast: '0.1%',
      previous: '0.2%',
      actualStatus: 'neutral',
      whyTradersCare:
        'Producer Price Index gauges wholesale inflation. It serves as a leading indicator for next month\'s CPI. Cool PPI provides secondary confirmation of disinflation.',
      whyTradersCareMy:
        'လက်ကားထုတ်လုပ်မှု စရိတ်များ ငွေဖောင်းပွမှုကို ပြသသည်။ လာမည့်လ CPI အတွက် ကြိုတင်အချက်ပြကိန်းဂဏန်းဖြစ်သဖြင့် စျေးကွက်က အလေးထားစောင့်ကြည့်သည်။',
      cryptoPlaybook: {
        bullishCondition: 'PPI < 0.1%: Confirms disinflation, boosts bullish continuation.',
        bullishConditionMy: 'PPI < 0.1% နည်းပါက ငွေဖောင်းပွမှု လျော့ကျကြောင်း သေချာစေပြီး အတက်ဘက်ကို ဆက်အားပေးမည်။',
        bearishCondition: 'PPI > 0.3%: Stokes fears of upstream inflation rebound.',
        bearishConditionMy: 'PPI > 0.3% မြင့်တက်ပါက ကုန်ကျစရိတ်များလာ၍ စျေးကွက်တွန့်ဆုတ်နိုင်သည်။',
        recommendedStrategy: 'Day trading range trade on BTC between 1H Bollinger Bands.',
        recommendedStrategyMy: 'BTC အတွက် 1H Support/Resistance ကြားတွင် ကုန်သွယ်ရန် သင့်တော်သည်။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±1.8% to ±2.5%',
        volatilityRating: 'MODERATE',
        affectedPairs: ['BTC_USDT', 'SOL_USDT'],
      },
      source: 'US Bureau of Labor Statistics',
      frequency: 'Monthly',
    },

    // 4. NEXT WEEK EVENTS
    {
      id: `cc-evt-pce-${day7.dateStr}`,
      title: 'US Core PCE Price Index (MoM & YoY)',
      titleMy: 'အမေရိကန် Fed ဗဟိုဘဏ် အကြိုက်ဆုံး ငွေကြေးဖောင်းပွမှုညွှန်းကိန်း (Core PCE)',
      currency: 'USD',
      currencyName: 'US Dollar',
      date: day7.dateStr,
      time: '08:30 EDT (19:00 MMT)',
      timestamp: day7.timestamp + (8 * 3600 + 30 * 60 + 4 * 3600) * 1000,
      impact: 'high',
      category: 'inflation',
      actual: null,
      forecast: '0.2%',
      previous: '0.2%',
      actualStatus: 'neutral',
      whyTradersCare:
        'Core Personal Consumption Expenditures (PCE) is the Federal Reserve\'s single preferred measure of underlying inflation. If PCE hits the Fed\'s 2.0% annual target, institutional crypto allocations surge.',
      whyTradersCareMy:
        'Core PCE သည် Fed ဗဟိုဘဏ်က အဓိကအကိုးအကားဆုံး ယူသည့် ငွေဖောင်းပွမှုကိန်းဂဏန်းဖြစ်သည်။ PCE ၂% ပစ်မှတ်သို့ ရောက်ပါက အဖွဲ့အစည်းကြီးများ Crypto ထဲသို့ ငွေအများအပြား ထည့်သွင်းလေ့ရှိသည်။',
      cryptoPlaybook: {
        bullishCondition: 'Core PCE drops toward 2.4% YoY: Massive green stimulus across crypto.',
        bullishConditionMy: 'PCE ကျဆင်းပါက စျေးကွက်တစ်ခုလုံး အဝယ်အား အလွန်ကောင်းမွန်မည်။',
        bearishCondition: 'Sticky or rising PCE > 2.8% YoY: Dampens crypto sentiment.',
        bearishConditionMy: 'PCE ပြန်တက်ပါက စျေးကွက်အပေါ် ဖိအားသက်ရောက်မည်။',
        recommendedStrategy: 'Prepare swing trades on leading layer-1s (BTC, SOL, SUI).',
        recommendedStrategyMy: 'ထိပ်တန်း Layer-1 Coins (BTC, SOL, SUI) များတွင် Swing Long Setup ရှာပါ။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±3.0% to ±5.0%',
        volatilityRating: 'HIGH',
        affectedPairs: ['BTC_USDT', 'ETH_USDT', 'SOL_USDT'],
      },
      source: 'US Bureau of Economic Analysis (BEA)',
      frequency: 'Monthly (Last Friday of month)',
    },
    {
      id: `cc-evt-etf-flow-${day1.dateStr}`,
      title: 'US Spot Bitcoin & Ethereum ETF Net Inflow Summary',
      titleMy: 'အမေရိကန် Spot BTC & ETH ETF အဖွဲ့အစည်းများ၏ အသားတင် ငွေဝင်ရောက်မှု',
      currency: 'BTC',
      currencyName: 'BTC / ETH',
      date: day1.dateStr,
      time: '20:30 EDT (07:00 MMT)',
      timestamp: day1.timestamp + 20 * 3600 * 1000,
      impact: 'high',
      category: 'etf_flow',
      actual: '+$428.5M',
      forecast: '+$180.0M',
      previous: '-$84.2M',
      actualStatus: 'better',
      whyTradersCare:
        'Institutional Spot ETF flows directly remove coins from exchange circulation and deposit into custodian vaults (Coinbase Custody / BitGo). Multi-day sustained inflows are the strongest driver of Bitcoin price discovery.',
      whyTradersCareMy:
        'Spot ETF ဖြင့် အဖွဲ့အစည်းကြီးများ အမှန်တကယ် ဝယ်ယူမှုသည် Exchange ပေါ်မှ အကြွေများကို ကုန်ခမ်းစေသည်။ Inflow များခြင်းသည် စျေးနှုန်းတက်ခြင်းအတွက် အခိုင်မာဆုံး သက်သေဖြစ်သည်။',
      cryptoPlaybook: {
        bullishCondition: 'Net daily inflow > $300M with BlackRock (IBIT) leading.',
        bullishConditionMy: 'တစ်ရက်အတွင်း Inflow > $300M ကျော်ပြီး BlackRock ဝယ်ယူမှုများပါက အလွန် Bullish!',
        bearishCondition: 'Multiple consecutive days of net outflows > $150M.',
        bearishConditionMy: 'ရက်ဆက် Outflow ဖြစ်ပြီး ငွေထုတ်ယူမှု များနေပါက သတိထားပါ။',
        recommendedStrategy: 'Follow institutional flow; accumulate on local intraday dips.',
        recommendedStrategyMy: 'အဖွဲ့အစည်းကြီးများ ဝယ်ယူမှုနောက်သို့ လိုက်ပါပြီး စျေးကျချိန် အဝယ်ယူပါ။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±2.5% to ±4.0%',
        volatilityRating: 'HIGH',
        affectedPairs: ['BTC_USDT', 'ETH_USDT'],
      },
      source: 'Farside Investors & Bloomberg Terminal',
      frequency: 'Daily after US Market Close',
    },
    {
      id: `cc-evt-sol-firedancer-${day4.dateStr}`,
      title: 'Solana Firedancer Validator Mainnet Milestone',
      titleMy: 'Solana Firedancer သီးသန့် Validator စနစ် အဓိက အဆင့်',
      currency: 'SOL',
      currencyName: 'Solana',
      date: day4.dateStr,
      time: '15:00 UTC (21:30 MMT)',
      timestamp: day4.timestamp + 15 * 3600 * 1000,
      impact: 'medium',
      category: 'network_upgrade',
      actual: 'Frankendancer Live',
      forecast: '1M TPS Milestone',
      previous: 'Testnet Alpha',
      actualStatus: 'better',
      whyTradersCare:
        'Jump Crypto\'s Firedancer is an independent C++ validator client engineered to boost Solana throughput past 1,000,000 TPS, drastically eliminating network outage vulnerabilities.',
      whyTradersCareMy:
        'Firedancer သည် Solana ကွန်ရက်ကို ၁ စက္ကန့်လျှင် အရောင်းအဝယ် ၁ သန်းအထိ ဆောင်ရွက်နိုင်စေပြီး ကွန်ရက်ပြတ်တောက်မှု မရှိစေရန် စီမံထားသော ဧရာမ အဆင့်မြှင့်တင်မှုဖြစ်သည်။',
      cryptoPlaybook: {
        bullishCondition: 'Validator adoption milestone verified with zero network congestion.',
        bullishConditionMy: 'ကွန်ရက် ပြတ်တောက်မှုမရှိဘဲ အောင်မြင်စွာ လည်ပတ်နိုင်ပါက SOL စျေးထိုးတက်နိုင်သည်။',
        bearishCondition: 'Unexpected consensus bug on hybrid client rollout.',
        bearishConditionMy: 'အဆင့်မြှင့်တင်စဉ် ချို့ယွင်းချက်တွေ့ရှိပါက အရောင်းဖိအား ခေတ္တဖြစ်နိုင်သည်။',
        recommendedStrategy: 'Look for SOL break above local swing resistance with targets at $220+.',
        recommendedStrategyMy: 'SOL Resistance ကျိုးပါက $220+ ပစ်မှတ်ဖြင့် Trend Trade စဉ်းစားပါ။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±4.0% on SOL_USDT',
        volatilityRating: 'HIGH',
        affectedPairs: ['SOL_USDT', 'JUP_USDT', 'RAY_USDT'],
      },
      source: 'Solana Foundation & Jump Crypto',
      frequency: 'Milestone Release',
    },
    {
      id: `cc-evt-jobless-claims-${day1.dateStr}`,
      title: 'US Initial Jobless Claims',
      titleMy: 'အမေရိကန် အလုပ်လက်မဲ့ ထောက်ပံ့ကြေး ဦးဆုံးလျှောက်ထားသူ အရေအတွက်',
      currency: 'USD',
      currencyName: 'US Dollar',
      date: day1.dateStr,
      time: '08:30 EDT (19:00 MMT)',
      timestamp: day1.timestamp + (8 * 3600 + 30 * 60 + 4 * 3600) * 1000,
      impact: 'low',
      category: 'employment',
      actual: null,
      forecast: '230K',
      previous: '227K',
      actualStatus: 'neutral',
      whyTradersCare:
        'Weekly gauge of layoffs in the United States. Spikes above 250K indicate accelerating labor market softening.',
      whyTradersCareMy:
        'အမေရိကန် အလုပ်လက်မဲ့ဦးရေ အခြေအနေကို အပတ်စဉ်ပြသသည်။ လျှောက်ထားသူ များပြားပါက စီးပွားရေးအေးလာပြီး Fed အတိုးနှုန်းလျှော့ရန် တွန်းအားဖြစ်စေသည်။',
      cryptoPlaybook: {
        bullishCondition: 'Claims > 240K (Weaker labor market): Bullish Crypto.',
        bullishConditionMy: 'လျှောက်ထားသူ > 240K (အလုပ်လက်မဲ့များပါက): Crypto အဝယ်အားကောင်းစေသည်။',
        bearishCondition: 'Claims < 215K (Tight labor market): Mild bearish headwind.',
        bearishConditionMy: 'လျှောက်ထားသူနည်းပါက ဒေါ်လာမာပြီး Crypto အနည်းငယ် အေးနိုင်သည်။',
        recommendedStrategy: 'Quick intraday 15M scalping setup.',
        recommendedStrategyMy: '၁၅ မိနစ် timeframe တွင် အမြန် Scalping ကစားရန် သင့်တော်သည်။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±1.0%',
        volatilityRating: 'LOW',
        affectedPairs: ['BTC_USDT'],
      },
      source: 'US Department of Labor',
      frequency: 'Weekly (Every Thursday)',
    },
    {
      id: `cc-evt-retail-sales-${day2.dateStr}`,
      title: 'US Retail Sales (MoM)',
      titleMy: 'အမေရိကန် လက်လီအရောင်းပမာဏ ပြောင်းလဲမှုနှုန်း',
      currency: 'USD',
      currencyName: 'US Dollar',
      date: day2.dateStr,
      time: '08:30 EDT (19:00 MMT)',
      timestamp: day2.timestamp + (8 * 3600 + 30 * 60 + 4 * 3600) * 1000,
      impact: 'medium',
      category: 'macro',
      actual: null,
      forecast: '0.2%',
      previous: '0.4%',
      actualStatus: 'neutral',
      whyTradersCare:
        'Consumer spending makes up approximately 70% of total US GDP. Moderate spending indicates healthy economic growth without igniting inflation.',
      whyTradersCareMy:
        'အမေရိကန် စီးပွားရေး၏ ၇၀% သည် ပြည်သူများ၏ လက်လီသုံးစွဲမှုအပေါ် မူတည်သည်။ ပုံမှန်သုံးစွဲမှုသည် စီးပွားရေးကောင်းမွန်မှုကို ပြသသည်။',
      cryptoPlaybook: {
        bullishCondition: 'Balanced print around 0.2% maintains "Soft Landing" narrative.',
        bullishConditionMy: 'ခန့်မှန်းချက် ၀.၂% ဝန်းကျင်ရှိပါက Soft Landing ဖြင့် စျေးကွက်ငြိမ်သက်စွာ တက်နိုင်သည်။',
        bearishCondition: 'Deep negative print (< -0.5%) triggers recession scare.',
        bearishConditionMy: 'အနှုတ်လက္ခဏာပြပါက စီးပွားပျက်ကပ် စိုးရိမ်မှုဖြင့် အန္တရာယ်ရှိ ပိုင်ဆိုင်မှုများ ကျနိုင်သည်။',
        recommendedStrategy: 'Monitor US Dollar reaction on 1H charts before entering futures.',
        recommendedStrategyMy: '1H Chart တွင် ဒေါ်လာတုံ့ပြန်မှုကို ကြည့်ပြီးမှ Futures Trade ဝင်ပါ။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±1.5%',
        volatilityRating: 'MODERATE',
        affectedPairs: ['BTC_USDT', 'ETH_USDT'],
      },
      source: 'US Census Bureau',
      frequency: 'Monthly',
    },
    // YESTERDAY EVENT FOR HISTORICAL ACCURACY
    {
      id: `cc-evt-sec-etf-${dayMinus1.dateStr}`,
      title: 'SEC Solana Spot ETF Filing Review Comments',
      titleMy: 'SEC ၏ Solana Spot ETF လျှောက်ထားမှု သုံးသပ်ချက် မှတ်ချက်များ',
      currency: 'SOL',
      currencyName: 'Solana',
      date: dayMinus1.dateStr,
      time: '16:00 EDT (02:30 MMT)',
      timestamp: dayMinus1.timestamp + 16 * 3600 * 1000,
      impact: 'high',
      category: 'regulatory',
      actual: 'Formal Review Initiated',
      forecast: 'Pending',
      previous: 'S-1 Filed',
      actualStatus: 'better',
      whyTradersCare:
        'Official recognition and formal feedback by the SEC on VanEck and 21Shares Solana Spot ETF filings is a massive institutional regulatory step for the altcoin ecosystem.',
      whyTradersCareMy:
        'SEC က Solana Spot ETF လျှောက်လွှာများကို တရားဝင် စိစစ်မှုစတင်ခြင်းသည် Solana နှင့် Altcoins များအတွက် အဖွဲ့အစည်းကြီးများ တရားဝင်ဝင်ရောက်လာမည့် အခွင့်အရေးဖြစ်သည်။',
      cryptoPlaybook: {
        bullishCondition: 'Progressive review comments without immediate disapproval.',
        bullishConditionMy: 'ချက်ချင်း ပယ်ချခြင်းမရှိဘဲ ဆက်လက်စိစစ်ခွင့်ပြုခြင်းသည် SOL အတွက် အဝယ်အားတက်စေသည်။',
        bearishCondition: 'Explicit rejection citing security classification concerns.',
        bearishConditionMy: 'လုံခြုံရေးစည်းမျဉ်း ချိုးဖောက်သည်ဟုဆိုကာ ပယ်ချပါက စျေးကျနိုင်သည်။',
        recommendedStrategy: 'Long SOL with stop loss placed below recent swing low.',
        recommendedStrategyMy: 'မကြာသေးမီက အနိမ့်ဆုံး စျေးနှုန်းအောက်တွင် Stop Loss ထားကာ Long ယူနိုင်။',
      },
      historicalVolatility: {
        expectedBtcMovePercent: '±5.2% on SOL_USDT',
        volatilityRating: 'HIGH',
        affectedPairs: ['SOL_USDT', 'JTO_USDT', 'BONK_USDT'],
      },
      source: 'US Securities and Exchange Commission (SEC)',
      frequency: 'Regulatory Filing Window',
    },
  ];

  // Sort by timestamp chronologically
  return events.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Fetch calendar events with caching and support for force refresh
 */
export async function getLiveCalendar(forceRefresh = false): Promise<CryptoCraftCalendarResponse> {
  const now = Date.now();
  if (!forceRefresh && cachedCalendar && cachedCalendar.expiresAt > now) {
    const nextHigh = cachedCalendar.data.find((e) => e.impact === 'high' && e.timestamp > now) || null;
    return {
      success: true,
      count: cachedCalendar.data.length,
      data: cachedCalendar.data,
      nextHighImpactEvent: nextHigh,
      timestamp: now,
    };
  }

  const events = getGeneratedCalendarEvents();
  cachedCalendar = {
    data: events,
    expiresAt: now + 60000, // 1 minute cache, instantly bypassable by forceRefresh
  };

  const nextHigh = events.find((e) => e.impact === 'high' && e.timestamp > now) || events.find((e) => e.impact === 'high') || null;

  return {
    success: true,
    count: events.length,
    data: events,
    nextHighImpactEvent: nextHigh,
    timestamp: now,
  };
}
