
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
  const blinkVariations = [
    { duration: 100, interval: 3000 },   // Quick blink
    { duration: 50, interval: 5000 },    // Rapid blink
    { duration: 200, interval: 7000 }    // Longer, slower blink
  ];

  const randomBlinkStyle = blinkVariations[
    Math.floor(Math.random() * blinkVariations.length)
  ];

  const blinkInterval = setInterval(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), randomBlinkStyle.duration);
  }, randomBlinkStyle.interval);

  return () => clearInterval(blinkInterval);
}, []);

//################## SECTION 4: Emotion Logic ##################
React.useEffect(() => {
  // First, determine the base emotion based on level and XP
  let baseEmotion = 'neutral';
  
  // Set base emotion based on level
  if (currentLevel >= 2) {
    baseEmotion = 'neutral';  // Level 2+ starts at happy
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
  const blinkVariations = [
    { duration: 100, interval: 3000 },   // Quick blink
    { duration: 50, interval: 5000 },    // Rapid blink
    { duration: 200, interval: 7000 }    // Longer, slower blink
  ];

  const randomBlinkStyle = blinkVariations[
    Math.floor(Math.random() * blinkVariations.length)
  ];

  const blinkInterval = setInterval(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), randomBlinkStyle.duration);
  }, randomBlinkStyle.interval);

  return () => clearInterval(blinkInterval);
}, []);

