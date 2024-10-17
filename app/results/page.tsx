'use client'

import { motion } from 'framer-motion'
import { ParticleBackground } from '@/components/ParticleBackground'
import { Sparkles, Trophy, Star, ThumbsUp, Rocket } from 'lucide-react'

export default function ResultsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 animate-gradient-x"></div>
      <ParticleBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative z-10 text-center overflow-hidden"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Congratulations!</h1>
          <p className="text-xl text-purple-300 mb-8">You&apos;ve completed the Game of Code 2.0!</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gray-700 bg-opacity-50 rounded-2xl p-6 mb-8"
        >
          <p className="text-lg text-white mb-4">Your coding journey was incredible!</p>
          <div className="flex justify-center space-x-4 mb-4">
            <Star className="w-8 h-8 text-yellow-400" />
            <Star className="w-8 h-8 text-yellow-400" />
            <Star className="w-8 h-8 text-yellow-400" />
            <Star className="w-8 h-8 text-yellow-400" />
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-md text-gray-300">You&apos;ve demonstrated exceptional skills and determination!</p>
        </motion.div>

        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex items-center justify-center mb-6"
        >
          <ThumbsUp className="w-10 h-10 text-green-400 mr-4" />
          <p className="text-lg text-white">Your scores have been submitted successfully.</p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <p className="text-lg text-purple-300 mb-4">Keep coding and reaching for the stars!</p>
          <Rocket className="w-12 h-12 text-blue-400 mx-auto" />
        </motion.div>

        <motion.div
          className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -top-20 -left-20 w-40 h-40 bg-pink-500 rounded-full opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      <Sparkles className="absolute bottom-10 left-10 w-10 h-10 text-yellow-300 opacity-70" />
      <Sparkles className="absolute top-10 right-10 w-10 h-10 text-yellow-300 opacity-70" />
    </div>
  )
}
