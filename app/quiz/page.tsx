'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ModernInteractiveQuizComponent } from '@/components/modern-interactive-quiz'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizContent />
    </Suspense>
  );
}

function QuizContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [round, setRound] = useState(1)

  useEffect(() => {
    const roundParam = searchParams?.get('round'); // Use optional chaining
    if (roundParam) {
      setRound(parseInt(roundParam, 10));
    }
  }, [searchParams]);

  const storeScore = async (roundNumber: number, score: number) => {
    const teamName = localStorage.getItem('teamName')
    if (!teamName) {
      toast.error('Team name not found. Please sign up again.')
      router.push('/')
      return
    }

    try {
      await addDoc(collection(db, `round${roundNumber}`), {
        teamName,
        score,
        submittedAt: new Date()
      })
      toast.success(`Round ${roundNumber} score submitted successfully!`)
    } catch (error) {
      console.error(`Error storing round ${roundNumber} score:`, error)
      toast.error(`Failed to submit round ${roundNumber} score. Please try again.`)
    }
  }

  const handleNextRound = async (score: number) => {
    await storeScore(1, score)
    const nextRound = round + 1
    router.push(`/quiz?round=${nextRound}`)
  }

  const handleQuizComplete = async (score: number) => {
    await storeScore(2, score)
    router.push('/results')
  }

  return (
    <ModernInteractiveQuizComponent
      key={round}
      round={round}
      onNextRound={handleNextRound}
      onQuizComplete={handleQuizComplete}
      teamName={''}
    />
  );
}
