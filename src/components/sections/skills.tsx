import React, { useMemo } from 'react';
import {
  FaReact,
  FaNodeJs,
  FaPython,
  FaGitAlt,
  FaHtml5,
  FaCss3Alt,
  FaDocker,
  FaVuejs,
  FaAws,
  FaLinux,
  FaJava,
} from 'react-icons/fa';
import {
  SiMongodb,
  SiExpress,
  SiJavascript,
  SiDjango,
  SiMysql,
  SiTailwindcss,
  SiNextdotjs,
  SiFirebase,
} from 'react-icons/si';
import { content } from '@/config/content';
import { motion } from 'framer-motion';

const { skills } = content;

const iconComponents = {
  FaReact,
  FaNodeJs,
  FaPython,
  FaGitAlt,
  FaHtml5,
  FaCss3Alt,
  FaDocker,
  FaVuejs,
  FaAws,
  FaLinux,
  FaJava,
  SiMongodb,
  SiExpress,
  SiJavascript,
  SiDjango,
  SiMysql,
  SiTailwindcss,
  SiNextdotjs,
  SiFirebase,
};

const Skill = React.memo(
  ({
    skill,
    IconComponent,
    index,
  }: {
    skill: { name: string; icon: string; level: string };
    IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    index: number;
  }) => (
    <motion.div
      className='flex flex-col items-center'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      {IconComponent && (
        <div className='relative cursor-pointer'>
          <IconComponent className='w-8 h-8 mb-2 transition-colors duration-300 hover:text-primary' />
        </div>
      )}
      <span className='text-xs text-center hover:text-primary transition-colors duration-300'>
        $ man {skill.name}
      </span>
      <span className='text-xs text-muted-foreground mt-1'>{skill.level}</span>
    </motion.div>
  )
);

Skill.displayName = 'Skill';

const SkillCategory = React.memo(
  ({
    category,
    categoryIndex,
  }: {
    category: {
      name: string;
      items: Array<{ name: string; icon: string; level: string }>;
    };
    categoryIndex: number;
  }) => (
    <motion.div
      className='mb-8'
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: categoryIndex * 0.2 }}
    >
      <h3 className='text-lg font-semibold mb-4'>{category.name}</h3>
      <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6'>
        {category.items.map(
          (
            skill: { name: string; icon: string; level: string },
            index: number
          ) => {
            const IconComponent =
              iconComponents[skill.icon as keyof typeof iconComponents];
            return (
              <Skill
                key={skill.name}
                skill={skill}
                IconComponent={IconComponent}
                index={index}
              />
            );
          }
        )}
      </div>
    </motion.div>
  )
);

SkillCategory.displayName = 'SkillCategory';

export function Skills() {
  const memoizedCategories = useMemo(() => skills.categories, []);

  return (
    <section id='skills' className='mt-16'>
      <motion.h2
        className='text-2xl font-bold mb-4'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {skills.title}
      </motion.h2>
      <motion.p
        className='text-muted-foreground mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {skills.description}
      </motion.p>
      {memoizedCategories.map((category, index) => (
        <SkillCategory key={index} category={category} categoryIndex={index} />
      ))}
    </section>
  );
}