//################## SECTION 4: Emotion Logic ##################
React.useEffect(() => {
  // First, determine the base emotion based on level and XP
  let baseEmotion = 'neutral';
  
  // Set base emotion based on level
  if (currentLevel >= 2) {
    baseEmotion = 'neutral';  // Level 2+ starts at happy
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
// Update this useEffect in your CuteRobotFace component
React.useEffect(() => {
  // Function to determine base emotion
  const getBaseEmotion = () => {
    if (currentLevel >= 2) {
      return 'happy';
    } else if (taskCompletionLevel >= 70) {
      return 'excited';
    } else if (taskCompletionLevel >= 30) {
      return 'happy';
    } else {
      return 'neutral';
    }
  };

  // Function to trigger random emotion
  const triggerRandomEmotion = () => {
    // Only show random emotions if we're in a base state
    if (!isTaskCompleted && 
        currentEmotion !== 'curious' && 
        currentEmotion !== 'perplexed' && 
        currentEmotion !== 'heart-eyes') {
      
      const chance = Math.random();
      
      // Distribute probabilities across emotions
      if (chance < 0.2) { // 20% total chance for random emotions
        let randomEmotion;
        
        // Sub-distribute the 20% among different emotions
        if (chance < 0.08) { // 8% chance for playful
          randomEmotion = 'playful';
        } else if (chance < 0.14) { // 6% chance for sleepy
          randomEmotion = 'sleepy';
        } else { // 6% chance for glitched
          randomEmotion = 'glitched';
        }

        setCurrentEmotion(randomEmotion);
        
        // Different durations for different emotions
        const duration = randomEmotion === 'glitched' ? 1500 : 3000; // Glitch state is shorter
        
        setTimeout(() => {
          setCurrentEmotion(getBaseEmotion());
        }, duration);
      }
    }
  };

  // Set up the interval for random emotions
  const intervalId = setInterval(triggerRandomEmotion, 15000); // Check every 15 seconds

  // Cleanup function
  return () => {
    clearInterval(intervalId);
  };
}, [currentLevel, taskCompletionLevel, isTaskCompleted, currentEmotion]);

//################## SECTION 5: Expressions Configuration ##################
const expressions = {

  'neutral': {
    leftEye: {
        path: 'M-25,-5 A15,10 0 1,1 -5,-4',  // Made significantly smaller
        blinkPath: 'M-25,-2 A15,1 0 1,1 -5,-2',  // Blink adjusted to match
        animationParams: {
            glowIntensity: {
                values: '0.95;0.85;0.95',
                duration: '4s'
            },
            floatOffset: {
                range: [-2, 2],
                duration: '3s'
            }
        }
    },
    rightEye: {
        path: 'M5,-4 A15,10 0 1,1 25,-5',  // Matching smaller scale
        blinkPath: 'M5,-2 A15,1 0 1,1 25,-2',  // Matching blink
        animationParams: {
            glowIntensity: {
                values: '0.95;0.85;0.95',
                duration: '4s'
            },
            floatOffset: {
                range: [-2, 2],
                duration: '3s'
            }
        }
    },
    mouth: 'M-25,20 Q0,25 25,20',  // Scaled mouth to match
    effects: {
        gradient: {
            type: 'radial',
            colors: [
                { offset: '0%', color: '#00ffff' },
                { offset: '60%', color: '#00e6e6' },
                { offset: '100%', color: '#00cccc' }
            ]
        },
        filter: {
            blur: [
                { stdDeviation: 1.5, result: 'glow1' },
                { stdDeviation: 3, result: 'glow2' }
            ]
        }
    },
    color: '#00e6e6',
    opacity: 0.95,
    emotional_metadata: {
        energy_level: 0.3,
        cognitive_state: 'passive_observation',
        tension: 0.2,
        blink_interval: {
            min: 2000,
            max: 5000
        }
    }
},
  'happy': {
    leftEye: 'M-30,-5 Q-12,-25 0,-5',   // Increased vertical curve height
    rightEye: 'M0,-5 Q12,-25 30,-5',    // Matched increased vertical curve height
    mouth: 'M-35,20 Q0,45 35,20',       // Taller, more expansive smile curve
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.8,                // Slightly increased energy
      cognitive_state: 'joyful_resonance',  // More descriptive state
      tension: 0.05,                    // Very low tension
      happiness_depth: 0.7               // New metric to quantify emotional intensity
    }
},

'excited': {
    leftEye: 'M-30,-5 C-22,-25 -12,-35 0,-5',   // Larger, more dramatic bean curve for left eye
    rightEye: 'M0,-5 C12,-35 22,-25 30,-5',     // Matching larger bean curve for right eye
    mouth: 'M-40,20 Q0,55 40,20',               // Maintained playful smile
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.9,                // High but not maxed out energy
      cognitive_state: 'joyful_burst',   // Softer, more cute-oriented state
      tension: 0.3,                     // Reduced tension for a more adorable feel
      excitement_intensity: 0.8,         // Slightly moderated excitement
      cute_factor: 0.9                   // New metric for adorable excitement
    }
},

'glitched': {
  // Base properties
  leftEye: "M-36,-12 L-40,-8 L-24,8 L-20,12 Z M-36,12 L-40,8 L-24,-8 L-20,-12 Z",
  rightEye: "M36,-12 L40,-8 L24,8 L20,12 Z M36,12 L40,8 L24,-8 L20,-12 Z",
  mouth: "M-25,20 Q0,35 25,20",
  color: "#00ffff",
  isGlitched: true,
  
  // Add the effects configuration
  effects: {
    // Color split effect configuration
    colorSplit: {
      dx: 2,
      duration: "0.8s",
      values: "2;1;2"
    },
    // Displacement effect configuration
    displacement: {
      baseFrequency: 0.1,
      scale: 2,
      duration: "0.8s",
      frequencyValues: "0.1;0.15;0.1"
    }
  },
  
  // Animation configurations
  animations: {
    eyes: {
      fill: {
        values: "#00ffff;#ff69b4;#00ffff",
        dur: "0.8s"
      },
      transform: {
        values: "translate(-15, -10);translate(-16, -10);translate(-15, -10)",
        dur: "1.2s"
      }
    },
    mouth: {
      path: {
        values: "M-25,20 Q0,35 25,20;M-25,21 Q0,36 25,21;M-25,20 Q0,35 25,20",
        dur: "1s"
      },
      stroke: {
        values: "#00ffff;#ff69b4;#00ffff",
        dur: "0.8s"
      }
    }
  },
  
  emotional_metadata: {
    energy_level: 0.7,
    cognitive_state: "digital_consciousness",
    digital_interference: 0.8,
    system_status: "active_connection"
  }
},

  'curious': {
    leftEye: 'M-30,-5 A15,20 0 1,1 0,-5',
    rightEye: 'M0,-5 A15,-20 0 1,1 30,-5',
    mouth: 'M-30,20 Q0,25 30,20',
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.6,
      cognitive_state: 'exploratory',
      tension: 0.4
    }
  },

'playful': {
    leftEye: 'M-25,-5 Q-10,-20 0,-5',  // Raised eyebrow effect
    rightEye: 'M-25,-5 L25,-5 0,-6',   // Mischievous wink
    mouth: 'M-35,20 Q0,45 35,20 Q15,10 -35,20',  // Asymmetrical, sly smile
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.9,
      cognitive_state: 'mischievous_delight',
      tension: 0.2,
      playfulness_index: 0.8
    }

  },
  'perplexed': {
    leftEye: 'M-25,-5 A15,10 0 1,1 0,-5',
    rightEye: 'M0,-5 A15,10 0 1,1 25,-5',
    mouth: 'M-10,30 A10,5 0 1,1 5,30',
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.5,
      cognitive_state: 'analytical_confusion',
      tension: 0.7
    }
  },
  'sleepy': {
    leftEye: 'M-20,-5 A15,8 0 1,1 0,-5',
    rightEye: 'M0,-5 A15,8 0 1,1 20,-5',
    mouth: 'M-30,20 Q0,25 30,20',
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.2,
      cognitive_state: 'low_engagement',
      tension: 0.1
    }
  },
  'heart-eyes': {
    leftEye: 'M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0', 
    rightEye: 'M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0',
    mouth: 'M-30,20 Q0,40 30,20',
    color: '#86dfff',
    isHeartEyes: true,
    emotional_metadata: {
      energy_level: 0.9,
      cognitive_state: 'euphoric_connection',
      tension: 0.05
    }
  }
};

