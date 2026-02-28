export type CharStatus = 'correct' | 'incorrect' | 'pending';

export function calculateWpm(
  typedText: string,
  targetText: string,
  elapsedSeconds: number
): number {
  if (elapsedSeconds <= 0 || typedText.length === 0) return 0;

  const typedWords = typedText.split(' ');
  const targetWords = targetText.split(' ');

  const correctWordCount = typedWords.filter(
    (word, i) => word === targetWords[i]
  ).length;

  return Math.round((correctWordCount / elapsedSeconds) * 60);
}

export function calculateAccuracy(
  typedText: string,
  targetText: string
): number {
  if (typedText.length === 0) return 1;

  let correctCount = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === targetText[i]) {
      correctCount++;
    }
  }

  return correctCount / typedText.length;
}

export function getCharStatus(
  typedText: string,
  targetText: string
): CharStatus[] {
  return targetText.split('').map((_, i) => {
    if (i >= typedText.length) return 'pending';
    return typedText[i] === targetText[i] ? 'correct' : 'incorrect';
  });
}

export function isFinished(typedText: string, targetText: string): boolean {
  return typedText === targetText;
}
