'use client';

import { useEffect, useState } from 'react';
import { ParticleBackground } from '@/components/background/particle-background';
import { Nav } from '@/components/layout/nav';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/sections/hero';
import { Skills } from '@/components/sections/skills';
import { ExperienceTimeline } from '@/components/sections/experience-timeline';
import { Projects } from '@/components/sections/projects';
import { InteractiveTerminal } from '@/components/interactive-terminal/terminal';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import Head from 'next/head';
import { content } from '@/config/content';
import { LoadingAnimation } from '@/components/loading/loading';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function Portfolio() {
  useDocumentTitle(
    'Jay Patrick Cano | Self-Taught Developer Portfolio',
    'Jay Patrick Cano | Portfolio'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setIsFirstVisit(false);
    } else {
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  useEffect(() => {
    document.title = 'Jay Patrick Cano | Self-Taught Developer Portfolio';
  }, []);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://0x3ef8.github.io/#person',
        name: 'Jay Patrick Cano',
        url: 'https://0x3ef8.github.io',
        image: {
          '@type': 'ImageObject',
          '@id': 'https://0x3ef8.github.io/#image',
          url: 'https://github.com/0x3EF8.png',
          width: 800,
          height: 800,
        },
        sameAs: [content.global.githubUrl, content.global.facebookUrl],
        jobTitle: 'Self-Taught Developer',
        worksFor: {
          '@type': 'Organization',
          name: 'CodeTriad Solutions',
        },
        description: content.hero.description
          .replace('$ echo "', '')
          .replace('"', ''),
      },
      {
        '@type': 'WebSite',
        '@id': 'https://0x3ef8.github.io/#website',
        url: 'https://0x3ef8.github.io',
        name: 'Jay Patrick Cano Portfolio',
        description:
          'Portfolio of Jay Patrick Cano, a self-taught Self-Taught Developer from the Philippines',
        publisher: {
          '@id': 'https://0x3ef8.github.io/#person',
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebPage',
        '@id': 'https://0x3ef8.github.io/#webpage',
        url: 'https://0x3ef8.github.io',
        name: 'Jay Patrick Cano | Self-Taught Developer Portfolio',
        isPartOf: {
          '@id': 'https://0x3ef8.github.io/#website',
        },
        about: {
          '@id': 'https://0x3ef8.github.io/#person',
        },
        description:
          'Explore the projects and skills of Jay Patrick Cano, a self-taught Self-Taught Developer from the Philippines specializing in modern web technologies.',
        inLanguage: 'en-US',
        potentialAction: [
          {
            '@type': 'ReadAction',
            target: ['https://0x3ef8.github.io'],
          },
        ],
      },
    ],
  };

  return (
    <>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <AnimatePresence>
        {isLoading && (
          <LoadingAnimation
            onLoadingComplete={() => setIsLoading(false)}
            isFirstVisit={isFirstVisit}
          />
        )}
      </AnimatePresence>
      {!isLoading && (
        <div className='min-h-screen bg-background/50 text-foreground'>
          <ParticleBackground />
          <Nav />

          <main className='container py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto'>
            <motion.div
              id='hero'
              variants={sectionVariants}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.3 }}
            >
              <Hero />
            </motion.div>

            <motion.div
              id='skills'
              variants={sectionVariants}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.3 }}
            >
              <Skills />
            </motion.div>

            <motion.div
              id='experience'
              variants={sectionVariants}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.3 }}
            >
              <ExperienceTimeline />
            </motion.div>

            <motion.div
              id='projects'
              variants={sectionVariants}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true, amount: 0.3 }}
            >
              <Projects />
            </motion.div>
          </main>

          <Footer />
          <InteractiveTerminal />
        </div>
      )}
    </>
  );
}
