import WinnersDisplay from '@/components/WinnersDisplay';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Final Results | Your Event Name',
  description: 'Top winners of our event',
};

export default function FinalResultsPage() {
  // Check if the environment variable is explicitly set to 'false'
  if (process.env.NEXT_PUBLIC_SHOW_FINAL_RESULTS === 'false') {
    notFound();
  }

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 text-white flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-300">Final Results</h1>
        <div className="flex-grow">
          <WinnersDisplay />
        </div>
      </div>
    </div>
  );
}
