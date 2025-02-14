
// Add the new MotivationalOverlay component here, before Section 2
const MotivationalOverlay = React.memo(({ message, isVisible }) => (
  <div className={`
    absolute inset-0 
    flex items-center justify-center 
    transition-opacity duration-500
    ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
  `}>
    <div className="
      bg-black bg-opacity-60 
      text-cyan-400 
      px-4 py-2 
      rounded-lg 
      shadow-lg 
      backdrop-blur-sm
      border border-cyan-400
      animate-pulse
      text-center
      max-w-xs
    ">
      {message}
    </div>
  </div>
));


//################## SECTION 1: CuteRobotFace Component Start ##################
const CuteRobotFace = ({ 
  taskCompletionLevel = 0, 
  currentLevel = 1, 
  isTaskCompleted = false 
}) => {




  //################## SECTION 2: State and Hooks ##################
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [currentEmotion, setCurrentEmotion] = React.useState('curious');

  //################## SECTION 3: Animation Effects ##################

  React.useEffect(() => {
  // Keep only the blinking animation, remove the emotion cycling
  const blinkInterval = setInterval(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 100);
  }, 3000 + Math.random() * 2000);

  return () => {
    clearInterval(blinkInterval);
  };
}, []);

//################## SECTION 4: Emotion Logic ##################
React.useEffect(() => {
  // First, determine the base emotion based on level and XP
  let baseEmotion = 'curious';
  
  // Set base emotion based on level
  if (currentLevel >= 2) {
    baseEmotion = 'happy';  // Level 2+ starts at happy
  } else {
    // Level 1 progression
    if (taskCompletionLevel >= 70) {
      baseEmotion = 'excited';
    } else if (taskCompletionLevel >= 30) {
      baseEmotion = 'happy';
    }
  }

  // Handle task completion animations
  if (isTaskCompleted) {
    if (currentLevel >= 2) {
      setCurrentEmotion('heart-eyes');
      const timer = setTimeout(() => setCurrentEmotion(baseEmotion), 2000);
      return () => clearTimeout(timer);
    } else {
      setCurrentEmotion('excited');
      const timer = setTimeout(() => setCurrentEmotion(baseEmotion), 2000);
      return () => clearTimeout(timer);
    }
  } else {
    setCurrentEmotion(baseEmotion);
  }
}, [taskCompletionLevel, currentLevel, isTaskCompleted]);

// Separate effect for handling input state
// In Section 4: Emotion Logic
// Replace the existing input handling effect with this new one
React.useEffect(() => {
  const inputEl = document.getElementById('addMission');
  
  // This function handles when the input field gains focus
  const handleFocus = () => {
    // Immediately change to curious expression when focused
    setCurrentEmotion('curious');
  };

  // This function handles when the input field loses focus
  const handleBlur = () => {
    // When focus is lost, determine the appropriate base emotion based on level and XP
    if (currentLevel >= 2) {
      setCurrentEmotion('happy');
    } else if (taskCompletionLevel >= 70) {
      setCurrentEmotion('excited');
    } else if (taskCompletionLevel >= 30) {
      setCurrentEmotion('happy');
    } else {
      setCurrentEmotion('neutral');
    }
  };

  if (inputEl) {
    // Add event listeners for focus and blur events
    inputEl.addEventListener('focus', handleFocus);
    inputEl.addEventListener('blur', handleBlur);

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      inputEl.removeEventListener('focus', handleFocus);
      inputEl.removeEventListener('blur', handleBlur);
    };
  }
}, [currentLevel, taskCompletionLevel]); // Dependencies include level and XP to ensure proper emotion state

// Separate effect for reset buttons
React.useEffect(() => {
  const handleReset = () => {
    setCurrentEmotion('perplexed');
    setTimeout(() => setCurrentEmotion('neutral'), 2000);
  };

  const resetButton = document.getElementById('resetButton');
  const resetXPButton = document.getElementById('xp-meter');

  if (resetButton) resetButton.addEventListener('click', handleReset);
  if (resetXPButton) resetXPButton.addEventListener('click', handleReset);

  return () => {
    if (resetButton) resetButton.removeEventListener('click', handleReset);
    if (resetXPButton) resetXPButton.removeEventListener('click', handleReset);
  };
}, []);

