import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/useUserStore';
import { X, ChevronRight, MousePointer, ShoppingBag, Trophy, Rocket } from 'lucide-react';

interface Step {
  title: string;
  content: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "목장에 오신 것을 환영합니다!",
    content: "지금부터 훌륭한 목장주가 되기 위한 기본 방법을 알려드릴게요. 아주 간단하니 걱정 마세요!",
    icon: <div className="text-6xl mb-4">👨‍🌾</div>
  },
  {
    title: "젖소 클릭하기",
    content: "목장에 있는 젖소를 클릭하면 우유를 생산할 수 있어요. 클릭할수록 더 많은 우유가 쌓인답니다!",
    icon: <div className="bg-blue-100 p-6 rounded-3xl text-blue-600 mb-4"><MousePointer size={48} /></div>
  },
  {
    title: "우유 판매와 골드",
    content: "생산된 우유는 자동으로 판매되어 골드로 바뀝니다. 골드를 모아 목장을 확장해보세요.",
    icon: <div className="bg-yellow-100 p-6 rounded-3xl text-yellow-600 mb-4">💰</div>
  },
  {
    title: "목장 업그레이드",
    content: "상점에서 더 좋은 젖소를 사거나 목장 시설을 업그레이드할 수 있어요. 수익이 엄청나게 늘어날 거예요!",
    icon: <div className="bg-emerald-100 p-6 rounded-3xl text-emerald-600 mb-4"><ShoppingBag size={48} /></div>
  },
  {
    title: "퀘스트와 업적",
    content: "매일 주어지는 퀘스트와 평생의 업적을 달성하면 특별한 보상을 받을 수 있습니다.",
    icon: <div className="bg-purple-100 p-6 rounded-3xl text-purple-600 mb-4"><Trophy size={48} /></div>
  },
  {
    title: "튜토리얼 완료!",
    content: "이제 모든 준비가 끝났습니다. 최고의 목장주가 되어보세요! 첫 미션을 완료하면 이 안내는 사라집니다.",
    icon: <div className="bg-blue-500 p-6 rounded-3xl text-white mb-4"><Rocket size={48} /></div>
  }
];

/** 
 * @function TutorialOverlay
 * @description 신규 플레이어에게 게임의 기본 조작법과 흐름을 안내하는 튜토리얼 화면입니다.
 * 단계별 안내와 이미지(아이콘)를 통해 게임 플레이를 돕습니다.
 */
const TutorialOverlay: React.FC = () => {
  const { tutorialPhase, tutorialStep, actions: userActions } = useUserStore();

  if (tutorialPhase !== 1) return null;

  const handleNext = () => {
    if (tutorialStep < STEPS.length - 1) {
      userActions.setTutorialStep(tutorialStep + 1);
    } else {
      userActions.completeTutorial();
    }
  };

  const handleSkip = () => {
    userActions.skipTutorial();
  };

  const step = STEPS[tutorialStep];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-8 font-game">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-h-brown-deep/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-xl bg-h-cream rounded-[5rem] shadow-2.5d-lg overflow-hidden flex flex-col border-4 border-h-milk"
      >
        <div className="p-12 flex flex-col items-center text-center">
          {/* Header Area */}
          <div className="mb-4 flex justify-between w-full items-start absolute top-10 px-12">
            <div className="bg-h-sky-base px-5 py-2 rounded-full text-h-milk text-xs font-black uppercase tracking-widest shadow-2.5d-blue border-2 border-h-milk flex items-center gap-1">
              <span>Step</span>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={tutorialStep}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  className="inline-block min-w-[1ch]"
                >
                  {tutorialStep + 1}
                </motion.span>
              </AnimatePresence>
              <span>/ {STEPS.length}</span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, x: -5 }}
              onClick={handleSkip}
              className="text-slate-500 hover:text-h-brown-deep transition-colors flex items-center gap-2 text-sm font-black uppercase tracking-widest bg-h-milk/50 px-4 py-2 rounded-full border-2 border-h-milk/50"
            >
              SKIP <X size={18} strokeWidth={3} />
            </motion.button>
          </div>

          {/* Icon Area */}
          <motion.div 
            key={tutorialStep}
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="mt-12 mb-8 bg-h-milk p-10 rounded-[3.5rem] shadow-2.5d-white border-4 border-h-green-light/30"
          >
            {step.icon}
          </motion.div>

          <h2 className="text-4xl font-black text-h-text mb-6 tracking-tight drop-shadow-sm">
            {step.title}
          </h2>
          
          <p className="text-h-brown-soft font-black text-xl leading-relaxed mb-12 px-6">
            {step.content}
          </p>

          <div className="w-full flex gap-6">
            <motion.button 
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95, y: 8 }}
              onClick={handleNext}
              className="flex-1 py-8 bg-h-green-base text-h-milk rounded-[3rem] font-black text-2xl shadow-2.5d-green border-4 border-h-milk flex items-center justify-center gap-3 active:shadow-none transition-all duration-75"
            >
              {tutorialStep === STEPS.length - 1 ? "목장 시작하기" : "다음 단계로"} 
              <ChevronRight size={32} strokeWidth={4} />
            </motion.button>
          </div>
        </div>

        {/* Progress Bar Area */}
        <div className="h-4 bg-h-brown-deep/5 w-full relative overflow-hidden border-t-2 border-h-brown-soft/5">
          <motion.div 
            className="h-full bg-h-green-base shadow-[0_0_15px_rgba(154,222,123,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${((tutorialStep + 1) / STEPS.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TutorialOverlay;
