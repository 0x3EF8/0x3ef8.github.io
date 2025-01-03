'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/src/components/background/particle-background';
import { Nav } from '@/src/components/layout/nav';
import { Footer } from '@/src/components/layout/footer';
import { Button } from '@/src/components/ui/button';
import { RefreshCcw, Home, ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { useDocumentTitle } from '@/src/hooks/useDocumentTitle';
import { content } from '@/src/config/content';

const { error: errorContent } = content;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useDocumentTitle('Error | Jay Patrick Cano', 'Jay Patrick Cano | Portfolio');

  useEffect(() => {
    console.error('Error occurred:', error);
  }, [error]);

  return (
    <div className='min-h-screen bg-background/50 text-foreground flex flex-col'>
      <ParticleBackground />
      <Nav />

      <main className='flex-grow container max-w-4xl mx-auto px-4 py-16'>
        <motion.div
          className='text-center mb-12'
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-5xl md:text-7xl font-bold mb-4'>
            {errorContent.title}
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground'>
            {errorContent.subtitle}
          </p>
        </motion.div>

        <Card className='backdrop-blur-sm bg-background/30 border-none shadow-lg'>
          <CardHeader>
            <CardTitle className='text-2xl font-semibold'>
              {errorContent.description}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-8'>
            <motion.div
              className='flex flex-col sm:flex-row justify-center gap-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {errorContent.actions.map((action, index) => (
                <Button
                  key={action.label}
                  onClick={
                    action.label === 'Try again' ? () => reset() : undefined
                  }
                  variant={index === 0 ? 'default' : 'outline'}
                  className='w-full sm:w-auto gap-2'
                >
                  {action.icon === 'RefreshCcw' && <RefreshCcw size={16} />}
                  {action.icon === 'Home' && <Home size={16} />}
                  {action.label}
                </Button>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className='text-lg font-semibold mb-4'>What you can do:</h2>
              <ul className='space-y-2'>
                {errorContent.helpfulTips.map((tip, index) => (
                  <li key={index} className='flex items-start'>
                    <span className='inline-block w-4 h-4 mr-2 rounded-full bg-primary/20 flex-shrink-0 mt-1' />
                    <span className='text-muted-foreground'>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </CardContent>
        </Card>

        <motion.div
          className='mt-12 text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className='text-sm text-muted-foreground mb-4'>
            Error ID: {error.digest || 'Unknown'}
          </p>
          <Link
            href='/'
            className='inline-flex items-center text-primary hover:underline'
          >
            <ArrowLeft size={16} className='mr-2' />
            Return to the previous page
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
