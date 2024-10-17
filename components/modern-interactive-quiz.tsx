'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { ParticleBackground } from './ParticleBackground'
import { ChevronLeftIcon, ChevronRightIcon, LockIcon, Clock, ArrowRight, XCircle, Award, Frown, AlertTriangle } from 'lucide-react'
import { db } from '../lib/firebase' // Make sure this import is correct
import { collection, addDoc } from 'firebase/firestore'
import { SocietyLogos } from '@/components/society-logos'

// Types
interface Option {
  id: string;
  text: string;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
  correctAnswer: string;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<number, string>;
  visitedQuestions: Set<number>;
  lockedQuestions: Set<number>;
  timeRemaining: number;
}

// Sample quiz data for two rounds
const quizDataRound1: Question[] = [
  {
    id: 1,
    text: "What is the time complexity of binary search?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(n log n)" },
      { id: "d", text: "O(1)" }
    ],
    correctAnswer: "b"
  },
  {
    id: 2,
    text: "Which data structure uses LIFO (Last In First Out) principle?",
    options: [
      { id: "a", text: "Queue" },
      { id: "b", text: "Stack" },
      { id: "c", text: "Linked List" },
      { id: "d", text: "Tree" }
    ],
    correctAnswer: "b"
  },
  {
    id: 3,
    text: "What is the worst-case time complexity of quicksort?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(n log n)" },
      { id: "c", text: "O(n^2)" },
      { id: "d", text: "O(log n)" }
    ],
    correctAnswer: "c"
  },
  {
    id: 4,
    text: "Which of the following is not a linear data structure?",
    options: [
      { id: "a", text: "Array" },
      { id: "b", text: "Linked List" },
      { id: "c", text: "Stack" },
      { id: "d", text: "Tree" }
    ],
    correctAnswer: "d"
  },
  {
    id: 5,
    text: "What is the time complexity of inserting an element at the end of an array?",
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(n)" },
      { id: "c", text: "O(log n)" },
      { id: "d", text: "O(n log n)" }
    ],
    correctAnswer: "a"
  }
]

const quizDataRound2: Question[] = [
  {
    id: 6,
    text: "Which sorting algorithm is known for its stability?",
    options: [
      { id: "a", text: "Quicksort" },
      { id: "b", text: "Heapsort" },
      { id: "c", text: "Merge sort" },
      { id: "d", text: "Selection sort" }
    ],
    correctAnswer: "c"
  },
  {
    id: 7,
    text: "What is the primary advantage of a hash table?",
    options: [
      { id: "a", text: "Ordered data storage" },
      { id: "b", text: "Constant time average case for insertion and lookup" },
      { id: "c", text: "Efficient sorting of elements" },
      { id: "d", text: "Hierarchical data representation" }
    ],
    correctAnswer: "b"
  },
  {
    id: 8,
    text: "Which of the following is used to find the shortest path in a weighted graph?",
    options: [
      { id: "a", text: "Depth-First Search" },
      { id: "b", text: "Breadth-First Search" },
      { id: "c", text: "Dijkstra's Algorithm" },
      { id: "d", text: "Binary Search" }
    ],
    correctAnswer: "c"
  },
  {
    id: 9,
    text: "What is the space complexity of recursive fibonacci implementation?",
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(n)" },
      { id: "c", text: "O(log n)" },
      { id: "d", text: "O(2^n)" }
    ],
    correctAnswer: "b"
  },
  {
    id: 10,
    text: "Which data structure is best for implementing a priority queue?",
    options: [
      { id: "a", text: "Array" },
      { id: "b", text: "Linked List" },
      { id: "c", text: "Binary Search Tree" },
      { id: "d", text: "Heap" }
    ],
    correctAnswer: "d"
  }
]

const QUESTION_TIME_LIMIT = 30 // seconds

interface ModernInteractiveQuizComponentProps {
  round: number;
  onNextRound: (score: number) => void;
  onQuizComplete: (score: number) => void;
}

