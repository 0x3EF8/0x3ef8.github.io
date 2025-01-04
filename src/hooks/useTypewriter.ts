import { useState, useEffect } from 'react';

export function useTypewriter(
  words: string[],
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenWords = 1000
) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];
    const prefix = word.split(' ')[0] + ' ';

    if (isDeleting) {
      if (currentText === prefix) {
        setIsDeleting(false);
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      } else {
        const timeoutId = setTimeout(() => {
          setCurrentText(word.substring(0, currentText.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timeoutId);
      }
    } else {
      if (currentText === word) {
        const timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, delayBetweenWords);
        return () => clearTimeout(timeoutId);
      } else {
        const timeoutId = setTimeout(() => {
          setCurrentText(word.substring(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    currentText,
    currentWordIndex,
    isDeleting,
    words,
    typingSpeed,
    deletingSpeed,
    delayBetweenWords,
  ]);

  return {
    currentText,
    isTyping: !isDeleting && currentText !== words[currentWordIndex],
  };
}
