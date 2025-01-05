'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/background/particle-background';
import { Nav } from '@/components/layout/nav';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Home, FolderOpen, ArrowLeft, Loader } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { content } from '@/config/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const { notFound } = content;

export default function NotFound() {
  useDocumentTitle(
    '404 - Page Not Found | Jay Patrick Cano',
    'Jay Patrick Cano | Portfolio'
  );

  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className='min-h-screen bg-background/50 text-foreground flex flex-col'>
      <ParticleBackground />
      <Nav />

      <main className='flex-grow container max-w-4xl mx-auto px-4 py-16 mt-32'>
        <motion.div
          className='text-center mb-12'
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-7xl md:text-9xl font-bold mb-4'>
            {notFound.title}
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground'>
            {notFound.subtitle}
          </p>
        </motion.div>

        <Card className='backdrop-blur-sm bg-background/30 border-none shadow-lg'>
          <CardHeader>
            <CardTitle className='text-2xl font-semibold'>
              {notFound.description}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-8'>
            <motion.div
              className='flex flex-col sm:flex-row justify-center gap-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {notFound.actions.map((action, index) => (
                <Link
                  key={action.label}
                  href={action.label === 'Back to Home' ? '/' : '/#projects'}
                  passHref
                >
                  <Button
                    variant={index === 0 ? 'default' : 'outline'}
                    className='w-full sm:w-auto gap-2'
                  >
                    {action.icon === 'Home' && <Home size={16} />}
                    {action.icon === 'FolderOpen' && <FolderOpen size={16} />}
                    {action.label}
                  </Button>
                </Link>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='relative'
            >
              {!videoLoaded && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Loader className='animate-spin w-8 h-8 text-muted-foreground' />
                </div>
              )}
              <video
                autoPlay
                loop
                playsInline
                className={`w-full mt-4 rounded-lg ${!videoLoaded ? 'opacity-0' : 'opacity-100'}`}
                style={{ pointerEvents: 'none' }}
                preload='auto'
                onLoadedData={() => setVideoLoaded(true)}
              >
                <source src='/files/rick.mp4' type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className='text-lg font-semibold mb-4'>Helpful tips:</h2>
              <ul className='space-y-2'>
                {notFound.helpfulTips.map((tip, index) => (
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
          transition={{ duration: 0.5, delay: 0.8 }}
        >
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
