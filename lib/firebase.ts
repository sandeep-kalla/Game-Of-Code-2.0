import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAayKahWMaGf-rPu_slhGbDgCihpBJJTFQ",
  authDomain: "gameofcode-7215f.firebaseapp.com",
  projectId: "gameofcode-7215f",
  storageBucket: "gameofcode-7215f.appspot.com",
  messagingSenderId: "451762420184",
  appId: "1:451762420184:web:27f72fe578d023117d1aad",
  measurementId: "G-1JTEXS0SJN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

export const storeRoundScore = async (teamName: string, roundName: string, score: number) => {
  try {
    const roundScoreRef = doc(collection(db, roundName));
    await setDoc(roundScoreRef, {
      teamName,
      score,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error storing round score:", error);
    throw error;
  }
};