const BREAK_TIME = 1 * 10; // 30 minutes in seconds

function BreakTimer({ onBreakComplete }: { onBreakComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(BREAK_TIME);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newTimeLeft = Math.max(BREAK_TIME - elapsedTime, 0);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        clearInterval(timer);
        onBreakComplete();
      }
    }, 100); // Update more frequently for smoother countdown

    return () => clearInterval(timer);
  }, [onBreakComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (BREAK_TIME - timeLeft) / BREAK_TIME;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <svg className="w-64 h-64">
          <circle
            className="text-gray-300"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
            r="120"
            cx="128"
            cy="128"
          />
          <motion.circle
            className="text-blue-500"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
            r="120"
            cx="128"
            cy="128"
            initial={{ strokeDasharray: "0 759" }}
            animate={{ strokeDasharray: `${progress * 759} 759` }}
            transition={{ duration: 0.1 }}
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <motion.div
            className="text-6xl font-bold text-white mb-2"
            key={timeLeft}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </motion.div>
          <motion.div 
            className="text-blue-300 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Clock className="mr-2" size={20} />
            Break Time
          </motion.div>
        </div>
      </motion.div>
      <motion.h1
        className="text-4xl font-bold text-white mt-8 mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Take a breather!
      </motion.h1>
      <motion.p
        className="text-xl text-white mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Next round will start automatically when the timer reaches zero.
      </motion.p>
      <motion.div
        className="text-white text-lg flex items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Get ready for the next round <ArrowRight className="ml-2" size={20} />
      </motion.div>
    </div>
  );
}

// Add this constant at the top of the file, after other imports
const ELIMINATION_SCORE_LIMIT = 3; // Adjust this value as needed

