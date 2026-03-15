import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VirtualGift } from '../types';

interface GiftAnimationProps {
  gift: VirtualGift | null;
  senderName: string;
  onComplete: () => void;
}

export const GiftAnimation: React.FC<GiftAnimationProps> = ({ gift, senderName, onComplete }) => {
  useEffect(() => {
    if (gift) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [gift, onComplete]);

  if (!gift) return null;

  return (
    <AnimatePresence>
      {gift && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[2px]"
        >
          <div className="relative flex flex-col items-center">
            {/* Burst Effect Background */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1.5, rotate: 180 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute w-64 h-64 bg-gradient-to-r from-yellow-400/30 to-brand-pink/30 rounded-full blur-xl"
            />

            {/* Gift Icon */}
            <motion.div
              initial={{ y: 300, scale: 0.5, opacity: 0 }}
              animate={{ y: 0, scale: 2.5, opacity: 1 }}
              exit={{ y: -100, opacity: 0, scale: 0.8 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                duration: 0.8 
              }}
              className="text-9xl drop-shadow-2xl z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            >
              {gift.icon}
            </motion.div>

            {/* Text Label */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="mt-12 bg-white/90 backdrop-blur px-8 py-4 rounded-2xl shadow-2xl border-2 border-brand-pink/20 transform translate-y-20"
            >
              <div className="text-center">
                <span className="text-gray-500 font-bold text-xs uppercase tracking-wider block mb-1">
                  {senderName} enviou
                </span>
                <span className="text-brand-pink font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-brand-pink to-purple-600" style={{ WebkitBackgroundClip: 'text' }}>
                  {gift.name}
                </span>
              </div>
            </motion.div>
            
            {/* Particles (Confetti) */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 500, 
                  y: (Math.random() - 0.5) * 500, 
                  opacity: 0, 
                  scale: Math.random() * 2,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.1 }}
                className={`absolute w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-brand-pink' : 'bg-yellow-400'}`}
                style={{ top: '50%', left: '50%' }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
