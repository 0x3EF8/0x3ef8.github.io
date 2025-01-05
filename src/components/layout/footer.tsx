import React, { useState, useEffect } from 'react';
import { GitHubActivity } from '@/components/background/github-activity';
import { content } from '@/config/content';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Facebook, Mail } from 'lucide-react';
import Link from 'next/link';

const iconComponents = {
  Github,
  Facebook,
  Mail,
};

export function Footer() {
  const { footer, global } = content;
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % footer.quotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [footer.quotes.length]);

  return (
    <footer className='border-t py-4 mt-16 bg-background/80 backdrop-blur-sm relative'>
      <GitHubActivity />
      <div className='container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center text-center'>
          <div className='h-16 mb-2 overflow-hidden'>
            <AnimatePresence mode='wait'>
              <motion.blockquote
                key={currentQuote}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className='text-xs italic text-muted-foreground'
              >
                &quot;{footer.quotes[currentQuote].text}&quot;
                <footer className='text-xs mt-2 font-semibold'>
                  - {footer.quotes[currentQuote].author}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className='flex justify-center space-x-4 mb-2'>
            {footer.socialLinks.map((link) => {
              const IconComponent =
                iconComponents[link.icon as keyof typeof iconComponents];
              const url =
                (global as Record<string, string | null>)[link.url] || '#';
              const safeUrl = typeof url === 'string' ? url : '#';
              return (
                <Link
                  key={link.name}
                  href={safeUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground hover:text-primary transition-colors duration-200'
                >
                  {IconComponent && <IconComponent className='w-5 h-5' />}
                  <span className='sr-only'>{link.name}</span>
                </Link>
              );
            })}
          </div>
          <p className='text-xs text-muted-foreground mt-2'>
            © {new Date().getFullYear()} {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
