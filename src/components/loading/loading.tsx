import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { content } from  "@/src/config/content";

interface LoadingAnimationProps {
  onLoadingComplete: () => void;
  isFirstVisit: boolean;
}

export function LoadingAnimation({ onLoadingComplete, isFirstVisit }: LoadingAnimationProps) {
  const { bootSequence, asciiArt, quickLoading } = useMemo(() => content.loading, []);
  const [loadingState, setLoadingState] = useState({ step: 0, text: '' });
  const [showAscii, setShowAscii] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAscii(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isFirstVisit) {
      if (loadingState.step < bootSequence.length) {
        const timer = setTimeout(() => {
          setLoadingState(prev => ({ step: prev.step + 1, text: '' }));
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        onLoadingComplete();
      }
    } else {
      const timer = setTimeout(onLoadingComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [loadingState.step, onLoadingComplete, isFirstVisit, bootSequence.length]);

  useEffect(() => {
    if (isFirstVisit && loadingState.step < bootSequence.length) {
      const text = bootSequence[loadingState.step];
      let i = 0;
      const intervalId = setInterval(() => {
        if (i <= text.length) {
          setLoadingState(prev => ({ ...prev, text: text.slice(0, i) }));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, 50);
      return () => clearInterval(intervalId);
    }
  }, [loadingState.step, isFirstVisit, bootSequence]);

  const progress = useMemo(() => (loadingState.step / bootSequence.length) * 100, [loadingState.step, bootSequence.length]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-2xl p-6 space-y-4 font-mono text-sm">
        <motion.pre
          className="text-primary text-xs leading-none mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: showAscii ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {asciiArt}
        </motion.pre>

        {isFirstVisit ? (
          <>
            <div className="relative w-full">
              <motion.div
                className="w-full h-1 bg-primary/20 rounded-full overflow-hidden"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 7 }}
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
              <motion.div
                className="absolute right-0 top-2 text-xs text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {Math.round(progress)}%
              </motion.div>
            </div>
            <div className="h-64 overflow-hidden p-4">
              {bootSequence.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: index <= loadingState.step ? 1 : 0, 
                    y: index <= loadingState.step ? 0 : 20 
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-primary"
                >
                  {index === loadingState.step ? loadingState.text : index < loadingState.step ? step : ''}
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <motion.div
              className="w-64 h-1 bg-primary/20 rounded-full overflow-hidden mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: "linear" }}
            >
              <motion.div
                className="h-full bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-primary"
            >
              {quickLoading}
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

