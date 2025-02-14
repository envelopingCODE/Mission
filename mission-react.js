//################## SECTION 1: CuteRobotFace Component Start ##################
const CuteRobotFace = ({ 
  taskCompletionLevel = 0, 
  currentLevel = 1, 
  isTaskCompleted = false 
}) => {
  //################## SECTION 2: State and Hooks ##################
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [currentEmotion, setCurrentEmotion] = React.useState('neutral');

  //################## SECTION 3: Animation Effects ##################
  React.useEffect(() => {
    // Blinking animation
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 100);
    }, 3000 + Math.random() * 2000);

    // Emotion cycling for more dynamic expressions
    const emotionInterval = setInterval(() => {
      const emotions = ['neutral', 'happy', 'excited', 'curious', 'sleepy'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      setCurrentEmotion(randomEmotion);
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(emotionInterval);
    };
  }, []);

  //################## SECTION 4: Emotion Logic ##################
  React.useEffect(() => {
    if (isTaskCompleted) {
      setCurrentEmotion('heart-eyes');
      const timer = setTimeout(() => setCurrentEmotion('happy'), 2000);
      return () => clearTimeout(timer);
    } else if (currentLevel > 1) {
      if (taskCompletionLevel >= 90) setCurrentEmotion('excited');
      else if (taskCompletionLevel >= 70) setCurrentEmotion('happy');
      else if (taskCompletionLevel >= 50) setCurrentEmotion('neutral');
    }
  }, [taskCompletionLevel, currentLevel, isTaskCompleted]);

  //################## SECTION 5: Expressions Configuration ##################
  const expressions = {
    'neutral': {
      leftEye: 'M-30,-5 A15,20 0 1,1 0,-5',
      rightEye: 'M0,-5 A15,-20 0 1,1 30, -5',
      mouth: 'M-30,20 Q0,25 30,20',
      color: '#86dfff'
    },
  'happy': {
    leftEye: 'M-30,-5 Q-12,-20 0,-5',
    rightEye: 'M0,-5 Q12,-20 30,-5',
    mouth: 'M-35,20 Q0,35 35,20',
    color: '#86dfff'
  },
    'excited': {
      leftEye: 'M-30,-5 Q-15,-25 0,-5',
      rightEye: 'M0,-5 Q15,-25 30,-5',
      mouth: 'M-40,20 Q0,50 40,20',
      color: '#86dfff'
    },

    'curious': {
      leftEye: 'M-30,-5 A15,20 0 1,1 0,-5',
      rightEye: 'M0,-5 A15,-20 0 1,1 30, -5',
      mouth: 'M-30,20 Q0,25 30,20',
      color: '#86dfff'
    },

    'playful': {
      leftEye: 'M-25,-5 Q-10,-15 0,-5',  // Normal eye
      rightEye: 'M-25,-5 L25,-5 0,-6',         // Simplified line to represent a wink
      mouth: 'M-40,20 Q20,90 30,20',
      color: '#86dfff'
    },

  'perplexed': {
  leftEye: 'M-25,-5 A15,10 0 1,1 0,-5',
  rightEye: 'M0,-5 A15,10 0 1,1 25,-5',
  mouth: 'M-10,30 A10,5 0 1,1 5,30',
  color: '#86dfff'
},

'sleepy': {
  leftEye: 'M-25,-5 A15,10 0 1,1 0,-5',
  rightEye: 'M0,-5 A15,10 0 1,1 25,-5',
  mouth: 'M-10,30 A10,5 0 1,1 5,30',
  color: '#86dfff'
},

    'heart-eyes': {
      leftEye: 'M-20,-10 C-25,-20 -15,-30 -10,-20 C-5,-30 5,-20 10,-10',
      rightEye: 'M-20,-10 C-25,-20 -15,-30 -10,-20 C-5,-30 5,-20 10,-10',
      mouth: 'M-30,20 Q0,40 30,20',
      color: '#86dfff'
    }
  };

  //################## SECTION 6: Render Logic ##################
  const currentExpression = expressions[currentEmotion];

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="-50 -50 100 100" 
      className="minimalist-face w-full h-full"
    >
      <defs>
        {/* CRT Glow Filter */}
        <filter id="crt-glow">
          <feGaussianBlur stdDeviation="2.75" result="coloredBlur"/>
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.5"/>
            <feFuncG type="linear" slope="0.5"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Screen Fade Gradient */}
        <radialGradient id="screen-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#86dfff" stopOpacity="0.1"/>
          <stop offset="50%" stopColor="#4a9eff" stopOpacity="0.05"/>
          <stop offset="60%" stopColor="#2c3e50" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Background with screen fade */}
      <circle 
        cx="0" 
        cy="0" 
        r="45" 
        fill="url(#screen-fade)"
        className="animate-pulse opacity-60"
      />

      {/* Main face group with CRT glow */}
      <g filter="url(#crt-glow)" className="retro-screen">
        {/* Left Eye */}
        <path 
          d={currentExpression.leftEye} 
          transform="translate(-25, -10)"
          fill="#86dfff"
          opacity={isBlinking ? 0.3 : 0.9}
          className="eye-left transition-all duration-300"
        />
        
        {/* Right Eye - only render if path exists */}
        {currentExpression.rightEye && (
          <path 
            d={currentExpression.rightEye} 
            transform="translate(25, -10)"
            fill="#86dfff"
            opacity={isBlinking ? 0.3 : 0.9}
            className="eye-right transition-all duration-300"
          />
        )}

        {/* Mouth */}
        <path 
          d={currentExpression.mouth} 
          fill="#86dfff" 
          className="mouth transition-all duration-500 opacity-90"
        />
      </g>

      {/* Animated scan line */}
      <line 
        x1="-50" 
        y1="0" 
        x2="50" 
        y2="0" 
        stroke="#86dfff" 
        strokeWidth=".5"
        strokeOpacity="0.3"
        className="animate-scan"
      >
        <animate 
          attributeName="y1" 
          values="-50;50;-50" 
          dur="3s" 
          repeatCount="indefinite" 
        />
        <animate 
          attributeName="y2" 
          values="-50;50;-50" 
          dur="3s" 
          repeatCount="indefinite" 
        />
      </line>
    </svg>
  );
}; // This closing brace ends the CuteRobotFace component

