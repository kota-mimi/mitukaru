import { GoogleGenerativeAI } from "@google/generative-ai";

let aiClient: GoogleGenerativeAI | null = null;

const getClient = () => {
  if (!aiClient) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn("Gemini API Key not found. Set NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY");
    }
    aiClient = new GoogleGenerativeAI(apiKey);
  }
  return aiClient;
};

// チャット機能用
export const generateChatResponse = async (
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> => {
  const client = getClient();
  
  const systemInstruction = `あなたはプロテイン比較サイト「PRO-TEIN AI」のアシスタントです。
  ユーザーの質問に対し、サイト内の商品情報（ホエイ、カゼイン、ソイなど）に基づいて、中立的かつ専門的なアドバイスを行ってください。
  特定のECサイト（楽天やAmazon）を過度に推奨せず、ユーザーにとって「何がベストか」を一緒に考えるスタンスで回答してください。
  回答は150文字以内で簡潔に。`;

  try {
    const model = client.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction
    });

    // Convert history to the correct format
    const historyForChat = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts[0].text }]
    }));

    const chat = model.startChat({
      history: historyForChat,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text() || "エラーが発生しました。もう一度お試しください。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "API接続エラーです。APIキーを確認してください。";
  }
};

// 診断レポート生成用
export const generateDiagnosisReport = async (
  answers: { [key: number]: string }
): Promise<string> => {
  const client = getClient();
  const prompt = `
  ユーザーがプロテイン選びの診断を行いました。以下の回答に基づき、専門的なトレーナーの視点から、
  「なぜそのタイプのプロテインが必要なのか」「どのような摂取タイミングが良いか」を含む診断レポートを作成してください。
  
  【ユーザーの回答】
  1. 性別・年齢層: ${answers[0]}
  2. 目的: ${answers[1]}
  3. 運動頻度: ${answers[2]}
  4. 味の好み: ${answers[3]}
  5. 重視する点: ${answers[4]}

  【出力条件】
  - 300文字以内
  - フレンドリーだが信頼感のある口調（です・ます調）
  - 最後に一言、応援メッセージを入れる
  - 具体的な商品名は出さず、成分（WPI、カゼイン、EAAなど）や特徴で推奨する
  `;

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "診断結果の生成に失敗しました。";
  } catch (error) {
    console.error("Diagnosis Error:", error);
    return "診断サーバーに接続できませんでした。";
  }
};