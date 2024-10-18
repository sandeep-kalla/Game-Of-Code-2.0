/* eslint-disable @typescript-eslint/no-unused-vars */
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
    text: `x = [1, 2, 3]
y = x
y.append(4)
print(x)`,
    options: [
      { id: "a", text: "[1, 2, 3]" },
      { id: "b", text: "[1, 2, 3, 4]" },
      { id: "c", text: "[1, 2, 3, 4, 4]" },
      { id: "d", text: "Error" }
    ],
    correctAnswer: "b"
  },
  {
    id: 2,
    text: `int arr[5] = {1, 2, 3, 4, 5};
int *ptr = arr;
for (int i = 0; i < 5; i++) 
{
    cout << *(ptr++) << " ";
}`,
    options: [
      { id: "a", text: "1 2 3 4 5" },
      { id: "b", text: "5 4 3 2 1" },
      { id: "c", text: "2 3 4 5 6" },
      { id: "d", text: "0 1 2 3 4" }
    ],
    correctAnswer: "a"
  },
  {
    id: 3,
    text: `int a = 5, b = 7;
for (int i = 0; i < 4; i++) 
{
    a += i;
    b -= i;
}
cout << a << " " << b;`,
    options: [
      { id: "a", text: "11 3" },
      { id: "b", text: "10 5" },
      { id: "c", text: "12 4" },
      { id: "d", text: "13 1" }
    ],
    correctAnswer: "a"
  },
  {
    id: 4,
    text: `public class Test {
    public static void main(String[] args) {
        int x = 10;
        int y = 5;
        System.out.println(x + y + " is the result");
        System.out.println("Result is " + x + y);
    }
}`,
    options: [
      { id: "a", text: "15 is the result and Result is 105" },
      { id: "b", text: "15 is the result and Result is 15" },
      { id: "c", text: "15 is the result and Result is 510" },
      { id: "d", text: "Compilation error" }
    ],
    correctAnswer: "a"
  },
  {
    id: 5,
    text: `int x = 1, y = 10;
while (y-- > x++) 
{
    cout << x << " ";
}`,
    options: [
      { id: "a", text: "2 3 4 5 6 7 8 9" },
      { id: "b", text: "2 3 4 5 6 7 8 9 10" },
      { id: "c", text: "2 3 4 5 6 7 8" },
      { id: "d", text: "1 2 3 4 5 6 7 8" }
    ],
    correctAnswer: "a"
  },
  {
    id: 6,
    text: `int a = 3, b = 7;
while (b > 0) 
{
    a = a * 2;
    b--;
}
cout << a;`,
    options: [
      { id: "a", text: "24" },
      { id: "b", text: "48" },
      { id: "c", text: "96" },
      { id: "d", text: "192" }
    ],
    correctAnswer: "c"
  },
  {
    id: 7,
    text: `int n = 4;
int fact = 1;
for (int i = 1; i <= n; i++) 
{
    fact *= i;
}
cout << fact << endl;
cout << (fact & 1 ? "Odd" : "Even");`,
    options: [
      { id: "a", text: "24 Odd" },
      { id: "b", text: "24 Even" },
      { id: "c", text: "120 Even" },
      { id: "d", text: "6 Even" }
    ],
    correctAnswer: "b"
  },
  {
    id: 8,
    text: `int arr[] = {1, 2, 3, 4, 5, 6};
int n = sizeof(arr) / sizeof(arr[0]);
int sum = 0;
for (int i = 0; i < n; i++) 
{
    if (arr[i] % 2 == 0)
        sum += arr[i];
}
cout << sum;`,
    options: [
      { id: "a", text: "6" },
      { id: "b", text: "12" },
      { id: "c", text: "10" },
      { id: "d", text: "14" }
    ],
    correctAnswer: "d"
  },
  {
    id: 9,
    text: `let a = 5;
let b = "5";
console.log(a == b);
console.log(a === b);`,
    options: [
      { id: "a", text: "true and true" },
      { id: "b", text: "false and true" },
      { id: "c", text: "true and false" },
      { id: "d", text: "false and false" }
    ],
    correctAnswer: "c"
  },
  {
    id: 10,
    text: `int x = 5;\n
int y = ++x + x++;\n
cout << y;`,
    options: [
      { id: "a", text: "11" },
      { id: "b", text: "12" },
      { id: "c", text: "10" },
      { id: "d", text: "13" }
    ],
    correctAnswer: "d"
  },
  {
    id: 11,
    text: "arr = [1, 2, 3, 4, 5, 6]\ntotal = 0\nfor i in range(0, len(arr), 2):\n total += arr[i]\nprint(total)",
    options: [
      { id: "a", text: "9" },
      { id: "b", text: "12" },
      { id: "c", text: "15" },
      { id: "d", text: "10" }
    ],
    correctAnswer: "a"
  },
  {
    id: 12,
    text: "n = 5\nfact = 1\nfor i in range(1, n+1):\n fact *= i\nprint(fact)\nprint(\"Odd\" if fact % 2 != 0 else \"Even\")",
    options: [
      { id: "a", text: "120 Even" },
      { id: "b", text: "24 Odd" },
      { id: "c", text: "120 Odd" },
      { id: "d", text: "24 Even" }
    ],
    correctAnswer: "a"
  },
  {
    id: 13,
    text: "x = 1\ny = 10\nwhile x < y:\n x *= 2\n y -= 1\nprint(x, y)",
    options: [
      { id: "a", text: "4 8" },
      { id: "b", text: "8 7" },
      { id: "c", text: "16 6" },
      { id: "d", text: "2 9" }
    ],
    correctAnswer: "b"
  },
  {
    id: 14,
    text: "x = 10\ny = 5\nif x > y:\n if y % 2 == 0:\n  print(\"y is even\")\n else:\n  print(\"y is odd\")\nelse:\n print(\"x is smaller\")",
    options: [
      { id: "a", text: "x is smaller" },
      { id: "b", text: "y is even" },
      { id: "c", text: "y is odd" },
      { id: "d", text: "Error" }
    ],
    correctAnswer: "c"
  },
  {
    id: 15,
    text: "arr = [10, 15, 7, 9, 11]\nmax_val = arr[0]\nfor i in arr:\n if i > max_val:\n  max_val = i\nprint(max_val)",
    options: [
      { id: "a", text: "7" },
      { id: "b", text: "15" },
      { id: "c", text: "10" },
      { id: "d", text: "11" }
    ],
    correctAnswer: "b"
  },
  {
    id: 16,
    text: "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)",
    options: [
      { id: "a", text: "[1, 2, 3]" },
      { id: "b", text: "[1, 2, 3, 4]" },
      { id: "c", text: "[4]" },
      { id: "d", text: "[]" }
    ],
    correctAnswer: "b"
  },
  {
    id: 17,
    text: "def fibonacci(n, memo={}):\n if n in memo:\n  return memo[n]\n if n <= 2:\n  return 1\n memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)\n return memo[n]\nresult = fibonacci(6)\nprint(result)",
    options: [
      { id: "a", text: "5" },
      { id: "b", text: "8" },
      { id: "c", text: "13" },
      { id: "d", text: "21" }
    ],
    correctAnswer: "b"
  },
  {
    id: 18,
    text: "Which HTML attribute is used to define inline styles?",
    options: [
      { id: "a", text: "font" },
      { id: "b", text: "styles" },
      { id: "c", text: "style" },
      { id: "d", text: "class" }
    ],
    correctAnswer: "c"
  },
  {
    id: 19,
    text: "In CSS, how can you select all elements with a class name button?",
    options: [
      { id: "a", text: "#button" },
      { id: "b", text: ".button" },
      { id: "c", text: "button" },
      { id: "d", text: "*button" }
    ],
    correctAnswer: "b"
  },
  {
    id: 20,
    text: "Which of the following is used to declare a variable in JavaScript?",
    options: [
      { id: "a", text: "var" },
      { id: "b", text: "let" },
      { id: "c", text: "const" },
      { id: "d", text: "All of the above" }
    ],
    correctAnswer: "d"
  },
  {
    id: 21,
    text: "Which HTML tag is used to define an interactive clickable button?",
    options: [
      { id: "a", text: "<input>" },
      { id: "b", text: "<button>" },
      { id: "c", text: "<form>" },
      { id: "d", text: "<a>" }
    ],
    correctAnswer: "b"
  },
  {
    id: 22,
    text: "Which method is used to round a number to the nearest integer in JavaScript?",
    options: [
      { id: "a", text: "Math.floor()" },
      { id: "b", text: "Math.round()" },
      { id: "c", text: "Math.ceil()" },
      { id: "d", text: "Math.random()" }
    ],
    correctAnswer: "b"
  },
  {
    id: 23,
    text: "Which of the following is NOT an example of Artificial Intelligence?",
    options: [
      { id: "a", text: "A chatbot answering queries" },
      { id: "b", text: "A self-driving car" },
      { id: "c", text: "A calculator performing arithmetic operations" },
      { id: "d", text: "A smart thermostat adjusting temperature based on preferences" }
    ],
    correctAnswer: "c"
  },
  {
    id: 24,
    text: "What is \"overfitting\" in machine learning?",
    options: [
      { id: "a", text: "When the model fits perfectly on the training data but performs poorly on new data" },
      { id: "b", text: "When the model cannot fit the training data at all" },
      { id: "c", text: "When the model requires too much computational power" },
      { id: "d", text: "When the model predicts values higher than expected" }
    ],
    correctAnswer: "a"
  },
  {
    id: 25,
    text: "Which of the following is a common application of AI in daily life?",
    options: [
      { id: "a", text: "Internet search engines" },
      { id: "b", text: "Traffic light systems" },
      { id: "c", text: "Airplane autopilot" },
      { id: "d", text: "All of the above" }
    ],
    correctAnswer: "d"
  },
  {
    id: 26,
    text: "Which algorithm is typically used for classification tasks?",
    options: [
      { id: "a", text: "K-Means Clustering" },
      { id: "b", text: "Linear Regression" },
      { id: "c", text: "Decision Trees" },
      { id: "d", text: "Principal Component Analysis (PCA)" }
    ],
    correctAnswer: "c"
  },
  {
    id: 27,
    text: "Which type of AI mimics the structure and function of the human brain?",
    options: [
      { id: "a", text: "Decision Trees" },
      { id: "b", text: "Neural Networks" },
      { id: "c", text: "Support Vector Machines" },
      { id: "d", text: "K-Nearest Neighbors" }
    ],
    correctAnswer: "b"
  },
  {
    id: 28,
    text: "You are given this sequence: 2, 4, 8, 16, 32. What is the next number in the sequence?",
    options: [
      { id: "a", text: "48" },
      { id: "b", text: "64" },
      { id: "c", text: "50" },
      { id: "d", text: "100" }
    ],
    correctAnswer: "b"
  },
  {
    id: 29,
    text: "A digital clock displays the time in HH:MM format. How many times does the digit \"1\" appear in the time from 12:00 AM to 11:59 PM in a single day?",
    options: [
      { id: "a", text: "120" },
      { id: "b", text: "144" },
      { id: "c", text: "156" },
      { id: "d", text: "168" }
    ],
    correctAnswer: "c"
  },
  {
    id: 30,
    text: "You have a box with 100 balls: 50 red and 50 blue. You are blindfolded and allowed to pick two balls at a time. If they are of the same color, you discard them and put a blue ball back into the box. If they are of different colors, you discard them and put a red ball back. What will be the color of the last ball remaining?",
    options: [
      { id: "a", text: "Red" },
      { id: "b", text: "Blue" },
      { id: "c", text: "Both are possible" },
      { id: "d", text: "Cannot be determined" }
    ],
    correctAnswer: "a"
  },
  {
    id: 31,
    text: "Which data structure uses the concept of \"First In, First Out\" (FIFO)?",
    options: [
      { id: "a", text: "Stack" },
      { id: "b", text: "Queue" },
      { id: "c", text: "Hash Table" },
      { id: "d", text: "Tree" }
    ],
    correctAnswer: "b"
  },
  {
    id: 32,
    text: "What is the time complexity of searching for an element in a balanced binary search tree (BST)?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(1)" },
      { id: "d", text: "O(n log n)" }
    ],
    correctAnswer: "b"
  },
  {
    id: 33,
    text: "In which of the following scenarios would you prefer a linked list over an array?",
    options: [
      { id: "a", text: "Random access of elements is needed." },
      { id: "b", text: "Insertions at the middle or beginning are frequent." },
      { id: "c", text: "Memory is a constraint." },
      { id: "d", text: "The list size is known in advance." }
    ],
    correctAnswer: "b"
  },
  {
    id: 34,
    text: "Which of the following sorting algorithms has the best average-case time complexity?",
    options: [
      { id: "a", text: "Bubble Sort" },
      { id: "b", text: "Selection Sort" },
      { id: "c", text: "Quick Sort" },
      { id: "d", text: "Insertion Sort" }
    ],
    correctAnswer: "c"
  },
  {
    id: 35,
    text: "In a min-heap, what is the relationship between the parent and child nodes?",
    options: [
      { id: "a", text: "Parent node is always smaller than the child nodes." },
      { id: "b", text: "Parent node is always larger than the child nodes." },
      { id: "c", text: "Parent node is always equal to the child nodes." },
      { id: "d", text: "Parent node can be larger or smaller than the child nodes." }
    ],
    correctAnswer: "a"
  }
];