// Add this helper function after the expressions object
const getEyePath = (expression, isLeft, isBlinking) => {
  if (typeof expression[isLeft ? 'leftEye' : 'rightEye'] === 'object') {
    return isBlinking 
      ? expression[isLeft ? 'leftEye' : 'rightEye'].blinkPath 
      : expression[isLeft ? 'leftEye' : 'rightEye'].path;
  }
  return expression[isLeft ? 'leftEye' : 'rightEye'];
};

// Emotion Transition Helper (Optional Enhancement)
const EmotionTransitionRules = {
  // Define transition probabilities and interesting rules
  'neutral-to-curious': {
    probability: 0.7,
    energyShift: 0.3,
    cognitiveEngagement: 'increase'
  },
  'curious-to-excited': {
    probability: 0.5,
    energyShift: 0.4,
    cognitiveEngagement: 'spike'
  }
};

// Utility function to get emotional transition information
function getEmotionTransitionDetails(fromEmotion, toEmotion) {
  const transitionKey = `${fromEmotion}-to-${toEmotion}`;
  return EmotionTransitionRules[transitionKey] || {
    probability: 0.5,
    energyShift: 0.2,
    cognitiveEngagement: 'moderate'
  };
}
  //################## SECTION 6: Render Logic ##################


    React.useEffect(() => {
      // Your emotion logic here
    }, [taskCompletionLevel, currentLevel, isTaskCompleted]);
  
    // Blinking effect
    React.useEffect(() => {
      // Your blinking logic here
    }, []);
  
    // Get current expression
    const currentExpression = expressions[currentEmotion];
  
  return (

    
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-50 -50 100 100"
    className="minimalist-face w-full h-full"
  >
    <defs>
      {/* Base CRT Glow Filter */}
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

  {/* Eye glow gradient */}
  <radialGradient id="eyeGlow">
    {/* We'll use a conditional render here instead of fragments */}
    {currentExpression && currentExpression.effects && currentExpression.effects.gradient ? 
      currentExpression.effects.gradient.colors.map(color => (
        <stop
          key={color.offset}
          offset={color.offset}
          stopColor={color.color}
        />
      ))
      :
      [
        <stop key="0" offset="0%" stopColor="#00ffff" />,
        <stop key="1" offset="60%" stopColor="#00e6e6" />,
        <stop key="2" offset="100%" stopColor="#00cccc" />
      ]
    }
  </radialGradient>

  {/* Cute glow filter */}
  <filter id="cuteGlow">
    {/* Similarly, we'll use an array of elements instead of fragments */}
    {currentExpression && currentExpression.effects && currentExpression.effects.filter ? 
      currentExpression.effects.filter.blur.map((blur, index) => (
        <feGaussianBlur
          key={index}
          stdDeviation={blur.stdDeviation}
          result={blur.result}
        />
      ))
      :
      [
        <feGaussianBlur key="1" stdDeviation="1.5" result="glow1"/>,
        <feGaussianBlur key="2" stdDeviation="3" result="glow2"/>
      ]
    }
    <feMerge>
      <feMergeNode in="glow2"/>
      <feMergeNode in="glow1"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>

      {/* Screen Fade Gradient - creates the monitor-like background effect */}
      <radialGradient id="screen-fade" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#86dfff" stopOpacity="0.1"/>
        <stop offset="50%" stopColor="#4a9eff" stopOpacity="0.05"/>
        <stop offset="60%" stopColor="#2c3e50" stopOpacity="0"/>
      </radialGradient>

      {/* Enhanced filters for glitched state */}
      {currentExpression.isGlitched && (
        <filter id="color-split">
          <feOffset dx="2" dy="0">
            <animate
              attributeName="dx"
              values="2;1;2"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </feOffset>
        </filter>
      )}

   

    {/* Background with screen fade */}
    <circle
      cx="0"
      cy="0"
      r="45"
      fill="url(#screen-fade)"
      className="animate-pulse opacity-60"
    />

    {/* Main face group with appropriate glow effect */}
    <g filter={currentExpression.isGlitched ? "url(#color-split)" : "url(#crt-glow)"} 
       className="retro-screen">
      {/* Left Eye with all states */}
{currentExpression.isHeartEyes ? (
  // Heart eyes state remains unchanged
  <path
    d="M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0"
    transform="translate(-25, -10)"
    fill="#86dfff"
    className="heart-eye left animate-pulse"
  />
) : currentExpression.isGlitched ? (
  // Glitched state with color split effect
  <path
    d={currentExpression.leftEye}
    transform="translate(-15, -10)"
    fill={currentExpression.color}
    filter="url(#color-split)"
  >
    <animate
      attributeName="fill"
      values="#00ffff;#ff69b4;#00ffff"
      dur="0.8s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="transform"
      values="translate(-15, -10);translate(-16, -10);translate(-15, -10)"
      dur="1.2s"
      repeatCount="indefinite"
    />
  </path>
) : (
  // Enhanced normal state with glow effects
  <g>
    {/* Base eye shape */}
    <path
      d={getEyePath(currentExpression, true, isBlinking)}
      transform="translate(-25, -10)"
      fill="url(#eyeGlow)"
      filter="url(#cuteGlow)"
      opacity={isBlinking ? 0.3 : (currentExpression.opacity || 0.95)}
      className="eye-left transition-all duration-300"
    />
    {/* Glow animation if available */}
    {currentExpression.leftEye && currentExpression.leftEye.animationParams && (
      <animate
        attributeName="opacity"
        values={currentExpression.leftEye.animationParams.glowIntensity.values}
        dur={currentExpression.leftEye.animationParams.glowIntensity.duration}
        repeatCount="indefinite"
      />
    )}
  </g>
)}

{/* Right Eye with all states */}
{currentExpression.isHeartEyes ? (
  // Heart eyes state remains unchanged
  <path
    d="M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0"
    transform="translate(25, -10)"
    fill="#86dfff"
    className="heart-eye right animate-pulse"
  />
) : currentExpression.isGlitched ? (
  // Glitched state with color split effect
  <path
    d={currentExpression.rightEye}
    transform="translate(15, -10)"
    fill={currentExpression.color}
    filter="url(#color-split)"
  >
    <animate
      attributeName="fill"
      values="#00ffff;#ff69b4;#00ffff"
      dur="0.8s"
      repeatCount="indefinite"
      begin="0.4s"
    />
    <animate
      attributeName="transform"
      values="translate(15, -10);translate(16, -10);translate(15, -10)"
      dur="1.2s"
      repeatCount="indefinite"
      begin="0.4s"
    />
  </path>
) : (
  // Enhanced normal state with glow effects
  <g>
    {/* Base eye shape */}
    <path
      d={getEyePath(currentExpression, false, isBlinking)}
      transform="translate(25, -10)"
      fill="url(#eyeGlow)"
      filter="url(#cuteGlow)"
      opacity={isBlinking ? 0.3 : (currentExpression.opacity || 0.95)}
      className="eye-right transition-all duration-300"
    />
    {/* Glow animation if available */}
    {currentExpression.rightEye && currentExpression.rightEye.animationParams && (
      <animate
        attributeName="opacity"
        values={currentExpression.rightEye.animationParams.glowIntensity.values}
        dur={currentExpression.rightEye.animationParams.glowIntensity.duration}
        repeatCount="indefinite"
      />
    )}
  </g>
)}

{/* Add definitions for gradients and filters */}
<defs>
  <radialGradient id="eyeGlow">
    <stop offset="0%" stopColor="#00ffff" />
    <stop offset="60%" stopColor="#00e6e6" />
    <stop offset="100%" stopColor="#00cccc" />
  </radialGradient>
  
  <filter id="cuteGlow">
    <feGaussianBlur stdDeviation="1.5" result="glow1"/>
    <feGaussianBlur stdDeviation="3" result="glow2"/>
    <feMerge>
      <feMergeNode in="glow2"/>
      <feMergeNode in="glow1"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>

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

      {/* Mouth with enhanced glitch support */}
      {currentExpression.isGlitched ? (
        <path 
          d={currentExpression.mouth}
          fill="none"
          stroke={currentExpression.color}
          strokeWidth="3"
          filter="url(#fractal-displace)"
        >
          <animate
            attributeName="d"
            values="M-25,20 Q0,35 25,20;M-25,21 Q0,36 25,21;M-25,20 Q0,35 25,20"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke"
            values="#00ffff;#ff69b4;#00ffff"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
      ) : (
        <path
          d={currentExpression.mouth}
          fill="#86dfff"
          className="mouth transition-all duration-500 opacity-90"
        />
      )}
    </g>

    {/* Single animated scan line */}
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
};

