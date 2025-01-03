import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TerminalIcon, X, Minimize, Maximize } from 'lucide-react'
import { Button } from "@/src/components/ui/button"
import { terminalContent } from "@/src/config/terminal-content"

interface Command {
  description: string;
  action: (args: string[], commands: Record<string, Command>, excludedCommands: string[], fetchGitHubRepos: () => Promise<GitHubRepo[]>) => string | Promise<string>;
  hidden?: boolean;
}

interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
}

interface UserData {
  output: string[];
  commandHistory: string[];
}

const fetchGitHubRepos = async (): Promise<GitHubRepo[]> => {
  const response = await fetch(terminalContent.githubReposUrl);
  return response.json();
};

const getASCIIArt = () => {
  return terminalContent.asciiArt;
};

const commands: Record<string, Command> = Object.entries(terminalContent.commands).reduce((acc, [key, value]) => {
  acc[key] = {
    ...value,
    action: new Function('args', 'commands', 'excludedCommands', 'fetchGitHubRepos', `
      return (async function() {
        ${value.action}
      })();
    `) as Command['action']
  };
  return acc;
}, {} as Record<string, Command>);

const generateUserId = () => {
  const savedUserData = localStorage.getItem('terminalUserData');
  const existingUserIds = savedUserData ? Object.keys(JSON.parse(savedUserData)) : [];
  let newId = 1;
  while (existingUserIds.includes(`visitor${newId}`) && newId <= 999) {
    newId++;
  }
  return newId <= 999 ? `visitor${newId}` : 'visitor999';
};

const initializeUserData = (): UserData => {
  const asciiArt = getASCIIArt();
  const initialOutput = [
    asciiArt,
    ...terminalContent.initialMessage.map(msg => 
      msg.replace('[DATE]', new Date().toLocaleDateString())
    )
  ];
  return {
    output: initialOutput,
    commandHistory: []
  };
};

const TerminalPrompt: React.FC<{ currentDirectory: string }> = React.memo(({ currentDirectory }) => (
  <>
    <span className="text-yellow-400">{terminalContent.prompt.user}</span>
    <span className="text-green-400">@</span>
    <span className="text-blue-400">{terminalContent.prompt.host}</span>
    <span className="text-green-400"> ➜ </span>
    <span className="text-cyan-400">{currentDirectory}</span>
    <span className="text-red-400"> $ </span>
  </>
));

TerminalPrompt.displayName = 'TerminalPrompt';

const TerminalOutput: React.FC<{ output: string[] }> = React.memo(({ output }) => (
  <>
    {output.map((line, index) => (
      <div key={index} className="mb-1 whitespace-pre-wrap">
        {line.startsWith('❯') ? (
          <span>
            <TerminalPrompt currentDirectory="~" />
            <span className="text-white">{line.split('❯ visitor ')[1]}</span>
          </span>
        ) : (
          <span className="text-white">{line}</span>
        )}
      </div>
    ))}
  </>
));
TerminalOutput.displayName = 'TerminalOutput';

