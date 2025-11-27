// 診断ロジックのテスト用ファイル
const { AdvancedDiagnosisEngine } = require('./src/lib/advancedDiagnosisLogic');

// テストケース1: コスパ重視の男性、筋トレ週2-3回
const testCase1 = {
  purpose: ['コスパ重視', '筋トレ'],
  gender: '男性',
  proteinType: [],
  budget: '安い',
  bodyType: {
    gainWeight: false,
    lactoseIntolerant: false,
    getHungry: false
  },
  exerciseFreq: '週2-3',
  timing: ['運動後', '朝'],
  taste: {
    sweet: false,
    refreshing: false,
    fruity: false,
    noArtificial: false,
    tasteImportant: false
  },
  preferences: {
    domestic: false,
    noArtificial: false,
    beautyIngredients: false
  }
};

// テストケース2: ダイエット重視の女性、乳糖不耐症
const testCase2 = {
  purpose: ['ダイエット', '美容'],
  gender: '女性',
  proteinType: [],
  budget: '普通',
  bodyType: {
    gainWeight: true,
    lactoseIntolerant: true,
    getHungry: true
  },
  exerciseFreq: '週1',
  timing: ['朝', '食事置き換え'],
  taste: {
    sweet: false,
    refreshing: true,
    fruity: false,
    noArtificial: true,
    tasteImportant: false
  },
  preferences: {
    domestic: true,
    noArtificial: true,
    beautyIngredients: true
  }
};

// テストケース3: 本格筋トレユーザー
const testCase3 = {
  purpose: ['筋トレ', '本格'],
  gender: '男性',
  proteinType: [],
  budget: '高い',
  bodyType: {
    gainWeight: false,
    lactoseIntolerant: false,
    getHungry: false
  },
  exerciseFreq: '毎日',
  timing: ['運動後'],
  taste: {
    sweet: false,
    refreshing: false,
    fruity: false,
    noArtificial: false,
    tasteImportant: false
  },
  preferences: {
    domestic: true,
    noArtificial: false,
    beautyIngredients: false
  }
};

console.log('=== 診断ロジック テスト ===\n');

console.log('テストケース1: コスパ重視の男性筋トレユーザー');
const result1 = AdvancedDiagnosisEngine.diagnose(testCase1);
result1.forEach((result, index) => {
  console.log(`${index + 1}位: ${result.protein.name} (スコア: ${result.score}, マッチ率: ${AdvancedDiagnosisEngine.calculateMatchPercentage(result.score)}%)`);
  console.log(`理由: ${result.reason}`);
  console.log(`価格: ¥${result.protein.pricePerServing}/1食\n`);
});

console.log('\nテストケース2: ダイエット重視の女性、乳糖不耐症');
const result2 = AdvancedDiagnosisEngine.diagnose(testCase2);
result2.forEach((result, index) => {
  console.log(`${index + 1}位: ${result.protein.name} (スコア: ${result.score}, マッチ率: ${AdvancedDiagnosisEngine.calculateMatchPercentage(result.score)}%)`);
  console.log(`理由: ${result.reason}`);
  console.log(`価格: ¥${result.protein.pricePerServing}/1食\n`);
});

console.log('\nテストケース3: 本格筋トレユーザー');
const result3 = AdvancedDiagnosisEngine.diagnose(testCase3);
result3.forEach((result, index) => {
  console.log(`${index + 1}位: ${result.protein.name} (スコア: ${result.score}, マッチ率: ${AdvancedDiagnosisEngine.calculateMatchPercentage(result.score)}%)`);
  console.log(`理由: ${result.reason}`);
  console.log(`価格: ¥${result.protein.pricePerServing}/1食\n`);
});