//################## SECTION 7: Interface Component ##################
const CyberpunkInterface = () => {
  // Existing state declarations
  const [status, setStatus] = React.useState('CONNECTED');
  const [time, setTime] = React.useState('');
  const [taskCompletionLevel, setTaskCompletionLevel] = React.useState(0);
  const [currentLevel, setCurrentLevel] = React.useState(1);
  const [isTaskCompleted, setIsTaskCompleted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [motivationalMessage, setMotivationalMessage] = React.useState('');
  const [showMessage, setShowMessage] = React.useState(false);

  // Enhanced displayRandomMessage function
  const displayRandomMessage = React.useCallback(() => {
    // Access the existing motivationalMessages array from window scope
    if (window.motivationalMessages && window.motivationalMessages.length > 0) {
      const message = window.motivationalMessages[
        Math.floor(Math.random() * window.motivationalMessages.length)
      ];
      setMotivationalMessage(message);
      setShowMessage(true);
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
        setMotivationalMessage('');
      }, 3000);
    }
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
    <div className="cyber-container flex flex-col relative">
      <div className="neural-status-panel">
        <div>Mission AI v2.3</div>
        <div>PrimerOS 0.9.5</div>
      </div>
  
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
//################## SECTION 5: Expressions Configuration ##################
const expressions = {

  'neutral': {
    leftEye: {
        path: 'M-25,-5 A15,10 0 1,1 -5,-4',  // Made significantly smaller
        blinkPath: 'M-25,-2 A15,1 0 1,1 -5,-2',  // Blink adjusted to match
        animationParams: {
            glowIntensity: {
                values: '0.95;0.85;0.95',
                duration: '4s'
            },
            floatOffset: {
                range: [-2, 2],
                duration: '3s'
            }
        }
    },
    rightEye: {
        path: 'M5,-4 A15,10 0 1,1 25,-5',  // Matching smaller scale
        blinkPath: 'M5,-2 A15,1 0 1,1 25,-2',  // Matching blink
        animationParams: {
            glowIntensity: {
                values: '0.95;0.85;0.95',
                duration: '4s'
            },
            floatOffset: {
                range: [-2, 2],
                duration: '3s'
            }
        }
    },
    mouth: 'M-25,20 Q0,25 25,20',  // Scaled mouth to match
    effects: {
        gradient: {
            type: 'radial',
            colors: [
                { offset: '0%', color: '#00ffff' },
                { offset: '60%', color: '#00e6e6' },
                { offset: '100%', color: '#00cccc' }
            ]
        },
        filter: {
            blur: [
                { stdDeviation: 1.5, result: 'glow1' },
                { stdDeviation: 3, result: 'glow2' }
            ]
        }
    },
    color: '#00e6e6',
    opacity: 0.95,
    emotional_metadata: {
        energy_level: 0.3,
        cognitive_state: 'passive_observation',
        tension: 0.2,
        blink_interval: {
            min: 2000,
            max: 5000
        }
    }
},
  'happy': {
    leftEye: 'M-30,-5 Q-12,-25 0,-5',   // Increased vertical curve height
    rightEye: 'M0,-5 Q12,-25 30,-5',    // Matched increased vertical curve height
    mouth: 'M-35,20 Q0,45 35,20',       // Taller, more expansive smile curve
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.8,                // Slightly increased energy
      cognitive_state: 'joyful_resonance',  // More descriptive state
      tension: 0.05,                    // Very low tension
      happiness_depth: 0.7               // New metric to quantify emotional intensity
    }
},

'excited': {
    leftEye: 'M-30,-5 C-22,-25 -12,-35 0,-5',   // Larger, more dramatic bean curve for left eye
    rightEye: 'M0,-5 C12,-35 22,-25 30,-5',     // Matching larger bean curve for right eye
    mouth: 'M-40,20 Q0,55 40,20',               // Maintained playful smile
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.9,                // High but not maxed out energy
      cognitive_state: 'joyful_burst',   // Softer, more cute-oriented state
      tension: 0.3,                     // Reduced tension for a more adorable feel
      excitement_intensity: 0.8,         // Slightly moderated excitement
      cute_factor: 0.9                   // New metric for adorable excitement
    }
},

'glitched': {
  // Base properties
  leftEye: "M-36,-12 L-40,-8 L-24,8 L-20,12 Z M-36,12 L-40,8 L-24,-8 L-20,-12 Z",
  rightEye: "M36,-12 L40,-8 L24,8 L20,12 Z M36,12 L40,8 L24,-8 L20,-12 Z",
  mouth: "M-25,20 Q0,35 25,20",
  color: "#00ffff",
  isGlitched: true,
  
  // Add the effects configuration
  effects: {
    // Color split effect configuration
    colorSplit: {
      dx: 2,
      duration: "0.8s",
      values: "2;1;2"
    },
    // Displacement effect configuration
    displacement: {
      baseFrequency: 0.1,
      scale: 2,
      duration: "0.8s",
      frequencyValues: "0.1;0.15;0.1"
    }
  },
  
  // Animation configurations
  animations: {
    eyes: {
      fill: {
        values: "#00ffff;#ff69b4;#00ffff",
        dur: "0.8s"
      },
      transform: {
        values: "translate(-15, -10);translate(-16, -10);translate(-15, -10)",
        dur: "1.2s"
      }
    },
    mouth: {
      path: {
        values: "M-25,20 Q0,35 25,20;M-25,21 Q0,36 25,21;M-25,20 Q0,35 25,20",
        dur: "1s"
      },
      stroke: {
        values: "#00ffff;#ff69b4;#00ffff",
        dur: "0.8s"
      }
    }
  },
  
  emotional_metadata: {
    energy_level: 0.7,
    cognitive_state: "digital_consciousness",
    digital_interference: 0.8,
    system_status: "active_connection"
  }
},

  'curious': {
    leftEye: 'M-30,-5 A15,20 0 1,1 0,-5',
    rightEye: 'M0,-5 A15,-20 0 1,1 30,-5',
    mouth: 'M-30,20 Q0,25 30,20',
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.6,
      cognitive_state: 'exploratory',
      tension: 0.4
    }
  },

