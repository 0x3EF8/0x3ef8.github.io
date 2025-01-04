import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { content } from '@/config/content';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Code, Briefcase, FolderOpen } from 'lucide-react';
import { Link as ScrollLink, Events, scrollSpy } from 'react-scroll';
import { Button } from '@/components/ui/button';

const iconComponents = {
  Home,
  Code,
  Briefcase,
  FolderOpen,
};

export function Nav() {
  const { nav } = content;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    Events.scrollEvent.register('begin', () => {});

    scrollSpy.update();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      Events.scrollEvent.remove('begin');
    };
  }, []);

  const sidebarVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      opacity: 0,
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 ${
          isScrolled ? 'shadow-md' : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <ScrollLink
                to='hero'
                smooth={true}
                duration={500}
                className='font-bold text-lg cursor-pointer'
              >
                {nav.title}
              </ScrollLink>
            </div>
            <div className='hidden md:flex space-x-4'>
              {nav.items.map((item) => {
                const IconComponent =
                  iconComponents[item.icon as keyof typeof iconComponents];
                return (
                  <ScrollLink
                    key={item.name}
                    to={item.href}
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    activeClass='text-primary after:scale-x-100'
                    className={`flex items-center text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out relative text-muted-foreground hover:text-foreground after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:bottom-0 after:left-0 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-right hover:after:origin-bottom-left`}
                  >
                    {IconComponent && (
                      <IconComponent className='h-5 w-5 mr-2' />
                    )}
                    <motion.span
                      className='inline-block'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.name}
                    </motion.span>
                  </ScrollLink>
                );
              })}
            </div>
            <div className='flex items-center space-x-2'>
              <ThemeToggle />
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant='ghost'
                size='icon'
                aria-label='Toggle menu'
                className='w-6 h-6 p-0 md:hidden'
              >
                <div className='relative w-5 h-5 flex flex-col justify-between items-center'>
                  <span
                    className={`block w-4 h-0.5 bg-foreground rounded transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}
                  />
                  <span
                    className={`block w-4 h-0.5 bg-foreground rounded transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
                  />
                  <span
                    className={`block w-4 h-0.5 bg-foreground rounded transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className='md:hidden fixed top-16 right-0 z-40 w-56 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-xl overflow-y-auto'
            initial='closed'
            animate='open'
            exit='closed'
            variants={sidebarVariants}
          >
            <div className='flex flex-col items-start py-4'>
              {nav.items.map((item) => {
                const IconComponent =
                  iconComponents[item.icon as keyof typeof iconComponents];
                return (
                  <ScrollLink
                    key={item.name}
                    to={item.href}
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    activeClass='bg-primary/10 text-primary'
                    className={`flex items-center px-4 py-2 text-sm font-medium cursor-pointer transition-colors text-muted-foreground hover:text-foreground hover:bg-muted w-full`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {IconComponent && (
                      <IconComponent className='h-4 w-4 mr-3' />
                    )}
                    <span>{item.name}</span>
                  </ScrollLink>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
