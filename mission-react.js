// Remove the Framer Motion import and replace with our own animation components
// Animation components with compatible syntax
const AnimatedDiv = ({ children, initial, animate, className, ...props }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const getInitialValue = (key, defaultValue) => {
    return initial && initial[key] !== undefined ? initial[key] : defaultValue;
  };

  const getAnimateValue = (key, defaultValue) => {
    return animate && animate[key] !== undefined ? animate[key] : defaultValue;
  };

  const style = {
    transition: 'all 0.3s ease',
    opacity: isVisible ? getAnimateValue('opacity', 1) : getInitialValue('opacity', 0),
    transform: [
      'scale(' + (isVisible ? getAnimateValue('scale', 1) : getInitialValue('scale', 0.9)) + ')',
      'translateY(' + (isVisible ? getAnimateValue('y', 0) : getInitialValue('y', 20)) + 'px)'
    ].join(' '),
    ...props.style
  };

  return (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  );
};

const AnimatedSVG = ({ children, className, initial, animate, ...props }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const getInitialValue = (key, defaultValue) => {
    return initial && initial[key] !== undefined ? initial[key] : defaultValue;
  };

  const getAnimateValue = (key, defaultValue) => {
    return animate && animate[key] !== undefined ? animate[key] : defaultValue;
  };

  const style = {
    transition: 'all 0.5s ease',
    opacity: isVisible ? getAnimateValue('opacity', 1) : getInitialValue('opacity', 0),
    transform: 'scale(' + (isVisible ? getAnimateValue('scale', 1) : getInitialValue('scale', 0.9)) + ')',
    ...props.style
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-50 -50 100 100"
      className={className}
      style={style}
      {...props}
    >
      {children}
    </svg>
  );
};

// Update the MotivationalOverlay component
const MotivationalOverlay = React.memo(({ message, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <AnimatedDiv
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AnimatedDiv
        className="
          bg-black bg-opacity-60 
          text-cyan-400 
          px-4 py-2 
          rounded-lg 
          shadow-lg 
          backdrop-blur-sm
          border border-cyan-400
          text-center
          max-w-xs
        "
        style={{
          animation: 'glow 2s infinite linear'
        }}
      >
        {message}
      </AnimatedDiv>
    </AnimatedDiv>
  );
});


