export const terminalContent = {
  initialMessage: [
    "Welcome to Jay's interactive terminal [DATE]",
    "Type 'help' for available commands.",
    '',
  ],
  prompt: {
    user: 'visitor',
    host: '0xEF8',
    path: '~',
  },
  commands: {
    help: {
      description: 'Display information about available commands',
      action: `
        const commandList = Object.entries(commands)
          .filter(([cmd, { hidden }]) => !hidden)
          .map(([cmd, { description }]) => \`  \${cmd.padEnd(15)} \${description}\`);
        return commandList.join('\\n');
      `,
    },
    man: {
      description: 'Display the manual page for a command',
      action: `
        if (args.length === 0) return "What manual page do you want?\\nFor example, try 'man man'.";
        
        const command = args[0];
        if (command in commands) {
          const manPage = \`\${command.toUpperCase()}(1)
          
          NAME
                 \${command} - \${commands[command].description}
          
          SYNOPSIS
                 \${command} [OPTION]...
          
          DESCRIPTION
                 \${commands[command].description}
                 
                 This is a simulated man page for demonstration purposes.\`;
          return manPage;
        }
        return \`No manual entry for \${command}\`;
      `,
    },
    ls: {
      description: 'List directory contents',
      action: `
        const files = ['about.txt', 'skills.md', 'projects.json', 'contact.vcf', 'experience.txt', 'learning_journey.log'];
        
        if (args.includes('-l')) {
          const longFormat = files.map(file => \`drwxr-xr-x 2 jay users 4096 Jun 15 14:30 \${file}\`);
          return longFormat.join('\\n');
        }
        
        return files.join('  ');
      `,
    },
    cat: {
      description: 'Concatenate files and print on the standard output',
      action: `
        if (args.length === 0) return "cat: missing file operand\\nTry 'cat --help' for more information.";
        
        const file = args[0];
        if (file === 'projects.json') {
          try {
            const repos = await fetchGitHubRepos();
            const projectsJson = {
              repositories: repos.map(repo => ({
                title: repo.name,
                description: repo.description || 'No description provided',
                url: repo.html_url
              }))
            };
            return JSON.stringify(projectsJson, null, 2);
          } catch (error) {
            return "Error fetching GitHub repositories. Please try again later.";
          }
        }
        
        const contents = {
          'about.txt': "Jay Patrick Cano is a self-taught developer based in the Philippines. With a passion for learning and problem-solving, Jay is on a continuous journey to expand his knowledge in various areas of web development. While he may not consider himself an expert, Jay is dedicated to improving his skills every day and contributing to the tech community in whatever way he can.",
          'skills.md': "# Skills\\n\\nAs a self-taught developer, I'm constantly learning and improving. Here are some of the technologies I've been exploring:\\n\\n## Frontend\\n- HTML\\n- CSS\\n- JavaScript\\n- React (learning)\\n\\n## Backend\\n- Node.js (learning)\\n- Express (learning)\\n\\n## Databases\\n- MongoDB (basic understanding)\\n- MySQL (learning)\\n\\n## Version Control\\n- Git (learning)\\n\\n## Other\\n- Basic Linux commands\\n- Problem-solving\\n- Continuous learning",
          'contact.vcf': "BEGIN:VCARD\\nVERSION:3.0\\nFN:Jay Patrick Cano\\nURL:https://0x3ef8.github.io/linktree\\nEMAIL:0x3ef8@gmail.com\\nEND:VCARD",
          'experience.txt': \`Self-Taught Developer
          2021 - Present
          Philippines

          - Embarked on a self-directed learning journey in web development
          - Completed various online courses and tutorials to gain foundational knowledge
          - Built personal projects to apply and reinforce learning
          - Actively participating in online coding communities to learn from others and share knowledge
          - Constantly challenging myself with new concepts and technologies

          Project Contributor at Hall of Codes
          2022 - Present
          Online Community

          - Participating in a group where tech enthusiasts come together to learn and solve problems
          - Collaborating on open-source projects to gain practical experience
          - Sharing insights and learning from more experienced developers
          - Helping to create a supportive environment for learning and growth

          Aspiring Code Artisan
          2021 - Present
          GitHub

          - Maintaining a GitHub profile to showcase personal projects and learning progress
          - Experimenting with different technologies and coding practices
          - Striving to write cleaner, more efficient code with each project
          - Learning to use version control effectively in solo and collaborative projects

          Community Member at CodeSync.PH
          October 2021 - Present
          Online Community

          - Actively participating in a community dedicated to helping individuals explore various aspects of tech
          - Engaging in discussions about programming, web development, and technology trends
          - Sharing resources and learning materials with fellow community members
          - Collaborating on small projects to gain hands-on experience\`,
          'learning_journey.log': \`2021-10-01: Started learning HTML and CSS
2021-11-15: Completed first responsive website project
2021-12-20: Began JavaScript fundamentals
2022-02-01: Started exploring React basics
2022-03-15: Built first React application (to-do list)
2022-05-01: Introduced to Node.js and Express
2022-06-20: Created first RESTful API
2022-08-10: Learned about databases, started with MongoDB
2022-10-05: Explored Git and GitHub for version control
2022-12-01: Participated in first open-source contribution
2023-02-15: Deepened understanding of JavaScript ES6+ features
2023-04-20: Started learning about web accessibility
2023-06-10: Explored basic DevOps concepts
2023-08-01: Began studying data structures and algorithms
2023-10-15: Started contributing to Hall of Codes projects
2023-12-20: Explored serverless architecture concepts
2024-02-01: Began learning about Progressive Web Apps
2024-04-15: Started exploring TypeScript
2024-06-01: Continuing to learn and grow every day...\`
        };
        
        return contents[file] || \`cat: \${file}: No such file or directory\`;
      `,
    },
    pwd: {
      description: 'Print name of current/working directory',
      action: `
        return "/home/visitor";
      `,
    },
    echo: {
      description: 'Display a line of text',
      action: `
        return args.join(' ');
      `,
    },
    date: {
      description: 'Print or set the system date and time',
      action: `
        return new Date().toString();
      `,
    },
    whoami: {
      description: 'Print effective userid',
      action: `
        return 'visitor';
      `,
    },
    clear: {
      description: 'Clear the terminal screen',
      action: `
        return "";
      `,
    },
    uname: {
      description: 'Print system information',
      action: `
        const info = args.includes('-a') 
          ? "Linux 0xEF8 5.10.0-custom #1 SMP PREEMPT Thu Jun 15 14:30:00 UTC 2023 x86_64 GNU/Linux" 
          : "Linux";
        return info;
      `,
    },
    sudo: {
      description: 'Execute a command as another user',
      action: `
        const command = args.join(' ');
        return command === 'rm -rf /' 
          ? "Nice try! 😉 This incident will be reported." 
          : "sudo: command not found";
      `,
    },
    rm: {
      description: 'Remove files or directories',
      hidden: true,
      action: `
        const isRootRemoval = args.includes('-rf') && args.includes('/');
        return isRootRemoval
          ? "rm: it is dangerous to operate recursively on '/'" 
          : "rm: missing operand\\nTry 'rm --help' for more information.";
      `,
    },
    reset: {
      description: 'Reset the terminal to its initial state',
      action: `
        return "RESET_TERMINAL";
      `,
    },
    cd: {
      description: 'Change the current directory',
      action: `
        return "";
      `,
    },
    about: {
      description: 'Display information about the developer',
      action: `
        const aboutText = \`Hello! I'm Jay Patrick Cano, a self-taught developer from the Philippines.

I'm on a continuous learning journey, exploring various aspects of web development. While I'm not an expert, I'm passionate about coding and always striving to improve my skills.

My goal is to create meaningful projects and contribute to the tech community in whatever way I can. I believe in the power of perseverance and the joy of solving problems through code.

Feel free to explore my projects and learning journey using the other commands available in this terminal. Remember, we're all learners in this vast world of technology!\`;
        return aboutText;
      `,
    },
    journey: {
      description: "Display the developer's learning journey",
      action: `
        const journeyText = \`My Learning Journey:

2021: Began my self-taught coding journey
- Started with HTML, CSS, and JavaScript basics
- Built simple static websites to practice

2022: Dived deeper into web development
- Explored React and started building small applications
- Learned about backend basics with Node.js and Express
- Introduced myself to databases, starting with MongoDB

2023: Expanded knowledge and started contributing
- Deepened understanding of JavaScript and its ecosystem
- Started contributing to open-source projects
- Explored concepts like web accessibility and basic DevOps

2024 and beyond: Continuing to learn and grow
- Always exploring new technologies and best practices
- Actively participating in coding communities
- Working on personal projects to apply and reinforce learning

Remember, everyone's journey is unique. The most important thing is to keep learning and enjoying the process!\`;
        return journeyText;
      `,
    },
  },
  githubReposUrl: 'https://api.github.com/users/0x3EF8/repos',
  asciiArt: `
   ___       _____ _____ _____ ___   
  / _ \\__  _|___ /| ____|  ___( _ )  
 | | | \\ \\/ / |_ \\|  _| | |_  / _ \\  
 | |_| |>  < ___) | |___|  _|| (_) | 
  \\___//_/\\_\\____/|_____|_|   \\___/  
                                     
 Welcome to Jay's interactive terminal!
 Type 'help' for available commands.
 `,
};