'playful': {
    leftEye: 'M-25,-5 Q-10,-20 0,-5',  // Raised eyebrow effect
    rightEye: 'M-25,-5 L25,-5 0,-6',   // Mischievous wink
    mouth: 'M-35,20 Q0,45 35,20 Q15,10 -35,20',  // Asymmetrical, sly smile
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.9,
      cognitive_state: 'mischievous_delight',
      tension: 0.2,
      playfulness_index: 0.8
    }

  },
  'perplexed': {
    leftEye: 'M-25,-5 A15,10 0 1,1 0,-5',
    rightEye: 'M0,-5 A15,10 0 1,1 25,-5',
    mouth: 'M-10,30 A10,5 0 1,1 5,30',
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.5,
      cognitive_state: 'analytical_confusion',
      tension: 0.7
    }
  },
  'sleepy': {
    leftEye: 'M-20,-5 A15,8 0 1,1 0,-5',
    rightEye: 'M0,-5 A15,8 0 1,1 20,-5',
    mouth: 'M-30,20 Q0,25 30,20',
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.2,
      cognitive_state: 'low_engagement',
      tension: 0.1
    }
  },
  'heart-eyes': {
    leftEye: 'M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0', 
    rightEye: 'M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0',
    mouth: 'M-30,20 Q0,40 30,20',
    color: '#86dfff',
    isHeartEyes: true,
    emotional_metadata: {
      energy_level: 0.9,
      cognitive_state: 'euphoric_connection',
      tension: 0.05
    }
  }
};

