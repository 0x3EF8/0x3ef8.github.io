/**
 * @file content.ts
 * @description Central content configuration for the modern portfolio project.
 * Update the content in this file to personalize your portfolio.
 * This includes sections for hero, experience, skills, projects, navigation, footer,
 * GitHub activity, and global URLs.
 */

export const content = {
  // Hero section
  // Contains information for the main landing area of the portfolio
  hero: {
    title: '$ cat Jay Patrick Cano',
    description:
      '$ echo "A self-taught developer from the Philippines, constantly learning and growing. I\'m passionate about creating meaningful projects and expanding my skills in web development."',
    typingWords: [
      '$ npm run learn-new-tech',
      '$ git commit -m "Embracing the learning curve"',
      '$ docker build -t continuous-improvement .',
      '$ chmod +x growth_mindset.sh && ./growth_mindset.sh',
      '$ echo "Hello, World!" >> journey.log',
      '$ for day in {1..365}; do echo "Keep learning"; done',
      '$ pip install --upgrade knowledge',
      '$ curl -X POST https://api.brain.com/v1/expand-horizons',
      '$ sudo apt-get update && sudo apt-get upgrade skills',
      '$ git push origin main --force-with-lease',
      '$ while true; do improve_skills; done',
    ],
    buttons: [
      { label: 'Resume', icon: 'FileText' },
      { label: 'GitHub', icon: 'Github', url: 'github' },
      { label: 'Facebook', icon: 'Facebook', url: 'facebook' },
      { label: 'Email', icon: 'Mail', url: 'email' },
    ],
    image: 'https://avatars.githubusercontent.com/u/76643867?v=4',
    status: {
      text: 'Open to Learning Opportunities',
      color: 'rgb(0, 255, 0)', // Green
      // Additional color options:
      // color: "rgb(255, 0, 0)",   // Red
      // color: "rgb(255, 255, 0)", // Yellow
      // color: "rgb(0, 0, 255)",   // Blue
      // color: "rgb(255, 165, 0)", // Orange
      // color: "rgb(128, 0, 128)", // Purple
      // color: "rgb(255, 192, 203)", // Pink
      // color: "rgb(0, 255, 255)", // Cyan
      // color: "rgb(128, 128, 128)", // Gray
    },
  },
  // Skills section
  // Lists the developer's technical skills with corresponding icons and descriptions
  skills: {
    title: '$ ls -l skills/',
    description:
      "$ echo \"As a passionate learner in the world of web development, I'm continuously working to improve my skills. Here's an overview of the technologies I've been exploring:\"",
    categories: [
      {
        name: 'Frontend Development',
        items: [
          { name: 'HTML5', icon: 'FaHtml5', level: 'Comfortable' },
          { name: 'CSS3', icon: 'FaCss3Alt', level: 'Comfortable' },
          {
            name: 'JavaScript (ES6+)',
            icon: 'SiJavascript',
            level: 'Comfortable',
          },
          { name: 'React', icon: 'FaReact', level: 'Learning' },
          { name: 'Vue.js', icon: 'FaVuejs', level: 'Exploring' },
          { name: 'Tailwind CSS', icon: 'SiTailwindcss', level: 'Learning' },
          { name: 'Next.js', icon: 'SiNextdotjs', level: 'Learning' },
        ],
      },
      {
        name: 'Backend Development',
        items: [
          { name: 'Node.js', icon: 'FaNodeJs', level: 'Learning' },
          { name: 'Express', icon: 'SiExpress', level: 'Learning' },
          { name: 'Python', icon: 'FaPython', level: 'Exploring' },
          { name: 'Django', icon: 'SiDjango', level: 'Exploring' },
          { name: 'Java', icon: 'FaJava', level: 'Exploring' },
        ],
      },
      {
        name: 'Database',
        items: [
          { name: 'MongoDB', icon: 'SiMongodb', level: 'Learning' },
          { name: 'MySQL', icon: 'SiMysql', level: 'Exploring' },
          { name: 'Firebase', icon: 'SiFirebase', level: 'Learning' },
        ],
      },
      {
        name: 'DevOps & Tools',
        items: [
          { name: 'Git', icon: 'FaGitAlt', level: 'Learning' },
          { name: 'Docker', icon: 'FaDocker', level: 'Exploring' },
          { name: 'AWS', icon: 'FaAws', level: 'Exploring' },
          { name: 'Linux', icon: 'FaLinux', level: 'Learning' },
        ],
      },
    ],
  },
  // Experience Timeline section
  experienceTimeline: {
    title: '$ tree /home/user/experience',
    description:
      '$ echo "A story of perseverance and dedication, where each step forward is guided by curiosity, collaboration, and a commitment to excellence."',
    events: [
      {
        date: '2024 - Present',
        title: 'Co-Founder and CTO',
        company: 'CodeTriad Solutions',
        description:
          '$ echo "Leading technical strategy and development for innovative software solutions."',
        technologies: ['React', 'Node.js', 'AWS', 'Docker'],
        command: '$ sudo systemctl start career-growth.service',
      },
      {
        date: '2022 - Present',
        title: 'Project Contributor',
        company: 'Hall of Codes',
        description:
          '$ echo "Collaborating on open-source projects and mentoring aspiring developers."',
        technologies: ['Git', 'JavaScript', 'Python', 'Community Building'],
        command: '$ git push origin feature/community-impact',
      },
      {
        date: '2010 - Present',
        title: 'Code Artisan',
        company: 'GitHub',
        description:
          '$ echo "Crafting and maintaining various personal and collaborative projects."',
        technologies: ['Version Control', 'CI/CD', 'Web Technologies'],
        command: '$ for repo in */; do cd $repo && git pull && cd ..; done',
      },
      {
        date: '2021 - 2024',
        title: 'Former Founder',
        company: 'CodeSync.PH',
        description:
          '$ echo "Built a community platform for developers to learn, collaborate, and grow together."',
        technologies: [
          'Community Management',
          'Web Development',
          'Educational Content Creation',
        ],
        command: '$ chmod +x build_community.sh && ./build_community.sh',
      },
    ],
  },
  // Projects section
  // Showcases the developer's projects with details and filtering options
  projects: {
    title: '$ ls projects/',
    description:
      '$ echo "A showcase of projects and experiments that reflect my creativity, dedication, and passion for continuous learning."',
    filterOptions: [
      { value: 'all', label: '$ grep -r .' },
      { value: 'web', label: '$ grep -r web' },
      { value: 'Chatbots', label: '$ grep -r Chatbots' },
    ],
    items: [
      {
        title: 'Portfolio',
        description:
          '$ echo "A minimal, interactive portfolio website built with Next.js, TypeScript, and Tailwind CSS, featuring a unique terminal interface, smooth animations, and dark/light mode support."',
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        github: 'https://github.com/0x3EF8/0x3ef8.github.io',
        demo: 'https://0x3ef8.github.io',
        category: 'web',
        image: '/images/portfolio.png',
        date: '01/03/25',
      },
      {
        title: 'Nero 2.0',
        description:
          '$ echo "Nero 2.0 is a simple Facebook Messenger Bot that uses OpenAI APIs to answer questions. Built on the fca-unofficial library, it ensures smooth communication with Facebook’s servers."',
        technologies: ['JavaScript', 'EJS', 'fca-unofficial'],
        github: 'https://github.com/0x3EF8/nero-2.0',
        demo: null,
        category: 'Chatbots',
        image: '/images/nero.jpg',
        date: '11/05/24',
      },
      {
        title: 'HireHub PH',
        description:
          '$ echo "HireHub PH is an online job portal created to help both job providers and job seekers. It includes role-based features to make things easier for everyone."',
        technologies: ['PHP', 'MySQL', 'Bootstrap'],
        github: null,
        demo: null,
        category: 'Web',
        image: '/images/hirehub.jpg',
        date: '12/12/23',
      },
    ],
  },
  // Navigation section
  // Defines the main navigation items for the portfolio
  nav: {
    title: '$ cd ~/0x3EF8',
    items: [
      { name: '$ cd ~', href: 'hero', icon: 'Home' },
      { name: '$ cd skills', href: 'skills', icon: 'Code' },
      { name: '$ cd experience', href: 'experience', icon: 'Briefcase' },
      { name: '$ cd projects', href: 'projects', icon: 'FolderOpen' },
    ],
  },
  // Footer section
  // Contains the footer text, quotes, and social links
  footer: {
    text: 'Inspired by innovation, driven by passion.',
    quotes: [
      {
        text: 'The people who are crazy enough to think they can change the world are the ones who do.',
        author: 'Steve Jobs',
      },
      {
        text: 'Innovation distinguishes between a leader and a follower.',
        author: 'Steve Jobs',
      },
      {
        text: 'The best way to predict the future is to create it.',
        author: 'Peter Drucker',
      },
      {
        text: 'Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.',
        author: 'Mark Zuckerberg',
      },
      {
        text: 'I think it is possible for ordinary people to choose to be extraordinary.',
        author: 'Elon Musk',
      },
      {
        text: "Your time is limited, don't waste it living someone else's life.",
        author: 'Steve Jobs',
      },
      {
        text: 'The biggest risk is not taking any risk.',
        author: 'Mark Zuckerberg',
      },
      {
        text: 'Failure is an option here. If things are not failing, you are not innovating enough.',
        author: 'Elon Musk',
      },
      {
        text: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
      },
      {
        text: 'Programming knowledge is the key to unlocking the power of a god.',
        author: '0x3EF8',
      },
    ],
    socialLinks: [
      { name: 'GitHub', url: 'githubUrl', icon: 'Github' },
      { name: 'Facebook', url: 'facebookUrl', icon: 'Facebook' },
      { name: 'Email', url: 'emailUrl', icon: 'Mail' },
    ],
    copyright: 'Jay Patrick Cano. All rights reserved.',
  },
  // GitHub Activity section
  // Sets up the GitHub activity feed display
  githubActivity: {
    apiUrl: 'https://api.github.com/users/0x3EF8/events/public',
    containerClass: 'github-activity-container',
    textClass: 'github-activity-text',
    maxEvents: 10,
    updateIntervals: [2000, 3000, 4000, 5000],
  },
  // Global section
  // Stores global URLs used throughout the portfolio
  global: {
    githubUrl: 'https://github.com/0x3EF8',
    resumeUrl: null,
    facebookUrl: 'https://fb.me/x3EF8',
    emailUrl: 'mailto:0x3ef8@gmail.com',
  },
  // Loading section
  // Configures the loading animations and text for both initial boot and quick loading
  loading: {
    bootSequence: [
      'Initializing system...',
      'Loading kernel...',
      'Mounting file systems...',
      'Starting network services...',
      'Loading portfolio modules...',
      'Initializing user interface...',
      'System ready...',
    ],
    quickLoading: 'Reloading modules...',
    asciiArt: `   ___       _____ _____ _____ ___   
  / _ \\__  _|___ /| ____|  ___( _ )  
 | | | \\ \\/ / |_ \\|  _| | |_  / _ \\  
 | |_| |>  < ___) | |___|  _|| (_) | 
  \\___//_/\\_\\____/|_____|_|   \\___/  
                                     `,
  },
  error: {
    title: 'Oops!',
    subtitle: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again later.',
    actions: [
      { label: 'Try again', icon: 'RefreshCcw' },
      { label: 'Back to Home', icon: 'Home' },
    ],
    helpfulTips: [
      'Refresh the page and try again',
      'Clear your browser cache and cookies',
      'Try accessing the site later',
      'If the problem persists, please contact the site administrator',
    ],
  },

  notFound: {
    title: '404',
    subtitle: 'Page Not Found',
    description: "The page you're looking for doesn't exist or has been moved.",
    actions: [
      { label: 'Back to Home', icon: 'Home' },
      { label: 'Explore Projects', icon: 'FolderOpen' },
    ],
    helpfulTips: [
      'Check the URL for any typos',
      "Use the navigation menu to find what you're looking for",
      'Try using the search function if available',
      'Contact us if you believe this is an error',
    ],
  },
};
