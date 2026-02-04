'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, MessageSquare, ArrowRight, Check } from 'lucide-react';

const STEPS = ['welcome', 'profile', 'complete'] as const;

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<typeof STEPS[number]>('welcome');
  const [name, setName] = useState('');

  const handleComplete = () => {
    router.push('/club');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className={`w-2 h-2 rounded-full transition-colors ${STEPS.indexOf(step) >= i ? 'bg-blue-600' : 'bg-zinc-300'}`} />
          ))}
        </div>

        {step === 'welcome' && (
          <div className="text-center">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-2xl font-bold mb-2">유니클럽에 오신 것을 환영합니다!</h1>
            <p className="text-zinc-500 mb-8">독서모임과 함께 성장하는 공간</p>
            <div className="space-y-4 mb-8 text-left">
              {[
                { icon: BookOpen, title: '함께 읽기', desc: '다양한 책을 함께 읽어요' },
                { icon: MessageSquare, title: '생각 나누기', desc: '독후감과 토론으로 깊이를 더해요' },
                { icon: Users, title: '함께 성장', desc: '같은 관심사를 가진 사람들과 연결돼요' },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
                  <item.icon className="w-8 h-8 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep('profile')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              시작하기 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'profile' && (
          <div>
            <h2 className="text-xl font-bold mb-2">프로필 설정</h2>
            <p className="text-zinc-500 mb-6">모임에서 사용할 이름을 알려주세요</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 mb-2">이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하세요" className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <button onClick={() => setStep('complete')} disabled={!name.trim()} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed">
              다음
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">준비 완료!</h2>
            <p className="text-zinc-500 mb-8">유니클럽을 시작해보세요</p>
            <button onClick={handleComplete} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