const quizDataRound2: Question[] = [
  {
    id: 1,
    text: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++)     
        for (int j = 0; j < n-i-1; j++) 
            if (arr[j] > arr[j+1]) 
                swap(arr[j], arr[j+1]); 
}

// What is the time complexity of this algorithm?`,
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(n log n)" },
      { id: "c", text: "O(n^2)" },
      { id: "d", text: "O(log n)" }
    ],
    correctAnswer: "c"
  },
  {
    id: 2,
    text: "What is the maximum number of edges in a simple undirected graph with n vertices?",
    options: [
      { id: "a", text: "n" },
      { id: "b", text: "n(n-1)/2" },
      { id: "c", text: "n(n+1)/2" },
      { id: "d", text: "n^2" }
    ],
    correctAnswer: "b"
  },
  {
    id: 3,
    text: "Which data structure uses the Last In First Out (LIFO) principle?",
    options: [
      { id: "a", text: "Queue" },
      { id: "b", text: "Stack" },
      { id: "c", text: "Array" },
      { id: "d", text: "Linked List" }
    ],
    correctAnswer: "b"
  },
  {
    id: 4,
    text: "In which case is a binary search algorithm not applicable?",
    options: [
      { id: "a", text: "When the array is sorted" },
      { id: "b", text: "When the array is unsorted" },
      { id: "c", text: "When the array contains duplicates" },
      { id: "d", text: "When the array is large" }
    ],
    correctAnswer: "b"
  },
  {
    id: 5,
    text: "What is the average time complexity of accessing an element in a hash table?",
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(n)" },
      { id: "c", text: "O(log n)" },
      { id: "d", text: "O(n log n)" }
    ],
    correctAnswer: "a"
  },
  {
    id: 6,
    text: "What will be the output of the following code?\n\ndef test(a, b):\n return a + b\nprint(test(5, \"5\"))",
    options: [
      { id: "a", text: "10" },
      { id: "b", text: "55" },
      { id: "c", text: "Error" },
      { id: "d", text: "None" }
    ],
    correctAnswer: "b"
  },
  {
    id: 7,
    text: "Which algorithm is primarily used for finding the shortest path in a weighted graph?",
    options: [
      { id: "a", text: "Breadth-First Search" },
      { id: "b", text: "Dijkstra's Algorithm" },
      { id: "c", text: "Depth-First Search" },
      { id: "d", text: "Kruskal's Algorithm" }
    ],
    correctAnswer: "b"
  },
  {
    id: 8,
    text: "What is the space complexity of a binary tree with n nodes?",
    options: [
      { id: "a", text: "O(log n)" },
      { id: "b", text: "O(n)" },
      { id: "c", text: "O(n log n)" },
      { id: "d", text: "O(1)" }
    ],
    correctAnswer: "b"
  },
  {
    id: 9,
    text: "Which of the following searching algorithms can be implemented using a recursive approach?",
    options: [
      { id: "a", text: "Linear Search" },
      { id: "b", text: "Binary Search" },
      { id: "c", text: "Both a and b" },
      { id: "d", text: "None of the above" }
    ],
    correctAnswer: "c"
  },
  {
    id: 10,
    text: "What is the purpose of a priority queue?",
    options: [
      { id: "a", text: "To manage elements in sorted order" },
      { id: "b", text: "To provide quick access to the highest (or lowest) priority element" },
      { id: "c", text: "To maintain a fixed-size collection of elements" },
      { id: "d", text: "All of the above" }
    ],
    correctAnswer: "b"
  },
  {
    id: 11,
    text: "What is overfitting in a machine learning model?",
    options: [
      { id: "a", text: "Model performs well on training data but poorly on unseen data" },
      { id: "b", text: "Model performs poorly on both training and test data" },
      { id: "c", text: "Model performs well on test data but poorly on training data" },
      { id: "d", text: "None of the above" }
    ],
    correctAnswer: "a"
  },
  {
    id: 12,
    text: "Which of the following is a type of unsupervised learning?",
    options: [
      { id: "a", text: "Linear Regression" },
      { id: "b", text: "Decision Trees" },
      { id: "c", text: "K-Means Clustering" },
      { id: "d", text: "Support Vector Machines" }
    ],
    correctAnswer: "c"
  },
  {
    id: 13,
    text: "What does the term \"bias\" refer to in machine learning?",
    options: [
      { id: "a", text: "The error introduced by approximating a real-world problem" },
      { id: "b", text: "The complexity of the model" },
      { id: "c", text: "The ability of the model to generalize" },
      { id: "d", text: "The size of the dataset" }
    ],
    correctAnswer: "a"
  },
  {
    id: 14,
    text: "Which algorithm is commonly used for classification tasks?",
    options: [
      { id: "a", text: "K-Means" },
      { id: "b", text: "Linear Regression" },
      { id: "c", text: "Random Forest" },
      { id: "d", text: "K-Means Clustering" }
    ],
    correctAnswer: "c"
  },
  {
    id: 15,
    text: "What is the purpose of the activation function in a neural network?",
    options: [
      { id: "a", text: "To scale input data" },
      { id: "b", text: "To introduce non-linearity into the model" },
      { id: "c", text: "To initialize weights" },
      { id: "d", text: "To optimize the model" }
    ],
    correctAnswer: "b"
  },
  {
    id: 16,
    text: "In a MERN stack application, what does \"M\" stand for?",
    options: [
      { id: "a", text: "MongoDB" },
      { id: "b", text: "MySQL" },
      { id: "c", text: "MariaDB" },
      { id: "d", text: "Microsoft SQL Server" }
    ],
    correctAnswer: "a"
  },
  {
    id: 17,
    text: "What is the primary purpose of Express.js in the MERN stack?",
    options: [
      { id: "a", text: "To manage the database" },
      { id: "b", text: "To build user interfaces" },
      { id: "c", text: "To handle server-side logic and routing" },
      { id: "d", text: "To create mobile applications" }
    ],
    correctAnswer: "c"
  },
  {
    id: 18,
    text: "Which command is used to create a new React application using Create React App?",
    options: [
      { id: "a", text: "create-react-app my-app" },
      { id: "b", text: "npx create-react-app my-app" },
      { id: "c", text: "npm install create-react-app" },
      { id: "d", text: "react-create-app my-app" }
    ],
    correctAnswer: "b"
  },
  {
    id: 19,
    text: "In a MERN application, which of the following is NOT a feature of MongoDB?",
    options: [
      { id: "a", text: "Document-oriented storage" },
      { id: "b", text: "SQL query support" },
      { id: "c", text: "Schema-less database" },
      { id: "d", text: "High availability" }
    ],
    correctAnswer: "b"
  },
  {
    id: 20,
    text: "What is the purpose of Redux in a MERN stack application?",
    options: [
      { id: "a", text: "To manage server-side routes" },
      { id: "b", text: "To facilitate state management" },
      { id: "c", text: "To interact with the database" },
      { id: "d", text: "To handle user authentication" }
    ],
    correctAnswer: "b"
  },
  {
    id: 21,
    text: "If you have a 3-gallon jug and a 5-gallon jug, how can you measure out exactly 4 gallons of water?",
    options: [
      { id: "a", text: "Fill the 5-gallon jug and pour it into the 3-gallon jug twice" },
      { id: "b", text: "Fill the 3-gallon jug and pour it into the 5-gallon jug twice" },
      { id: "c", text: "Fill the 3-gallon jug and pour it into the 5-gallon jug once" },
      { id: "d", text: "Fill the 5-gallon jug and pour it out" }
    ],
    correctAnswer: "a"
  },
  {
    id: 22,
    text: "A man is pushing his car along a road when he comes to a hotel. He shouts, \"I'm bankrupt!\" Why?",
    options: [
      { id: "a", text: "He lost all his money" },
      { id: "b", text: "He is playing Monopoly" },
      { id: "c", text: "He was robbed" },
      { id: "d", text: "He can't afford a car" }
    ],
    correctAnswer: "b"
  },
  {
    id: 23,
    text: "You have two eggs. You want to find the highest floor from which you can drop an egg without breaking it. What is the minimum number of drops required in the worst case?",
    options: [
      { id: "a", text: "10" },
      { id: "b", text: "14" },
      { id: "c", text: "7" },
      { id: "d", text: "3" }
    ],
    correctAnswer: "b"
  },
  {
    id: 24,
    text: "You are in a room with two doors: one leads to freedom and the other leads to certain death. There are two guards, one in front of each door. One guard always tells the truth, and the other always lies. You can ask one guard one question. What question do you ask?",
    options: [
      { id: "a", text: "Which door leads to freedom?" },
      { id: "b", text: "What would the other guard say?" },
      { id: "c", text: "Are you the truthful guard?" },
      { id: "d", text: "Is the sky blue?" }
    ],
    correctAnswer: "b"
  },
  {
    id: 25,
    text: "If a rooster lays an egg on top of a barn roof, which way will it roll?",
    options: [
      { id: "a", text: "To the left" },
      { id: "b", text: "To the right" },
      { id: "c", text: "Roosters don't lay eggs" },
      { id: "d", text: "It will not roll" }
    ],
    correctAnswer: "c"
  },
  {
    id: 26,
    text: "You have 8 balls of equal size. One of them is slightly heavier. How can you find the heavier ball in only two weighings?",
    options: [
      { id: "a", text: "Weigh 3 against 3, then 1 against 1" },
      { id: "b", text: "Weigh 4 against 4" },
      { id: "c", text: "Weigh 2 against 2" },
      { id: "d", text: "Weigh 3 against 2" }
    ],
    correctAnswer: "a"
  },
  {
    id: 27,
    text: "How many times can you subtract 5 from 25?",
    options: [
      { id: "a", text: "5" },
      { id: "b", text: "4" },
      { id: "c", text: "1" },
      { id: "d", text: "25" }
    ],
    correctAnswer: "c"
  },
  {
    id: 28,
    text: "A farmer has 17 sheep, and all but 9 die. How many are left?",
    options: [
      { id: "a", text: "17" },
      { id: "b", text: "9" },
      { id: "c", text: "8" },
      { id: "d", text: "0" }
    ],
    correctAnswer: "b"
  },
  {
    id: 29,
    text: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: [
      { id: "a", text: "5 minutes" },
      { id: "b", text: "100 minutes" },
      { id: "c", text: "10 minutes" },
      { id: "d", text: "50 minutes" }
    ],
    correctAnswer: "a"
  },
  {
    id: 30,
    text: "In a certain code language, if \"WATER\" is coded as \"GURVE,\" how would you code \"FIRE\"?",
    options: [
      { id: "a", text: "UQIV" },
      { id: "b", text: "UQRE" },
      { id: "c", text: "UQIF" },
      { id: "d", text: "UQIE" }
    ],
    correctAnswer: "b"
  }
];

