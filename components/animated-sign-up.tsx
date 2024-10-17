'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LockIcon, UsersIcon, Sparkles, Code2 } from 'lucide-react'
import { ParticleBackground } from './ParticleBackground'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

interface AnimatedSignUpComponentProps {
  onSignUp: () => void;
}

export function AnimatedSignUpComponent({ onSignUp }: AnimatedSignUpComponentProps) {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [codeLines, setCodeLines] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const lines = [
      "const gameOfCode = new Challenge();",
      "gameOfCode.version = 2.0;",
      "gameOfCode.start();",
      "while (player.isCoding()) {",
      "  player.learnNewSkills();",
      "  player.solveProblems();",
      "}",
      "player.winAwesomePrizes();"
    ]
    const currentLines: string[] = []
    const interval = setInterval(() => {
      if (currentLines.length < lines.length) {
        currentLines.push(lines[currentLines.length])
        setCodeLines([...currentLines])
      } else {
        clearInterval(interval)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName || !password) {
      toast.error('Please enter both team name and password');
      return;
    }

    setIsLoading(true);

    try {
      // Add the team data to Firestore
      await addDoc(collection(db, 'teams'), {
        teamName,
        password, // Note: In a real-world application, you should hash the password before storing it
        createdAt: new Date()
      });

      // Store the team name in local storage
      localStorage.setItem('teamName', teamName);

      toast.success('Team registered successfully!');
      router.push('/quiz?round=1');
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('Failed to register team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 animate-gradient-x"></div>

      {/* Particle Background */}
      <ParticleBackground />

      {/* Floating code snippets */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {codeLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="absolute text-green-400 text-sm font-mono"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {line}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sign-up form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gray-800 bg-opacity-30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 overflow-hidden border border-purple-500"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            className="flex items-center justify-center mb-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Code2 className="w-16 h-16 text-purple-400" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-2 text-center">Game of Code 2.0</h2>
          <p className="text-purple-300 text-center mb-6">Embark on an epic coding quest!</p>
        </motion.div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-2"
          >
            <label htmlFor="teamName" className="text-white text-sm font-medium">Team Name</label>
            <div className="relative">
              <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
              <Input
                id="teamName"
                type="text"
                placeholder="Enter your team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="pl-10 bg-gray-700 bg-opacity-50 border-2 border-purple-500 focus:border-purple-400 text-white placeholder-gray-400 rounded-lg"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="space-y-2"
          >
            <label htmlFor="password" className="text-white text-sm font-medium">Password</label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-gray-700 bg-opacity-50 border-2 border-purple-500 focus:border-purple-400 text-white placeholder-gray-400 rounded-lg"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="relative overflow-hidden rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 rounded-lg relative z-10 transition-all duration-300 ease-in-out transform hover:shadow-lg group"
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? 'Joining...' : 'Join the Game'}
                <Sparkles className="ml-2 w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </span>
            </Button>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-300"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: 'linear',
              }}
              style={{ mixBlendMode: 'overlay' }}
            ></motion.div>
          </motion.div>
        </form>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-0 left-0 w-20 h-20 bg-purple-500 rounded-full opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500 rounded-full opacity-10"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  )
}
