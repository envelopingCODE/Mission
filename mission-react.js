const MinimalistFace = ({ taskCompletionLevel = 0, currentLevel = 1, isTaskCompleted = false }) => {
  const getEmotionalState = () => {
    // After level 1, baseline starts at HAPPY
    if (currentLevel > 1) {
      if (isTaskCompleted) return 'HEART_EYES';
      if (taskCompletionLevel >= 90) return 'ECSTATIC';
      if (taskCompletionLevel >= 70) return 'VERY_HAPPY';
      return 'HAPPY'; // Baseline for experienced users
    }
    // Level 1 progression
    if (taskCompletionLevel >= 90) return 'ECSTATIC';
    if (taskCompletionLevel >= 70) return 'VERY_HAPPY';
    if (taskCompletionLevel >= 50) return 'HAPPY';
    if (taskCompletionLevel >= 30) return 'NEUTRAL';
    return 'NEUTRAL';
  };

  const expressions = {
    'HEART_EYES': {
      eyes: { 
        left: { x: -25, y: -15, rotation: 0, isHeart: true },
        right: { x: 25, y: -15, rotation: 0, isHeart: true }
      },
      mouth: 'M-30,30 Q0,45 30,30'
    },
    'ECSTATIC': {
      eyes: { 
        left: { x: -25, y: -10, rotation: -8 },
        right: { x: 25, y: -10, rotation: 8 }
      },
      mouth: 'M-40,30 Q0,50 40,30'  // Wider, more pronounced happy curve
    },
    'VERY_HAPPY': {
      eyes: { 
        left: { x: -25, y: -10, rotation: -5 },
        right: { x: 25, y: -10, rotation: 5 }
      },
      mouth: 'M-35,30 Q0,45 35,30'  // GERTY-style wide smile
    },
    'HAPPY': {
      eyes: { 
        left: { x: -25, y: -10, rotation: 0 },
        right: { x: 25, y: -10, rotation: 0 }
      },
      mouth: 'M-30,30 Q0,40 30,30'  // Gentle curve like GERTY's default smile
    },
    'NEUTRAL': {
      eyes: { 
        left: { x: -25, y: -10, rotation: 0 },
        right: { x: 25, y: -10, rotation: 0 }
      },
      mouth: 'M-20,30 L20,30'
    },
    'SLIGHTLY_SAD': {
      eyes: { 
        left: { x: -25, y: -10, rotation: 5 },
        right: { x: 25, y: -10, rotation: -5 }
      },
      mouth: 'M-20,30 Q0,25 20,30'
    }
  };

  const currentExpression = expressions[getEmotionalState()];

  // Heart shape for celebration
  const heartPath = "M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0";

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="-50 -50 100 100" 
      className="minimalist-face w-full h-full"
    >
      {/* Define filters for retro CRT effect */}
      <defs>
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

        <radialGradient id="screen-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#86dfff" stopOpacity="0.1"/>
          <stop offset="50%" stopColor="#4a9eff" stopOpacity="0.05"/>
          <stop offset="60%" stopColor="#2c3e50" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* CRT screen background glow */}
      <circle 
        cx="0" 
        cy="0" 
        r="45" 
        fill="url(#screen-fade)"
        className="animate-pulse opacity-60"
      />

      {/* Main face group with vintage effect */}
      <g filter="url(#crt-glow)" className="retro-screen">
        {/* Left Eye */}
        <g transform={`translate(${currentExpression.eyes.left.x}, ${currentExpression.eyes.left.y}) 
                    rotate(${currentExpression.eyes.left.rotation})`}>
          {currentExpression.eyes.left.isHeart ? (
            <path 
              d={heartPath} 
              fill="#86dfff"
              className="animate-pulse"
            />
          ) : (
            <ellipse 
              cx="0" 
              cy="0" 
              rx="8" 
              ry="12" 
              fill="#86dfff" 
              className="animate-pulse"
            />
          )}
        </g>

        {/* Right Eye */}
        <g transform={`translate(${currentExpression.eyes.right.x}, ${currentExpression.eyes.right.y}) 
                    rotate(${currentExpression.eyes.right.rotation})`}>
          {currentExpression.eyes.right.isHeart ? (
            <path 
              d={heartPath} 
              fill="#86dfff"
              className="animate-pulse"
            />
          ) : (
            <ellipse 
              cx="0" 
              cy="0" 
              rx="8" 
              ry="12" 
              fill="#86dfff" 
              className="animate-pulse"
            />
          )}
        </g>

        {/* Mouth */}
        <path 
          d={currentExpression.mouth} 
          fill="none" 
          stroke="#86dfff" 
          strokeWidth="3"
          className="animate-pulse opacity-90"
        />
      </g>

      {/* Horizontal scan line */}
      <line 
        x1="-50" 
        y1="0" 
        x2="50" 
        y2="0" 
        stroke="#86dfff" 
        strokeWidth=".5"
        strokeOpacity="0.3"
        className="animate-scan"
      />
    </svg>
  );
};

const CyberpunkInterface = () => {
  const [status, setStatus] = React.useState('CONNECTED');
  const [time, setTime] = React.useState('');
  const [taskCompletionLevel, setTaskCompletionLevel] = React.useState(0);
  const [currentLevel, setCurrentLevel] = React.useState(1);
  const [isTaskCompleted, setIsTaskCompleted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
 
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
          <MinimalistFace 
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

// Initialize
const container = document.getElementById('react-mission-control');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<CyberpunkInterface />);
}