// Replace the existing QUESTION_TIME_LIMIT constant with these:
const ROUND_ONE_TIME_LIMIT = 90; // seconds
const ROUND_TWO_TIME_LIMIT = 120; // seconds

interface ModernInteractiveQuizComponentProps {
  round: number;
  onNextRound: (score: number) => void;
  onQuizComplete: (score: number) => void;
}

const BREAK_TIME = 15 * 60; // 30 minutes in seconds

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
const ELIMINATION_SCORE_LIMIT = 20; // Adjust this value as needed

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

// Add this function near the top of your file
const isCodeQuestion = (text: string) => {
  return text.includes('\n') && (
    text.includes('{') || 
    text.includes('def ') || 
    text.includes('class ') ||
    text.includes('for ') ||
    text.includes('while ') ||
    text.includes('if ') ||
    text.includes('print') ||
    text.includes('console.log')
  );
};

export function ModernInteractiveQuizComponent({ round, onNextRound, onQuizComplete, teamName }: ModernInteractiveQuizComponentProps & { teamName: string }) {
  const [quizState, setQuizState] = useState<QuizState>(() => ({
    currentQuestionIndex: 0,
    answers: {},
    visitedQuestions: new Set([0]),
    lockedQuestions: new Set(),
    timeRemaining: round === 1 ? ROUND_ONE_TIME_LIMIT : ROUND_TWO_TIME_LIMIT
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
      timeRemaining: round === 1 ? ROUND_ONE_TIME_LIMIT : ROUND_TWO_TIME_LIMIT
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
  }, [quizState.currentQuestionIndex, round])

  const lockCurrentQuestionAndMoveToNext = (prevState: QuizState): QuizState => {
    const lockedQuestions = new Set(prevState.lockedQuestions)
    lockedQuestions.add(prevState.currentQuestionIndex)

    const nextIndex = findNextUnlockedQuestion(prevState.currentQuestionIndex + 1, lockedQuestions)
    
    return {
      ...prevState,
      currentQuestionIndex: nextIndex,
      visitedQuestions: new Set([...Array.from(prevState.visitedQuestions), nextIndex]),
      lockedQuestions,
      timeRemaining: round === 1 ? ROUND_ONE_TIME_LIMIT : ROUND_TWO_TIME_LIMIT
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
        timeRemaining: round === 1 ? ROUND_ONE_TIME_LIMIT : ROUND_TWO_TIME_LIMIT
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
      timeRemaining: round === 1 ? ROUND_ONE_TIME_LIMIT : ROUND_TWO_TIME_LIMIT
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
                <h2 className="text-2xl font-bold mb-6 text-white">
                  {isCodeQuestion(currentQuestion.text) ? (
                    <pre className="text-sm overflow-x-auto p-4 bg-gray-800 rounded-lg">
                      <code>{currentQuestion.text}</code>
                    </pre>
                  ) : (
                    currentQuestion.text
                  )}
                </h2>
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