export function InteractiveTerminal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [input, setInput] = useState("")
  const [userId, setUserId] = useState("")
  const [userData, setUserData] = useState<Record<string, UserData>>({})
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null);
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentDirectory, setCurrentDirectory] = useState("~")

  useEffect(() => {
    const newUserId = generateUserId();
    setUserId(newUserId);

    const savedUserData = localStorage.getItem('terminalUserData');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  useEffect(() => {
    if (isOpen && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [isOpen, userData])

  const getCurrentUserData = useCallback(() => {
    if (!userData[userId]) {
      const newUserData = initializeUserData();
      setUserData(prevData => ({
        ...prevData,
        [userId]: newUserData
      }));
      return newUserData;
    }
    return userData[userId];
  }, [userId, userData]);

  const handleCommand = useCallback(async (cmd: string) => {
    const args = cmd.trim().split(' ')
    const command = args.shift()?.toLowerCase() || ''

    const currentUserData = getCurrentUserData();
    let newOutput: string[];

    if (command === "clear") {
      newOutput = [];
    } else if (command === "reset") {
      const resetData = initializeUserData();
      setUserData(prevData => ({
        ...prevData,
        [userId]: resetData
      }));
      return;
    } else if (command === "cd") {
      const newDir = args[0] || "~";
      setCurrentDirectory(newDir);
      newOutput = [...currentUserData.output, `❯ visitor ${cmd}`, ""];
    } else {
      if (command in commands) {
        const excludedCommands = ['sudo', 'rm'];
        try {
          let result: string;
          if (command === 'help') {
            result = await commands[command].action([], commands, excludedCommands, fetchGitHubRepos);
          } else {
            result = await commands[command].action(args, commands, excludedCommands, fetchGitHubRepos);
          }
          newOutput = [...currentUserData.output, `❯ visitor ${cmd}`, result || ''];
        } catch (error) {
          newOutput = [...currentUserData.output, `❯ visitor ${cmd}`, `Error executing command: ${error}`];
        }
      } else {
        newOutput = [...currentUserData.output, `❯ visitor ${cmd}`, `bash: ${command}: command not found`];
      }
    }

    const newHistory = [...currentUserData.commandHistory, cmd];

    setUserData(prevData => ({
      ...prevData,
      [userId]: {
        output: newOutput,
        commandHistory: newHistory
      }
    }));

    localStorage.setItem('terminalUserData', JSON.stringify({
      ...userData,
      [userId]: {
        output: newOutput,
        commandHistory: newHistory
      }
    }));

    setHistoryIndex(-1)
    setInput("")
  }, [userId, getCurrentUserData, userData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentUserData = getCurrentUserData();
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < currentUserData.commandHistory.length - 1) {
        setHistoryIndex(prev => prev + 1)
        setInput(currentUserData.commandHistory[currentUserData.commandHistory.length - 1 - historyIndex - 1])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        setHistoryIndex(prev => prev - 1)
        setInput(currentUserData.commandHistory[currentUserData.commandHistory.length - 1 - historyIndex + 1])
      } else {
        setHistoryIndex(-1)
        setInput('')
      }
    }
  }, [getCurrentUserData, historyIndex]);

  const terminalVariants = useMemo(() => ({
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  }), []);

  const iconVariants = useMemo(() => ({
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    tap: { scale: 0.9 }
  }), []);

  const currentUserData = getCurrentUserData();

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={iconVariants}
        whileTap="tap"
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          size="icon"
          variant="outline"
          onClick={() => {setIsOpen(true); setIsFullScreen(false);}}
          className="rounded-full w-12 h-12 bg-background text-foreground border-primary hover:bg-primary hover:text-primary-foreground"
        >
          <TerminalIcon className="w-6 h-6" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={terminalVariants}
            className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center`}
          >
            <div className={`container mx-auto h-full flex items-center justify-center ${isFullScreen ? 'p-0' : ''}`}>
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className={`bg-background text-foreground rounded-lg shadow-lg overflow-hidden border border-border ${isFullScreen ? 'w-full h-full' : 'w-full max-w-2xl'}`}
              >
                <div className="flex items-center justify-between p-2 bg-background border-b border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {terminalContent.prompt.user}@{terminalContent.prompt.host}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="hover:bg-muted"
                    >
                      {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-muted"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div 
                  ref={terminalRef} 
                  className={`p-4 overflow-y-auto font-mono text-sm bg-background ${isFullScreen ? 'h-[calc(100vh-40px)]' : 'h-96'} text-green-400`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget && inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                >
                  <TerminalOutput output={currentUserData.output} />
                  <div className="flex items-center">
                    <TerminalPrompt currentDirectory={currentDirectory} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCommand(input)
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      className="flex-grow bg-transparent outline-none text-white"
                      autoFocus
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}