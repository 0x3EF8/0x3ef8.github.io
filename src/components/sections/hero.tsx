import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { Button } from  "@/src/components/ui/button"
import { Github, Linkedin, FileText, ExternalLink, Download, Circle, Link, Facebook, Mail } from 'lucide-react'
import { content } from  "@/src/config/content"
import { motion } from 'framer-motion'
import { useTypewriter } from '@/src/hooks/useTypewriter'

interface HeroButton {
  label: string;
  icon: string;
  url?: string;
}

const isGradient = (color: string) => color.includes('gradient');

const iconComponents = {
  Github, Linkedin, FileText, ExternalLink, Link, Facebook, Mail
};

const circleVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const HeroButton = React.memo(({ button }: { button: HeroButton }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const IconComponent = iconComponents[button.icon as keyof typeof iconComponents];
  const url = button.url 
    ? (content.global as Record<string, string>)[`${button.label.toLowerCase()}Url`]
    : '#';

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(content.global.resumeUrl);
      if (!response.ok) throw new Error('Failed to download resume');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = content.global.resumeUrl.split('/').pop() || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to download resume. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (button.label === "Resume") {
    return (
      <Button 
        size="sm" 
        variant="default"
        className="gap-2 group transition-colors duration-300"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Download className="w-4 h-4 animate-bounce" />
        ) : (
          <FileText className="w-4 h-4 group-hover:text-primary-foreground transition-colors duration-300" />
        )}
        <span className="group-hover:text-primary-foreground transition-colors duration-300">
          {isDownloading ? "Downloading..." : "Resume"}
        </span>
      </Button>
    );
  }

  return (
    <Button 
      size="sm" 
      variant="outline"
      className="gap-2 group transition-colors duration-300"
      asChild
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        {IconComponent && <IconComponent className="w-4 h-4 group-hover:text-primary transition-colors duration-300" />}
        <span className="group-hover:text-primary transition-colors duration-300">{button.label}</span>
      </a>
    </Button>
  );
});

HeroButton.displayName = 'HeroButton';

export function Hero() {
  const { hero } = content;
  const { currentText, isTyping } = useTypewriter(hero.typingWords);

  const memoizedButtons = useMemo(() => hero.buttons, [hero.buttons]);

  return (
    <div 
      id="about"
      className="pt-24 space-y-6 md:flex md:items-center md:space-x-8 md:space-y-0"
    >
      <div className="md:flex-1">
        <div className="flex flex-col space-y-4 md:space-y-6">
          <div className="flex items-start space-x-5 md:block">
            <div 
              className="relative flex-shrink-0 md:hidden"
            >
              <Image
                src={hero.image}
                alt="Profile"
                width={160}
                height={160}
                className="rounded-full shadow-lg"
              />
            </div>
            
            <div className="flex-grow flex flex-col space-y-1 md:space-y-2 pt-8">
              <motion.h1 className="text-2xl font-bold">{hero.title}</motion.h1>
              
              <div
                className="flex items-center md:hidden"
              >
                <motion.div
                  className="relative w-3 h-3 mr-2"
                  variants={circleVariants}
                  animate="animate"
                  style={{
                    filter: isGradient(hero.status.color) ? 'none' : `drop-shadow(0 0 3px ${hero.status.color})`,
                  }}
                >
                  <Circle 
                    className="w-3 h-3 absolute" 
                    style={isGradient(hero.status.color) ? { background: hero.status.color, borderRadius: '50%' } : { color: hero.status.color } } 
                  />
                  <Circle 
                    className="w-3 h-3 absolute animate-ping" 
                    style={isGradient(hero.status.color) ? { background: hero.status.color, borderRadius: '50%' } : { color: hero.status.color } } 
                  />
                </motion.div>
                <span className="text-sm font-semibold">
                  {hero.status.text}
                </span>
              </div>

              <motion.div className="text-sm text-primary font-semibold h-6 font-mono">
                {currentText}
                {isTyping && <span className="animate-blink">|</span>}
              </motion.div>
            </div>
          </div>

          <motion.p className="text-lg text-muted-foreground">
            {hero.description}
          </motion.p>
          
          <motion.div className="flex flex-wrap gap-2">
            {memoizedButtons.map((button, index) => (
              <HeroButton key={index} button={button} />
            ))}
          </motion.div>
        </div>
      </div>
      <div 
        className="hidden md:block md:flex-shrink-0 relative"
      >
        <Image
          src={hero.image}
          alt="Profile"
          width={300}
          height={300}
          className="rounded-full shadow-lg"
        />
        <motion.div
          className="absolute -bottom-4 -right-4 bg-background rounded-lg shadow-lg p-2 border border-primary/30"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className="relative w-3 h-3"
              variants={circleVariants}
              animate="animate"
              style={{
                filter: isGradient(hero.status.color) ? 'none' : `drop-shadow(0 0 4px ${hero.status.color})`,
              }}
            >
              <Circle 
                className="w-3 h-3 absolute" 
                style={isGradient(hero.status.color) ? { background: hero.status.color, borderRadius: '50%' } : { color: hero.status.color } } 
              />
              <Circle 
                className="w-3 h-3 absolute animate-ping" 
                style={isGradient(hero.status.color) ? { background: hero.status.color, borderRadius: '50%' } : { color: hero.status.color } } 
              />
            </motion.div>
            <span className="text-xs font-semibold">
              {hero.status.text}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}