"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal } from 'react-icons/fa';

interface Team {
  teamName: string;
  score: number;
  submittedAt: Date;
}

export default function WinnersDisplay() {
  const [winners, setWinners] = useState<Team[]>([]);

  useEffect(() => {
    const fetchWinners = async () => {
      const q = query(
        collection(db, 'round2'),
        orderBy('score', 'desc'),
        orderBy('submittedAt', 'asc'),
        limit(3)
      );
      const querySnapshot = await getDocs(q);
      const topThree = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          teamName: data.teamName || 'Unknown Team',
          score: data.score || 0,
          submittedAt: data.submittedAt?.toDate() || new Date()
        } as Team;
      });
      setWinners(topThree);
    };

    fetchWinners();
  }, []);

  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd
  const medals = [
    <FaTrophy key="gold" className="text-yellow-400 text-4xl" />,
    <FaMedal key="silver" className="text-gray-300 text-3xl" />,
    <FaMedal key="bronze" className="text-yellow-700 text-3xl" />
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full">
      <div className="flex justify-center items-end mb-8 relative">
        {podiumOrder.map((index, position) => (
          <motion.div
            key={index}
            className={`w-56 mx-2 p-4 rounded-lg bg-opacity-90 shadow-lg ${
              position === 1 ? 'bg-yellow-400 z-10' : position === 0 ? 'bg-gray-300 z-0' : 'bg-yellow-700 z-0'
            }`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: position === 1 ? '240px' : position === 0 ? '200px' : '160px',
              opacity: 1 
            }}
            transition={{ duration: 1, delay: index * 0.2 }}
          >
            <motion.div 
              className="text-center flex flex-col items-center justify-end h-full"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 + index * 0.2 }}
            >
              <div className="mb-2">{medals[index]}</div>
              <h3 className="text-lg font-bold mb-1 text-purple-900">{winners[index]?.teamName}</h3>
              <p className="text-md font-semibold text-purple-800">{winners[index]?.score} points</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <h3 className="text-3xl font-bold mb-2 text-yellow-300">Congratulations to our winners!</h3>
        <p className="text-lg text-gray-300">Thank you to all participants for making this event a success.</p>
      </motion.div>
      <motion.div
        className="bg-purple-800 bg-opacity-30 p-6 rounded-lg shadow-2xl backdrop-blur-sm w-full max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2 }}
      >
        <h4 className="text-2xl font-bold mb-4 text-yellow-300">Top 3 Teams:</h4>
        <ul className="space-y-4">
          {winners.map((team, index) => (
            <motion.li 
              key={index} 
              className="flex items-center text-lg"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.2 + index * 0.2 }}
            >
              <span className="mr-4">{medals[index]}</span>
              <span className="font-semibold text-white">{team.teamName}:</span>
              <span className="ml-2 text-yellow-300">{team.score} points</span>
              <span className="ml-2 text-sm text-gray-400">
                (Submitted: {team.submittedAt.toLocaleTimeString()})
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