// Move EliminationMessage outside of the main component
const EliminationMessage = ({ score, requiredScore }: { score: number; requiredScore: number }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={animate ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-3xl text-center relative overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={animate ? { scale: 1 } : {}}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
          className="absolute -top-16 -left-16 text-red-500 opacity-10"
        >
          <XCircle size={200} />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={animate ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">Thank you for participating!</h2>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={animate ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center items-center mb-6"
        >
          <div className="bg-red-500 rounded-full p-4">
            <Frown size={48} className="text-white" />
          </div>
        </motion.div>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={animate ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-300 mb-8"
        >
          Unfortunately, your team did not meet the minimum score requirement to proceed to the next round.
        </motion.p>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={animate ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="bg-gray-700 rounded-2xl p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <AlertTriangle className="text-yellow-500 mr-2" size={24} />
              <span className="text-lg text-gray-300">Minimum required score:</span>
            </div>
            <span className="text-2xl font-bold text-yellow-500">{requiredScore}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Award className="text-blue-500 mr-2" size={24} />
              <span className="text-lg text-gray-300">Your score:</span>
            </div>
            <span className="text-2xl font-bold text-blue-500">{score}</span>
          </div>
        </motion.div>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={animate ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="text-lg text-gray-400"
        >
          Keep practicing and come back stronger next time!
        </motion.p>
      </motion.div>
    </div>
  );
};

export function ModernInteractiveQuizComponent({ round, onNextRound, onQuizComplete, teamName }: ModernInteractiveQuizComponentProps & { teamName: string }) {
  const [quizState, setQuizState] = useState<QuizState>(() => ({
    currentQuestionIndex: 0,
    answers: {},
    visitedQuestions: new Set([0]),
    lockedQuestions: new Set(),
    timeRemaining: QUESTION_TIME_LIMIT
  }))
  const [showRoundHeading, setShowRoundHeading] = useState(true)
  const [isBreak, setIsBreak] = useState(false)
  const [isEliminated, setIsEliminated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showElimination, setShowElimination] = useState(false);
  const [score, setScore] = useState(0);

  const quizData = round === 1 ? quizDataRound1 : quizDataRound2

  // Reset quiz state when round changes
  useEffect(() => {
    setQuizState({
      currentQuestionIndex: 0,
      answers: {},
      visitedQuestions: new Set([0]),
      lockedQuestions: new Set(),
      timeRemaining: QUESTION_TIME_LIMIT
    })
    setShowRoundHeading(true)
  }, [round])

  useEffect(() => {
    const timer = setTimeout(() => setShowRoundHeading(false), 3000) // Hide round heading after 3 seconds
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setQuizState(prevState => {
        if (prevState.timeRemaining > 0) {
          return { ...prevState, timeRemaining: prevState.timeRemaining - 1 }
        } else {
          return lockCurrentQuestionAndMoveToNext(prevState)
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizState.currentQuestionIndex])

  const lockCurrentQuestionAndMoveToNext = (prevState: QuizState): QuizState => {
    const lockedQuestions = new Set(prevState.lockedQuestions)
    lockedQuestions.add(prevState.currentQuestionIndex)

    const nextIndex = findNextUnlockedQuestion(prevState.currentQuestionIndex + 1, lockedQuestions)
    
    return {
      ...prevState,
      currentQuestionIndex: nextIndex,
      visitedQuestions: new Set([...Array.from(prevState.visitedQuestions), nextIndex]),
      lockedQuestions,
      timeRemaining: QUESTION_TIME_LIMIT
    }
  }

  const findNextUnlockedQuestion = (startIndex: number, lockedQuestions: Set<number>): number => {
    for (let i = startIndex; i < quizData.length; i++) {
      if (!lockedQuestions.has(i)) return i
    }
    for (let i = 0; i < startIndex; i++) {
      if (!lockedQuestions.has(i)) return i
    }
    return -1 // All questions are locked
  }

  const handleOptionSelect = (optionId: string) => {
    if (quizState.lockedQuestions.has(quizState.currentQuestionIndex)) return
    setQuizState(prevState => ({
      ...prevState,
      answers: { ...prevState.answers, [prevState.currentQuestionIndex]: optionId }
    }))
  }

  const handleNavigation = (direction: 'prev' | 'next') => {
    setQuizState(prevState => {
      const newIndex = direction === 'next' 
        ? findNextUnlockedQuestion(prevState.currentQuestionIndex + 1, prevState.lockedQuestions)
        : findPreviousUnlockedQuestion(prevState.currentQuestionIndex - 1, prevState.lockedQuestions)
      
      if (newIndex === -1) return prevState // No unlocked questions available

      return {
        ...prevState,
        currentQuestionIndex: newIndex,
        visitedQuestions: new Set([...Array.from(prevState.visitedQuestions), newIndex]),
        timeRemaining: QUESTION_TIME_LIMIT
      }
    })
  }

  const findPreviousUnlockedQuestion = (startIndex: number, lockedQuestions: Set<number>): number => {
    for (let i = startIndex; i >= 0; i--) {
      if (!lockedQuestions.has(i)) return i
    }
    for (let i = quizData.length - 1; i > startIndex; i--) {
      if (!lockedQuestions.has(i)) return i
    }
    return -1 // All questions are locked
  }

  const handleQuestionJump = (index: number) => {
    if (quizState.lockedQuestions.has(index)) return
    setQuizState(prevState => ({
      ...prevState,
      currentQuestionIndex: index,
      visitedQuestions: new Set([...Array.from(prevState.visitedQuestions), index]),
      timeRemaining: QUESTION_TIME_LIMIT
    }))
  }

  const getQuestionStatus = (index: number): 'current' | 'answered' | 'unattempted' | 'locked' | 'not-visited' => {
    if (quizState.lockedQuestions.has(index)) return 'locked'
    if (index === quizState.currentQuestionIndex) return 'current'
    if (quizState.answers[index]) return 'answered'
    if (quizState.visitedQuestions.has(index)) return 'unattempted'
    return 'not-visited'
  }

  const currentQuestion = quizData[quizState.currentQuestionIndex]

  const isLastQuestion = quizState.currentQuestionIndex === quizData.length - 1

  const calculateScore = () => {
    let calculatedScore = 0;
    quizData.forEach((question, index) => {
      if (quizState.answers[index] === question.correctAnswer) {
        calculatedScore++;
      }
    });
    return calculatedScore;
  };

  const storeRoundOneResult = async (score: number) => {
    setIsSubmitting(true);
    try {
      const roundOneCollection = collection(db, 'roundOne');
      await addDoc(roundOneCollection, {
        teamName,
        score,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error storing round one result:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToNextRound = async () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    if (round === 1) {
      await storeRoundOneResult(calculatedScore);
      if (calculatedScore >= ELIMINATION_SCORE_LIMIT) {
        setIsBreak(true);
      } else {
        setShowElimination(true);
      }
    } else {
      onQuizComplete(calculatedScore);
    }
  }

  // Memoize the EliminationMessage
  const memoizedEliminationMessage = useMemo(() => (
    <EliminationMessage score={score} requiredScore={ELIMINATION_SCORE_LIMIT} />
  ), [score]);

  return (
    <>
      {showElimination ? (
        memoizedEliminationMessage
      ) : isBreak ? (
        <BreakTimer onBreakComplete={() => {
          setIsBreak(false);
          onNextRound(score);
        }} />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 animate-gradient-x"></div>
          <ParticleBackground />
          
          <AnimatePresence>
            {showRoundHeading && (
              <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute top-1/4 text-6xl font-bold text-white text-center z-20"
              >
                Round {round}
              </motion.h1>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-4xl relative z-10"
          >
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {quizData.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    getQuestionStatus(index) === 'current' ? 'bg-blue-500 ring-4 ring-blue-300' :
                    getQuestionStatus(index) === 'answered' ? 'bg-green-500' :
                    getQuestionStatus(index) === 'unattempted' ? 'bg-yellow-500' :
                    getQuestionStatus(index) === 'locked' ? 'bg-red-500' :
                    'bg-gray-600'
                  }`}
                  onClick={() => handleQuestionJump(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={getQuestionStatus(index) === 'locked'}
                >
                  {getQuestionStatus(index) === 'locked' ? <LockIcon size={16} /> : index + 1}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-700 bg-opacity-50 rounded-2xl p-6 mb-6"
              >
                <h2 className="text-2xl font-bold mb-6 text-white">{currentQuestion.text}</h2>
                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <motion.button
                      key={option.id}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        quizState.answers[quizState.currentQuestionIndex] === option.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-white hover:bg-gray-500'
                      }`}
                      onClick={() => handleOptionSelect(option.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={quizState.lockedQuestions.has(quizState.currentQuestionIndex)}
                    >
                      {option.text}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center">
              <Button
                onClick={() => handleNavigation('prev')}
                disabled={quizState.currentQuestionIndex === 0}
                className="flex items-center bg-gray-700 hover:bg-gray-600"
              >
                <ChevronLeftIcon className="mr-2" /> Previous
              </Button>
              <motion.div 
                className="text-3xl font-bold text-white bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center"
                animate={{ scale: quizState.timeRemaining <= 3 ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: quizState.timeRemaining <= 3 ? Infinity : 0, duration: 0.5 }}
              >
                {quizState.timeRemaining}
              </motion.div>
              {isLastQuestion ? (
                <Button
                  onClick={handleMoveToNextRound}
                  disabled={isSubmitting}
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : round === 2 ? 'Submit Quiz' : 'Next Round'}
                </Button>
              ) : (
                <Button
                  onClick={() => handleNavigation('next')}
                  className="flex items-center bg-gray-700 hover:bg-gray-600"
                >
                  Next <ChevronRightIcon className="ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
          <SocietyLogos />
        </div>
      )}
    </>
  )
}
