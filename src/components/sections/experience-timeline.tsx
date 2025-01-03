import React from 'react'
import { motion } from 'framer-motion'
import { content } from "@/src/config/content"

interface TimelineEvent {
  date: string;
  title: string;
  company: string;
  description: string;
  technologies: string[];
  command?: string;
}

const { experienceTimeline } = content;

const TimelineEvent = ({ event, index }: { event: TimelineEvent, index: number }) => (
  <motion.div 
    className="mb-8 flex"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.2 }}
  >
    <div className="flex-shrink-0 w-24 text-sm text-muted-foreground pt-1">
      {event.date}
    </div>
    <div className="flex-grow pl-8 border-l border-primary">
      <motion.h3 
        className="text-lg font-semibold"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.1 }}
      >
        {event.title}
      </motion.h3>
      <motion.p 
        className="text-muted-foreground mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
      >
        {event.company}
      </motion.p>
      <motion.p 
        className="mb-2 text-muted-foreground"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
      >
        {event.description}
      </motion.p>
      <motion.div 
        className="flex flex-wrap gap-2 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
      >
        {event.technologies.map((tech: string, techIndex: number) => (
          <span 
            key={techIndex}
            className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
          >
            {tech}
          </span>
        ))}
      </motion.div>
      {event.command && (
        <motion.div 
          className="font-mono text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
        >
          {event.command}
        </motion.div>
      )}
    </div>
  </motion.div>
)

export function ExperienceTimeline() {
  if (!experienceTimeline) {
    console.error("ExperienceTimeline section is not defined in content");
    return null;
  }

  return (
    <section id="experience" className="mt-16">
      <motion.h2 
        className="text-2xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {experienceTimeline.title}
      </motion.h2>
      <motion.p 
        className="text-muted-foreground mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {experienceTimeline.description}
      </motion.p>
      <div className="relative">
        {experienceTimeline.events && experienceTimeline.events.map((event, index) => (
          <TimelineEvent key={index} event={event} index={index} />
        ))}
      </div>
    </section>
  )
}

