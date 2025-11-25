import { NextRequest, NextResponse } from 'next/server';
import { proteins, type Protein } from '@/lib/proteins';

export type DiagnoseRequest = {
  purpose: string;        // ダイエット / 筋トレ / 健康維持
  taste: string;          // 甘い / さっぱり / どちらでも
  budget: string;         // 低 / 中 / 高
  lactoseIntolerant: boolean; // 乳糖に弱いか
};

export type DiagnoseResponse = {
  recommendations: Protein[];
  message: string;
};

function calculateScore(protein: Protein, request: DiagnoseRequest): number {
  let score = 0;

  // 目的のマッチング（最重要）
  if (protein.purpose === request.purpose) {
    score += 100;
  }

  // 予算のマッチング
  const budgetScore = getBudgetScore(protein.pricePerServing, request.budget);
  score += budgetScore;

  // 味の好みのマッチング
  const tasteScore = getTasteScore(protein.flavor, request.taste);
  score += tasteScore;

  // 乳糖不耐症の場合、ソイプロテインにボーナス
  if (request.lactoseIntolerant && (protein.type === 'ソイ' || protein.type === '植物性')) {
    score += 50;
  }

  // ダイエット目的の場合、低カロリー・低糖質にボーナス
  if (request.purpose === 'ダイエット') {
    if (protein.calories < 100) score += 20;
    if (protein.sugarPerServing < 1) score += 20;
  }

  // 筋トレ目的の場合、高タンパクにボーナス
  if (request.purpose === '筋トレ') {
    if (protein.proteinPerServing > 20) score += 20;
    if (protein.proteinPerServing > 24) score += 10;
  }

  return score;
}

function getBudgetScore(price: number, budget: string): number {
  switch (budget) {
    case '低':
      if (price <= 120) return 30;
      if (price <= 150) return 10;
      return 0;
    case '中':
      if (price >= 120 && price <= 180) return 30;
      if (price <= 200) return 20;
      return 10;
    case '高':
      if (price >= 150) return 30;
      if (price >= 120) return 20;
      return 10;
    default:
      return 0;
  }
}

function getTasteScore(flavor: string, preference: string): number {
  const sweetFlavors = ['バニラ', 'チョコレート', 'ストロベリー', 'バナナ'];
  const lightFlavors = ['プレーン', 'ミルク'];
  
  switch (preference) {
    case '甘い':
      return sweetFlavors.includes(flavor) ? 20 : 0;
    case 'さっぱり':
      return lightFlavors.includes(flavor) ? 20 : 0;
    case 'どちらでも':
      return 10;
    default:
      return 0;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: DiagnoseRequest = await request.json();
    
    // バリデーション
    if (!body.purpose || !body.taste || !body.budget || typeof body.lactoseIntolerant !== 'boolean') {
      return NextResponse.json(
        { error: '必要なパラメータが不足しています' },
        { status: 400 }
      );
    }

    // スコア計算
    const scoredProteins = proteins.map(protein => ({
      protein,
      score: calculateScore(protein, body)
    }));

    // スコア順にソートして上位3つを取得
    const recommendations = scoredProteins
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.protein);

    const message = generateMessage(body, recommendations);

    const response: DiagnoseResponse = {
      recommendations,
      message
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('診断API エラー:', error);
    return NextResponse.json(
      { error: '診断処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function generateMessage(request: DiagnoseRequest, recommendations: Protein[]): string {
  let message = `${request.purpose}が目的で`;
  
  if (request.lactoseIntolerant) {
    message += '、乳糖に配慮した';
  }
  
  message += `、${request.budget}予算のあなたにおすすめのプロテインです。`;
  
  if (recommendations.length === 0) {
    message += ' 申し訳ありませんが、条件に合うプロテインが見つかりませんでした。';
  } else {
    message += ` 特に1位の「${recommendations[0].name}」がおすすめです！`;
  }
  
  return message;
}