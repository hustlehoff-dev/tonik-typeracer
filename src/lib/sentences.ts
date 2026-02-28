export const SENTENCES: string[] = [
  'The quick brown fox jumps over the lazy dog near the river bank.',
  'Programming is the art of telling another human what one wants the computer to do.',
  'In the beginning was the Word, and the Word was with God, and the Word was God.',
  'To be or not to be, that is the question, whether tis nobler in the mind to suffer.',
  'It was the best of times, it was the worst of times, it was the age of wisdom.',
  'All happy families are alike but each unhappy family is unhappy in its own way.',
  'The only way to do great work is to love what you do and never stop learning.',
  'Success is not final, failure is not fatal, it is the courage to continue that counts.',
  'Two roads diverged in a wood and I took the one less traveled by, and that has made all the difference.',
  'The greatest glory in living lies not in never falling, but in rising every time we fall.',
  'In three words I can sum up everything I have learned about life: it goes on.',
  'Life is what happens to you while you are busy making other plans.',
  'The future belongs to those who believe in the beauty of their dreams.',
  'When you reach the end of your rope, tie a knot in it and hang on.',
  'Always remember that you are absolutely unique, just like everyone else.',
  'Do not go where the path may lead, go instead where there is no path and leave a trail.',
  'You will face many defeats in life, but never let yourself be defeated.',
  'In the end, it is not the years in your life that count, it is the life in your years.',
  'Never let the fear of striking out keep you from playing the game.',
  'Many of life greatest fears are a waste of time because they never come to pass.',
  'A good programmer looks both ways before crossing a one way street.',
  'Debugging is twice as hard as writing the code in the first place.',
  'Any fool can write code that a computer can understand, but good programmers write code that humans can understand.',
  'First, solve the problem, then write the code.',
  'Code is like humor, when you have to explain it, it is bad.',
  'Fix the cause, not the symptom.',
  'Optimism is an occupational hazard of programming, feedback is the treatment.',
  'When to use iterative development is when you are not sure what you want to build.',
  'Simplicity is the soul of efficiency.',
  'Before software can be reusable it first has to be usable.',
];

export function getRandomSentence(exclude?: string): string {
  const available = exclude
    ? SENTENCES.filter((s) => s !== exclude)
    : SENTENCES;
  return available[Math.floor(Math.random() * available.length)];
}
