import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Github,
  Linkedin,
  FileText,
  ExternalLink,
  Download,
  Circle,
  Link,
  Facebook,
  Mail,
  Loader,
} from 'lucide-react';
import { content } from '@/config/content';
import { motion } from 'framer-motion';
import { useTypewriter } from '@/hooks/useTypewriter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HeroButton {
  label: string;
  icon: string;
  url?: string;
}

const isGradient = (color: string) => color.includes('gradient');

const iconComponents = {
  Github,
  Linkedin,
  FileText,
  ExternalLink,
  Link,
  Facebook,
  Mail,
};

const circleVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const HeroButton = React.memo(({ button }: { button: HeroButton }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const IconComponent =
    iconComponents[button.icon as keyof typeof iconComponents];
  const url = button.url
    ? (content.global as Record<string, string | null>)[
        `${button.label.toLowerCase()}Url`
      ] || '#'
    : '#';

  const handleDownload = async () => {
    if (content.global.resumeUrl === null) {
      setIsDownloading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Add a delay of 1 second
      setIsDownloading(false);
      setIsModalOpen(true);
      return;
    }

    setIsDownloading(true);
    const response = await fetch(content.global.resumeUrl);
    if (!response.ok) return;

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = (content.global.resumeUrl as string).split('/').pop() || '';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    setIsDownloading(false);
  };

  if (button.label === 'Resume') {
    return (
      <>
        <Button
          size='sm'
          variant='default'
          className='gap-2 group transition-colors duration-300'
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Download className='w-4 h-4 animate-bounce' />
          ) : (
            <FileText className='w-4 h-4 group-hover:text-primary-foreground transition-colors duration-300' />
          )}
          <span className='group-hover:text-primary-foreground transition-colors duration-300'>
            {isDownloading ? 'Downloading...' : 'Resume'}
          </span>
        </Button>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Oops! Resume Not Available</DialogTitle>
              <DialogDescription>
                It looks like Pat hasn&apos;t uploaded his resume yet. Check
                back later!
              </DialogDescription>
            </DialogHeader>
            <div className='relative'>
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
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button
      size='sm'
      variant='outline'
      className='gap-2 group transition-colors duration-300'
      asChild
    >
      <a href={url} target='_blank' rel='noopener noreferrer'>
        {IconComponent && (
          <IconComponent className='w-4 h-4 group-hover:text-primary transition-colors duration-300' />
        )}
        <span className='group-hover:text-primary transition-colors duration-300'>
          {button.label}
        </span>
      </a>
    </Button>
  );
});

HeroButton.displayName = 'HeroButton';

export function Hero() {
  const { hero } = content;
  const { currentText, isTyping } = useTypewriter(hero.typingWords);
  const [imageLoaded, setImageLoaded] = useState(false);

  const memoizedButtons = useMemo(() => hero.buttons, [hero.buttons]);

  return (
    <div
      id='about'
      className='pt-24 space-y-6 md:flex md:items-center md:space-x-8 md:space-y-0'
    >
      <div className='md:flex-1'>
        <div className='flex flex-col space-y-4 md:space-y-6'>
          <div className='flex items-start space-x-5 md:block'>
            <div className='relative flex-shrink-0 md:hidden'>
              {!imageLoaded && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Loader className='animate-spin w-8 h-8 text-muted-foreground' />
                </div>
              )}
              <Image
                src={hero.image}
                alt='Profile'
                width={160}
                height={160}
                className={`rounded-full shadow-lg ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                onLoadingComplete={() => setImageLoaded(true)}
              />
            </div>

            <div className='flex-grow flex flex-col space-y-1 md:space-y-2 pt-8'>
              <motion.h1 className='text-2xl font-bold'>{hero.title}</motion.h1>

              <div className='flex items-center md:hidden'>
                <motion.div
                  className='relative w-3 h-3 mr-2'
                  variants={circleVariants}
                  animate='animate'
                  style={{
                    filter: isGradient(hero.status.color)
                      ? 'none'
                      : `drop-shadow(0 0 3px ${hero.status.color})`,
                  }}
                >
                  <Circle
                    className='w-3 h-3 absolute'
                    style={
                      isGradient(hero.status.color)
                        ? { background: hero.status.color, borderRadius: '50%' }
                        : { color: hero.status.color }
                    }
                  />
                  <Circle
                    className='w-3 h-3 absolute animate-ping'
                    style={
                      isGradient(hero.status.color)
                        ? { background: hero.status.color, borderRadius: '50%' }
                        : { color: hero.status.color }
                    }
                  />
                </motion.div>
                <span className='text-sm font-semibold'>
                  {hero.status.text}
                </span>
              </div>

              <motion.div className='text-sm text-primary font-semibold h-6 font-mono'>
                {currentText}
                {isTyping && <span className='animate-blink'>|</span>}
              </motion.div>
            </div>
          </div>

          <motion.p className='text-lg text-muted-foreground'>
            {hero.description}
          </motion.p>

          <motion.div className='flex flex-wrap gap-2'>
            {memoizedButtons.map((button, index) => (
              <HeroButton key={index} button={button} />
            ))}
          </motion.div>
        </div>
      </div>
      <div className='hidden md:block md:flex-shrink-0 relative'>
        {!imageLoaded && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <Loader className='animate-spin w-8 h-8 text-muted-foreground' />
          </div>
        )}
        <Image
          src={hero.image}
          alt='Profile'
          width={300}
          height={300}
          className={`rounded-full shadow-lg ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          onLoadingComplete={() => setImageLoaded(true)}
        />
        <motion.div className='absolute -bottom-4 -right-4 bg-background rounded-lg shadow-lg p-2 border border-primary/30'>
          <div className='flex items-center space-x-2'>
            <motion.div
              className='relative w-3 h-3'
              variants={circleVariants}
              animate='animate'
              style={{
                filter: isGradient(hero.status.color)
                  ? 'none'
                  : `drop-shadow(0 0 4px ${hero.status.color})`,
              }}
            >
              <Circle
                className='w-3 h-3 absolute'
                style={
                  isGradient(hero.status.color)
                    ? { background: hero.status.color, borderRadius: '50%' }
                    : { color: hero.status.color }
                }
              />
              <Circle
                className='w-3 h-3 absolute animate-ping'
                style={
                  isGradient(hero.status.color)
                    ? { background: hero.status.color, borderRadius: '50%' }
                    : { color: hero.status.color }
                }
              />
            </motion.div>
            <span className='text-xs font-semibold'>{hero.status.text}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
