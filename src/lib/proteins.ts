export type Protein = {
  name: string;                // 商品名
  brand: string;               // ブランド
  type: string;                // タイプ（ホエイ/ソイなど）
  flavor: string;              // 味
  proteinPerServing: number;   // 1食タンパク質(g)
  sugarPerServing: number;     // 糖質(g)
  calories: number;            // カロリー(kcal)
  pricePerServing: number;     // 1食価格(円)
  purpose: string;             // 目的（ダイエット/筋トレ/健康維持など）
  amazonUrl?: string;
  rakutenUrl?: string;
};

export const proteins: Protein[] = [
  {
    name: "ザバス ホエイプロテイン100（リッチショコラ）",
    brand: "SAVAS",
    type: "ホエイ(WPC)",
    flavor: "ココア",
    proteinPerServing: 20,
    sugarPerServing: 2.7,
    calories: 113,
    pricePerServing: 68,
    purpose: "初心者/日常使い",
    amazonUrl: "",
    rakutenUrl: ""
  },
  {
    name: "ビーレジェンド ホエイ（南国パイン）",
    brand: "beLEGEND",
    type: "ホエイ(WPC)",
    flavor: "パイン",
    proteinPerServing: 21,
    sugarPerServing: 3,
    calories: 118,
    pricePerServing: 60,
    purpose: "初心者/味重視",
    amazonUrl: "",
    rakutenUrl: ""
  },
  {
    name: "VALX ホエイプロテイン（チョコ）",
    brand: "VALX",
    type: "ホエイ(WPC)",
    flavor: "チョコ",
    proteinPerServing: 21.6,
    sugarPerServing: 2.1,
    calories: 110,
    pricePerServing: 55,
    purpose: "初心者/軽い筋トレ",
    amazonUrl: "",
    rakutenUrl: ""
  },
  {
    name: "マイプロテイン インパクトホエイ（チョコ）",
    brand: "Myprotein",
    type: "ホエイ(WPC)",
    flavor: "チョコ",
    proteinPerServing: 21,
    sugarPerServing: 1.9,
    calories: 103,
    pricePerServing: 45,
    purpose: "コスパ重視",
    amazonUrl: "",
    rakutenUrl: ""
  },
  {
    name: "Kentai NEWホエイ（バニラ）",
    brand: "Kentai",
    type: "ホエイ",
    flavor: "バニラ",
    proteinPerServing: 20.2,
    sugarPerServing: 2.6,
    calories: 108,
    pricePerServing: 70,
    purpose: "健康維持",
    amazonUrl: "",
    rakutenUrl: ""
  },
  {
    name: "X-PLOSION ホエイ（バナナ）",
    brand: "X-PLOSION",
    type: "ホエイ(WPC)",
    flavor: "バナナ",
    proteinPerServing: 22,
    sugarPerServing: 2,
    calories: 110,
    pricePerServing: 39,
    purpose: "コスパ最強",
    amazonUrl: "",
    rakutenUrl: ""
  },
  {
    name: "GOLD'S GYM CFMホエイプロテイン（チョコ）",
    brand: "Gold's Gym",
    type: "ホエイ(WPI)",
    flavor: "チョコ",
    proteinPerServing: 24,
    sugarPerServing: 1.2,
    calories: 108,
    pricePerServing: 110,
    purpose: "質重視/初心者〜中級",
    amazonUrl: "",
    rakutenUrl: ""
  },
  {
    name: "ザバス ソイプロテイン100（ココア）",
    brand: "SAVAS",
    type: "ソイ",
    flavor: "ココア",
    proteinPerServing: 15,
    sugarPerServing: 1.1,
    calories: 79,
    pricePerServing: 60,
    purpose: "ダイエット/お腹弱い人",
    amazonUrl: "",
    rakutenUrl: ""
  },
  {
    name: "ULTORA ソイダイエット（抹茶）",
    brand: "ULTORA",
    type: "ソイ",
    flavor: "抹茶",
    proteinPerServing: 15,
    sugarPerServing: 1.5,
    calories: 78,
    pricePerServing: 85,
    purpose: "女性向け/ダイエット",
    amazonUrl: "",
    rakutenUrl: ""
  },
  {
    name: "FIXIT ホエイ（キャラメル）",
    brand: "FIXIT",
    type: "ホエイ(WPC)",
    flavor: "キャラメル",
    proteinPerServing: 20.7,
    sugarPerServing: 2,
    calories: 106,
    pricePerServing: 57,
    purpose: "初心者/飲みやすさ",
    amazonUrl: "",
    rakutenUrl: ""
  }
];