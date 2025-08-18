import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = { onDone: () => void }

export function Splash({ onDone }: Props) {
  const text = 'TILESticker'
  const colors = [
    '#ffc4f1', '#fffbb5', '#a6e2ff', '#dbc9ff', '#a6ffe4',
    '#f87171', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa'
  ]

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 z-[9999] bg-white/70 flex items-end justify-center
                   backdrop-blur-md backdrop-saturate-100 filter saturate-[5]"
        style={{
          boxShadow: 'inset 0 0 100px rgba(255, 255, 255, 0.3)'
        }}
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: '-120vh',
          opacity: 1,
          transition: { delay: 1, duration: 0.8, ease: [0.1, 0.8, 0.2, 1] }
        }}
        exit={{ opacity: 0 }}
        onAnimationComplete={onDone}
      >
        <div className="mb-12 flex select-none">
          {text.split('').map((ch, i) => (
            <motion.span
              key={i}
              className="font-extrabold tracking-wide text-6xl md:text-8xl"
              style={{ color: colors[i % colors.length] }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 0.5 }}
              transition={{ 
                delay: i * 0.03, 
                duration: 0.3, 
                ease: [0.22, 0.61, 0.36, 1] 
              }}
            >
              {ch}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