// Occasional random emotions (playful/sleepy) with much lower frequency
React.useEffect(() => {
  const randomEmotionInterval = setInterval(() => {
    // Only show random emotions if we're in a base state
    if (!isTaskCompleted && currentEmotion !== 'curious' && 
        currentEmotion !== 'perplexed' && currentEmotion !== 'heart-eyes') {
      
      const chance = Math.random();
      if (chance < 0.05) { // Only 5% chance every 30 seconds
        const randomEmotion = chance < 0.025 ? 'playful' : 'sleepy';
        setCurrentEmotion(randomEmotion);
        
        // Return to base emotion after 2 seconds
        setTimeout(() => {
          if (currentLevel >= 2) {
            setCurrentEmotion('happy');
          } else if (taskCompletionLevel >= 70) {
            setCurrentEmotion('excited');
          } else if (taskCompletionLevel >= 30) {
            setCurrentEmotion('happy');
          } else {
            setCurrentEmotion('neutral');
          }
        }, 2000);
      }
    }
  }, 30000); // Check only every 30 seconds

  return () => clearInterval(randomEmotionInterval);
}, [currentLevel, taskCompletionLevel, isTaskCompleted, currentEmotion]);

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
  rightEye: 'M0,-5 A15,-20 0 1,1 30,-5',
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
  leftEye: 'M-20,-5 A15,8 0 1,1 0,-5',
  rightEye: 'M0,-5 A15,8 0 1,1 20,-5',
  mouth: 'M-30,20 Q0,25 30,20',
  color: '#86dfff'
},

'heart-eyes': {
  leftEye: 'M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0', 
  rightEye: 'M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0',
  mouth: 'M-30,20 Q0,40 30,20',
  color: '#86dfff',
  isHeartEyes: true
},
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

    {/* Left Heart Eye */}
{currentExpression.isHeartEyes ? (
  <path 
    d="M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0" 
    transform="translate(-25, -10)"  // Kept same as other expressions
    fill="#86dfff"
    className="heart-eye left animate-pulse"
  />
) : (
        <path 
          d={currentExpression.leftEye} 
          transform="translate(-25, -10)"
          fill="#86dfff"
          opacity={isBlinking ? 0.3 : 0.9}
          className="eye-left transition-all duration-300"
        />
      )}
      
      {/* Right Eye */}
      {currentExpression.isHeartEyes ? (
        <path 
          d="M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0" 
          transform="translate(25, -10)"
          fill="#86dfff"
          className="heart-eye right animate-pulse"
        />
      ) : (
        currentExpression.rightEye && (
          <path 
            d={currentExpression.rightEye} 
            transform="translate(25, -10)"
            fill="#86dfff"
            opacity={isBlinking ? 0.3 : 0.9}
            className="eye-right transition-all duration-300"
          />
        )
      )}

  {/* Eyebrows - Only render if the current expression has eyebrows */}
  {currentExpression.eyebrows && (
        <g className="eyebrows">
          <path
            d={currentExpression.eyebrows.left}
            fill="none"
            stroke="#86dfff"
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <path
            d={currentExpression.eyebrows.right}
            fill="none"
            stroke="#86dfff"
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </g>
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
}

//################## SECTION 7: Interface Component ##################
const CyberpunkInterface = () => {
  const [status, setStatus] = React.useState('CONNECTED');
  const [time, setTime] = React.useState('');
  const [taskCompletionLevel, setTaskCompletionLevel] = React.useState(0);
  const [currentLevel, setCurrentLevel] = React.useState(1);
  const [isTaskCompleted, setIsTaskCompleted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

    //  // Add these new state variables
  const [motivationalMessage, setMotivationalMessage] = React.useState('');
  const [showMessage, setShowMessage] = React.useState(false);

  // Add the displayRandomMessage function right after the state declarations
  const displayRandomMessage = React.useCallback(() => {
    const messages = window.motivationalMessages || [];
    const message = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(message);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  }, []);
 
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

      // Find the XP observer section and modify it
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
              
              // Add these two lines to trigger both animations
              setIsTaskCompleted(true);
              displayRandomMessage();
              setTimeout(() => setIsTaskCompleted(false), 2000);
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

      <div className="robot-companion-container flex flex-col items-center mt-4 relative">
        <div className="minimalist-face-wrapper w-32 h-32 relative">
          <CuteRobotFace 
            taskCompletionLevel={taskCompletionLevel}
            currentLevel={currentLevel}
            isTaskCompleted={isTaskCompleted}
          />
          <MotivationalOverlay 
            message={motivationalMessage}
            isVisible={showMessage}
          />
        </div>
      </div>

     
      <div className="scan-line"></div>
    </div>
  );
};

//################## SECTION 10: Initialization ##################
// Wrap our initialization in a function to ensure all required elements are loaded
const initializeReactComponents = () => {
  // First, ensure we're running in a browser environment
  if (typeof window === 'undefined') return;

  // Get our container element
  const container = document.getElementById('react-mission-control');
  
  if (container) {
    // Create a single stable reference for our root
    if (!window.reactRoot) {
      try {
        window.reactRoot = ReactDOM.createRoot(container);
        
        // Wrap our render in a try-catch to handle potential errors
        try {
          window.reactRoot.render(
            // Wrap the component in React.StrictMode for better error catching
            <React.StrictMode>
              <CyberpunkInterface />
            </React.StrictMode>
          );
        } catch (renderError) {
          console.error('Error rendering React component:', renderError);
        }
      } catch (rootError) {
        console.error('Error creating React root:', rootError);
      }
    }
  }
};

// Ensure the DOM is fully loaded before we initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReactComponents);
} else {
  initializeReactComponents();
}