'use client';

import React from 'react';
import { ArrowLeft, Zap, Moon, Leaf, Clock, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface ProteinGuideProps {
  onBack: () => void;
}

export const ProteinGuide: React.FC<ProteinGuideProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={onBack}
            className="flex items-center text-slate-500 hover:text-secondary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            ショップに戻る
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-secondary mb-4">
            THE PROTEIN <span className="text-primary">GUIDE</span>
          </h1>
          <p className="text-slate-600 text-lg">
            プロテインの「種類」や「飲むタイミング」で効果は劇的に変わります。<br/>
            迷ったときに役立つ、基礎知識と選び方の完全ガイド。
          </p>
        </div>

        {/* Section 1: Types */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-2 rounded-lg"><Target className="w-6 h-6 text-primary" /></div>
            <h2 className="text-2xl font-bold text-secondary">1. プロテインの3大種類</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Whey */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-primary transition-colors shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary">ホエイ<br/><span className="text-sm font-normal text-slate-500">Whey Protein</span></h3>
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center"><span className="w-20 text-slate-400 font-bold text-xs">原料</span> 牛乳</div>
                <div className="flex items-center"><span className="w-20 text-slate-400 font-bold text-xs">吸収速度</span> <span className="text-primary font-bold">非常に速い</span></div>
                <div className="flex items-center"><span className="w-20 text-slate-400 font-bold text-xs">おすすめ</span> 筋肥大・トレ後</div>
              </div>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                筋肉の材料となるアミノ酸が豊富。トレーニング直後のゴールデンタイムに飲むなら間違いなくこれ。
              </p>
            </div>

            {/* Casein */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-400 transition-colors shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary">カゼイン<br/><span className="text-sm font-normal text-slate-500">Casein Protein</span></h3>
                <Moon className="w-8 h-8 text-purple-500" />
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center"><span className="w-20 text-slate-400 font-bold text-xs">原料</span> 牛乳</div>
                <div className="flex items-center"><span className="w-20 text-slate-400 font-bold text-xs">吸収速度</span> <span className="text-purple-500 font-bold">ゆっくり</span></div>
                <div className="flex items-center"><span className="w-20 text-slate-400 font-bold text-xs">おすすめ</span> 就寝前・休息日</div>
              </div>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                腹持ちが良く、就寝中など長時間栄養が摂れない時に筋肉の分解を防ぐ。ダイエット中の間食にも最適。
              </p>
            </div>

            {/* Soy */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group hover:border-green-400 transition-colors shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary">ソイ<br/><span className="text-sm font-normal text-slate-500">Soy Protein</span></h3>
                <Leaf className="w-8 h-8 text-green-500" />
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center"><span className="w-20 text-slate-400 font-bold text-xs">原料</span> 大豆</div>
                <div className="flex items-center"><span className="w-20 text-slate-400 font-bold text-xs">吸収速度</span> 普通〜ゆっくり</div>
                <div className="flex items-center"><span className="w-20 text-slate-400 font-bold text-xs">おすすめ</span> 美容・健康維持</div>
              </div>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                植物性タンパク質。イソフラボンを含み、美容目的や乳製品でお腹を壊しやすい人におすすめ。
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Timing */}
        <section className="mb-16">
           <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-2 rounded-lg"><Clock className="w-6 h-6 text-primary" /></div>
            <h2 className="text-2xl font-bold text-secondary">2. 効果を最大化するタイミング</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-xl p-6 items-center shadow-sm">
              <div className="flex-shrink-0 bg-blue-50 p-4 rounded-full mb-4 md:mb-0 md:mr-6">
                <span className="text-2xl font-black text-primary">01</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-secondary mb-2 flex items-center">
                  運動後 30分以内 <span className="ml-3 text-xs bg-primary text-white px-2 py-0.5 rounded font-bold">ゴールデンタイム</span>
                </h3>
                <p className="text-slate-600 text-sm">
                  傷ついた筋肉が最も栄養を必要としている時間。吸収の速い「ホエイプロテイン」を水で割って飲むのがベストです。
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-xl p-6 items-center shadow-sm">
              <div className="flex-shrink-0 bg-slate-50 p-4 rounded-full mb-4 md:mb-0 md:mr-6">
                <span className="text-2xl font-black text-slate-300">02</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-secondary mb-2">
                  就寝 1時間前
                </h3>
                <p className="text-slate-600 text-sm">
                  寝ている間は成長ホルモンが分泌され、筋肉の修復が行われます。「カゼイン」や「ソイ」など、ゆっくり吸収されるものがおすすめ。
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row bg-white border border-slate-200 rounded-xl p-6 items-center shadow-sm">
              <div className="flex-shrink-0 bg-slate-50 p-4 rounded-full mb-4 md:mb-0 md:mr-6">
                <span className="text-2xl font-black text-slate-300">03</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-secondary mb-2">
                  朝食時・間食
                </h3>
                <p className="text-slate-600 text-sm">
                  朝は体内の栄養が枯渇しています。忙しい朝のタンパク質補給として、食事にプラスして飲みましょう。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: FAQ */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
           <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg"><AlertCircle className="w-6 h-6 text-primary" /></div>
            <h2 className="text-2xl font-bold text-secondary">よくある疑問</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-secondary mb-2 flex items-center"><CheckCircle2 className="w-4 h-4 text-primary mr-2"/>太りませんか？</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                プロテイン自体は低脂質・低糖質なものが多いです。あくまで食事の補助として、1日の総カロリーを超えない範囲で飲めば太ることはありません。逆に代謝アップに繋がります。
              </p>
            </div>
            <div>
              <h4 className="font-bold text-secondary mb-2 flex items-center"><CheckCircle2 className="w-4 h-4 text-primary mr-2"/>運動しない日も飲む？</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                はい、飲むことをおすすめします。筋肉の修復は休息日にも行われています。普段の食事でタンパク質が不足しているなら、積極的に摂取しましょう。
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 text-center">
          <Button size="lg" onClick={onBack} className="rounded-full px-12">
            自分に合うプロテインを探す
          </Button>
        </div>

      </div>
    </div>
  );
};