export interface NewsDataPoint {
  label: string;
  labelMy: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface CryptoNewsItem {
  id: string;
  title: string;
  titleMy: string;
  summary: string;
  summaryMy: string;
  fullStory: string;
  fullStoryMy: string;
  takeaway: string;
  takeawayMy: string;
  dataPoints: NewsDataPoint[];
  technicalActionPlan: {
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    keySupport: string;
    keyResistance: string;
    triggerCondition: string;
    triggerConditionMy: string;
  };
  category: 'macro' | 'catalysts' | 'liquidations' | 'etf' | 'forex-macro' | 'regulations' | 'institutional';
  impact: 'BULLISH' | 'BEARISH' | 'HIGH_VOLATILITY';
  affectedCoins: string[];
  source: string;
  timeAgo: string;
  mmtTime: string;
  usTime: string;
}

export const CURATED_CRYPTO_NEWS: CryptoNewsItem[] = [
  {
    id: 'news-1',
    title: 'Fed FOMC Rate Decision: CPI at 3.4% Stokes Volatility Across BTC & FX',
    titleMy: 'Fed FOMC အတိုးနှုန်း မဆုံးဖြတ်မီ CPI 3.4% ကြောင့် BTC နှင့် စျေးကွက်များတွင် လှုပ်ခတ်မှု ပြင်းထန်နေ',
    summary:
      'The CME FedWatch tool indicates an 88% probability that the Federal Reserve will maintain defensive monetary policy following higher-than-forecast CPI inflation (3.4%). US Dollar Index (DXY) hovers at 99.49, holding Bitcoin Dominance near 58.4%.',
    summaryMy:
      'ဩဂုတ် CPI ငွေကြေးဖောင်းပွမှု 3.4% အထိ ခန့်မှန်းချက်ထက် မြင့်တက်ခဲ့ပြီးနောက် Fed အနေဖြင့် အတိုးနှုန်းတင်းကျပ်ထားမည့် အလားအလာ 88% သို့ ရောက်ရှိလာသည်။ ဒေါ်လာအညွှန်းကိန်း (DXY) သည် 99.49 တွင် ရှိနေပြီး Bitcoin Dominance သည် 58.4% အထိ အားကောင်းနေသဖြင့် Altcoin များတွင် အတက်အကျကြမ်းနိုင်သည်။',
    fullStory:
      'The US Bureau of Labor Statistics reported Consumer Price Index (CPI) at 3.4% year-over-year, exceeding consensus expectations of 3.1%. The unexpected stickiness in core shelter and services inflation has forced market participants to recalibrate expectations for interest rate cuts. Federal Reserve Chairman Jerome Powell reaffirmed that the central bank remains strictly data-dependent. Consequently, the US 10-Year Treasury Yield rose to 4.28%, applying pressure on risk assets including crypto. In the crypto futures sector, total open interest contracted by $1.2B as institutional desks de-risked ahead of the upcoming FOMC press conference.',
    fullStoryMy:
      'အမေရိကန် အလုပ်သမားစာရင်းအင်းဌာနမှ ထုတ်ပြန်သော CPI ငွေကြေးဖောင်းပွမှုနှုန်းသည် ခန့်မှန်းထားသော 3.1% ထက်ကျော်လွန်ကာ 3.4% အထိ တက်လာခဲ့သည်။ အထူးသဖြင့် အိမ်ငှားခနှင့် ဝန်ဆောင်မှုစရိတ်များ ဆက်လက်မြင့်တက်နေခြင်းကြောင့် Fed အနေဖြင့် အတိုးနှုန်းလျှော့ချမည့်အချိန်ကို နောက်ဆုတ်ရမည့် အခြေအနေဖြစ်လာသည်။ Fed ဥက္ကဋ္ဌ Powell က စီးပွားရေးဒေတာအပေါ် မူတည်၍သာ ဆုံးဖြတ်မည်ဟု အတည်ပြုခဲ့သဖြင့် US 10Y Bond Yield သည် 4.28% အထိ တက်လာပြီး Crypto စျေးကွက်အပေါ် ဖိအားပေးခဲ့သည်။ FOMC အစည်းအဝေး မတိုင်မီ Futures စျေးကွက်တွင် Open Interest $1.2B ခန့် လျှော့ချခဲ့ကြသည်။',
    takeaway: 'Defensive mode. Stick to high-liquidity coins (BTC, SOL). Avoid holding overleveraged swing positions into FOMC announcements. Watch for false breakouts at key liquidity levels.',
    takeawayMy: 'မဆင်မခြင် Long မလိုက်ပါနှင့်။ အရင်းအနှီးများသော အဓိက Coins (BTC, SOL) ကိုသာ အာရုံစိုက်ပြီး Stop Loss ကို မဖြစ်မနေ အသုံးပြုပါ။ သတင်းထွက်ချိန်တွင် စျေးအတုအယောင်လှုပ်ရှားမှုများကို သတိပြုပါ။',
    dataPoints: [
      { label: 'US Headline CPI', labelMy: 'အမေရိကန် CPI နှုန်း', value: '3.4% YoY', trend: 'up' },
      { label: 'CME Rate Hold Prob', labelMy: 'အတိုးနှုန်းမပြောင်းလဲနိုင်ခြေ', value: '88.0%', trend: 'neutral' },
      { label: '10Y US Treasury', labelMy: '၁၀ နှစ် နှောင်ကြိုးအထွက်နှုန်း', value: '4.28%', trend: 'up' },
      { label: 'US Dollar (DXY)', labelMy: 'ဒေါ်လာအညွှန်းကိန်း (DXY)', value: '99.49', trend: 'neutral' },
    ],
    technicalActionPlan: {
      bias: 'NEUTRAL',
      keySupport: '$62,400',
      keyResistance: '$65,200',
      triggerCondition: 'Wait for post-FOMC 15M candle close above $65,200 or liquidity sweep under $62,400 before entering.',
      triggerConditionMy: 'FOMC သတင်းပြီးနောက် $65,200 အထက် 15M ဖယောင်းတိုင် ပိတ်မှ (သို့) $62,400 အောက် Liquidity Sweep ဖြစ်မှသာ ဝင်ရောက်ပါ။',
    },
    category: 'macro',
    impact: 'HIGH_VOLATILITY',
    affectedCoins: ['BTC', 'ETH', 'SOL'],
    source: 'Bloomberg & CME FedWatch',
    timeAgo: '12m ago',
    mmtTime: '09:20 PM MMT',
    usTime: '10:50 AM EDT',
  },
  {
    id: 'news-2',
    title: 'Binance USDⓈ-M Futures Extreme Negative Funding Rate Alert & Short Squeeze',
    titleMy: 'Binance Futures တွင် Negative Funding Rate အလွန်ကဲဖြစ်ပေါ်ပြီး Short Squeeze သတိပေးချက်',
    summary:
      'Contracts such as LSKUSDT (-0.5917%) and VTHOUSDT (-0.1003%) are seeing massive short crowds paying longs every 8 hours. Over-leveraged short positioning has triggered rapid squeezes of +20% to +200% in intraday trading.',
    summaryMy:
      'LSKUSDT (-0.59%) နှင့် VTHOUSDT (-0.10%) စသည့် ဒင်္ဂါးများတွင် အနုတ် Funding Rate အလွန်ဆိုးရွားနေပြီး Short ရောင်းချသူများက Long အား အခကြေးငွေ အများအပြား ပေးနေရသည်။ ဤအခြေအနေသည် ရုတ်တရက် Short Squeeze ဖြစ်ပြီး 10% - 20% အထက်သို့ စျေးခုန်တက်စေနိုင်သည်။',
    fullStory:
      'Binance USDⓈ-M perpetual contracts are displaying acute structural imbalances. Several mid-cap altcoins have hit extreme negative funding thresholds. On LSKUSDT, the 8-hour funding fee reached -0.5917%, meaning aggressive short traders are paying long holders nearly 1.8% daily in carry costs just to keep positions active. Market makers and institutional algorithmic desks typically exploit this crowded positioning by initiating violent liquidity sweeps to trigger cascaded stop-losses and short liquidations, propelling prices upward in short squeeze surges.',
    fullStoryMy:
      'Binance Futures တွင် အချို့သော Altcoins များ၌ Funding Rate များ အလွန်အမင်း အနုတ်လက္ခဏာပြနေသည်။ LSKUSDT တွင် ၈ နာရီတစ်ကြိမ် -0.5917% အထိ ရောက်ရှိနေသဖြင့် Short ဖွင့်ထားသူများသည် Long ဖွင့်ထားသူများအား နေ့စဉ် ၁.၈% ခန့် အခကြေးငွေ ပေးဆောင်နေရသည်။ ထိုအခါ Whales များနှင့် Algorithm များသည် Short ရောင်းသူများ၏ Stop Loss များကို သိမ်းကျုံးရှင်းလင်းပြီး စျေးနှုန်းကို အဆမတန် အပေါ်သို့ ထိုးတက်စေသည့် Short Squeeze များကို ဖြစ်ပေါ်စေလေ့ရှိသည်။',
    takeaway: 'Do NOT open late market shorts on coins with negative funding < -0.10%. Look for liquidity sweep longs or wait for momentum exhaustion to scalp mean reversion.',
    takeawayMy: 'Funding Rate အနုတ်ပြင်းနေသော ဒင်္ဂါးများကို လိုက်လံ Short မရောင်းပါနှင့်။ Liquidity Sweep ဖြစ်ပြီးမှသာ ပြန်တက်မည့် အခွင့်အရေးကို စောင့်ကြည့်ပါ။',
    dataPoints: [
      { label: 'LSK 8h Funding Rate', labelMy: 'LSK ၈ နာရီ Funding Rate', value: '-0.5917%', trend: 'down' },
      { label: 'VTHO 8h Funding Rate', labelMy: 'VTHO ၈ နာရီ Funding Rate', value: '-0.1003%', trend: 'down' },
      { label: 'Annualized Short Cost', labelMy: 'တစ်နှစ်စာ Short ကုန်ကျစရိတ်', value: '~640% APR', trend: 'up' },
      { label: 'Short Squeeze Prob', labelMy: 'Short Squeeze ဖြစ်နိုင်ခြေ', value: 'High (84%)', trend: 'up' },
    ],
    technicalActionPlan: {
      bias: 'BULLISH',
      keySupport: 'Local Session Low',
      keyResistance: 'Daily Supply Block',
      triggerCondition: 'Enter long on M5 bullish CHoCH following liquidity sweep of Asian session low.',
      triggerConditionMy: 'Asian Session Low ကို Sweep လုပ်ပြီး M5 CHoCH အတက်အချက်ပြ ပေါ်ပေါက်လာပါက Long စတင်ဝင်ရောက်ပါ။',
    },
    category: 'catalysts',
    impact: 'HIGH_VOLATILITY',
    affectedCoins: ['LSK', 'VTHO', 'FLOCK', 'ZEC'],
    source: 'Binance Derivatives API & Coinglass',
    timeAgo: '35m ago',
    mmtTime: '08:57 PM MMT',
    usTime: '10:27 AM EDT',
  },
  {
    id: 'news-3',
    title: 'BlackRock & Fidelity Spot BTC ETFs Accumulate $420M in Daily Inflows',
    titleMy: 'BlackRock နှင့် Fidelity တို့၏ Spot Bitcoin ETF သို့ တစ်ရက်တည်း ဒေါ်လာ ၄၂၀ သန်း စီးဝင်',
    summary:
      'Institutional demand surged as BlackRock IBIT and Fidelity FBTC captured a combined $420M in fresh net inflows, absorbing over 6.5x the daily newly minted Bitcoin supply from miners.',
    summaryMy:
      'အမေရိကန် အဖွဲ့အစည်းကြီးများဖြစ်သော BlackRock (IBIT) နှင့် Fidelity (FBTC) သို့ ဒေါ်လာ ၄၂၀ သန်းဖိုး Bitcoin ETF အသစ်များ စီးဝင်ခဲ့သည်။ ၎င်းပမာဏသည် နေ့စဉ် Miners များ တူးဖော်ရရှိသော Bitcoin အရေအတွက်ထက် ၆.၅ ဆ ပိုမိုများပြားသည်။',
    fullStory:
      'Farside Investors and Bloomberg ETF analytical data showed US spot Bitcoin exchange-traded funds registered their largest single-day net positive intake in three weeks. BlackRock iShares Bitcoin Trust (IBIT) led institutional purchases with $285M, while Fidelity FBTC recorded $135M. Grayscale GBTC experienced negligible outflows ($8M), signaling exhaustion in legacy trust selling. With daily post-halving Bitcoin production capped at approximately 450 BTC ($29M), the institutional demand of ~$420M represents a 14:1 structural supply deficit, laying the groundwork for a sustained supply squeeze into Q4.',
    fullStoryMy:
      'Bloomberg စာရင်းဇယားများအရ အမေရိကန် Spot Bitcoin ETF များသို့ သုံးပတ်အတွင်း အများဆုံး အသားတင် ငွေစီးဝင်မှု ဖြစ်ပေါ်ခဲ့သည်။ BlackRock IBIT က ဒေါ်လာ ၂၈၅ သန်းနှင့် Fidelity က ဒေါ်လာ ၁၃၅ သန်း ဝယ်ယူခဲ့ပြီး Grayscale ရောင်းထုတ်မှု လျော့ကျသွားခဲ့သည်။ Halving ပြီးနောက် တစ်နေ့လျှင် Bitcoin ၄၅၀ ပြား (ဒေါ်လာ ၂၉ သန်းဖိုး) သာ အသစ်ထွက်ရှိသဖြင့် ဝယ်လိုအားက ရောင်းလိုအားထက် ၁၄ ဆ ပိုမိုနေကာ စျေးကွက်အတွင်း Bitcoin ပစ္စည်းပြတ်လပ်မှုကို ဖြစ်စေလျက်ရှိသည်။',
    takeaway: 'Strong structural spot bid confirms high-timeframe bullish trend. Pullbacks to 4H support zones offer institutional-grade accumulation opportunities.',
    takeawayMy: 'အဖွဲ့အစည်းကြီးများ၏ ဝယ်လိုအား အားကောင်းနေသဖြင့် 4H Support ဇုန်များသို့ ပြန်ကျလာပါက Long ဖွင့်ရန် အကောင်းဆုံး အခွင့်အရေး ဖြစ်သည်။',
    dataPoints: [
      { label: 'IBIT Net Daily Flow', labelMy: 'BlackRock နေ့စဉ်စီးဝင်မှု', value: '+$285.4M', trend: 'up' },
      { label: 'FBTC Net Daily Flow', labelMy: 'Fidelity နေ့စဉ်စီးဝင်မှု', value: '+$135.2M', trend: 'up' },
      { label: 'Daily Miner Issuance', labelMy: 'နေ့စဉ် Bitcoin အသစ်ထွက်ရှိမှု', value: '~450 BTC (~$29M)', trend: 'neutral' },
      { label: 'Demand/Supply Ratio', labelMy: 'ဝယ်လိုအား/ရောင်းလိုအား အချိုး', value: '14.5x Deficit', trend: 'up' },
    ],
    technicalActionPlan: {
      bias: 'BULLISH',
      keySupport: '$63,200',
      keyResistance: '$68,500',
      triggerCondition: 'Look for 1H Fair Value Gap (FVG) retest at $63,500 for trend continuation long entry.',
      triggerConditionMy: '$63,500 ဝန်းကျင်ရှိ 1H FVG ဇုန်သို့ စျေးပြန်ဆင်းလာချိန်တွင် Trend အတိုင်း Long ဝင်ရောက်ပါ။',
    },
    category: 'institutional',
    impact: 'BULLISH',
    affectedCoins: ['BTC', 'ETH', 'SOL'],
    source: 'Bloomberg ETF Terminal & Farside Investors',
    timeAgo: '50m ago',
    mmtTime: '08:42 PM MMT',
    usTime: '10:12 AM EDT',
  },
  {
    id: 'news-4',
    title: 'Solana Daily DEX Volume Flips Ethereum: SOL Defends $100 Psychological Floor',
    titleMy: 'Solana ၏ ၂၄ နာရီ DEX ကုန်သွယ်မှုပမာဏ Ethereum ကို ကျော်တက်ပြီး $100 Support ကို ကာကွယ်ထားနိုင်',
    summary:
      'Solana network registered $2.31B in 24h decentralized exchange volume compared to Ethereum $1.95B. On Binance Futures, SOL 24h volume exceeded $321M, successfully defending the psychological $100 pivot.',
    summaryMy:
      'Solana ကွန်ရက်၏ ၂၄ နာရီ DEX Volume သည် ဒေါ်လာ ၂.၃၁ ဘီလီယံအထိ ရောက်ရှိခဲ့ပြီး Ethereum ကို ကျော်တက်ခဲ့သည်။ Binance Futures တွင် SOL သည် $100 Support ကို အခိုင်အမာ ကာကွယ်ထားနိုင်ပြီး စျေးနှုန်း $110 ဆီသို့ 10% ခန့် ပြန်တက်နိုင်ခြေ အားကောင်းနေသည်။',
    fullStory:
      'DeFiLlama on-chain metrics confirmed Solana leading all layer-1 and layer-2 blockchains in 24-hour trading volume. Driven by deep liquidity on Raydium, Orca, and Phoenix DEXs, Solana logged $2.31B in organic volume. Ethereum mainnet posted $1.95B, burdened by elevated mainnet gas fees during peak hours. In the derivatives space, SOLUSDT open interest stabilized at $2.14B, with funding rates resetting to a healthy +0.0082%. Technical traders noted multiple structural rejections at the critical $99.50-$100.00 liquidity pool, indicating strong institutional limit buyer presence.',
    fullStoryMy:
      'DeFiLlama ဒေတာများအရ Solana သည် ၂၄ နာရီအတွင်း ဒေါ်လာ ၂.၃၁ ဘီလီယံ ကုန်သွယ်မှုပမာဏ ရရှိကာ Ethereum (ဒေါ်လာ ၁.၉၅ ဘီလီယံ) ကို ကျော်လွန်သွားခဲ့သည်။ Raydium နှင့် Orca စသည့် DEX များတွင် အရောင်းအဝယ် အလွန်သွက်လက်နေသည်။ Binance Futures တွင် SOL ၏ Open Interest သည် $2.14B ရှိနေပြီး $99.50 မှ $100 ကြားတွင် ဝယ်ယူသူများ အခိုင်အမာ ကာကွယ်ထားနိုင်သဖြင့် $110 - $115 သို့ 10% ကျော် ဆက်လက်တက်လှမ်းနိုင်သည့် အနေအထား ရှိသည်။',
    takeaway: 'SOL remains the cleanest structured high-feasibility candidate on 15M/1H charts with strong $100 support defense and high network utility.',
    takeawayMy: 'SOL သည် $100 Support တွင် အခိုင်အမာ ရပ်တည်နေသဖြင့် 15M/1H တွင် 10% အတက်ရရှိနိုင်သော အကောင်းဆုံး Setup အဖြစ် ဆက်လက်တည်ရှိနေသည်။',
    dataPoints: [
      { label: 'Solana 24h DEX Vol', labelMy: 'Solana DEX ကုန်သွယ်မှုပမာဏ', value: '$2.31B', trend: 'up' },
      { label: 'Ethereum 24h DEX Vol', labelMy: 'Ethereum DEX ပမာဏ', value: '$1.95B', trend: 'down' },
      { label: 'SOL 24h Futures Vol', labelMy: 'SOL Futures ပမာဏ', value: '$321M', trend: 'up' },
      { label: 'SOL Open Interest', labelMy: 'SOL စုစုပေါင်း အော်ဒါပမာဏ', value: '$2.14B', trend: 'up' },
    ],
    technicalActionPlan: {
      bias: 'BULLISH',
      keySupport: '$100.20',
      keyResistance: '$111.80',
      triggerCondition: 'Enter long on 15M pullback to $101.50 with stop loss at $98.40 targeting $111.50 (1:3.2 R:R).',
      triggerConditionMy: '$101.50 သို့ Pullback ဖြစ်ချိန်တွင် $98.40 Stop Loss ဖြင့် Long ဝင်ပြီး $111.50 (1:3.2 R:R) ကို ပစ်မှတ်ထားပါ။',
    },
    category: 'catalysts',
    impact: 'BULLISH',
    affectedCoins: ['SOL', 'JTO', 'PYTH', 'RAY'],
    source: 'DeFiLlama & Binance Futures Book',
    timeAgo: '1h ago',
    mmtTime: '08:30 PM MMT',
    usTime: '10:00 AM EDT',
  },
  {
    id: 'news-5',
    title: 'Global Forex DXY Consolidation: EUR/USD & GBP/USD Eye Key Central Bank Statements',
    titleMy: 'ကမ္ဘာ့ Forex ဒေါ်လာအညွှန်းကိန်း DXY အပြောင်းအလဲ: EUR/USD နှင့် GBP/USD အဓိကဇုန်များသို့ ရောက်ရှိ',
    summary:
      'The US Dollar Index (DXY) consolidates around 99.49 as traders await the ECB and Bank of England monetary policy divergence. Gold pushes past $2,650/oz in safe-haven flow.',
    summaryMy:
      'US Dollar Index (DXY) သည် 99.49 ဝန်းကျင်တွင် ငြိမ်သက်နေပြီး ECB နှင့် Bank of England တို့၏ အတိုးနှုန်းသတင်းများကို စောင့်ကြည့်နေကြသည်။ ရွှေစျေး (XAU/USD) သည် $2,650 အထက်သို့ စံချိန်တင် ရောက်ရှိခဲ့သည်။',
    fullStory:
      'Intermarket correlation models highlight significant capital movements across foreign exchange and commodities. The US Dollar Index (DXY) established a narrow multi-day range between 99.20 and 99.85. The European Central Bank (ECB) delivered a 25 bps rate cut, narrowing the yield differential between the euro and the US dollar. In London trading, GBP/USD held firm above the psychological 1.3000 handle, supported by resilient UK service sector PMI data (52.4). Concurrently, Spot Gold (XAU/USD) breached $2,650 per ounce, reflecting persistent sovereign central bank gold accumulation and macroeconomic de-dollarization trends.',
    fullStoryMy:
      'Forex နှင့် ကုန်စည်စျေးကွက်များတွင် DXY ဒေါ်လာအညွှန်းကိန်းသည် 99.20 မှ 99.85 ကြားတွင် ရွေ့လျားနေသည်။ ဥရောပဗဟိုဘဏ် (ECB) က အတိုးနှုန်း ၀.၂၅% လျှော့ချခဲ့ပြီး ဗြိတိန်ပေါင် GBP/USD သည် 1.3000 Level အထက်တွင် ခိုင်မာစွာ ရပ်တည်နေသည်။ အခြားတစ်ဖက်တွင် ကမ္ဘာ့ဗဟိုဘဏ်များက ရွှေအရန်ငွေများ တိုးမြှင့်ဝယ်ယူနေကြသဖြင့် ရွှေစျေးသည် တစ်အောင်စလျှင် ဒေါ်လာ ၂,၆၅၀ ကျော်သို့ စံချိန်တင် ထိုးတက်ခဲ့သည်။',
    takeaway: 'Forex traders should focus on London and New York overlapping session liquidity. Watch DXY 99.80 resistance breakout to confirm broader crypto risk-off pressure.',
    takeawayMy: 'Forex ကုန်သွယ်သူများအနေဖြင့် London နှင့် NY စျေးဖွင့်ချိန်ကို အာရုံစိုက်ပါ။ DXY 99.80 ကို ဖောက်ထွက်ပါက Crypto စျေးကွက်တွင် စျေးကျဆင်းမှု ဖိအား ပိုမိုလာနိုင်သည်။',
    dataPoints: [
      { label: 'DXY Index', labelMy: 'ဒေါ်လာအညွှန်းကိန်း DXY', value: '99.49', trend: 'neutral' },
      { label: 'EUR/USD Rate', labelMy: 'ယူရို/ဒေါ်လာ နှုန်း', value: '1.0845', trend: 'down' },
      { label: 'GBP/USD Rate', labelMy: 'ပေါင်/ဒေါ်လာ နှုန်း', value: '1.3022', trend: 'up' },
      { label: 'Spot Gold (XAU)', labelMy: 'ကမ္ဘာ့ရွှေစျေး (XAU/USD)', value: '$2,654/oz', trend: 'up' },
    ],
    technicalActionPlan: {
      bias: 'NEUTRAL',
      keySupport: 'EUR/USD 1.0800',
      keyResistance: 'EUR/USD 1.0920',
      triggerCondition: 'Execute liquidity sweep pullback on EUR/USD during London 08:00 GMT open.',
      triggerConditionMy: 'London စျေးဖွင့်ချိန် (မြန်မာစံတော်ချိန် နေ့လယ် ၂:၃၀) တွင် EUR/USD ၏ Asian High/Low Sweep ကို စောင့်ကြည့် အော်ဒါဖွင့်ပါ။',
    },
    category: 'forex-macro',
    impact: 'HIGH_VOLATILITY',
    affectedCoins: ['BTC', 'ETH', 'SOL'],
    source: 'ForexFactory, Reuters & TradingView',
    timeAgo: '1h 30m ago',
    mmtTime: '08:00 PM MMT',
    usTime: '09:30 AM EDT',
  },
  {
    id: 'news-6',
    title: '24-Hour Crypto Futures Liquidations Top $184 Million: Long Overhang Flushed',
    titleMy: 'လွန်ခဲ့သော ၂၄ နာရီအတွင်း Crypto Futures Liquidation ဒေါ်လာ ၁၈၄ သန်း ကျော်လွန်ပြီး စျေးကွက် သန့်စင်သွား',
    summary:
      'Over $184M in leveraged futures contracts were liquidated over the past 24 hours, consisting of $112M long liquidations and $72M short liquidations. Bitcoin and altcoin open interest saw a healthy flush, removing excess speculative froth.',
    summaryMy:
      'လွန်ခဲ့သော ၂၄ နာရီအတွင်း စျေးကွက်တစ်ခုလုံးတွင် $184M ဖိုး Leverage များ ရှင်းလင်းခံခဲ့ရပြီး Long $112M နှင့် Short $72M ပါဝင်သည်။ အလွန်အကျွံ Leverage ကစားသူများ ပြုတ်ထွက်သွားသဖြင့် စျေးကွက်ဖွဲ့စည်းပုံ ပိုမိုသန့်ရှင်းသွားသည်။',
    fullStory:
      'Derivatives data providers recorded severe liquidation clusters between $63,100 and $63,800 on BTCUSDT. A rapid $1,200 downward sweep triggered automated stop losses across retail exchanges, liquidating 64,280 individual trading accounts. Coinglass heatmaps show the bulk of aggressive long leverage accumulated over the weekend was completely eradicated. Following the cascade, funding rates across Binance and OKX reset to neutral (0.005% - 0.010%), which historically precedes stable accumulation ranges and high-quality multi-day swing opportunities.',
    fullStoryMy:
      'BTCUSDT တွင် $63,100 မှ $63,800 ကြားရှိ အော်ဒါများ ရုတ်တရက် အောက်သို့ ထိုးဆင်းသွားသဖြင့် ကုန်သွယ်သူပေါင်း ၆၄,၂၈၀ ဦး၏ အကောင့်များ Liquidation ဖြစ်ပေါ်ခဲ့သည်။ Coinglass Liquidation Heatmap အရ စနေ၊ တနင်္ဂနွေတွင် လိုက်လံဝယ်ယူခဲ့ကြသော Long Leverage များ အားလုံး ရှင်းလင်းခံလိုက်ရသည်။ ဤသို့ Liquidation ပြီးသွားချိန်တွင် Funding Rate ပြန်လည်ငြိမ်သက်သွားသဖြင့် စျေးကွက်တွင် အရည်အသွေးမြင့်သော Swing အခွင့်အလမ်းများ စတင်ပေါ်ပေါက်လာလေ့ရှိသည်။',
    takeaway: 'Leverage flushes create clean technical entry setups. Maintain strict stop-loss orders and limit leverage to 20x or below.',
    takeawayMy: 'Liquidation ရှင်းလင်းပြီးချိန်တွင် Technical Setup အသစ်များ ပေါ်ပေါက်လေ့ရှိသည်။ မိမိ၏ Leverage ကို 20x အောက်သာ ကန့်သတ်ထားပါ။',
    dataPoints: [
      { label: 'Total Liquidations', labelMy: 'စုစုပေါင်း ရှင်းလင်းခံရငွေ', value: '$184.2M', trend: 'up' },
      { label: 'Long Liquidations', labelMy: 'Long အရှုံးရှင်းလင်းငွေ', value: '$112.4M', trend: 'up' },
      { label: 'Short Liquidations', labelMy: 'Short အရှုံးရှင်းလင်းငွေ', value: '$71.8M', trend: 'neutral' },
      { label: 'Liquidated Traders', labelMy: 'အကောင့်ပြုတ်သူ အရေအတွက်', value: '64,280 accounts', trend: 'up' },
    ],
    technicalActionPlan: {
      bias: 'BULLISH',
      keySupport: '$62,800',
      keyResistance: '$64,900',
      triggerCondition: 'Wait for 1H candle to close with long lower shadow (wick) indicating absorption.',
      triggerConditionMy: 'စျေးကွက်အောက်ခြေတွင် အမြီးရှည်သော 1H Pinbar ဖယောင်းတိုင် ပေါ်ပေါက်လာမှသာ ဝယ်ယူသူများ အားကောင်းကြောင်း အတည်ပြုပါ။',
    },
    category: 'liquidations',
    impact: 'HIGH_VOLATILITY',
    affectedCoins: ['BTC', 'ETH', 'SOL', 'LSK'],
    source: 'Coinglass Derivatives Liquidation Heatmap',
    timeAgo: '2h ago',
    mmtTime: '07:32 PM MMT',
    usTime: '09:02 AM EDT',
  },
  {
    id: 'news-7',
    title: 'Spot Ethereum ETF Flows See Net Neutral Week as L2 Rollup Activity Expands',
    titleMy: 'Spot Ethereum ETF စီးဝင်မှု ပုံမှန်သာရှိပြီး L2 Arbitrum & Base တိုးတက်မှုကြောင့် ETH စောင့်ကြည့်သင့်',
    summary:
      'US Spot Ethereum ETFs saw modest institutional activity with net weekly outflows of $34M. ETH is trading between $2,450 and $2,520, lacking directional catalyst until Bitcoin makes its next macro breakout.',
    summaryMy:
      'Ethereum Spot ETF များတွင် ငွေစီးဝင်မှု မရှိသေးဘဲ ETH သည် $2,450 မှ $2,520 ကြားတွင် ငြိမ်သက်နေသည်။ BTC လှုပ်ရှားမှု မရှိမချင်း ETH Futures များတွင် ကြီးမားသော Trend မရှိနိုင်သေးပါ။',
    fullStory:
      'Institutional adoption for Spot Ethereum ETFs remains subdued compared to Bitcoin. Combined net outflows from Grayscale ETHE offset inflows into BlackRock ETHA and Fidelity FETH, resulting in a net weekly outflow of $34M. Despite sluggish ETF momentum, Ethereum Layer-2 rollup throughput hit an all-time record, with Base and Arbitrum processing over 140 transactions per second. ETH/BTC ratio hovers at cyclical lows near 0.039, presenting asymmetric long-term upside for mean-reversion positioning once risk appetite broadens to the altcoin complex.',
    fullStoryMy:
      'Ethereum Spot ETF များတွင် BlackRock ETHA နှင့် Fidelity FETH သို့ ငွေအနည်းငယ် စီးဝင်သော်လည်း Grayscale ETHE မှ ရောင်းထုတ်မှုများကြောင့် အသားတင် ဒေါ်လာ ၃၄ သန်း အနုတ်ပြခဲ့သည်။ သို့သော် Layer-2 ကွန်ရက်များဖြစ်သော Base နှင့် Arbitrum တို့တွင် အသုံးပြုမှု အလွန်မြင့်တက်နေသည်။ ETH/BTC အချိုးသည် 0.039 အနိမ့်ဆုံးသို့ ရောက်ရှိနေသဖြင့် စျေးကွက်တွင် Altcoin ရာသီ စတင်ချိန်တွင် ETH သည် အဆမတန် ပြန်လည်ဦးမော့လာနိုင်သည့် အလားအလာ ရှိသည်။',
    takeaway: 'Wait for ETH to either break $2,550 resistance or sweep $2,420 liquidity before taking multi-day swing positions.',
    takeawayMy: 'ETH သည် $2,550 ကို မကျော်နိုင်မချင်း (သို့) $2,420 Support သို့ မရောက်မချင်း ကြားထဲတွင် ကုန်သွယ်ခြင်း မပြုဘဲ စောင့်ဆိုင်းသင့်သည်။',
    dataPoints: [
      { label: 'Weekly ETF Net Flow', labelMy: 'အပတ်စဉ် ETF စီးဝင်ငွေ', value: '-$34.1M', trend: 'down' },
      { label: 'ETH/BTC Ratio', labelMy: 'ETH နှင့် BTC အချိုး', value: '0.0392', trend: 'down' },
      { label: 'L2 Aggregate TPS', labelMy: 'L2 တစ်စက္ကန့် အရောင်းအဝယ်', value: '142 tx/s', trend: 'up' },
      { label: 'ETH Staking Ratio', labelMy: 'ETH ပေါင်နှံထားမှု ရာခိုင်နှုန်း', value: '28.8% of Supply', trend: 'up' },
    ],
    technicalActionPlan: {
      bias: 'NEUTRAL',
      keySupport: '$2,420',
      keyResistance: '$2,560',
      triggerCondition: 'Look for break and retest of $2,560 on the 4H timeframe with expanding volume.',
      triggerConditionMy: '4H ဇယားတွင် $2,560 ကို Volume ဖြင့် ဖောက်ထွက်ပြီး ပြန်လည်စမ်းသပ်ချိန်တွင် Long ဝင်ရောက်ပါ။',
    },
    category: 'etf',
    impact: 'BEARISH',
    affectedCoins: ['ETH', 'LDO', 'OP', 'ARB'],
    source: 'Farside & L2Beat On-Chain Explorer',
    timeAgo: '3h ago',
    mmtTime: '06:30 PM MMT',
    usTime: '08:00 AM EDT',
  },
  {
    id: 'news-8',
    title: 'Global Crypto Regulatory Clarification: MiCA Compliance Rollout & US Stablecoin Bill',
    titleMy: 'ကမ္ဘာ့ Crypto စည်းမျဉ်းများ: ဥရောပ MiCA စည်းမျဉ်းအသက်ဝင်ခြင်းနှင့် US Stablecoin ဥပဒေကြမ်း',
    summary:
      'European Union Markets in Crypto-Assets (MiCA) framework takes full effect, providing legal certainty for banks and institutions. US Congress advances bipartisan payment stablecoin legislation.',
    summaryMy:
      'ဥရောပသမဂ္ဂ၏ MiCA စည်းမျဉ်းသည် တရားဝင် အသက်ဝင်လာခဲ့ပြီး ဘဏ်များနှင့် အဖွဲ့အစည်းကြီးများ တရားဝင်ရင်းနှီးမြှုပ်နှံရန် လမ်းဖွင့်ပေးလိုက်သည်။ အမေရိကန်တွင်လည်း Stablecoin ဥပဒေကြမ်းကို လွှတ်တော်က ဆက်လက်ဆွေးနွေးနေသည်။',
    fullStory:
      'The European Union completed its scheduled implementation of the MiCA (Markets in Crypto-Assets) regulatory regime, setting standardized licensing requirements across all 27 member states. Major European private banks have commenced offering regulated custodial cryptocurrency services. Simultaneously, bipartisan momentum in the US House Financial Services Committee suggests a comprehensive federal framework for fiat-backed payment stablecoins could reach a vote before the end of the fiscal year, legitimizing USDT, USDC, and institutional settlement rails.',
    fullStoryMy:
      'ဥရောပသမဂ္ဂ ၂၇ နိုင်ငံတွင် MiCA စည်းမျဉ်း စတင်ကျင့်သုံးပြီးနောက် ဘဏ်ကြီးများသည် Crypto ဝန်ဆောင်မှုများကို စတင်ပေးအပ်နေပြီဖြစ်သည်။ အမေရိကန် လွှတ်တော်တွင်လည်း ဒေါ်လာအခြေပြု Stablecoin များကို တရားဝင် ခွင့်ပြုမည့် ဥပဒေကို အတည်ပြုရန် ဆွေးနွေးနေကြသည်။ ဤအခြေအနေသည် ကမ္ဘာ့အဖွဲ့အစည်းကြီးများ Crypto ထဲသို့ တရားဝင်ငွေရင်းနှီးမြှုပ်နှံရန် အကြီးမားဆုံး အထောက်အကူ ဖြစ်စေသည်။',
    takeaway: 'Regulatory clarity de-risks crypto infrastructure for pension funds and banks, cementing a permanent floor for digital asset institutionalization.',
    takeawayMy: 'စည်းမျဉ်းဥပဒေများ ရှင်းလင်းလာခြင်းသည် အဖွဲ့အစည်းကြီးများ၊ ဘဏ်များနှင့် ပင်စင်ရန်ပုံငွေများ စျေးကွက်ထဲ ဝင်ရောက်လာစေရန် အခွင့်အရေး ရရှိစေသည်။',
    dataPoints: [
      { label: 'MiCA EU Coverage', labelMy: 'ဥရောပ MiCA လွှမ်းခြုံမှု', value: '27 EU States', trend: 'up' },
      { label: 'Stablecoin Market Cap', labelMy: 'စုစုပေါင်း Stablecoin ပမာဏ', value: '$172.5 Billion', trend: 'up' },
      { label: 'USDC Institutional Circ', labelMy: 'USDC အဖွဲ့အစည်းသုံးစွဲမှု', value: '$35.8 Billion', trend: 'up' },
      { label: 'Regulatory Risk Index', labelMy: 'ဥပဒေဆိုင်ရာ စိုးရိမ်ရမှု', value: 'Low to Moderate', trend: 'down' },
    ],
    technicalActionPlan: {
      bias: 'BULLISH',
      keySupport: 'Total Crypto Cap $2.15T',
      keyResistance: 'Total Crypto Cap $2.40T',
      triggerCondition: 'Macro long-term DCA positioning on major blue-chips BTC, ETH, SOL.',
      triggerConditionMy: 'ရေရှည်အတွက် အဓိကဒင်္ဂါးများဖြစ်သော BTC, ETH, SOL တို့တွင် ပုံမှန်ခွဲဝယ်စုဆောင်းရန် သင့်တော်သည်။',
    },
    category: 'regulations',
    impact: 'BULLISH',
    affectedCoins: ['BTC', 'ETH', 'SOL'],
    source: 'European Securities and Markets Authority (ESMA) & US Congress',
    timeAgo: '4h ago',
    mmtTime: '05:30 PM MMT',
    usTime: '07:00 AM EDT',
  },
];
