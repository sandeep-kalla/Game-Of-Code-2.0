'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ParticleBackground } from '@/components/ParticleBackground'
import { SocietyLogos } from '@/components/society-logos'

interface TeamResult {
  teamName: string;
  score: number;
}

export default function RoundOneResults() {
  const [results, setResults] = useState<TeamResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      const roundOneCollection = collection(db, 'roundOne')
      const q = query(roundOneCollection, orderBy('score', 'desc'), limit(8))
      const querySnapshot = await getDocs(q)
      const fetchedResults: TeamResult[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedResults.push({ teamName: data.teamName, score: data.score })
      })
      setResults(fetchedResults)
      setLoading(false)
    }

    fetchResults()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 animate-gradient-x"></div>
      <ParticleBackground />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-4xl relative z-10"
      >
        <h1 className="text-4xl font-bold text-white text-center mb-8">Round One Results</h1>
        {loading ? (
          <p className="text-white text-center">Loading results...</p>
        ) : (
          <div className="space-y-4">
            {results.map((team, index) => (
              <motion.div
                key={team.teamName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-700 bg-opacity-50 rounded-lg p-4 flex justify-between items-center ${
                  index === 0 ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <span className="text-white font-semibold">
                  {index === 0 && <span className="text-yellow-400 mr-2">🏆</span>}
                  {team.teamName}
                </span>
                <span className="text-blue-300 font-bold">{team.score} points</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      <SocietyLogos />
    </div>
  )
}
