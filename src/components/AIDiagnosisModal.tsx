'use client';

import React, { useState } from 'react';
import { X, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { generateDiagnosisReport } from '@/lib/geminiService';

interface AIDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (recommendedType: string) => void;
}

const QUESTIONS = [
  {
    id: 0,
    text: "あなたの性別・年代は？",
    options: ["男性 (10-20代)", "男性 (30-40代)", "男性 (50代以上)", "女性 (10-20代)", "女性 (30-40代)", "女性 (50代以上)"]
  },
  {
    id: 1,
    text: "プロテインを飲む主な目的は？",
    options: ["筋肥大・バルクアップ", "ダイエット・引き締め", "健康維持・栄養補給", "スポーツのパフォーマンス向上"]
  },
  {
    id: 2,
    text: "普段の運動頻度は？",
    options: ["週4回以上 (ガッツリ)", "週1-3回 (適度に)", "ほぼしない (これから始める)"]
  },
  {
    id: 3,
    text: "味の好みは？",
    options: ["甘いチョコ・バニラ系", "さっぱりフルーツ系", "人工甘味料なし・プレーン", "こだわりなし"]
  },
  {
    id: 4,
    text: "一番重視するポイントは？",
    options: ["価格 (コスパ)", "成分・品質", "味の美味しさ", "ブランドの信頼性"]
  }
];

export const AIDiagnosisModal: React.FC<AIDiagnosisModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [step]: answer };
    setAnswers(newAnswers);
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      analyze(newAnswers);
    }
  };

  const analyze = async (finalAnswers: {[key: number]: string}) => {
    setIsAnalyzing(true);
    // Gemini API call
    const report = await generateDiagnosisReport(finalAnswers);
    setResult(report);
    setIsAnalyzing(false);
    
    // 簡易ロジックで推奨フィルターを決定
    let recommendedType = 'ALL';
    if (finalAnswers[1].includes("筋肥大")) recommendedType = 'WHEY';
    else if (finalAnswers[1].includes("ダイエット")) recommendedType = 'VEGAN';
    else if (finalAnswers[4].includes("価格")) recommendedType = 'WHEY';
    
    onComplete(recommendedType);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-800/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600 w-5 h-5 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-800 tracking-wide">AI プロテイン診断</h2>
          </div>
          <button onClick={reset} className="text-slate-400 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto bg-white">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-6 text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">AIが分析中...</h3>
                <p className="text-slate-500">あなたのライフスタイルに最適な配合を計算しています</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <Check className="w-5 h-5 mr-2 text-blue-600" />
                  診断結果レポート
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{result}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500 mb-2">この診断に基づくおすすめ商品を絞り込みました。</p>
                <Button className="w-full" onClick={reset}>
                  おすすめ商品を見る <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">
                  <span>Question {step + 1} of {QUESTIONS.length}</span>
                  <span>{Math.round(((step) / QUESTIONS.length) * 100)}% 完了</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center leading-relaxed">
                {QUESTIONS[step].text}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {QUESTIONS[step].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 font-medium text-left flex items-center justify-between group shadow-sm hover:shadow-md"
                  >
                    {option}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-white" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};