// Add this helper function after the expressions object
const getEyePath = (expression, isLeft, isBlinking) => {
  if (typeof expression[isLeft ? 'leftEye' : 'rightEye'] === 'object') {
    return isBlinking 
      ? expression[isLeft ? 'leftEye' : 'rightEye'].blinkPath 
      : expression[isLeft ? 'leftEye' : 'rightEye'].path;
  }
  return expression[isLeft ? 'leftEye' : 'rightEye'];
};

// Emotion Transition Helper (Optional Enhancement)
const EmotionTransitionRules = {
  // Define transition probabilities and interesting rules
  'neutral-to-curious': {
    probability: 0.7,
    energyShift: 0.3,
    cognitiveEngagement: 'increase'
  },
  'curious-to-excited': {
    probability: 0.5,
    energyShift: 0.4,
    cognitiveEngagement: 'spike'
  }
};

// Utility function to get emotional transition information
function getEmotionTransitionDetails(fromEmotion, toEmotion) {
  const transitionKey = `${fromEmotion}-to-${toEmotion}`;
  return EmotionTransitionRules[transitionKey] || {
    probability: 0.5,
    energyShift: 0.2,
    cognitiveEngagement: 'moderate'
  };
}
  //################## SECTION 6: Render Logic ##################


    React.useEffect(() => {
      // Your emotion logic here
    }, [taskCompletionLevel, currentLevel, isTaskCompleted]);
  
    // Blinking effect
    React.useEffect(() => {
      // Your blinking logic here
    }, []);
  
    // Get current expression
    const currentExpression = expressions[currentEmotion];
  
  return (

    
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-50 -50 100 100"
    className="minimalist-face w-full h-full"
  >
    <defs>
      {/* Base CRT Glow Filter */}
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

  {/* Eye glow gradient */}
  <radialGradient id="eyeGlow">
    {/* We'll use a conditional render here instead of fragments */}
    {currentExpression && currentExpression.effects && currentExpression.effects.gradient ? 
      currentExpression.effects.gradient.colors.map(color => (
        <stop
          key={color.offset}
          offset={color.offset}
          stopColor={color.color}
        />
      ))
      :
      [
        <stop key="0" offset="0%" stopColor="#00ffff" />,
        <stop key="1" offset="60%" stopColor="#00e6e6" />,
        <stop key="2" offset="100%" stopColor="#00cccc" />
      ]
    }
  </radialGradient>

  {/* Cute glow filter */}
  <filter id="cuteGlow">
    {/* Similarly, we'll use an array of elements instead of fragments */}
    {currentExpression && currentExpression.effects && currentExpression.effects.filter ? 
      currentExpression.effects.filter.blur.map((blur, index) => (
        <feGaussianBlur
          key={index}
          stdDeviation={blur.stdDeviation}
          result={blur.result}
        />
      ))
      :
      [
        <feGaussianBlur key="1" stdDeviation="1.5" result="glow1"/>,
        <feGaussianBlur key="2" stdDeviation="3" result="glow2"/>
      ]
    }
    <feMerge>
      <feMergeNode in="glow2"/>
      <feMergeNode in="glow1"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>

      {/* Screen Fade Gradient - creates the monitor-like background effect */}
      <radialGradient id="screen-fade" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#86dfff" stopOpacity="0.1"/>
        <stop offset="50%" stopColor="#4a9eff" stopOpacity="0.05"/>
        <stop offset="60%" stopColor="#2c3e50" stopOpacity="0"/>
      </radialGradient>

      {/* Enhanced filters for glitched state */}
      {currentExpression.isGlitched && (
        <filter id="color-split">
          <feOffset dx="2" dy="0">
            <animate
              attributeName="dx"
              values="2;1;2"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </feOffset>
        </filter>
      )}

   

    {/* Background with screen fade */}
    <circle
      cx="0"
      cy="0"
      r="45"
      fill="url(#screen-fade)"
      className="animate-pulse opacity-60"
    />

    {/* Main face group with appropriate glow effect */}
    <g filter={currentExpression.isGlitched ? "url(#color-split)" : "url(#crt-glow)"} 
       className="retro-screen">
      {/* Left Eye with all states */}
{currentExpression.isHeartEyes ? (
  // Heart eyes state remains unchanged
  <path
    d="M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0"
    transform="translate(-25, -10)"
    fill="#86dfff"
    className="heart-eye left animate-pulse"
  />
) : currentExpression.isGlitched ? (
  // Glitched state with color split effect
  <path
    d={currentExpression.leftEye}
    transform="translate(-15, -10)"
    fill={currentExpression.color}
    filter="url(#color-split)"
  >
    <animate
      attributeName="fill"
      values="#00ffff;#ff69b4;#00ffff"
      dur="0.8s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="transform"
      values="translate(-15, -10);translate(-16, -10);translate(-15, -10)"
      dur="1.2s"
      repeatCount="indefinite"
    />
  </path>
) : (
  // Enhanced normal state with glow effects
  <g>
    {/* Base eye shape */}
    <path
      d={getEyePath(currentExpression, true, isBlinking)}
      transform="translate(-25, -10)"
      fill="url(#eyeGlow)"
      filter="url(#cuteGlow)"
      opacity={isBlinking ? 0.3 : (currentExpression.opacity || 0.95)}
      className="eye-left transition-all duration-300"
    />
    {/* Glow animation if available */}
    {currentExpression.leftEye && currentExpression.leftEye.animationParams && (
      <animate
        attributeName="opacity"
        values={currentExpression.leftEye.animationParams.glowIntensity.values}
        dur={currentExpression.leftEye.animationParams.glowIntensity.duration}
        repeatCount="indefinite"
      />
    )}
  </g>
)}

{/* Right Eye with all states */}
{currentExpression.isHeartEyes ? (
  // Heart eyes state remains unchanged
  <path
    d="M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0"
    transform="translate(25, -10)"
    fill="#86dfff"
    className="heart-eye right animate-pulse"
  />
) : currentExpression.isGlitched ? (
  // Glitched state with color split effect
  <path
    d={currentExpression.rightEye}
    transform="translate(15, -10)"
    fill={currentExpression.color}
    filter="url(#color-split)"
  >
    <animate
      attributeName="fill"
      values="#00ffff;#ff69b4;#00ffff"
      dur="0.8s"
      repeatCount="indefinite"
      begin="0.4s"
    />
    <animate
      attributeName="transform"
      values="translate(15, -10);translate(16, -10);translate(15, -10)"
      dur="1.2s"
      repeatCount="indefinite"
      begin="0.4s"
    />
  </path>
) : (
  // Enhanced normal state with glow effects
  <g>
    {/* Base eye shape */}
    <path
      d={getEyePath(currentExpression, false, isBlinking)}
      transform="translate(25, -10)"
      fill="url(#eyeGlow)"
      filter="url(#cuteGlow)"
      opacity={isBlinking ? 0.3 : (currentExpression.opacity || 0.95)}
      className="eye-right transition-all duration-300"
    />
    {/* Glow animation if available */}
    {currentExpression.rightEye && currentExpression.rightEye.animationParams && (
      <animate
        attributeName="opacity"
        values={currentExpression.rightEye.animationParams.glowIntensity.values}
        dur={currentExpression.rightEye.animationParams.glowIntensity.duration}
        repeatCount="indefinite"
      />
    )}
  </g>
)}

{/* Add definitions for gradients and filters */}
<defs>
  <radialGradient id="eyeGlow">
    <stop offset="0%" stopColor="#00ffff" />
    <stop offset="60%" stopColor="#00e6e6" />
    <stop offset="100%" stopColor="#00cccc" />
  </radialGradient>
  
  <filter id="cuteGlow">
    <feGaussianBlur stdDeviation="1.5" result="glow1"/>
    <feGaussianBlur stdDeviation="3" result="glow2"/>
    <feMerge>
      <feMergeNode in="glow2"/>
      <feMergeNode in="glow1"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>

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

      {/* Mouth with enhanced glitch support */}
      {currentExpression.isGlitched ? (
        <path 
          d={currentExpression.mouth}
          fill="none"
          stroke={currentExpression.color}
          strokeWidth="3"
          filter="url(#fractal-displace)"
        >
          <animate
            attributeName="d"
            values="M-25,20 Q0,35 25,20;M-25,21 Q0,36 25,21;M-25,20 Q0,35 25,20"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke"
            values="#00ffff;#ff69b4;#00ffff"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
      ) : (
        <path
          d={currentExpression.mouth}
          fill="#86dfff"
          className="mouth transition-all duration-500 opacity-90"
        />
      )}
    </g>

    {/* Single animated scan line */}
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
};

//################## SECTION 7: Interface Component ##################
const CyberpunkInterface = () => {
  // Existing state declarations
  const [status, setStatus] = React.useState('CONNECTED');
  const [time, setTime] = React.useState('');
  const [taskCompletionLevel, setTaskCompletionLevel] = React.useState(0);
  const [currentLevel, setCurrentLevel] = React.useState(1);
  const [isTaskCompleted, setIsTaskCompleted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [motivationalMessage, setMotivationalMessage] = React.useState('');
  const [showMessage, setShowMessage] = React.useState(false);

  // Enhanced displayRandomMessage function
  const displayRandomMessage = React.useCallback(() => {
    // Access the existing motivationalMessages array from window scope
    if (window.motivationalMessages && window.motivationalMessages.length > 0) {
      const message = window.motivationalMessages[
        Math.floor(Math.random() * window.motivationalMessages.length)
      ];
      setMotivationalMessage(message);
      setShowMessage(true);
      
      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
        setMotivationalMessage('');
      }, 3000);
    }
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
    <div className="cyber-container flex flex-col relative">
      <div className="neural-status-panel">
        <div>Mission AI v2.3</div>
        <div>PrimerOS 0.9.5</div>
      </div>
  
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