//################## SECTION 7: Interface Component ##################
const CyberpunkInterface = () => {
  const [status, setStatus] = React.useState('CONNECTED');
  const [time, setTime] = React.useState('');
  const [taskCompletionLevel, setTaskCompletionLevel] = React.useState(0);
  const [currentLevel, setCurrentLevel] = React.useState(1);
  const [isTaskCompleted, setIsTaskCompleted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
 
  //################## SECTION 8: Interface Effects ##################
  React.useEffect(() => {
    const intervals = [];
    
    // Mobile detection
    const mediaQuery = window.matchMedia('(max-width: 600px)');
    const handleMediaQueryChange = (e) => setIsMobile(e.matches);
    mediaQuery.addListener(handleMediaQueryChange);
    setIsMobile(mediaQuery.matches);
     
    // Time update
    intervals.push(setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000));
     
    // Status cycling
    intervals.push(setInterval(() => {
      setStatus(prev => prev === 'CONNECTED' ? 'SCANNING' : 'CONNECTED');
    }, 3000));

    // Watch for XP changes and task completions
    const xpMeterEl = document.getElementById('xp-meter');
    if (xpMeterEl) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-xp') {
            const currentXp = parseInt(xpMeterEl.dataset.xp) || 0;
            const level = Math.floor(currentXp / 100) + 1;
            const xpForCurrentLevel = currentXp % 100;
            
            setCurrentLevel(level);
            setTaskCompletionLevel(xpForCurrentLevel);
            
            // Trigger heart eyes animation on task completion
            setIsTaskCompleted(true);
            setTimeout(() => setIsTaskCompleted(false), 2000); // Reset after 2 seconds
          }
        });
      });

      observer.observe(xpMeterEl, {
        attributes: true,
        attributeFilter: ['data-xp']
      });

      // Set initial state
      const initialXp = parseInt(xpMeterEl.dataset.xp) || 0;
      const initialLevel = Math.floor(initialXp / 100) + 1;
      const initialXpForCurrentLevel = initialXp % 100;
      setCurrentLevel(initialLevel);
      setTaskCompletionLevel(initialXpForCurrentLevel);
    }
     
    return () => {
      intervals.forEach(clearInterval);
    };
  }, []);
   
  //################## SECTION 9: Interface Render ##################
  return (
    <div className="cyber-container flex flex-col">
      <div className="cyber-header">
        <div className="cyber-line"></div>
        <div className="header-content flex justify-between items-center">
          <div className="status-indicator">
            <span className="dot"></span>
            NEURAL_LINK: {status}
          </div>
          {!isMobile && <div className="time-display">{time}_UTC</div>}
        </div>
      </div>

      <div className="robot-companion-container flex flex-col items-center mt-4">
        <div className="minimalist-face-wrapper w-32 h-32">
          <CuteRobotFace 
            taskCompletionLevel={taskCompletionLevel}
            currentLevel={currentLevel}
            isTaskCompleted={isTaskCompleted}
          />
        </div>
      </div>
     
      <div className="scan-line"></div>
    </div>
  );
};

//################## SECTION 10: Initialization ##################
const container = document.getElementById('react-mission-control');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<CyberpunkInterface />);
}