//################## SECTION 1: CuteRobotFace Component Start ##################
// Update the CuteRobotFace component
const CuteRobotFace = ({ 
  taskCompletionLevel = 0, 
  currentLevel = 1, 
  isTaskCompleted = false 
}) => {

  //################## SECTION 2: State and Hooks ##################
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [currentEmotion, setCurrentEmotion] = React.useState('curious');
    const [eyePosition, setEyePosition] = React.useState({ x: 0, y: 0 });
    const [isTracking, setIsTracking] = React.useState(false);

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

  // Add natural eye movement
  React.useEffect(() => {
    const moveEyesRandomly = () => {
      if (!isTracking) {
        const randomX = (Math.random() - 0.5) * 6;
        const randomY = (Math.random() - 0.5) * 4;
        setEyePosition({ x: randomX, y: randomY });
      }
    };

    const movementInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        moveEyesRandomly();
      }
    }, 2000);

    const resetInterval = setInterval(() => {
      if (!isTracking && Math.random() < 0.4) {
        setEyePosition({ x: 0, y: 0 });
      }
    }, 4000);

    return () => {
      clearInterval(movementInterval);
      clearInterval(resetInterval);
    };
  }, [isTracking]);

  // Add mouse tracking for eye movement
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      const wrapper = document.querySelector('.minimalist-face-wrapper');
      if (!wrapper) return;
      
      const bounds = wrapper.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      
      const deltaX = (e.clientX - centerX) / (bounds.width / 2);
      const deltaY = (e.clientY - centerY) / (bounds.height / 2);
      
      const limitedX = Math.max(-1, Math.min(1, deltaX)) * 8;
      const limitedY = Math.max(-1, Math.min(1, deltaY)) * 6;
      
      setEyePosition({ 
        x: limitedX, 
        y: limitedY 
      });
    };

    const handleMouseEnter = () => setIsTracking(true);
    const handleMouseLeave = () => {
      setIsTracking(false);
      setEyePosition({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    const wrapper = document.querySelector('.minimalist-face-wrapper');
    if (wrapper) {
      wrapper.addEventListener('mouseenter', handleMouseEnter);
      wrapper.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (wrapper) {
        wrapper.removeEventListener('mouseenter', handleMouseEnter);
        wrapper.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
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
  let basePath = '';
  
  if (typeof expression[isLeft ? 'leftEye' : 'rightEye'] === 'object') {
    basePath = isBlinking 
      ? expression[isLeft ? 'leftEye' : 'rightEye'].blinkPath 
      : expression[isLeft ? 'leftEye' : 'rightEye'].path;
  } else {
    basePath = expression[isLeft ? 'leftEye' : 'rightEye'];
  }

  // Add translation for eye movement
  const baseTransform = isLeft ? 'translate(-25, -10)' : 'translate(25, -10)';
  return {
    d: basePath,
    transform: `${baseTransform} translate(${eyePosition.x}, ${eyePosition.y})`
  };
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

// Add animation variants
const faceVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const eyeVariants = {
  blink: {
    scaleY: [1, 0.1, 1],
    transition: {
      duration: 0.2,
      times: [0, 0.5, 1]
    }
  }
};
//################## SECTION 6: Render Logic ##################
// Get current expression based on emotion
const currentExpression = expressions[currentEmotion] || expressions.neutral;

// Helper function to safely get gradient colors
const getGradientColors = (expr) => {
  if (expr && expr.effects && expr.effects.gradient) {
    return expr.effects.gradient.colors.map(color => (
      <stop
        key={color.offset}
        offset={color.offset}
        stopColor={color.color}
      />
    ));
  }
  return [
    <stop key="0" offset="0%" stopColor="#00ffff" />,
    <stop key="1" offset="60%" stopColor="#00e6e6" />,
    <stop key="2" offset="100%" stopColor="#00cccc" />
  ];
};

// Helper function to safely get blur filters
const getBlurFilters = (expr) => {
  if (expr && expr.effects && expr.effects.filter) {
    return expr.effects.filter.blur.map((blur, index) => (
      <feGaussianBlur
        key={index}
        stdDeviation={blur.stdDeviation}
        result={blur.result}
      />
    ));
  }
  return [
    <feGaussianBlur key="1" stdDeviation="1.5" result="glow1"/>,
    <feGaussianBlur key="2" stdDeviation="3" result="glow2"/>
  ];
};

return (
  <AnimatedSVG 
    className="minimalist-face w-full h-full"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
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
        {getGradientColors(currentExpression)}
      </radialGradient>

      {/* Cute glow filter */}
      <filter id="cuteGlow">
        {getBlurFilters(currentExpression)}
        <feMerge>
          <feMergeNode in="glow2"/>
          <feMergeNode in="glow1"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      {/* Screen Fade Gradient */}
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
    </defs>

    {/* Background with screen fade */}
    <circle
      cx="0"
      cy="0"
      r="45"
      fill="url(#screen-fade)"
      className="animate-pulse opacity-60"
    />

    {/* Main face group */}
    <g
      filter={currentExpression.isGlitched ? "url(#color-split)" : "url(#crt-glow)"}
      className="retro-screen"
      style={{
        animation: currentExpression.isGlitched ? 'glitch 0.5s infinite' : 'none'
      }}
    >
      {/* Left Eye Group */}
      <g transform={`translate(${-25 + eyePosition.x}, ${-10 + eyePosition.y})`}>
        <path
          d={typeof currentExpression.leftEye === 'string' ? 
             currentExpression.leftEye : 
             isBlinking ? currentExpression.leftEye.blinkPath : currentExpression.leftEye.path}
          fill="url(#eyeGlow)"
          filter="url(#cuteGlow)"
          className={isBlinking ? 'blink-animation' : ''}
          style={{
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </g>

      {/* Right Eye Group */}
      <g transform={`translate(${25 + eyePosition.x}, ${-10 + eyePosition.y})`}>
        <path
          d={typeof currentExpression.rightEye === 'string' ? 
             currentExpression.rightEye : 
             isBlinking ? currentExpression.rightEye.blinkPath : currentExpression.rightEye.path}
          fill="url(#eyeGlow)"
          filter="url(#cuteGlow)"
          className={isBlinking ? 'blink-animation' : ''}
          style={{
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </g>

      {/* Mouth */}
      <path
        d={currentExpression.mouth}
        fill={currentExpression.color || "#86dfff"}
        className="mouth"
        style={{
          transition: 'd 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </g>

    {/* Scan line */}
    <line
      x1="-50"
      x2="50"
      stroke="#86dfff"
      strokeWidth=".5"
      strokeOpacity="0.3"
      className="scan-line-animation"
    />
  </AnimatedSVG>
);}

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