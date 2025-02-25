// Access React and ReactDOM from global scope (already loaded in HTML)
const React = window.React;
const ReactDOM = window.ReactDOM;
// Access Framer Motion (check browser console to see the actual global variable name)
const { motion, AnimatePresence } = window.framerMotion || {};

// Your components remain unchanged
console.log("Available globals:", {
  React: window.React,
  ReactDOM: window.ReactDOM,
  framerMotion: window.framerMotion,
  FramerMotion: window.FramerMotion
});

// Animation components with Framer Motion
const AnimatedDiv = ({ children, initial, animate, className, ...props }) => {
  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={{ ease: "easeOut", duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const AnimatedSVG = ({ children, className, initial, animate, ...props }) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-50 -50 100 100"
      className={className}
      initial={initial}
      animate={animate}
      transition={{ ease: "easeOut", duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.svg>
  );
};

// Update the MotivationalOverlay component
const MotivationalOverlay = React.memo(({ message, isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

// New states for enhanced animations
const [pupilSize, setPupilSize] = React.useState(1);
const [particles, setParticles] = React.useState([]);
const [microAnimationPhase, setMicroAnimationPhase] = React.useState(0);

// Pupil dilation effect
React.useEffect(() => {
  // Dilate pupils on task completion
  if (isTaskCompleted) {
    setPupilSize(1.5);
    setTimeout(() => {
      setPupilSize(1.2);
      setTimeout(() => setPupilSize(1), 800);
    }, 200);
    
    // Generate particles for excitement
    generateParticles(currentEmotion === 'heart-eyes' ? 'heart' : 'sparkle');
  }
  
  // React to emotion changes with appropriate pupil size
  if (currentEmotion === 'curious') {
    setPupilSize(1.2);
  } else if (currentEmotion === 'perplexed') {
    setPupilSize(0.7);
  } else if (currentEmotion === 'sleepy') {
    setPupilSize(0.8);
  } else if (currentEmotion === 'excited') {
    setPupilSize(1.3);
    if (!isTaskCompleted) {
      // Only generate particles if this isn't from task completion
      // (which already generates particles)
      generateParticles('sparkle');
    }
  } else if (currentEmotion === 'glitched') {
    // Random pupil sizes for glitched state
    const glitchInterval = setInterval(() => {
      setPupilSize(0.7 + Math.random() * 0.8);
    }, 200);
    
    return () => clearInterval(glitchInterval);
  }
}, [isTaskCompleted, currentEmotion]);

// Micro-animation ticker
React.useEffect(() => {
  const interval = setInterval(() => {
    setMicroAnimationPhase(prev => (prev + 1) % 4);
  }, 1500);
  
  return () => clearInterval(interval);
}, []);

// Particle generator function
const generateParticles = (type) => {
  const count = type === 'heart' ? 8 : 12;
  const newParticles = Array.from({ length: count }, (_, i) => ({
    id: `${type}-${Date.now()}-${i}`,
    x: (Math.random() * 60) - 30,
    y: type === 'heart' ? -10 : (Math.random() * 60) - 30,
    size: type === 'heart' ? 3 + Math.random() * 2 : 1 + Math.random() * 2,
    duration: 1 + Math.random() * 1.5,
    type,
    opacity: 0.7 + Math.random() * 0.3
  }));
  
  setParticles(prev => [...prev, ...newParticles]);
  
  // Clear particles after animation
  setTimeout(() => {
    setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
  }, 3000);
};

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
 // Enhanced happy expression with more dynamic eye animation
'happy': {
  leftEye: {
    path: 'M-30,-6 Q-16,-28 1,-6',   // More pronounced curve
    blinkPath: 'M-30,-8 L0,-8',
    animationParams: {
      glowIntensity: {
        values: '1;0.85;1',
        duration: '2s'
      }
    }
  },
  rightEye: {
    path: 'M0,-6 Q16,-28 31,-8',    // Matching curve
    blinkPath: 'M0,-8 L30,-8',
    animationParams: {
      glowIntensity: {
        values: '1;0.85;1',
        duration: '2s'
      }
    }
  },
  mouth: 'M-35,20 Q0,45 35,20',       // Taller, more expansive smile curve  color: '#86dfff',
  emotional_metadata: {
    energy_level: 0.8,
    cognitive_state: 'joyful_resonance',
    tension: 0.05,
    happiness_depth: 0.7
  }
},
  'excited': {
    leftEye: {
      path: 'M-30,-5 C-22,-25 -12,-35 0,-5',
      blinkPath: 'M-30,-5 L0,-5'
    },
    rightEye: {
      path: 'M0,-5 C12,-35 22,-25 30,-5',
      blinkPath: 'M0,-5 L30,-5'
    },
    mouth: 'M-40,20 Q0,55 40,20',
    color: '#86dfff',
    emotional_metadata: {
      energy_level: 0.9,
      cognitive_state: 'joyful_burst',
      tension: 0.3,
      excitement_intensity: 0.8,
      cute_factor: 0.9
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
    leftEye: {
      path: 'M-12,-8 C-18,-14 -24,-14 -24,-8 C-24,-4 -18,0 -12,4 C-6,0 0,-4 0,-8 C0,-14 -6,-14 -12,-8',
      blinkPath: 'M-24,-8 L0,-8'
    },
    rightEye: {
      path: 'M12,-8 C6,-14 0,-14 0,-8 C0,-4 6,0 12,4 C18,0 24,-4 24,-8 C24,-14 18,-14 12,-8',
      blinkPath: 'M0,-8 L24,-8'
    },
    mouth: 'M-30,20 Q0,45 30,20',
    color: '#ff69b4',
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

// Add animation variants with Framer Motion syntax
const faceVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1
  }
};

const eyeVariants = {
  normal: { scaleY: 1 },
  blink: { scaleY: 0.1 }
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


// In your render function where the eyes are drawn
{currentEmotion === 'happy' && (
  <motion.circle
    cx={0}
    cy={0}
    r={3}
    fill="white"
    opacity={0.8}
    animate={{
      opacity: [0.8, 1, 0.8],
      scale: [1, 1.2, 1]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
)}

// Create the SVG component using motion if available, otherwise fallback to standard SVG
const SVGComponent = motion ? motion.svg : 'svg';
const PathComponent = motion ? motion.path : 'path';
const CircleComponent = motion ? motion.circle : 'circle';

return (
  <SVGComponent 
    className="minimalist-face w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-50 -50 100 100"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    style={!motion ? {
      opacity: 1,
      transform: 'scale(1)',
      transition: 'opacity 0.5s ease, transform 0.5s ease'
    } : undefined}
  >
    {/* Add dynamic animations and effects */}
    <style>
      {`
        /* Scanline animations */
        @keyframes scanlineMove {
          0% { transform: translateY(-45px); opacity: 0.15; }
          50% { transform: translateY(0px); opacity: 0.4; }
          100% { transform: translateY(45px); opacity: 0.15; }
        }
        
        @keyframes scanlineFlicker {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
          65% { opacity: 0.1; }
          85% { opacity: 0.4; }
        }
        
        .scan-line-animation {
          animation: scanlineMove 4s linear infinite, scanlineFlicker 0.8s ease-in-out infinite;
        }
        
        /* Micro-animations */
        @keyframes eyeShine {
          0%, 100% { opacity: 0.6; transform: translate(0, 0); }
          50% { opacity: 0.9; transform: translate(0.5px, -0.5px); }
        }
        
        @keyframes subtlePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        /* Particle animations */
        @keyframes particleFloat {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          100% { 
            transform: translate(
              calc(var(--x-offset) * 15px), 
              calc(var(--y-offset) * -20px)
            ); 
            opacity: 0;
          }
        }
        
        @keyframes heartFloat {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          15% { transform: translate(0, -5px) scale(1); opacity: 1; }
          100% { transform: translate(0, -40px) scale(0.5); opacity: 0; }
        }
        
        /* Mouth gentle pulsing animation */
        .mouth {
          transform-origin: center;
          animation: subtlePulse 3s ease-in-out infinite;
        }
      `}
    </style>
    
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

      {/* Enhanced eye glow gradient */}
      <radialGradient id="eyeGlow">
        {getGradientColors(currentExpression)}
      </radialGradient>
      
      {/* Pupil gradient for depth */}
      <radialGradient id="pupilGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
        <stop offset="0%" stopColor={currentEmotion === 'glitched' ? '#ff69b4' : '#00ffff'} />
        <stop offset="70%" stopColor={currentEmotion === 'glitched' ? '#ff00ff' : '#00ccff'} />
        <stop offset="100%" stopColor={currentEmotion === 'glitched' ? '#cc00cc' : '#0099cc'} />
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
      
      {/* CRT Screen effect */}
      <filter id="crtNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.05 0" />
      </filter>

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
      
      {/* Clipping path for left eye to fix teardrops */}
      <clipPath id="leftEyeClip">
        <path
          d={typeof currentExpression.leftEye === 'string' ? 
             currentExpression.leftEye : 
             currentExpression.leftEye.path}
        />
      </clipPath>
      
      {/* Clipping path for right eye to fix teardrops */}
      <clipPath id="rightEyeClip">
        <path
          d={typeof currentExpression.rightEye === 'string' ? 
             currentExpression.rightEye : 
             currentExpression.rightEye.path}
        />
      </clipPath>
    </defs>

    {/* CRT screen effect overlay */}
    <rect 
      x="-50" 
      y="-50" 
      width="100" 
      height="100" 
      fill="url(#screen-fade)" 
      filter="url(#crtNoise)" 
      style={{ mixBlendMode: 'overlay' }}
      opacity="0.15"
    />
    
    {/* Background with screen fade */}
    <CircleComponent
      cx="0"
      cy="0"
      r="45"
      fill="url(#screen-fade)"
      className="opacity-60"
      animate={motion ? { scale: [1, 1.02, 1] } : undefined}
      style={!motion ? { animation: 'subtlePulse 3s ease-in-out infinite' } : undefined}
    />

    {/* Main face group */}
    <g
      filter={currentExpression.isGlitched ? "url(#color-split)" : "url(#crt-glow)"}
      className="retro-screen"
      style={{
        animation: currentExpression.isGlitched ? 'glitch 0.5s infinite' : 'none'
      }}
    >
      {/* Left Eye Group with pupil dilation */}
      <g transform={`translate(${-25 + eyePosition.x}, ${-10 + eyePosition.y})`}>
        {/* Main eye path */}
        <PathComponent
          d={typeof currentExpression.leftEye === 'string' ? 
             currentExpression.leftEye : 
             isBlinking ? currentExpression.leftEye.blinkPath : currentExpression.leftEye.path}
          fill="url(#eyeGlow)"
          filter="url(#cuteGlow)"
          className={isBlinking ? 'blink-animation' : ''}
          animate={motion && isBlinking ? { scaleY: [1, 0.1, 1] } : undefined}
          style={!motion && isBlinking ? {
            transform: 'scaleY(0.1)',
            transition: 'transform 0.1s ease'
          } : {
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), d 0.4s ease'
          }}
        />
        
        {/* Clipped group for pupil and shine to fix teardrop effect */}
        <g clipPath="url(#leftEyeClip)">
          {/* Pupil with dilation effect - only visible when not blinking */}
          {!isBlinking && !currentExpression.isHeartEyes && (
            <CircleComponent
              cx="0"
              cy="0"
              r={4 * pupilSize}
              fill="url(#pupilGradient)"
              animate={motion ? { r: 4 * pupilSize } : undefined}
              style={{
                transition: 'r 0.3s ease-out',
                filter: 'drop-shadow(0 0 1px rgba(0, 255, 255, 0.5))'
              }}
            />
          )}
          
          {/* Eye shine micro-animation */}
          {!isBlinking && (
            <circle
              cx={3 + microAnimationPhase % 2}
              cy={-2 - (microAnimationPhase > 1 ? 1 : 0)}
              r="2"
              fill="white"
              opacity="0.7"
              style={{ animation: 'eyeShine 3s ease-in-out infinite' }}
            />
          )}
        </g>
      </g>

      {/* Right Eye Group with same enhancements */}
      <g transform={`translate(${25 + eyePosition.x}, ${-10 + eyePosition.y})`}>
        <PathComponent
          d={typeof currentExpression.rightEye === 'string' ? 
             currentExpression.rightEye : 
             isBlinking ? currentExpression.rightEye.blinkPath : currentExpression.rightEye.path}
          fill="url(#eyeGlow)"
          filter="url(#cuteGlow)"
          className={isBlinking ? 'blink-animation' : ''}
          animate={motion && isBlinking ? { scaleY: [1, 0.1, 1] } : undefined}
          style={!motion && isBlinking ? {
            transform: 'scaleY(0.1)',
            transition: 'transform 0.1s ease'
          } : {
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), d 0.4s ease'
          }}
        />
        
        {/* Clipped group for pupil and shine to fix teardrop effect */}
        <g clipPath="url(#rightEyeClip)">
          {/* Pupil with dilation */}
          {!isBlinking && !currentExpression.isHeartEyes && (
            <CircleComponent
              cx="0"
              cy="0"
              r={4 * pupilSize}
              fill="url(#pupilGradient)"
              animate={motion ? { r: 4 * pupilSize } : undefined}
              style={{
                transition: 'r 0.3s ease-out',
                filter: 'drop-shadow(0 0 1px rgba(0, 255, 255, 0.5))'
              }}
            />
          )}
          
          {/* Eye shine micro-animation */}
          {!isBlinking && (
            <circle
              cx={3 + microAnimationPhase % 2}
              cy={-2 - (microAnimationPhase > 1 ? 1 : 0)}
              r="2"
              fill="white"
              opacity="0.7"
              style={{ animation: 'eyeShine 3s ease-in-out infinite' }}
            />
          )}
        </g>
      </g>

      {/* Enhanced Mouth with smoother transitions */}
      <PathComponent
        d={currentExpression.mouth}
        fill={currentExpression.color || "#86dfff"}
        className="mouth"
        animate={motion ? { d: currentExpression.mouth } : undefined}
        style={{
          transition: 'd 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: 'drop-shadow(0 0 2px rgba(134, 223, 255, 0.5))'
        }}
      />
    </g>

    {/* Particle Effects System */}
    <g className="particles">
      {particles.map(particle =>
        particle.type === 'heart' ? (
          <path
            key={particle.id}
            d="M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0"
            transform={`translate(${particle.x}, ${particle.y}) scale(${particle.size / 8})`}
            fill="#ff69b4"
            opacity={particle.opacity}
            style={{
              animation: `heartFloat ${particle.duration}s ease-out forwards`
            }}
          />
        ) : (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={currentEmotion === 'glitched' ? '#ff69b4' : '#86dfff'}
            opacity={particle.opacity}
            style={{
              animation: `particleFloat ${particle.duration}s ease-out forwards`,
              '--x-offset': Math.random() > 0.5 ? '1' : '-1',
              '--y-offset': Math.random() > 0.7 ? '0.5' : '1'
            }}
          />
        )
      )}
    </g>

    {/* Enhanced scanline group */}
    <g className="scanlines">
      {/* Primary animated scanline */}
      <line
        x1="-50"
        x2="50"
        y1="0"
        y2="0"
        stroke="#86dfff"
        strokeWidth=".5"
        strokeOpacity="0.3"
        className="scan-line-animation"
      />
      
      {/* Secondary scanline (slower, offset) */}
      <line
        x1="-50"
        x2="50"
        y1="0"
        y2="0"
        stroke="#86dfff"
        strokeWidth=".3"
        strokeOpacity="0.15"
        style={{
          animation: 'scanlineMove 6s linear infinite reverse, scanlineFlicker 1.2s ease-in-out infinite',
          animationDelay: '2s'
        }}
      />
      
      {/* Static scanline pattern for CRT effect */}
      <g opacity="0.05">
        {[...Array(10)].map((_, i) => (
          <line
            key={i}
            x1="-50"
            x2="50"
            y1={-40 + (i * 8)}
            y2={-40 + (i * 8)}
            stroke="#86dfff"
            strokeWidth=".2"
          />
        ))}
      </g>
    </g>
  </SVGComponent>
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

  // Create component variables based on availability of Framer Motion
  const Container = motion ? motion.div : 'div';
  const AnimatedDiv = motion ? motion.div : 'div';

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
  }, [displayRandomMessage]);
   
  //################## SECTION 9: Interface Render ##################
  return (
    <Container 
      className="cyber-container flex flex-col relative"
      initial={motion ? { opacity: 0, y: 20 } : undefined}
      animate={motion ? { opacity: 1, y: 0 } : undefined}
      style={!motion ? {
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      } : undefined}
    >
      <AnimatedDiv 
        className="neural-status-panel"
        initial={motion ? { opacity: 0 } : undefined}
        animate={motion ? { opacity: 1 } : undefined}
        style={!motion ? {
          opacity: 1,
          transition: 'opacity 0.3s ease'
        } : undefined}
      >
        <div>Mission AI v2.3</div>
        <div>PrimerOS 0.9.5</div>
      </AnimatedDiv>
  
      <div className="cyber-header">
        <AnimatedDiv 
          className="cyber-line"
          initial={motion ? { scaleX: 0 } : undefined}
          animate={motion ? { scaleX: 1 } : undefined}
          style={!motion ? {
            transform: 'scaleX(1)',
            transition: 'transform 0.5s ease'
          } : undefined}
        ></AnimatedDiv>
        <div className="header-content flex justify-between items-center">
          <AnimatedDiv 
            className="status-indicator"
      
          >
            <span 
      className="dot"
      style={{
        animation: 'pulse 1.5s infinite ease-in-out'
      }}
              ></span>
            NEURAL_LINK: {status}
          </AnimatedDiv>
          {!isMobile && <div className="time-display">{time}_UTC</div>}
        </div>
      </div>
  
      <AnimatedDiv 
        className="robot-companion-container flex flex-col items-center mt-4 relative"
        initial={motion ? { y: 20, opacity: 0 } : undefined}
        animate={motion ? { y: 0, opacity: 1 } : undefined}
        style={!motion ? {
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        } : undefined}
      >
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
      </AnimatedDiv>
       
      <div 
        className="scan-line"
        style={{
          animation: 'scanlineMove 4s linear infinite, scanlineFlicker 0.8s ease-in-out infinite'
        }}
      ></div>
    </Container>
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