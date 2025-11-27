'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DiagnosisResult {
  goal: string
  exercise: string
  about: string
  timing: string
  flavor: string
}

export default function SimpleDiagnosisPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<DiagnosisResult>({
    goal: '',
    exercise: '',
    about: '',
    timing: '',
    flavor: ''
  })
  const router = useRouter()

  const handleAnswer = (key: keyof DiagnosisResult, value: string) => {
    const newAnswers = { ...answers, [key]: value }
    setAnswers(newAnswers)
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      // 診断完了 - 結果画面へ
      const queryParams = new URLSearchParams(newAnswers).toString()
      router.push(`/protein-results?${queryParams}`)
    }
  }

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    {
      question: "プロテインで何を目指したいですか？",
      emoji: "🎯",
      options: [
        { key: "muscle", label: "筋肉をつけてカッコいい体になりたい", emoji: "💪" },
        { key: "diet", label: "ダイエットして引き締まった体になりたい", emoji: "🏃‍♀️" },
        { key: "health", label: "健康的で元気な毎日を送りたい", emoji: "✨" },
        { key: "beauty", label: "美肌・美髪など美容効果も期待したい", emoji: "👩‍🦰" }
      ]
    },
    {
      question: "普段どのくらい運動しますか？",
      emoji: "🏋️",
      options: [
        { key: "heavy", label: "週3回以上ガッツリ筋トレ・運動", emoji: "💦" },
        { key: "light", label: "週1-2回軽い運動（ウォーキングなど）", emoji: "🚶" },
        { key: "none", label: "ほとんど運動しない・デスクワーク中心", emoji: "📺" },
        { key: "start", label: "これから運動を始めたい", emoji: "🔄" }
      ]
    },
    {
      question: "あてはまるものを選んでください",
      emoji: "👤",
      options: [
        { key: "male", label: "男性・がっしり体型を目指したい", emoji: "👨" },
        { key: "female", label: "女性・しなやか体型を目指したい", emoji: "👩" },
        { key: "plant", label: "乳製品が苦手・植物性が好み", emoji: "🌱" },
        { key: "budget", label: "コスパ重視・安いものがいい", emoji: "💰" }
      ]
    },
    {
      question: "いつ飲む予定ですか？",
      emoji: "⏰",
      options: [
        { key: "morning", label: "朝食と一緒に（忙しい朝の栄養補給）", emoji: "🌅" },
        { key: "after", label: "運動後すぐに（30分以内）", emoji: "💪" },
        { key: "night", label: "夜寝る前に（ゆっくり吸収させたい）", emoji: "🌃" },
        { key: "meal", label: "食事代わりに（置き換えダイエット）", emoji: "🍽️" }
      ]
    },
    {
      question: "どんな味が好きですか？",
      emoji: "🍭",
      options: [
        { key: "chocolate", label: "チョコレート・ココア系（甘くて美味しい）", emoji: "🍫" },
        { key: "fruit", label: "フルーツ系（ストロベリー・バナナなど）", emoji: "🍓" },
        { key: "plain", label: "プレーン・ミルク系（シンプルな味）", emoji: "🥛" },
        { key: "other", label: "その他（コーヒー・抹茶など）", emoji: "☕" }
      ]
    }
  ]

  const currentStepData = steps[currentStep - 1]
  const progressPercentage = (currentStep / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              ステップ {currentStep} / 5
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentStepData.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.question}
            </h2>
            <p className="text-gray-600">
              あなたにぴったりのプロテインを見つけましょう！
            </p>
          </div>

          {/* 選択肢 */}
          <div className="space-y-4">
            {currentStepData.options.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  const answerKey = Object.keys(answers)[currentStep - 1] as keyof DiagnosisResult
                  handleAnswer(answerKey, option.key)
                }}
                className="w-full p-6 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-4 group-hover:scale-110 transition-transform duration-200">
                    {option.emoji}
                  </span>
                  <span className="text-lg font-medium text-gray-900 group-hover:text-blue-700">
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* 戻るボタン */}
          {currentStep > 1 && (
            <div className="mt-8 text-center">
              <button
                onClick={goBack}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                ← 前の質問に戻る
              </button>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🔒 あなたの回答は安全に処理されます</p>
          <p>⚡ 最適なプロテインを見つけるまでもう少し！</p>
        </div>
      </div>
    </div>
  )
}