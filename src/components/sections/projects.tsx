import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Github,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { content } from '@/config/content';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const { projects } = content;

const ProjectCard = React.memo(
  ({ project }: { project: (typeof projects.items)[0] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showImage, setShowImage] = useState(false);

    const shortDescription =
      project.description.split(' ').slice(0, 20).join(' ') + '... Click me';

    return (
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        onHoverStart={() => setShowImage(true)}
        onHoverEnd={() => setShowImage(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Card
          className={`group overflow-hidden border transition-all duration-300 hover:border-primary hover:shadow-md cursor-pointer relative ${isExpanded ? 'sm:col-span-2' : ''}`}
        >
          <CardHeader className='p-3'>
            <div className='flex items-center justify-between'>
              <div className='flex space-x-2'>
                <div className='w-3 h-3 rounded-full bg-red-500'></div>
                <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                <div className='w-3 h-3 rounded-full bg-green-500'></div>
              </div>
              <CardTitle className='text-sm'>
                $ cat {project.title.toLowerCase().replace(/ /g, '_')}.md
              </CardTitle>
              <div className='flex gap-1 items-center'>
                {project.date && (
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <CalendarDays className='w-4 h-4 mr-1' />
                    <span>{project.date}</span>
                  </div>
                )}
                {project.github && (
                  <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
                    <a
                      href={project.github}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className='w-4 h-4' />
                      <span className='sr-only'>GitHub</span>
                    </a>
                  </Button>
                )}
                {project.demo && (
                  <Button size='sm' variant='ghost' className='h-8 w-8 p-0'>
                    <a
                      href={project.demo}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className='w-4 h-4' />
                      <span className='sr-only'>Demo</span>
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className='p-3 pt-0'>
            <AnimatePresence>
              {(showImage || isExpanded) && project.image && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={550}
                    height={310}
                    className='w-full h-48 object-cover mt-3 mb-3 rounded-md'
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <p className='text-muted-foreground'>
              {isExpanded ? project.description : shortDescription}
            </p>
          </CardContent>
          <CardFooter className='p-3 pt-0'>
            <div className='flex flex-wrap gap-1'>
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className='text-xs px-2 py-1 rounded-full bg-primary/10 text-primary'
                >
                  {tech}
                </span>
              ))}
            </div>
          </CardFooter>
          <div
            className='absolute bottom-2 right-2 flex items-center gap-2'
            style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem' }}
          >
            {project.image && (
              <ImageIcon className='w-4 h-4 text-muted-foreground' />
            )}
            {isExpanded ? (
              <ChevronUp className='w-4 h-4 text-muted-foreground' />
            ) : (
              <ChevronDown className='w-4 h-4 text-muted-foreground' />
            )}
          </div>
        </Card>
      </motion.div>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

export function Projects() {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 4;

  const filteredProjects = useMemo(
    () =>
      projects.items.filter(
        (project) =>
          filter === 'all' ||
          project.category.toLowerCase() === filter.toLowerCase()
      ),
    [filter]
  );

  const pageCount = Math.ceil(filteredProjects.length / projectsPerPage);
  const totalPages = pageCount;
  const currentProjects = filteredProjects.slice(
    currentPage * projectsPerPage,
    (currentPage + 1) * projectsPerPage
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < pageCount - 1 ? prev + 1 : prev));
  };

  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(0);
  }, []);

  return (
    <section className='mt-16 space-y-6'>
      <div className='flex flex-col items-start gap-4'>
        <h2 className='text-xl font-bold'>{projects.title}</h2>
        <p className='text-muted-foreground mb-8'>{projects.description}</p>
        <div className='flex items-center justify-between w-full'>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Select a filter' />
            </SelectTrigger>
            <SelectContent>
              {projects.filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className='flex gap-1'>
              <Button
                variant='outline'
                size='icon'
                className='w-8 h-8'
                onClick={handlePrevious}
                disabled={currentPage === 0}
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='w-8 h-8'
                onClick={handleNext}
                disabled={currentPage === pageCount - 1}
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-6 sm:grid-cols-2'>
        {currentProjects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
