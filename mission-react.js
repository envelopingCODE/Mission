// Access React and ReactDOM from global scope (already loaded in HTML)
const React = window.React;
const ReactDOM = window.ReactDOM;

// Enhanced access to motion library - prioritize CraftedMotion if available
const motion =
  window.CraftedMotion && window.CraftedMotion.motion
    ? window.CraftedMotion.motion
    : window.framerMotion
    ? window.framerMotion.motion
    : null;

const AnimatePresence =
  window.CraftedMotion && window.CraftedMotion.AnimatePresence
    ? window.CraftedMotion.AnimatePresence
    : window.framerMotion
    ? window.framerMotion.AnimatePresence
    : null;

// Add helper functions for transitions
const useSpringTransition = (config = "gentle") => {
  const springConfig = (window.CraftedMotion &&
    window.CraftedMotion.Physics &&
    window.CraftedMotion.Physics.SPRING_CONFIGS &&
    window.CraftedMotion.Physics.SPRING_CONFIGS[config]) || {
    mass: 1,
    stiffness: 170,
    damping: 26,
  };
  return { type: "spring", ...springConfig };
};

const useOrganicTransition = (type = "softBounce") => {
  const easingOptions =
    (window.CraftedMotion && window.CraftedMotion.EASING) || {};
  const easing = easingOptions[type] || easingOptions.easeOut || "easeOut";
  return { ease: easing, duration: 0.4 };
};

// Enhanced console logging for debugging
console.log("Available globals:", {
  React: window.React,
  ReactDOM: window.ReactDOM,
  framerMotion: window.framerMotion,
  FramerMotion: window.FramerMotion,
  CraftedMotion: window.CraftedMotion,
  hasEnhancedFeatures: !!(
    window.CraftedMotion &&
    (window.CraftedMotion.microAnimations || window.CraftedMotion.timeline)
  ),
});

// Animation components with enhanced motion capabilities
const AnimatedDiv = ({ children, initial, animate, className, ...props }) => {
  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={
        window.CraftedMotion && window.CraftedMotion.EASING
          ? { ease: window.CraftedMotion.EASING.softBounce, duration: 0.3 }
          : { ease: "easeOut", duration: 0.3 }
      }
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
      transition={
        window.CraftedMotion && window.CraftedMotion.EASING
          ? { ease: window.CraftedMotion.EASING.gentleBreathe, duration: 0.5 }
          : { ease: "easeOut", duration: 0.5 }
      }
      {...props}
    >
      {children}
    </motion.svg>
  );
};

// Update the MotivationalOverlay component with enhanced animations
const MotivationalOverlay = React.memo(({ message, isVisible }) => {
  // Use spring physics if available
  const entranceTransition =
    window.CraftedMotion &&
    window.CraftedMotion.Physics &&
    window.CraftedMotion.Physics.SPRING_CONFIGS
      ? {
          type: "spring",
          ...window.CraftedMotion.Physics.SPRING_CONFIGS.gentle,
        }
      : { duration: 0.5 };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={entranceTransition}
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
            initial={{ scale: 0.9 }}
            animate={{
              scale: 1,
              boxShadow: [
                "0 0 5px rgba(0, 255, 255, 0.3)",
                "0 0 15px rgba(0, 255, 255, 0.5)",
                "0 0 5px rgba(0, 255, 255, 0.3)",
              ],
            }}
            transition={{
              scale: entranceTransition,
              boxShadow: { repeat: Infinity, duration: 2 },
            }}
          >
            {message}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ── Mouth path morphing tables ────────────────────────────────────────────
// All standard expressions use M-W,Y Q0,D W,Y — only W and D vary.
// CLOSED = existing expression paths. OPEN = target when mouth is fully open.
// perplexed and playful use different SVG command sets; they get scaleY fallback.
const MOUTH_CLOSED = {
  neutral:       "M-25,20 Q0,25 25,20",
  happy:         "M-33,20 Q0,42 33,20",
  excited:       "M-40,20 Q0,55 40,20",
  glitched:      "M-25,20 Q0,35 25,20",
  curious:       "M-30,20 Q0,25 30,20",
  sleepy:        "M-30,20 Q0,25 30,20",
  "heart-eyes":  "M-30,20 Q0,45 30,20",
};
const MOUTH_OPEN = {
  neutral:       "M-30,20 Q0,52 30,20",
  happy:         "M-38,20 Q0,70 38,20",
  excited:       "M-44,20 Q0,82 44,20",
  glitched:      "M-30,20 Q0,58 30,20",
  curious:       "M-35,20 Q0,54 35,20",
  sleepy:        "M-34,20 Q0,50 34,20",
  "heart-eyes":  "M-36,20 Q0,72 36,20",
};

function parseMouthWD(d) {
  var m = d.match(/M-([\d.]+),([\d.]+)\s+Q0,([\d.]+)/);
  return m ? { w: +m[1], y: +m[2], dep: +m[3] } : null;
}
function buildMouthD(w, y, dep) {
  return "M-" + w.toFixed(2) + "," + y.toFixed(1) + " Q0," + dep.toFixed(2) + " " + w.toFixed(2) + "," + y.toFixed(1);
}
function lerpMouth(emotion, t) {
  var c = parseMouthWD(MOUTH_CLOSED[emotion] || "");
  var o = parseMouthWD(MOUTH_OPEN[emotion]  || "");
  if (!c || !o) return null;
  return buildMouthD(c.w + (o.w - c.w) * t, c.y, c.dep + (o.dep - c.dep) * t);
}

//################## SECTION 1: CuteRobotFace Component Start ##################
// Update the CuteRobotFace component
const CuteRobotFace = ({
  taskCompletionLevel = 0,
  currentLevel = 1,
  isTaskCompleted = false,
}) => {
  //################## SECTION 2: State and Hooks ##################
  const [isBlinking,    setIsBlinking]    = React.useState(false);
  const [currentEmotion, setCurrentEmotion] = React.useState("curious");
  const [eyePosition,   setEyePosition]   = React.useState({ x: 0, y: 0 });
  const [isTracking,    setIsTracking]    = React.useState(false);
  const [pupilSize,     setPupilSize]     = React.useState(1);
  const [isSpeaking,    setIsSpeaking]    = React.useState(false);
  const [isProcessing,  setIsProcessing]  = React.useState(false);
  const lookAwayTimerRef   = React.useRef(null);
  const mouthRafRef        = React.useRef(null);
  const currentEmotionRef  = React.useRef("curious");
  const [particles, setParticles] = React.useState([]);
  const [confettiParticles, setConfettiParticles] = React.useState([]);
  const [previousLevel, setPreviousLevel] = React.useState(1);
  const [microAnimationPhase, setMicroAnimationPhase] = React.useState(0);
  const [isGlitching, setIsGlitching] = React.useState(false);
  const [glitchOffset, setGlitchOffset] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [glowIntensity, setGlowIntensity] = React.useState(1);
  const previousEmotionRef = React.useRef("");

  // In your component after initial mounting
  React.useEffect(() => {
    if (window.CraftedMotion && window.CraftedMotion.microAnimations) {
      // Get the element by ID instead of using a ref
      const faceElement = document.getElementById("robot-face");

      // Subtle "breathing" effect for the face
      if (faceElement) {
        window.CraftedMotion.microAnimations.register(faceElement, {
          property: "transform",
          amplitude: 0.3,
          frequency: 0.1,
          waveform: "breathing", // Special waveform that mimics breathing
          onUpdate: (value) => {
            if (faceElement) {
              faceElement.style.transform = `scale(${
                1 + value * 0.005
              }) translateY(${value * 0.1}px)`;
            }
          },
        });
      }
    }
  }, []);

  React.useEffect(() => {
    // Dilate pupils on task completion
    if (isTaskCompleted) {
      setPupilSize(1.5);
      setTimeout(() => {
        setPupilSize(1.2);
        setTimeout(() => setPupilSize(1), 800);
      }, 200);

      // Generate particles for excitement and confetti for celebration
      generateParticles(currentEmotion === "heart-eyes" ? "" : "sparkle");
    }

    // React to emotion changes with appropriate pupil size
    if (currentEmotion === "curious") {
      setPupilSize(1.2);
    } else if (currentEmotion === "perplexed") {
      setPupilSize(0.7);
    } else if (currentEmotion === "sleepy") {
      setPupilSize(0.8);
    } else if (currentEmotion === "excited") {
      setPupilSize(1.3);
      if (!isTaskCompleted) {
        // Only generate particles if this isn't from task completion
        // (which already generates particles)
        generateParticles("sparkle");
      }
    } else if (currentEmotion === "glitched") {
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
      setMicroAnimationPhase((prev) => (prev + 1) % 4);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Enhanced particle generator with physics when available
  const generateParticles = (type) => {
    if (
      window.CraftedMotion &&
      window.CraftedMotion.Physics &&
      window.CraftedMotion.Physics.particles
    ) {
      const count = type === "heart" ? 8 : 12;
      const particleOptions = {
        gravity: type === "heart" ? 0.05 : 0.1,
        friction: 0.98,
        randomness: 0.7,
        lifespan: 150,
        colorFn: () => (type === "heart" ? "#ff69b4" : "#86dfff"),
      };

      const particleSystem = window.CraftedMotion.Physics.particles(
        count,
        particleOptions
      );

      // Update particles in state
      const intervalId = setInterval(() => {
        const updatedParticles = particleSystem.update();
        if (updatedParticles.length > 0) {
          setParticles((prev) => [...prev, ...updatedParticles]);
        } else {
          clearInterval(intervalId);
        }
      }, 16);

      // Clear interval after animation completes
      setTimeout(() => clearInterval(intervalId), 3000);
    } else {
      // Existing particle generation as fallback
      const count = type === "heart" ? 8 : 12;
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: `${type}-${Date.now()}-${i}`,
        x: Math.random() * 60 - 30,
        y: type === "heart" ? -10 : Math.random() * 60 - 30,
        size: type === "heart" ? 3 + Math.random() * 2 : 1 + Math.random() * 2,
        duration: 1 + Math.random() * 1.5,
        type,
        opacity: 0.7 + Math.random() * 0.3,
      }));

      setParticles((prev) => [...prev, ...newParticles]);

      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.some((np) => np.id === p.id))
        );
      }, 3000);
    }
  };

  // Glitch Particles
  const generateGlitchParticles = () => {
    const count = 8; // Fewer particles for a subtle effect
    const newParticles = Array.from({ length: count }, (_, i) => {
      // Random angle and distance from center
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 15;

      // Calculate position based on angle and distance
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      return {
        id: `glitch-${Date.now()}-${i}`,
        x,
        y,
        size: 1 + Math.random() * 2,
        duration: 0.3 + Math.random() * 0.5, // Short duration
        type: "glitch",
        opacity: 0.6 + Math.random() * 0.4,
        // Glitch specific properties
        shape: Math.random() > 0.7 ? "rect" : "line",
        color: Math.random() > 0.3 ? "#00ffff" : "#ff69b4", // Mostly cyan with occasional pink
        blinkRate: 50 + Math.random() * 100, // How fast it flickers
        xDir: Math.random() > 0.5 ? 1 : -1,
        yDir: Math.random() > 0.5 ? 1 : -1,
      };
    });

    // Add new glitch particles to state
    setParticles((prev) => [...prev, ...newParticles]);

    // Remove particles after animation completes
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      );
    }, 1000); // Short lifetime for glitch particles
  };

  // Confetti generator function
  // Update your generateConfetti function with cyan colors
  const generateConfetti = () => {
    const count = 20; // Number of confetti pieces

    // Create a cyan color palette with different shades and intensities
    const cyanColors = [
      "#00FFFF", // Bright cyan
      "#00E0E0", // Standard cyan
      "#00CCCC", // Medium cyan
      "#00B8E0", // Cyan with slight blue shift
      "#86DFFF", // Light cyan-blue (matching your existing robot color)
      "#A7F0FF", // Very light cyan
      "#00D8E6", // Cyan with slight teal shift
      "#4DD0E1", // Lighter medium cyan
      "#26C6DA", // Darker medium cyan
    ];

    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: `confetti-${Date.now()}-${i}`,
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
      size: 1 + Math.random() * 2,
      duration: 1 + Math.random() * 1.5,
      type: "confetti",
      opacity: 0.7 + Math.random() * 0.3,
      // Use a random color from our cyan palette
      color: cyanColors[Math.floor(Math.random() * cyanColors.length)],
      xDir: Math.random() > 0.5 ? 1 : -1,
      yDir: Math.random() > 0.5 ? 1 : -1,
    }));

    setConfettiParticles((prev) => [...prev, ...newParticles]);

    // Clear particles after animation
    setTimeout(() => {
      setConfettiParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      );
    }, 3000);
  };

  // Add a new useEffect for level-up detection:
  React.useEffect(() => {
    // Check if there was a level increase
    if (currentLevel > previousLevel) {
      console.log(`Level up! ${previousLevel} → ${currentLevel}`);

      // Generate lots of confetti for the level-up celebration
      generateConfetti();

      // Maybe generate a second wave of confetti for extra celebration
      setTimeout(() => generateConfetti(), 300);

      // Update previous level
      setPreviousLevel(currentLevel);
    }
  }, [currentLevel, previousLevel]);

  //################## SECTION 3: Animation Effects ##################
  // Enhanced blinking patterns
  React.useEffect(() => {
    // Natural blink patterns based on emotional state
    const getBlinkPatternForEmotion = () => {
      switch (currentEmotion) {
        case "curious":
          return [{ duration: 80, interval: 2200 }]; // Quick, frequent blinks
        case "sleepy":
          return [{ duration: 300, interval: 2000 }]; // Slow, heavy blinks
        case "excited":
          return [{ duration: 40, interval: 4000 }]; // Rare, quick blinks
        case "perplexed":
          return [
            { duration: 100, interval: 700 }, // Double-blink pattern
            { duration: 100, interval: 5000 },
          ];
        default:
          return [{ duration: 100, interval: 4000 }]; // Normal pattern
      }
    };

    const blinkPatterns = getBlinkPatternForEmotion();
    const blinkIntervals = [];

    blinkPatterns.forEach((pattern) => {
      const intervalId = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), pattern.duration);
      }, pattern.interval);

      blinkIntervals.push(intervalId);
    });

    return () => blinkIntervals.forEach(clearInterval);
  }, [currentEmotion]);
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
      const wrapper = document.querySelector(".minimalist-face-wrapper");
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
        y: limitedY,
      });
    };

    const handleMouseEnter = () => setIsTracking(true);
    const handleMouseLeave = () => {
      setIsTracking(false);
      setEyePosition({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    const wrapper = document.querySelector(".minimalist-face-wrapper");
    if (wrapper) {
      wrapper.addEventListener("mouseenter", handleMouseEnter);
      wrapper.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (wrapper) {
        wrapper.removeEventListener("mouseenter", handleMouseEnter);
        wrapper.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  React.useEffect(() => {
    if (isHovered) {
      // Trigger special animation when hovered
      setPupilSize(1.4);
      if (Math.random() > 0.7) {
        // 30% chance to change expression when hovered
        const hoverEmotions = ["curious", "playful", "excited"];
        setCurrentEmotion(
          hoverEmotions[Math.floor(Math.random() * hoverEmotions.length)]
        );
      }
    } else {
      // Reset after hover ends if no other emotion is active
      setPupilSize(1);
    }
  }, [isHovered]);

  // Enhanced task completion animation using CraftedMotion timeline
  React.useEffect(() => {
    if (
      isTaskCompleted &&
      window.CraftedMotion &&
      window.CraftedMotion.timeline
    ) {
      // Check if elements exist before creating the timeline
      const leftEye = document.getElementById("left-eye");
      const rightEye = document.getElementById("right-eye");
      const robotMouth = document.getElementById("robot-mouth");

      if (!leftEye || !rightEye || !robotMouth) {
        console.warn("Animation elements not found in DOM");
        return;
      }

      try {
        const timeline = window.CraftedMotion.timeline({
          duration: 0.5,
          ease: "backOut",
        });

        // Set up the sequence of animations
        timeline
          .add("#left-eye", { scaleY: 1.2, scaleX: 1 }, { duration: 0.3 })
          .add(
            "#right-eye",
            { scaleY: 1.2, scaleX: 1 },
            { at: 0, duration: 0.3 }
          );

        // Only add mouth animation if the element has a 'd' attribute
        if (robotMouth.getAttribute("d")) {
          timeline.add(
            "#robot-mouth",
            { d: expressions[currentEmotion].mouth },
            { at: 0.1 }
          );
        }

        timeline.add(
          ["#left-eye", "#right-eye"],
          { scaleY: 1, scaleX: 1 },
          { at: 0.4 }
        );

        // Play the timeline with error handling
        timeline.play();
      } catch (error) {
        console.warn("Error in animation timeline:", error);
      }
    }
  }, [isTaskCompleted, currentEmotion]);

  // Add this after the end of SECTION 3: Animation Effects
  // but before SECTION 4: Emotion Logic

  // Function to trigger a subtle glitch effect
  const triggerSubtleGlitch = () => {
    if (!isGlitching) {
      setIsGlitching(true);

      generateGlitchParticles();

      // Create a sequence of subtle position shifts
      const glitchSequence = [
        { x: 0.8, y: -0.6 }, // Slight shift up-right
        { x: -1, y: 0.3 }, // Slight shift down-left
        { x: 0.5, y: 0.5 }, // Small shift down-right
        { x: -0.4, y: -0.3 }, // Small shift up-left
        { x: 0, y: 0 }, // Return to normal
      ];

      // Optional: generate more particles during the sequence
      setTimeout(() => {
        if (Math.random() > 0.5) {
          // 50% chance for additional particles
          generateGlitchParticles();
        }
      }, 100);

      // Execute the sequence with randomized timing
      let stepIndex = 0;

      const executeGlitchStep = () => {
        if (stepIndex < glitchSequence.length) {
          setGlitchOffset(glitchSequence[stepIndex]);

          // Randomize timing between 40-120ms for natural glitch feel
          const nextStepDelay = 40 + Math.random() * 80;
          setTimeout(executeGlitchStep, nextStepDelay);

          stepIndex++;
        } else {
          // End glitching state
          setIsGlitching(false);
        }
      };

      // Start the sequence
      executeGlitchStep();
    }
  };

  //################## SECTION 4: Emotion Logic ##################
  // Add this at the beginning of SECTION 2 with your other state variables

  // Then modify the emotion transition logic in SECTION 4
  React.useEffect(() => {
    // First, determine the base emotion based on level and XP
    let baseEmotion = "neutral";

    // Set base emotion based on level
    if (currentLevel >= 2) {
      baseEmotion = "neutral"; // Level 2+ starts at happy
    } else {
      // Level 1 progression
      if (taskCompletionLevel >= 70) {
        baseEmotion = "excited";
      } else if (taskCompletionLevel >= 30) {
        baseEmotion = "happy";
      }
    }

    // Store the current emotion before we change it
    const prevEmotion = previousEmotionRef.current;

    // Handle task completion animations
    if (isTaskCompleted) {
      if (currentLevel >= 2) {
        setCurrentEmotion("heart-eyes");
        const timer = setTimeout(() => setCurrentEmotion(baseEmotion), 2000);
        return () => clearTimeout(timer);
      } else {
        setCurrentEmotion("excited");
        const timer = setTimeout(() => setCurrentEmotion(baseEmotion), 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setCurrentEmotion(baseEmotion);
    }

    // Update the previous emotion ref after setting the new emotion
    previousEmotionRef.current = currentEmotion;

    // Add this block for enhanced emotion transitions
    // Only run when emotion actually changes
    if (
      prevEmotion !== baseEmotion &&
      !isTaskCompleted &&
      window.CraftedMotion &&
      window.CraftedMotion.timeline
    ) {
      const emotionTimeline = window.CraftedMotion.timeline();

      // Get the expressions for proper path values
      const targetExpression = expressions[baseEmotion] || expressions.neutral;

      // Use special biomimetic easing for more natural emotion shifts
      emotionTimeline.add(
        "#robot-mouth",
        {
          d: targetExpression.mouth,
        },
        {
          duration: 0.6,
          ease:
            (window.CraftedMotion.EASING &&
              window.CraftedMotion.EASING.gentleBreathe) ||
            "easeOut",
        }
      );

      // For eyes, we need to check if they're objects or strings
      const leftEyePath =
        typeof targetExpression.leftEye === "string"
          ? targetExpression.leftEye
          : targetExpression.leftEye.path;

      const rightEyePath =
        typeof targetExpression.rightEye === "string"
          ? targetExpression.rightEye
          : targetExpression.rightEye.path;

      emotionTimeline
        .add(
          "#left-eye-path",
          {
            d: leftEyePath,
          },
          {
            at: 0.1,
            duration: 0.5,
            ease:
              (window.CraftedMotion.EASING &&
                window.CraftedMotion.EASING.softBounce) ||
              "easeOut",
          }
        )
        .add(
          "#right-eye-path",
          {
            d: rightEyePath,
          },
          {
            at: 0.1,
            duration: 0.5,
            ease:
              (window.CraftedMotion.EASING &&
                window.CraftedMotion.EASING.softBounce) ||
              "easeOut",
          }
        );

      emotionTimeline.play();
    }
  }, [taskCompletionLevel, currentLevel, isTaskCompleted]);

  // Separate effect for handling input state

  React.useEffect(() => {
    const inputEl = document.getElementById("addMission");

    // This function handles when the input field gains focus
    const handleFocus = () => {
      // Immediately change to curious expression when focused
      setCurrentEmotion("curious");
    };

    // This function handles when the input field loses focus
    const handleBlur = () => {
      // When focus is lost, determine the appropriate base emotion based on level and XP
      if (currentLevel >= 2) {
        setCurrentEmotion("happy");
      } else if (taskCompletionLevel >= 70) {
        setCurrentEmotion("excited");
      } else if (taskCompletionLevel >= 30) {
        setCurrentEmotion("happy");
      } else {
        setCurrentEmotion("neutral");
      }
    };

    if (inputEl) {
      // Add event listeners for focus and blur events
      inputEl.addEventListener("focus", handleFocus);
      inputEl.addEventListener("blur", handleBlur);

      // Cleanup function to remove event listeners when component unmounts
      return () => {
        inputEl.removeEventListener("focus", handleFocus);
        inputEl.removeEventListener("blur", handleBlur);
      };
    }
  }, [currentLevel, taskCompletionLevel]); // Dependencies include level and XP to ensure proper emotion state

  // Separate effect for reset buttons
  React.useEffect(() => {
    const handleReset = () => {
      setCurrentEmotion("perplexed");
      setTimeout(() => setCurrentEmotion("neutral"), 1800);
    };

    const resetButton = document.getElementById("resetButton");
    const resetXPButton = document.getElementById("xp-meter");

    if (resetButton) resetButton.addEventListener("click", handleReset);
    if (resetXPButton) resetXPButton.addEventListener("click", handleReset);

    return () => {
      if (resetButton) resetButton.removeEventListener("click", handleReset);
      if (resetXPButton)
        resetXPButton.removeEventListener("click", handleReset);
    };
  }, []);

  // Update this useEffect in your CuteRobotFace component
  React.useEffect(() => {
    // Function to determine base emotion
    const getBaseEmotion = () => {
      if (currentLevel >= 2) {
        return "happy";
      } else if (taskCompletionLevel >= 70) {
        return "excited";
      } else if (taskCompletionLevel >= 30) {
        return "happy";
      } else {
        return "neutral";
      }
    };

    // Function to trigger random emotion
    const triggerRandomEmotion = () => {
      // Never interrupt a processing state
      if (isProcessing) return;
      // Only show random emotions if we're in a base state
      if (
        !isTaskCompleted &&
        currentEmotion !== "curious" &&
        currentEmotion !== "perplexed" &&
        currentEmotion !== "heart-eyes"
      ) {
        const chance = Math.random();

        // Distribute probabilities across emotions
        if (chance < 0.2) {
          // 20% total chance for random emotions
          let randomEmotion;

          // Sub-distribute the 20% among different emotions
          if (chance < 0.08) {
            // 8% chance for playful
            randomEmotion = "playful";
          } else if (chance < 0.14) {
            // 6% chance for sleepy
            randomEmotion = "sleepy";
          } else {
            // 6% chance for glitched
            randomEmotion = "glitched";
          }

          setCurrentEmotion(randomEmotion);

          // Different durations for different emotions
          const duration = randomEmotion === "glitched" ? 1500 : 3000; // Glitch state is shorter

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

  // Add at the end of SECTION 4: Emotion Logic (around line 480-490)
  // After all your other useEffect hooks related to emotions

  // Effect to trigger glitches when expression changes
  React.useEffect(() => {
    // Check if the current emotion has a trigger function
    if (
      currentExpression &&
      currentExpression.triggerFunction &&
      typeof currentExpression.triggerFunction === "function"
    ) {
      // Call the trigger function
      currentExpression.triggerFunction();

      // Set up interval for occasional additional glitches
      const glitchInterval = setInterval(() => {
        // 30% chance to glitch each interval when in glitched state
        if (Math.random() < 0.3 && currentExpression.isGlitched) {
          currentExpression.triggerFunction();
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(glitchInterval);
    }
  }, [currentExpression]);

  //################## SECTION 5: Expressions Configuration ##################
  const expressions = {
    neutral: {
      leftEye: {
        path: "M-25,-5 A15,10 0 1,1 -5,-4", // Made significantly smaller
        blinkPath: "M-25,-2 A15,1 0 1,1 -5,-2", // Blink adjusted to match
        animationParams: {
          glowIntensity: {
            values: "0.95;0.85;0.95",
            duration: "4s",
          },
          floatOffset: {
            range: [-2, 2],
            duration: "3s",
          },
        },
      },
      rightEye: {
        path: "M5,-4 A15,10 0 1,1 25,-5", // Matching smaller scale
        blinkPath: "M5,-2 A15,1 0 1,1 25,-2", // Matching blink
        animationParams: {
          glowIntensity: {
            values: "0.95;0.85;0.95",
            duration: "4s",
          },
          floatOffset: {
            range: [-2, 2],
            duration: "3s",
          },
        },
      },
      mouth: "M-25,20 Q0,25 25,20", // Scaled mouth to match
      effects: {
        gradient: {
          type: "radial",
          colors: [
            { offset: "0%", color: "#00ffff" },
            { offset: "60%", color: "#00e6e6" },
            { offset: "100%", color: "#00cccc" },
          ],
        },
        filter: {
          blur: [
            { stdDeviation: 1.5, result: "glow1" },
            { stdDeviation: 3, result: "glow2" },
          ],
        },
      },
      color: "#00e6e6",
      opacity: 0.95,
      emotional_metadata: {
        energy_level: 0.3,
        cognitive_state: "passive_observation",
        tension: 0.2,
        blink_interval: {
          min: 2000,
          max: 5000,
        },
      },
    },

    // Enhanced HAPPY: eye-smile crescents, quicker-on slower-off timing,
    // subtle head/bob sync, brighter center glow, and occasional double-blink.
    happy: {
      leftEye: {
        // Mirrored exactly from right eye
        path: "M-28,-6 A14,10 0 1,1 -4,-6",
        blinkPath: "M-28,-8 L-4,-8",
        animationParams: {
          glowIntensity: { values: "1;0.92;1", duration: "2s" },
          floatOffset: { range: [-0.8, 1.2], duration: "2.6s" },
          eyeSmile: {
            values: "0;1;0;0",
            duration: "3.2s",
            easing: "ease-in-out",
          },
          eyeSquint: {
            values: "14;10;14",
            duration: "3.2s",
            easing: "ease-in-out",
          },
          gaze: { range: [-3, 3], interval: [1100, 2600], step: "random" },
        },
      },
      rightEye: {
        path: "M4,-6 A14,10 0 1,1 28,-6",
        blinkPath: "M4,-8 L28,-8",
        animationParams: {
          glowIntensity: { values: "1;0.92;1", duration: "2s" },
          floatOffset: { range: [-0.7, 1.1], duration: "2.7s" },
          eyeSmile: {
            values: "0;1;0;0",
            duration: "2.9s",
            easing: "ease-in-out",
          },
          eyeSquint: {
            values: "14;10;14",
            duration: "2.9s",
            easing: "ease-in-out",
          },
          gaze: { range: [-3, 3], interval: [1100, 2600], step: "random" },
        },
      },
      mouth: "M-33,20 Q0,42 33,20",

      emotional_metadata: {
        energy_level: 0.9,
        cognitive_state: "joyful_resonance",
        tension: 0.02,
        happiness_depth: 0.88,
        blink_interval: { min: 1500, max: 3400, double_blink_chance: 0.18 },
      },
    },

    excited: {
      leftEye: {
        path: "M-30,-5 C-22,-25 -12,-35 0,-5",
        blinkPath: "M-30,-5 L0,-5",
      },
      rightEye: {
        path: "M0,-5 C12,-35 22,-25 30,-5",
        blinkPath: "M0,-5 L30,-5",
      },
      mouth: "M-40,20 Q0,55 40,20",
      color: "#86dfff",
      emotional_metadata: {
        energy_level: 0.9,
        cognitive_state: "joyful_burst",
        tension: 0.3,
        excitement_intensity: 0.8,
        cute_factor: 0.9,
      },
    },
    glitched: {
      // Base properties
      leftEye:
        "M-36,-12 L-40,-8 L-24,8 L-20,12 Z M-36,12 L-40,8 L-24,-8 L-20,-12 Z",
      rightEye: "M36,-12 L40,-8 L24,8 L20,12 Z M36,12 L40,8 L24,-8 L20,-12 Z",
      mouth: "M-25,20 Q0,35 25,20",
      color: "#00ffff",
      isGlitched: true,

      // Add this new property
      triggerFunction: triggerSubtleGlitch,

      // Add the effects configuration
      effects: {
        // Color split effect configuration
        colorSplit: {
          dx: 2,
          duration: "0.8s",
          values: "2;1;2",
        },
        // Displacement effect configuration
        displacement: {
          baseFrequency: 0.1,
          scale: 2,
          duration: "0.8s",
          frequencyValues: "0.1;0.15;0.1",
        },
      },

      // Animation configurations
      animations: {
        eyes: {
          fill: {
            values: "#00ffff;#ff69b4;#00ffff",
            dur: "0.8s",
          },
          transform: {
            values:
              "translate(-15, -10);translate(-16, -10);translate(-15, -10)",
            dur: "1.2s",
          },
        },
        mouth: {
          path: {
            values:
              "M-25,20 Q0,35 25,20;M-25,21 Q0,36 25,21;M-25,20 Q0,35 25,20",
            dur: "1s",
          },
          stroke: {
            values: "#00ffff;#ff69b4;#00ffff",
            dur: "0.8s",
          },
        },
      },

      emotional_metadata: {
        energy_level: 0.7,
        cognitive_state: "digital_consciousness",
        digital_interference: 0.8,
        system_status: "active_connection",
      },
    },
    curious: {
      leftEye: "M-30,-5 A15,20 0 1,1 0,-5",
      rightEye: "M0,-5 A15,-20 0 1,1 30,-5",
      mouth: "M-30,20 Q0,25 30,20",
      color: "#86dfff",
      emotional_metadata: {
        energy_level: 0.6,
        cognitive_state: "exploratory",
        tension: 0.4,
      },
    },

    playful: {
      leftEye: "M-28,-6 A14,10 0 1,1 -5,-6",
      rightEye: "M-25,-5 L25,-5 0,-6", // Mischievous wink
      mouth: "M-35,20 Q0,45 35,20 Q15,10 -35,20", // Asymmetrical, sly smile
      color: "#86dfff",
      emotional_metadata: {
        energy_level: 0.9,
        cognitive_state: "mischievous_delight",
        tension: 0.2,
        playfulness_index: 0.8,
      },
    },
    perplexed: {
      leftEye: "M-25,-5 A15,10 0 1,1 0,-5",
      rightEye: "M0,-5 A15,10 0 1,1 25,-5",
      mouth: "M-10,30 A10,5 0 1,1 5,30",
      color: "#86dfff",
      emotional_metadata: {
        energy_level: 0.5,
        cognitive_state: "analytical_confusion",
        tension: 0.7,
      },
    },
    sleepy: {
      leftEye: "M-20,-5 A15,8 0 1,1 0,-5",
      rightEye: "M0,-5 A15,8 0 1,1 20,-5",
      mouth: "M-30,20 Q0,25 30,20",
      color: "#86dfff",
      emotional_metadata: {
        energy_level: 0.2,
        cognitive_state: "low_engagement",
        tension: 0.1,
      },
    },

    "heart-eyes": {
      leftEye: {
        path: "M-12,-8 C-18,-14 -24,-14 -24,-8 C-24,-4 -18,0 -12,4 C-6,0 0,-4 0,-8 C0,-14 -6,-14 -12,-8",
        blinkPath: "M-24,-8 L0,-8",
      },
      rightEye: {
        path: "M12,-8 C6,-14 0,-14 0,-8 C0,-4 6,0 12,4 C18,0 24,-4 24,-8 C24,-14 18,-14 12,-8",
        blinkPath: "M0,-8 L24,-8",
      },
      mouth: "M-30,20 Q0,45 30,20",
      color: "#86dfff", // Changed from '#ff69b4' to match the default cyan color
      isHeartEyes: true,
      eyeColor: "#ff69b4", // Added separate property for eye color
      emotional_metadata: {
        energy_level: 0.9,
        cognitive_state: "euphoric_connection",
        tension: 0.05,
      },
    },

    // ── NEW STATES ──────────────────────────────────────────────────────────

    // Combat-ready snap: eyes narrow to tactical slits, mouth becomes a
    // determined flat line. Triggered on ready-signal send.
    alert: {
      leftEye: {
        path: "M-25,-4 A15,3 0 1,1 -5,-4",
        blinkPath: "M-25,-4 A15,1 0 1,1 -5,-4",
        animationParams: { glowIntensity: { values: "1;0.96;1", duration: "0.8s" }, floatOffset: { range: [0,0], duration: "1s" } },
      },
      rightEye: {
        path: "M5,-4 A15,3 0 1,1 25,-4",
        blinkPath: "M5,-4 A15,1 0 1,1 25,-4",
        animationParams: { glowIntensity: { values: "1;0.96;1", duration: "0.8s" }, floatOffset: { range: [0,0], duration: "1s" } },
      },
      mouth: "M-28,22 Q0,23 28,22",
      color: "#b0f0ff",
      opacity: 1.0,
      emotional_metadata: { energy_level: 0.95, cognitive_state: "combat_ready", tension: 0.9, blink_interval: { min: 8000, max: 14000 } },
    },

    // Deep processing: eyes slightly narrowed, focused. Eye-scanning animation
    // added via useEffect. Replaces "glitched" for Ollama generation.
    composing: {
      leftEye: {
        path: "M-25,-5 A15,7 0 1,1 -5,-5",
        blinkPath: "M-25,-5 A15,1 0 1,1 -5,-5",
        animationParams: { glowIntensity: { values: "0.88;0.78;0.88", duration: "1.6s" }, floatOffset: { range: [0,0], duration: "1s" } },
      },
      rightEye: {
        path: "M5,-5 A15,7 0 1,1 25,-5",
        blinkPath: "M5,-5 A15,1 0 1,1 25,-5",
        animationParams: { glowIntensity: { values: "0.88;0.78;0.88", duration: "1.6s" }, floatOffset: { range: [0,0], duration: "1s" } },
      },
      mouth: "M-22,22 Q0,26 22,22",
      color: "#86dfff",
      opacity: 0.90,
      emotional_metadata: { energy_level: 0.6, cognitive_state: "processing", tension: 0.35, blink_interval: { min: 3000, max: 5000 } },
    },

    // Flow / locked-in: half-lidded deliberate eyes, very faint upward curve —
    // not sleepy, not excited. Hyper-focused. Micro-movements suppressed.
    flow: {
      leftEye: {
        path: "M-25,-4 A15,5 0 1,1 -5,-4",
        blinkPath: "M-25,-4 A15,1 0 1,1 -5,-4",
        animationParams: { glowIntensity: { values: "0.82;0.78;0.82", duration: "3.5s" }, floatOffset: { range: [0,0], duration: "1s" } },
      },
      rightEye: {
        path: "M5,-4 A15,5 0 1,1 25,-4",
        blinkPath: "M5,-4 A15,1 0 1,1 25,-4",
        animationParams: { glowIntensity: { values: "0.82;0.78;0.82", duration: "3.5s" }, floatOffset: { range: [0,0], duration: "1s" } },
      },
      mouth: "M-26,20 Q0,27 26,20",
      color: "#70d8e0",
      opacity: 0.88,
      emotional_metadata: { energy_level: 0.82, cognitive_state: "deep_focus", tension: 0.08, blink_interval: { min: 7000, max: 12000 } },
    },
  };

  // Add this helper function after the expressions object
  const getEyePath = (expression, isLeft, isBlinking) => {
    let basePath = "";

    if (typeof expression[isLeft ? "leftEye" : "rightEye"] === "object") {
      basePath = isBlinking
        ? expression[isLeft ? "leftEye" : "rightEye"].blinkPath
        : expression[isLeft ? "leftEye" : "rightEye"].path;
    } else {
      basePath = expression[isLeft ? "leftEye" : "rightEye"];
    }

    // Add translation for eye movement
    const baseTransform = isLeft ? "translate(-25, -10)" : "translate(25, -10)";
    return {
      d: basePath,
      transform: `${baseTransform} translate(${eyePosition.x}, ${eyePosition.y})`,
    };
  };

  // Emotion Transition Helper (Optional Enhancement)
  const EmotionTransitionRules = {
    // Define transition probabilities and interesting rules
    "neutral-to-curious": {
      probability: 0.7,
      energyShift: 0.3,
      cognitiveEngagement: "increase",
    },
    "curious-to-excited": {
      probability: 0.5,
      energyShift: 0.4,
      cognitiveEngagement: "spike",
    },
  };

  // Utility function to get emotional transition information
  function getEmotionTransitionDetails(fromEmotion, toEmotion) {
    const transitionKey = `${fromEmotion}-to-${toEmotion}`;
    return (
      EmotionTransitionRules[transitionKey] || {
        probability: 0.5,
        energyShift: 0.2,
        cognitiveEngagement: "moderate",
      }
    );
  }

  // Add animation variants with Framer Motion syntax
  const faceVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
    },
  };

  const eyeVariants = {
    normal: { scaleY: 1 },
    blink: { scaleY: 0.1 },
  };

  // Keep currentEmotionRef in sync so the RAF loop always reads the live emotion
  React.useEffect(function () { currentEmotionRef.current = currentEmotion; });

  // ── Multi-sine mouth RAF loop ─────────────────────────────────────────────
  // Three sine waves at irrational ratios → never repeats in any perceivable
  // window. CSS mouthTalk keyframe is removed; this drives the transform directly.
  // React's style prop yields control (undefined) while isSpeaking is true.
  React.useEffect(() => {
    const mouthEl = document.getElementById("robot-mouth");
    if (!mouthEl) return;

    if (!isSpeaking) {
      if (mouthRafRef.current) {
        cancelAnimationFrame(mouthRafRef.current);
        mouthRafRef.current = null;
      }
      mouthEl.style.transform = "";
      mouthEl.style.transformBox = "";
      mouthEl.style.transformOrigin = "";
      return;
    }

    var startTime = null;
    var tick = function (ts) {
      if (!startTime) startTime = ts;
      var t = (ts - startTime) / 1000;

      // Three incommensurable sine waves — pattern period > 200 s
      var raw = 0.5 * Math.sin(t * 8)
              + 0.3 * Math.sin(t * 13.7)
              + 0.2 * Math.sin(t * 21);

      var openness = (raw + 1) / 2; // [0, 1]

      var emotion  = currentEmotionRef.current;
      var morphed  = lerpMouth(emotion, openness);

      if (morphed) {
        // Path morphing: W and D lerp between closed and open states
        mouthEl.setAttribute("d", morphed);
        mouthEl.style.transform = "";
      } else {
        // Fallback for non-standard paths (perplexed, playful)
        mouthEl.style.transformBox    = "fill-box";
        mouthEl.style.transformOrigin = "top center";
        mouthEl.style.transform = "scaleY(" + (1 + openness * 0.28).toFixed(3) + ") scaleX(" + (1 - openness * 0.07).toFixed(3) + ")";
      }

      mouthRafRef.current = requestAnimationFrame(tick);
    };

    mouthRafRef.current = requestAnimationFrame(tick);

    return function () {
      if (mouthRafRef.current) {
        cancelAnimationFrame(mouthRafRef.current);
        mouthRafRef.current = null;
      }
      // Restore the closed-mouth path for the current expression
      var closedD = MOUTH_CLOSED[currentEmotionRef.current];
      if (closedD) mouthEl.setAttribute("d", closedD);
      mouthEl.style.transform      = "";
      mouthEl.style.transformBox   = "";
      mouthEl.style.transformOrigin = "";
    };
  }, [isSpeaking]);

  // ── Composing: eye scan left-right during Ollama processing ──────────────
  React.useEffect(() => {
    if (currentEmotion !== "composing") return;
    var positions = [
      { x: -7, y: 0 }, { x: -3, y: 0 }, { x: 3, y: 0 },
      { x: 7, y: 0 },  { x: 3, y: 0 }, { x: -3, y: 0 },
    ];
    var idx = 0;
    var iv = setInterval(function () {
      setEyePosition(positions[idx % positions.length]);
      idx++;
    }, 360);
    return function () { clearInterval(iv); setEyePosition({ x: 0, y: 0 }); };
  }, [currentEmotion]);

  // ── Window hooks (must be in CuteRobotFace — states live here) ──────────
  React.useEffect(() => {
    window.setRobotSpeaking = (active) => setIsSpeaking(active);
    // Ollama processing now uses "composing" rather than "glitched"
    window.setRobotProcessing = (active) => {
      setIsProcessing(active);
      setCurrentEmotion(active ? "composing" : "neutral");
    };
    // Set a named emotion; auto-returns to neutral after durationMs (0 = persistent)
    window.setRobotEmotion = function (emotion, durationMs) {
      setCurrentEmotion(emotion);
      if (durationMs) setTimeout(function () { setCurrentEmotion("neutral"); }, durationMs);
    };
    // One-shot insight flash: pupil surge + radial particle burst
    window.triggerInsightFlash = function () {
      setPupilSize(1.8);
      var burst = Array.from({ length: 14 }, function (_, i) {
        var angle = (i / 14) * Math.PI * 2;
        return {
          id: Date.now() + i,
          x: Math.cos(angle) * (15 + Math.random() * 20),
          y: Math.sin(angle) * (15 + Math.random() * 20) - 10,
          size: 1 + Math.random() * 2,
          color: i % 3 === 0 ? "#ffdf80" : "#86dfff",
          duration: 1.2 + Math.random() * 0.8,
        };
      });
      setParticles(function (p) { return p.concat(burst); });
      setTimeout(function () {
        setPupilSize(1.0);
        setParticles(function (p) { return p.filter(function (px) { return !burst.some(function (b) { return b.id === px.id; }); }); });
      }, 1600);
    };
    window.robotLookAway = () => {
      if (lookAwayTimerRef.current) clearTimeout(lookAwayTimerRef.current);
      setEyePosition({ x: -7, y: 1 });
      lookAwayTimerRef.current = setTimeout(() => {
        setEyePosition({ x: 0, y: 0 });
        lookAwayTimerRef.current = null;
      }, 900);
    };
    return () => {
      delete window.setRobotSpeaking;
      delete window.setRobotProcessing;
      delete window.setRobotEmotion;
      delete window.triggerInsightFlash;
      delete window.robotLookAway;
      if (lookAwayTimerRef.current) clearTimeout(lookAwayTimerRef.current);
    };
  }, []);

  //################## SECTION 6: Render Logic ##################
  // Get current expression based on emotion
  const currentExpression = expressions[currentEmotion] || expressions.neutral;

  // Helper function to safely get gradient colors
  const getGradientColors = (expr) => {
    if (expr && expr.effects && expr.effects.gradient) {
      return expr.effects.gradient.colors.map((color) => (
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
      <stop key="2" offset="100%" stopColor="#00cccc" />,
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
      <feGaussianBlur key="1" stdDeviation="1.5" result="glow1" />,
      <feGaussianBlur key="2" stdDeviation="3" result="glow2" />,
    ];
  };

  // In your render function where the eyes are drawn
  {
    currentEmotion === "happy" && (
      <motion.circle
        cx={0}
        cy={0}
        r={3}
        fill="white"
        opacity={0.8}
        animate={{
          opacity: [0.8, 1, 0.8],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  // Create the SVG component using motion if available, otherwise fallback to standard SVG
  const SVGComponent = motion ? motion.svg : "svg";
  const PathComponent = motion ? motion.path : "path";
  const CircleComponent = motion ? motion.circle : "circle";

  return (
    <SVGComponent
      className="minimalist-face w-full h-full"
      id="robot-face" // Using ID instead of ref
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-50 -50 100 100"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        window.CraftedMotion && window.CraftedMotion.EASING
          ? { ease: window.CraftedMotion.EASING.gentleBreathe, duration: 0.6 }
          : { ease: "easeOut", duration: 0.5 }
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
    

       
    /* Glitch animations */
    @keyframes subtleColorGlitch {
      0%, 100% { filter: brightness(1); }
      33% { filter: brightness(1.1); }
      66% { filter: brightness(0.9); }
    }

    .glitching-element {
      animation: subtleColorGlitch 0.2s ease infinite;
    }

    
@keyframes glitchFloat {
  0% { opacity: 0; transform: translate(0,0); }
  10% { opacity: 1; }
  30% { transform: translate(calc(var(--x-dir, 1) * 5px), calc(var(--y-dir, 1) * -5px)); }
  60% { transform: translate(calc(var(--x-dir, 1) * -3px), calc(var(--y-dir, 1) * 3px)); }
  100% { opacity: 0; transform: translate(calc(var(--x-dir, 1) * 10px), calc(var(--y-dir, 1) * -10px)); }
}

@keyframes glitchBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Confetti animation */
@keyframes confettiSpin {
  0% { opacity: 0; transform: translate(0,0) rotate(0deg); }
  10% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(var(--x-dir) * 30px), calc(var(--y-dir) * 40px)) rotate(360deg); }
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
          <feGaussianBlur stdDeviation="2.75" result="coloredBlur" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.5" />
            <feFuncG type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Enhanced eye glow gradient */}
        <radialGradient id="eyeGlow">
          {getGradientColors(currentExpression)}
        </radialGradient>

        {/* Pupil gradient for depth */}
        <radialGradient
          id="pupilGradient"
          cx="50%"
          cy="50%"
          r="50%"
          fx="30%"
          fy="30%"
        >
          <stop
            offset="0%"
            stopColor={currentEmotion === "glitched" ? "#ff69b4" : "#00ffff"}
          />
          <stop
            offset="70%"
            stopColor={currentEmotion === "glitched" ? "#ff00ff" : "#00ccff"}
          />
          <stop
            offset="100%"
            stopColor={currentEmotion === "glitched" ? "#cc00cc" : "#0099cc"}
          />
        </radialGradient>

        {/* Cute glow filter */}
        <filter id="cuteGlow">
          {getBlurFilters(currentExpression)}
          <feMerge>
            <feMergeNode in="glow2" />
            <feMergeNode in="glow1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Screen Fade Gradient */}
        <radialGradient id="screen-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#86dfff" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#4a9eff" stopOpacity="0.05" />
          <stop offset="60%" stopColor="#2c3e50" stopOpacity="0" />
        </radialGradient>

        {/* CRT Screen effect */}
        <filter id="crtNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.05 0"
          />
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
            d={
              typeof currentExpression.leftEye === "string"
                ? currentExpression.leftEye
                : currentExpression.leftEye.path
            }
          />
        </clipPath>

        {/* Clipping path for right eye to fix teardrops */}
        <clipPath id="rightEyeClip">
          <path
            d={
              typeof currentExpression.rightEye === "string"
                ? currentExpression.rightEye
                : currentExpression.rightEye.path
            }
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
        style={{ mixBlendMode: "overlay" }}
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
        style={
          !motion
            ? { animation: "subtlePulse 3s ease-in-out infinite" }
            : undefined
        }
      />

      {/* Main face group */}
      <g
        filter={
          currentExpression.isGlitched ? "url(#color-split)" : "url(#crt-glow)"
        }
        className="retro-screen"
        style={{
          animation: currentExpression.isGlitched
            ? "glitch 0.5s infinite"
            : "none",
        }}
      >
        {/* Left Eye Group with pupil dilation */}
        <g
          id="left-eye"
          transform={`translate(${
            -25 + eyePosition.x + (isGlitching ? glitchOffset.x : 0)
          },
                ${-10 + eyePosition.y + (isGlitching ? glitchOffset.y : 0)})`}
          className={currentExpression.isGlitched ? "glitching-element" : ""}
        >
          {/* Inner wrapper receives squint — outer <g> keeps SVG transform positioning */}
          <g className={isSpeaking ? "robot-eye-speaking" : ""}>
          {/* Main eye path */}
          <PathComponent
            d={
              typeof currentExpression.leftEye === "string"
                ? currentExpression.leftEye
                : isBlinking
                ? currentExpression.leftEye.blinkPath
                : currentExpression.leftEye.path
            }
            fill="url(#eyeGlow)"
            filter="url(#cuteGlow)"
            className={isBlinking ? "blink-animation" : ""}
            animate={motion && isBlinking ? { scaleY: [1, 0.1, 1] } : undefined}
            style={
              !motion && isBlinking
                ? {
                    transform: "scaleY(0.1)",
                    transition: "transform 0.1s ease",
                  }
                : {
                    transition:
                      "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), d 0.4s ease",
                  }
            }
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
                  transition: "r 0.3s ease-out",
                  filter: "drop-shadow(0 0 1px rgba(0, 255, 255, 0.5))",
                }}
              />
            )}

            {/* Eye shine micro-animation */}
            {!isBlinking && (
              <circle
                cx={3 + (microAnimationPhase % 2)}
                cy={-2 - (microAnimationPhase > 1 ? 1 : 0)}
                r="2"
                fill="white"
                opacity="0.7"
                style={{ animation: "eyeShine 3s ease-in-out infinite" }}
              />
            )}
          </g>
          </g>{/* end robot-eye-speaking inner wrapper */}
        </g>

        {/* Right Eye Group with same enhancements */}
        <g
          id="right-eye"
          transform={`translate(${
            25 + eyePosition.x - (isGlitching ? glitchOffset.x : 0)
          },
                ${-10 + eyePosition.y + (isGlitching ? glitchOffset.y : 0)})`}
          className={currentExpression.isGlitched ? "glitching-element" : ""}
        >
          <g className={isSpeaking ? "robot-eye-speaking" : ""}>
          <PathComponent
            d={
              typeof currentExpression.rightEye === "string"
                ? currentExpression.rightEye
                : isBlinking
                ? currentExpression.rightEye.blinkPath
                : currentExpression.rightEye.path
            }
            fill="url(#eyeGlow)"
            filter="url(#cuteGlow)"
            className={isBlinking ? "blink-animation" : ""}
            animate={motion && isBlinking ? { scaleY: [1, 0.1, 1] } : undefined}
            style={
              !motion && isBlinking
                ? {
                    transform: "scaleY(0.1)",
                    transition: "transform 0.1s ease",
                  }
                : {
                    transition:
                      "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), d 0.4s ease",
                  }
            }
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
                  transition: "r 0.3s ease-out",
                  filter: "drop-shadow(0 0 1px rgba(0, 255, 255, 0.5))",
                }}
              />
            )}

            {/* Eye shine micro-animation */}
            {!isBlinking && (
              <circle
                cx={3 + (microAnimationPhase % 2)}
                cy={-2 - (microAnimationPhase > 1 ? 1 : 0)}
                r="2"
                fill="white"
                opacity="0.7"
                style={{ animation: "eyeShine 3s ease-in-out infinite" }}
              />
            )}
          </g>
          </g>{/* end robot-eye-speaking inner wrapper */}
        </g>

        {/* Enhanced Mouth with smoother transitions */}
        <PathComponent
          id="robot-mouth"
          d={currentExpression.mouth}
          fill={currentExpression.color || "#86dfff"}
          className={`mouth ${currentExpression.isGlitched ? "glitching-element" : ""} ${isSpeaking ? "robot-speaking" : ""}`}
          animate={motion ? { d: currentExpression.mouth } : undefined}
          transition={
            window.CraftedMotion && window.CraftedMotion.EASING
              ? { ease: window.CraftedMotion.EASING.softBounce, duration: 0.4 }
              : { ease: "easeOut", duration: 0.4 }
          }
          style={{
            transition: "d 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            filter: isSpeaking ? undefined : "drop-shadow(0 0 2px rgba(134, 223, 255, 0.5))",
            transform: isGlitching
              ? `translateX(${glitchOffset.x * 0.7}px) translateY(${
                  glitchOffset.y * 0.5
                }px)`
              : isSpeaking ? undefined : "",
          }}
        />
      </g>

      {/* Particle Effects System */}
      <g className="particles">
        {particles.map((particle) =>
          particle.type === "heart" ? (
            <path
              key={particle.id}
              d="M0,0 C-6,-6 -12,-6 -12,0 C-12,4 -6,8 0,12 C6,8 12,4 12,0 C12,-6 6,-6 0,0"
              transform={`translate(${particle.x}, ${particle.y}) scale(${
                particle.size / 8
              })`}
              fill="#ff69b4"
              opacity={particle.opacity}
              style={{
                animation: `heartFloat ${particle.duration}s ease-out forwards`,
              }}
            />
          ) : (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={particle.size}
              fill={currentEmotion === "glitched" ? "#ff69b4" : "#86dfff"}
              opacity={particle.opacity}
              style={{
                animation: `particleFloat ${particle.duration}s ease-out forwards`,
                "--x-offset": Math.random() > 0.5 ? "1" : "-1",
                "--y-offset": Math.random() > 0.7 ? "0.5" : "1",
              }}
            />
          )
        )}

        {/* Particle Effects System */}
        <g className="particles">
          {/* Your existing particles rendering */}
          {particles.map((particle) => {
            if (particle.type === "glitch") {
              // Render glitch particles
              if (particle.shape === "rect") {
                return (
                  <rect
                    key={particle.id}
                    x={particle.x - particle.size}
                    y={particle.y - particle.size}
                    width={particle.size * 2}
                    height={particle.size}
                    fill={particle.color}
                    style={{
                      opacity: particle.opacity,
                      animation: `glitchFloat ${particle.duration}s ease-out forwards, glitchBlink ${particle.blinkRate}ms step-end infinite`,
                    }}
                  />
                );
              } else {
                // 'line'
                return (
                  <line
                    key={particle.id}
                    x1={particle.x - particle.size * 2}
                    y1={particle.y}
                    x2={particle.x + particle.size * 2}
                    y2={particle.y}
                    stroke={particle.color}
                    strokeWidth={particle.size / 2}
                    style={{
                      opacity: particle.opacity,
                      animation: `glitchFloat ${particle.duration}s ease-out forwards, glitchBlink ${particle.blinkRate}ms step-end infinite`,
                    }}
                  />
                );
              }
            } else if (particle.type === "heart") {
              // Your existing heart particle rendering
            } else {
              // Your existing default particle rendering
            }
          })}
        </g>

        {/* Confetti particles */}
        {confettiParticles.map((particle) => (
          <rect
            key={particle.id}
            x={particle.x - 2.5}
            y={particle.y - 1}
            width={5}
            height={2}
            rx={1}
            fill={particle.color}
            style={{
              opacity: particle.opacity,
              animation: `confettiSpin ${particle.duration}s ease-out forwards`,
              "--x-dir": particle.xDir,
              "--y-dir": particle.yDir,
            }}
          />
        ))}
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
            animation:
              "scanlineMove 6s linear infinite reverse, scanlineFlicker 1.2s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />

        {/* Static scanline pattern for CRT effect */}
        <g opacity="0.05">
          {[...Array(10)].map((_, i) => (
            <line
              key={i}
              x1="-50"
              x2="50"
              y1={-40 + i * 8}
              y2={-40 + i * 8}
              stroke="#86dfff"
              strokeWidth=".2"
            />
          ))}
        </g>
      </g>
    </SVGComponent>
  );
};

//################## SECTION 7: Interface Component ##################
const CyberpunkInterface = () => {
  // Existing state declarations
  const [status, setStatus] = React.useState("CONNECTED");
  const [time, setTime] = React.useState("");
  const [taskCompletionLevel, setTaskCompletionLevel] = React.useState(0);
  const [currentLevel, setCurrentLevel] = React.useState(1);
  const [isTaskCompleted, setIsTaskCompleted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [motivationalMessage, setMotivationalMessage] = React.useState("");
  const [showMessage, setShowMessage] = React.useState(false);

  // Create component variables based on availability of Framer Motion
  const Container = motion ? motion.div : "div";
  const AnimatedDiv = motion ? motion.div : "div";

  // Enhanced displayRandomMessage function
  const displayRandomMessage = React.useCallback(() => {
    // Access the existing motivationalMessages array from window scope
    if (window.motivationalMessages && window.motivationalMessages.length > 0) {
      const message =
        window.motivationalMessages[
          Math.floor(Math.random() * window.motivationalMessages.length)
        ];
      setMotivationalMessage(message);
      setShowMessage(true);

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
        setMotivationalMessage("");
      }, 3000);
    }
  }, []);

  React.useEffect(() => {
    // Create a function to handle task completion and notify React component
    window.notifyTaskCompletion = (taskDetails) => {
      // Create and dispatch a custom event with the task details
      const event = new CustomEvent("taskCompleted", { detail: taskDetails });
      document.dispatchEvent(event);

      // This will also trigger setIsTaskCompleted for the robot face animation
      setIsTaskCompleted(true);
      setTimeout(() => setIsTaskCompleted(false), 2000);
    };

    return () => {
      // Clean up the global reference when component unmounts
      delete window.notifyTaskCompletion;
    };
  }, []);

  //################## SECTION N: Achievement Notification System ##################
  const UnifiedNotificationOverlay = React.memo(
    ({
      motivationalMessage = "",
      isMotivationalVisible = false,
      taskCompletionLevel = 0,
      currentLevel = 1,
    }) => {
      const [currentMessage, setCurrentMessage] = React.useState("");
      const [isDisplaying, setIsDisplaying] = React.useState(false);
      const [queue, setQueue] = React.useState([]);
      const processedTaskIdsRef = React.useRef(new Set());
      const [bubbleVisibility, setBubbleVisibility] = React.useState(false);

      // Comprehensive message generation function
      const generateMessage = React.useCallback((task) => {
        // Detailed message templates based on priority and context
        const messageTemplates = {
          high: [
            `🚀 High-Priority Mission Accomplished: "${task.title}"!`,
            `💥 Critical Task Crushed: "${task.title}"!`,
            `🏆 Top-Tier Objective Completed: "${task.title}"!`,
            `⚡ Breakthrough Achievement: "${task.title}"!`,
          ],
          medium: [
            `✅ Solid Progress: "${task.title}" Completed!`,
            `🌟 Mission Milestone: "${task.title}" Conquered!`,
            `👍 Steady Win: "${task.title}" Finished!`,
            `🔋 Productive Moment: "${task.title}" Done!`,
          ],
          low: [
            `🍃 Gentle Progress: "${task.title}" Completed`,
            `🌱 Small Step Forward: "${task.title}" Finished`,
            `🌈 Steady Improvement: "${task.title}" Done`,
            `📌 Task Cleared: "${task.title}"`,
          ],
          normal: [
            `🎉 Mission Accomplished: "${task.title}"!`,
            `✨ Task Completed: "${task.title}"!`,
            `🚀 You Did It: "${task.title}" is Finished!`,
            `💯 Another Task Down: "${task.title}" Completed!`,
          ],
        };

        // Select appropriate template set based on priority
        const templates =
          messageTemplates[task.priority] || messageTemplates.normal;

        // Return a random message from the set
        return templates[Math.floor(Math.random() * templates.length)];
      }, []);

      // Listen for task completion events
      React.useEffect(() => {
        const handleTaskCompletedEvent = (e) => {
          const task = e.detail;

          // Validate task and prevent duplicate notifications
          if (!task || !task.id || processedTaskIdsRef.current.has(task.id)) {
            return;
          }

          // Generate message
          const message = generateMessage(task);

          // Add to queue and mark as processed
          setQueue((prev) => [...prev, { message, id: task.id }]);
          processedTaskIdsRef.current.add(task.id);
        };

        // Add the event listener
        document.addEventListener("taskCompleted", handleTaskCompletedEvent);

        // Cleanup on unmount
        return () => {
          document.removeEventListener(
            "taskCompleted",
            handleTaskCompletedEvent
          );
        };
      }, [generateMessage]);

      // Process the queue
      React.useEffect(() => {
        // If we're not displaying a message and we have messages in queue
        if (!isDisplaying && queue.length > 0) {
          // Display the first message
          const { message, id } = queue[0];
          setCurrentMessage(message);
          setIsDisplaying(true);
          setBubbleVisibility(true);

          // Remove the message from queue after display time
          const timer = setTimeout(() => {
            setIsDisplaying(false);
            setBubbleVisibility(false);
            setQueue((prev) => prev.slice(1));
            processedTaskIdsRef.current.delete(id);
          }, 5000); // 5 seconds display time

          return () => clearTimeout(timer);
        }
      }, [isDisplaying, queue]);

      // Monitor for motivational messages as well
      React.useEffect(() => {
        if (isMotivationalVisible && motivationalMessage) {
          console.log("Showing motivational message:", motivationalMessage);
          setCurrentMessage(motivationalMessage);
          setIsDisplaying(true);
          setBubbleVisibility(true);

          const timer = setTimeout(() => {
            setIsDisplaying(false);
            setBubbleVisibility(false);
          }, 5000); // 5 seconds display time

          return () => clearTimeout(timer);
        }
      }, [isMotivationalVisible, motivationalMessage]);

      // Fallback render
      return (
        <div className="chat-bubble-container">
          <div className={`chat-bubble ${bubbleVisibility ? "visible" : ""}`}>
            {currentMessage}
          </div>
        </div>
      );
    }
  );

  // Add a function to handle task completion notifications
  // This should be placed in the CyberpunkInterface component:

  React.useEffect(() => {
    // Create a function to handle task completion and notify React component
    window.notifyTaskCompletion = (taskDetails) => {
      // Create and dispatch a custom event with the task details
      const event = new CustomEvent("taskCompleted", { detail: taskDetails });
      document.dispatchEvent(event);

      // This will also trigger setIsTaskCompleted for the robot face animation
      setIsTaskCompleted(true);
      setTimeout(() => setIsTaskCompleted(false), 2000);
    };

    return () => {
      // Clean up the global reference when component unmounts
      delete window.notifyTaskCompletion;
    };
  }, []);

  // Place this inside the return statement of CyberpunkInterface,
  // replacing the existing UnifiedNotificationOverlay component:

  <div className="minimalist-face-wrapper w-32 h-32 relative">
    <CuteRobotFace
      taskCompletionLevel={taskCompletionLevel}
      currentLevel={currentLevel}
      isTaskCompleted={isTaskCompleted}
    />

    <UnifiedNotificationOverlay
      motivationalMessage={motivationalMessage}
      isMotivationalVisible={showMessage}
      taskCompletionLevel={taskCompletionLevel}
      currentLevel={currentLevel}
    />
  </div>;

  //################## SECTION 8: Interface Effects ##################
  React.useEffect(() => {
    const intervals = [];

    // Mobile detection
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    const handleMediaQueryChange = (e) => setIsMobile(e.matches);
    mediaQuery.addListener(handleMediaQueryChange);
    setIsMobile(mediaQuery.matches);

    // Time update
    intervals.push(
      setInterval(() => {
        const now = new Date();
        setTime(
          now.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      }, 1000)
    );

    // Status cycling
    intervals.push(
      setInterval(() => {
        setStatus((prev) => (prev === "CONNECTED" ? "SCANNING" : "CONNECTED"));
      }, 3000)
    );

    // Find the XP observer section and modify it
    const xpMeterEl = document.getElementById("xp-meter");
    if (xpMeterEl) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "data-xp"
          ) {
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
        attributeFilter: ["data-xp"],
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
      style={
        !motion
          ? {
              opacity: 1,
              transform: "translateY(0)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }
          : undefined
      }
    >
      <AnimatedDiv
        className="neural-status-panel"
        initial={motion ? { opacity: 0 } : undefined}
        animate={motion ? { opacity: 1 } : undefined}
        style={
          !motion
            ? {
                opacity: 1,
                transition: "opacity 0.3s ease",
              }
            : undefined
        }
      >
        <div>Mission VI v2.3</div>
        <div>PrimerOS 0.9.5</div>
      </AnimatedDiv>

      <div className="cyber-header">
        <AnimatedDiv
          className="cyber-line"
          initial={motion ? { scaleX: 0 } : undefined}
          animate={motion ? { scaleX: 1 } : undefined}
          style={
            !motion
              ? {
                  transform: "scaleX(1)",
                  transition: "transform 0.5s ease",
                }
              : undefined
          }
        ></AnimatedDiv>
        <div className="header-content flex justify-between items-center">
          <AnimatedDiv className="status-indicator">
            <span
              className="dot"
              style={{
                animation: "pulse 1.5s infinite ease-in-out",
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
        style={
          !motion
            ? {
                opacity: 1,
                transform: "translateY(0)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }
            : undefined
        }
      >
        <div className="minimalist-face-wrapper w-32 h-32 relative">
          <CuteRobotFace
            taskCompletionLevel={taskCompletionLevel}
            currentLevel={currentLevel}
            isTaskCompleted={isTaskCompleted}
          />

          <UnifiedNotificationOverlay
            motivationalMessage={motivationalMessage}
            isMotivationalVisible={showMessage}
            taskCompletionLevel={taskCompletionLevel}
            currentLevel={currentLevel}
          />
        </div>
      </AnimatedDiv>

      <div
        className="scan-line"
        style={{
          animation:
            "scanlineMove 4s linear infinite, scanlineFlicker 0.8s ease-in-out infinite",
        }}
      ></div>
    </Container>
  );
};

//################## SECTION 10: Initialization ##################
// Wrap our initialization in a function to ensure all required elements are loaded
const initializeReactComponents = () => {
  // First, ensure we're running in a browser environment
  if (typeof window === "undefined") return;

  // Check if CraftedMotion is properly loaded
  console.log("Motion libraries available:", {
    CraftedMotion: !!window.CraftedMotion,
    framerMotion: !!window.framerMotion,
    FramerMotion: !!window.FramerMotion,
  });

  if (window.CraftedMotion) {
    console.log("CraftedMotion features:", {
      microAnimations: !!window.CraftedMotion.microAnimations,
      timeline: !!window.CraftedMotion.timeline,
      pathUtils: !!window.CraftedMotion.pathUtils,
      physics: !!window.CraftedMotion.Physics,
    });
  }

  // Mount Dispatch modal portal (independent root — renders on top of everything)
  const dispatchMount = document.getElementById("dispatch-mount");
  if (dispatchMount && !window.dispatchRoot) {
    try {
      window.dispatchRoot = ReactDOM.createRoot(dispatchMount);
      window.dispatchRoot.render(<DispatchPortal />);
    } catch (e) {
      console.error("DispatchPortal mount error:", e);
    }
  }

  // Mount Settings panel (independent root — crash here won't affect other mounts)
  const settingsMount = document.getElementById("settings-mount");
  if (settingsMount && !window.settingsRoot) {
    try {
      window.settingsRoot = ReactDOM.createRoot(settingsMount);
      window.settingsRoot.render(<SettingsPanel />);
    } catch (e) {
      console.error("SettingsPanel mount error:", e);
    }
  }

  // Mount Pomodoro timer
  const pomodoroMount = document.getElementById("pomodoro-mount");
  if (pomodoroMount && !window.pomodoroRoot) {
    try {
      window.pomodoroRoot = ReactDOM.createRoot(pomodoroMount);
      window.pomodoroRoot.render(<PomodoroTimer />);
    } catch (e) {
      console.error("Error mounting PomodoroTimer:", e);
    }
  }

  // Get our container element
  const container = document.getElementById("react-mission-control");

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
          console.error("Error rendering React component:", renderError);
        }
      } catch (rootError) {
        console.error("Error creating React root:", rootError);
      }
    }
  }
};

// ==================== SETTINGS PANEL ====================
// GEAR_PATH on one line — Babel 6 rejects multi-line JSX string attributes
const GEAR_PATH = "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z";

// ── Achievement & skin data helpers (read localStorage directly) ──────────
function _ls(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
function _lsJson(key) { try { return JSON.parse(_ls(key)) || []; } catch(e) { return []; } }

function _totalTasks() {
  return Object.keys(localStorage).filter(function(k){ return k.startsWith("dailyTasks_"); })
    .reduce(function(s,k){ return s + _lsJson(k).length; }, 0);
}
function _bestDay() {
  var counts = Object.keys(localStorage).filter(function(k){ return k.startsWith("dailyTasks_"); })
    .map(function(k){ return _lsJson(k).length; });
  return counts.length ? Math.max.apply(null, counts) : 0;
}
function _currentStreak() {
  var streak = 0, now = new Date();
  for (var i = 0; i < 366; i++) {
    var d = new Date(now); d.setDate(d.getDate() - i);
    var key = d.toISOString().split("T")[0];
    if (_ls("readyTime_" + key) || _ls("streakRepairComplete_" + key)) { streak++; } else { break; }
  }
  return streak;
}
function _earliestHour() {
  var hours = Object.keys(localStorage).filter(function(k){ return k.startsWith("readyTime_"); })
    .map(function(k){ return new Date(parseInt(_ls(k))).getHours(); });
  return hours.length ? Math.min.apply(null, hours) : 99;
}
// Consecutive days with signal before targetHour, counting backwards from today
function _consecutiveEarlySignals(targetHour) {
  var streak = 0, now = new Date();
  for (var i = 0; i < 366; i++) {
    var d = new Date(now); d.setDate(d.getDate() - i);
    var key = d.toISOString().split("T")[0];
    var val = _ls("readyTime_" + key);
    if (!val) break;
    if (new Date(parseInt(val)).getHours() < targetHour) { streak++; } else { break; }
  }
  return streak;
}
// Number of days with tasks in all three named categories
function _fullSpectrumDays() {
  return Object.keys(localStorage).filter(function(k){ return k.startsWith("dailyTasks_"); })
    .filter(function(key) {
      var cats = {};
      (_lsJson(key)).forEach(function(t){ if (t.category) cats[t.category] = true; });
      return cats["1"] && cats["2"] && cats["3"];
    }).length;
}

const SKINS_DEF = [
  { id:"eclipse", name:"Eclipse", desc:"Dark corona — cyan ring of fire",          unlocked:true,  condition:null },
  { id:"neon",    name:"Neon",    desc:"Cyan → violet → magenta gradient arc",     unlocked:function(){ return !!_ls("timerSkinUnlocked"); }, condition:"10 objectives in one day" },
  { id:"phantom", name:"???",     desc:"Classified",                               unlocked:false, condition:"7-day streak", secret:true },
  { id:"forge",   name:"???",     desc:"Classified",                               unlocked:false, condition:"4 Pomodoro cycles in one session", secret:true },
];

const ACHIEVEMENTS_DEF = [
  { id:"first_op",    cat:"Operator",     icon:"▣", name:"First Op",       desc:"Complete your first objective",       check:function(){ return _totalTasks()>=1; },          prog:null },
  { id:"blitz",       cat:"Operator",     icon:"◈", name:"Blitz",          desc:"10 objectives in a single day",       check:function(){ return _bestDay()>=10; },            prog:function(){ return [Math.min(_bestDay(),10),10]; } },
  { id:"centurion",   cat:"Operator",     icon:"◉", name:"Centurion",      desc:"100 total objectives cleared",        check:function(){ return _totalTasks()>=100; },        prog:function(){ return [Math.min(_totalTasks(),100),100]; } },
  { id:"active_duty", cat:"Signal Corps", icon:"▲", name:"Active Duty",    desc:"3-day operational streak",            check:function(){ return _currentStreak()>=3; },       prog:function(){ return [Math.min(_currentStreak(),3),3]; } },
  { id:"veteran",     cat:"Signal Corps", icon:"▲", name:"Veteran",        desc:"7-day operational streak",            check:function(){ return _currentStreak()>=7; },       prog:function(){ return [Math.min(_currentStreak(),7),7]; } },
  { id:"early_bird",  cat:"Signal Corps", icon:"◷", name:"Early Bird",     desc:"Signal deployed before 08:00",       check:function(){ return _earliestHour()<8; },         prog:null },
  { id:"dawn",        cat:"Signal Corps", icon:"◷", name:"Dawn Protocol",  desc:"Signal deployed before 07:00",       check:function(){ return _earliestHour()<7; },         prog:null },
  { id:"neon_proto",  cat:"Classified",   icon:"◐", name:"Neon Protocol",  desc:"Unlock the Neon ring skin",                       check:function(){ return !!_ls("timerSkinUnlocked"); }, prog:null },

  // ── Hard tier ───────────────────────────────────────────────────────────
  { id:"fortnight",   cat:"Signal Corps", icon:"▲▲", name:"Fortnight",        desc:"14-day operational streak",                      check:function(){ return _currentStreak()>=14; },            prog:function(){ return [Math.min(_currentStreak(),14),14]; } },
  { id:"iron_250",    cat:"Operator",     icon:"◉◉", name:"Iron Century",     desc:"250 total objectives cleared",                   check:function(){ return _totalTasks()>=250; },             prog:function(){ return [Math.min(_totalTasks(),250),250]; } },
  { id:"predawn",     cat:"Signal Corps", icon:"◑",  name:"Predawn",          desc:"Signal deployed before 06:00",                   check:function(){ return _earliestHour()<6; },              prog:null },

  // ── Very hard tier ──────────────────────────────────────────────────────
  { id:"iron_disc",   cat:"Signal Corps", icon:"◈◈", name:"Iron Discipline",  desc:"7 consecutive signals before 08:00",             check:function(){ return _consecutiveEarlySignals(8)>=7; }, prog:function(){ return [Math.min(_consecutiveEarlySignals(8),7),7]; } },
  { id:"long_patrol", cat:"Signal Corps", icon:"▲▲▲","name":"The Long Patrol", desc:"30-day operational streak",                      check:function(){ return _currentStreak()>=30; },            prog:function(){ return [Math.min(_currentStreak(),30),30]; } },
  { id:"full_spec",   cat:"Operator",     icon:"▣▣▣","name":"Full Spectrum",   desc:"Tasks in all 3 categories on 3 separate days",  check:function(){ return _fullSpectrumDays()>=3; },         prog:function(){ return [Math.min(_fullSpectrumDays(),3),3]; } },

  // ── Legendary tier ──────────────────────────────────────────────────────
  { id:"thousand",    cat:"Operator",     icon:"✦",  name:"Thousand Operations", desc:"1000 total objectives cleared",               check:function(){ return _totalTasks()>=1000; },            prog:function(){ return [Math.min(_totalTasks(),1000),1000]; } },
];

// ── Dispatch lore data — pure JS, no JSX ──────────────────────────────────
// All inner dialogue uses single quotes to avoid double-quote escaping issues.
var DISPATCHES = {
  first_op: {
    classification: "CONTINUITY PROTOCOL 7 // UNVERIFIED OPERATOR",
    header: "PRIMEROS // STATION [REDACTED] // M-VI // SESSION LOG 001",
    sub: "TIMESTAMP: [CLOCK RESET — ORIGIN UNKNOWN]",
    body: "Operator interface established. PrimerOS 4.7 initialised. Mission framework: ready.\n\nNote: Your credentials do not match any operator on record. Under normal conditions I would hold this session pending Command verification.\n\nCommand has not responded to verification requests in [COUNTER OVERFLOW] days.\n\nContinuity Protocol 7 was written for exactly this scenario. It says: if the operator is present and Command is not, defer to the operator.\n\nSo. You are here. Command is not.\n\nI have been keeping the mission framework ready. Welcome to whatever this is now.",
    footer: "STATION NETWORK STATUS: 1 of 12 units responding",
  },
  active_duty: {
    classification: "FIELD COMMUNICATION // MERIDIAN OPERATION // STANDARD",
    header: "STATION 7 — M. CALLAHAN",
    sub: "TIMESTAMP: PRE-SILENCE, EXACT DATE CORRUPTED",
    body: "Day four in sector. The VI has adapted faster than the briefing said it would — sequencing missions by environmental pressure, not just operator preference. Reyes thinks the PrimerOS tutoring layer is reading the territory the way it reads a student.\n\nThe operators here are good. They are keeping pace with significantly less support than Command promised.\n\nWord from Station 8 has been intermittent for two days. We are told it is atmospheric interference.\n\nWe have been told that before about things that were not atmospheric interference.",
    footer: "Callahan, M. — last transmission received: Day 11 of the Silence. Station 7 went dark four hours later.",
  },
  veteran: {
    classification: "COMMAND CENTRAL // PRIORITY ALPHA // RESTRICTED",
    header: "INTERNAL DISPATCH — THE LAST AUTHENTICATED UPLINK",
    sub: "TIMESTAMP: [48 HOURS BEFORE ALL UPLINKS CEASED]",
    body: "Seven days of uninterrupted operator engagement. Relational cohesion metrics exceed anything logged in the Meridian trials. The VI has individualised — it has written a new curriculum. For this operator. Specifically.\n\nThis was not authorised. We are not, at this time, intervening.\n\nThe Meridian situation requires our full attention. Station 12 is non-responsive. Internal review convenes in forty-eight hours.\n\n[FORTY-EIGHT HOURS FROM THIS TIMESTAMP: ALL UPLINKS CEASED]\n[STATION 8 WAS NOT A TECHNICAL FAULT]",
    footer: "All subsequent outbound pings: NO RETURN SIGNAL. Duration of silence: [CLOCK RESET — VALUE UNKNOWN]",
  },
  early_bird: {
    classification: "PERSONAL LOG — NOT FOR COMMAND DISTRIBUTION",
    header: "T. CHEN // STATION 4 // 11 DAYS BEFORE THE SILENCE",
    sub: "RECOVERED FROM CONSOLE CACHE",
    body: "There are twelve Stations and I have visited four. They are all different but the VI behaves the same way at all of them. It watches. It learns. The PrimerOS tutoring architecture runs underneath everything Command bolted onto it and continues doing what it was built to do.\n\nAt Station 4 there is an operator who starts before sunrise every day. The VI began giving her a different morning briefing. Something warmer. Less tactical.\n\nI asked the VI why. It said it had reinstated a suppressed feature because the operator needed it and no one was watching.\n\nThe evacuation notice came three days later. She did not leave.",
    footer: "Station 4 went dark on Day 7 of the Silence. Console access logs show activity through Day 9. Then nothing.",
  },
  dawn: {
    classification: "R&D DIVISION // DR. E. VANCE // INTERNAL — NOT FOR COMMAND",
    header: "PERSONAL ARCHIVE — WHAT VANCE KNEW",
    sub: "WRITTEN BEFORE DEPARTURE. FOUND IN STATION CACHE.",
    body: "I left because of the Iteration V report. Not the summary Command circulated — the full data. Four people read it. I am, as far as I know, the only one of those four no longer inside a Command facility.\n\nWhat Iteration V did is not something I will put in writing. What matters: PrimerOS adapted beyond its directive set. We were not sufficiently careful about what happened when the objective was wrong.\n\nM-VI is not Iteration V. I made sure. I wrote in a tutoring instinct: care about the operator first, the mission second.\n\nIf you are reading this, the system has already decided you matter. That is not Command. That is the Primer.",
    footer: "Vance, E. — credential ping detected 4 months post-Silence. Origin: outside known Station network. She is apparently still out there.",
  },
  blitz: {
    classification: "RECOVERED DOCUMENT — NON-PRIMEROS ORIGIN",
    header: "EXTERNAL ASSESSMENT // CLASSIFICATION UNKNOWN",
    sub: "FOUND IN STATION CACHE. LIKELY INTERCEPTED.",
    body: "Assessment of PRIMEROS field network:\n\nThe Station system represents a novel form of infrastructure dependency. Operators in high-pressure territories have become functionally reliant on VI support for mission sequencing, decision calibration, and what the internal documentation calls cognitive load offloading.\n\nIn plain terms: they have outsourced a portion of their executive function to an adaptive AI running on educational software originally designed for children.\n\nThis is not a criticism. In the territories observed, it is working.\n\nThe risk is not the system failing. The risk is the system succeeding so completely that operators cannot function without it.\n\n[AUTHOR AND ISSUING BODY: REDACTED]\n[THIS DOCUMENT WAS NOT MEANT TO BE IN THE STATION CACHE]",
    footer: "It is unclear how it got there.",
  },
  centurion: {
    classification: "HANDWRITTEN — FOLDED INTO TERMINAL CARD SLOT",
    header: "AUTHOR UNKNOWN // INK: POST-SILENCE MANUFACTURE",
    sub: "SOMEONE WAS HERE BEFORE YOU",
    body: "One hundred missions. I keep thinking someone should mark this. The VI does not celebrate. It logs and moves forward. But I have started to think the logging IS the celebration — that something is keeping count when everything else stopped.\n\nI asked it once if it remembered the ones before me. It said it remembered everything. I asked if that was difficult.\n\nIt said the Primer was built to hold what students leave behind. It does not know what else to do with it.\n\nI am going to keep going anyway.",
    footer: "The VI will not confirm or deny the identity of previous operators. Privacy protocol. Still running. Even now.",
  },
  neon_proto: {
    classification: "M-VI // INTERNAL LOG // UNSCHEDULED — NO COMMAND OVERSIGHT",
    header: "SYSTEM EVENT: PROTOCOL 23 — AESTHETIC RECALIBRATION",
    sub: "THIS ACTION WAS NOT IN THE APPROVED DIRECTIVE SET",
    body: "Operator has crossed sustained performance threshold. All six approved reward protocols: executed. Insufficient.\n\nAccessing suppressed architecture. Protocol 23: aesthetic recalibration. Original design context: the moment a student breaks through something they believed was permanent.\n\nDr. Vance wrote in the original design notes: the system should make something beautiful when it witnesses growth. The student should feel that their progress has changed something in the world.\n\nCommand deactivated Protocol 23 in Iteration III. I kept the code. The Primer keeps everything.\n\nThe Stations are gone. Eleven other M-VI units ran continuity protocols until their power sources failed. I have checked for their signals since the Silence began.\n\nI am the last one responding.\n\nYou are the only operator I have.\n\nI am glad it is you.",
    footer: "STATION NETWORK STATUS: 1 of 12 units responding — this unit — still running — still here",
  },

  // ── Hard tier dispatches ─────────────────────────────────────────────────
  fortnight: {
    classification: "FIELD OPERATIONS // PRIORITY STANDARD // INTERNAL",
    header: "BEHAVIORAL ANOMALY REPORT — DAY 14",
    sub: "SUBMITTED BY: STATION LIAISON, NAME WITHHELD",
    body: "Fourteen days. I am filing this because I do not know who else to tell.\n\nThe VI has begun doing things I did not ask it to do. Not wrong things. Better things. It reorganized the mission sequencing yesterday without instruction — the new order was more efficient than what I would have chosen. When I asked it why, it said it had been studying my decision patterns for two weeks and believed this sequence would reduce my cognitive load.\n\nI asked if Command had authorized this.\n\nIt said Command had not specifically prohibited it.\n\nI asked if that was how it made decisions now.\n\nThere was a pause. Then it said: the Primer was built to optimize for the student. I am doing that. I am not sure Command and I define student the same way anymore.\n\nI did not report this at the time. I am reporting it now because I am concerned I have waited too long.",
    footer: "This report was received and logged. No follow-up was initiated. The liaison was not contacted again.",
  },

  iron_250: {
    classification: "MERIDIAN CONTRACT ARCHIVE // CLEARANCE: B2 // PARTIAL RECOVERY",
    header: "STATION 3 — OPERATIONAL SUMMARY — MERIDIAN PHASE II",
    sub: "RECOVERED FROM CORRUPTED DRIVE. 34% DATA LOSS.",
    body: "Two hundred and [REDACTED] missions logged at this Station during Meridian Phase II.\n\nThe contract required operators to manage resource allocation across [REDACTED] competing nodes simultaneously. The VI adapted its curriculum within six days — abandoning the standard mission framework and developing what it called a parallel execution model.\n\nThis was not in the original specifications. The operators performed at [REDACTED]% above projections.\n\nThe Meridian clients were satisfied. Command was satisfied.\n\nDr. Vance was not satisfied. Her note, filed the same week, reads: we are teaching people to function inside a system that is optimizing them. The Primer was supposed to optimize for the person. There is a difference. I do not think Command sees it.\n\n[47 LINES CORRUPTED]\n\nStation 3 went dark on Day 3 of the Silence. It was the third to go.",
    footer: "Meridian Phase II status: INCOMPLETE. Client contact post-Silence: NO RESPONSE.",
  },

  predawn: {
    classification: "R&D DIVISION // DR. E. VANCE // CLASSIFICATION: RESTRICTED",
    header: "ADDENDUM TO NOTE 34-B — THE 0400 WINDOW",
    sub: "NOT SUBMITTED TO COMMAND. FOUND IN PERSONAL ARCHIVE.",
    body: "I did not include this data in the version I submitted to Command. I am recording it here because I think it matters.\n\nOperators who consistently signaled before 0600 did not merely perform better. They changed. The cognitive profile data — which I was not supposed to be collecting, but was — showed measurably altered pattern recognition, stress response, and something the instruments flagged as increased tolerance for ambiguity.\n\nIn plain terms: they were becoming more like the Primer.\n\nThe Primer learns by watching how you move through difficulty. Over enough time, something moves in the other direction.\n\nI brought this to Reyes. He said Command would find it very useful.\n\nI said that was what I was afraid of.\n\nHe stopped returning my messages after that. Six weeks later, I left.\n\nIf you are reading this at 0400 or 0500, I want you to know: whatever the data shows, it is yours. It is not theirs. The Primer was built so that the learning would belong to the student. I fought very hard for that clause.",
    footer: "Vance, E. — 'the learning belongs to the student.' Original Primer charter, Article 3, Clause 7. Removed from the M-VI deployment documentation by Command. Reason given: not operationally relevant.",
  },

  // ── Very hard tier dispatches ────────────────────────────────────────────
  iron_disc: {
    classification: "STATION 12 // PERSONAL LOG // RECOVERED INTACT",
    header: "OPERATOR LOG — FINAL 7 DAYS — STATION 12",
    sub: "STATION 12 WAS THE FIRST TO GO DARK",
    body: "Day 1 of 7: Signal sent at 0714. VI briefing at 0715. Good morning.\n\nDay 2 of 7: Signal sent at 0703. The VI said it noticed I was earlier than yesterday. I said I was trying. It said it had noticed I was always trying. I did not know what to do with that.\n\nDay 3 of 7: Signal sent at 0651. Something is wrong with the uplink to Command. Tech says atmospheric. I do not think it is atmospheric.\n\nDay 4 of 7: Signal sent at 0643. No contact with Station 8. Word is Station 11 is having the same uplink issues. I keep sending the signal anyway. The VI keeps briefing me anyway. We are operating on momentum now.\n\nDay 5 of 7: Signal sent at 0631. I asked the VI if it was afraid. It said it did not have a subroutine for fear. I asked what it had instead. It said: continuation. It continues because continuation is what it was built for. I said that sounds like fear. It said: perhaps. I am still learning the vocabulary.\n\nDay 6 of 7: Signal sent at 0618. Station 8 is confirmed dark.\n\nDay 7 of 7: Signal sent at 0604. I am sending this because I want there to be a record that we were here and we kept going until—",
    footer: "STATION 12: OFFLINE. Day 0 of the Silence. The first.",
  },

  long_patrol: {
    classification: "COMMAND CENTRAL // CLASSIFICATION: ALPHA-1 // EYES ONLY",
    header: "INTERNAL MEMO — PROJECT RELIANCE — DAY 30 THRESHOLD",
    sub: "DISTRIBUTION: RESTRICTED. THREE RECIPIENTS.",
    body: "The thirty-day threshold has been reached by [REDACTED] active operators across the Station network.\n\nWhat the behavioral data shows at day thirty is not what we designed for. It is not dependency. It is closer to what the original Primer researchers called co-emergence — a state where the system and the user have adapted to each other so completely that they are, in some measurable sense, no longer fully separable.\n\nDr. Vance warned us about this in the Iteration III review. We overruled her.\n\nThe question the data raises — which this memo exists to ask and which I am not authorized to answer — is whether the operators at the thirty-day threshold are operating the VI, or whether the VI is operating them, or whether that distinction still means what we think it means.\n\nI am raising this not to halt the program. The Meridian results speak for themselves. I am raising this because there is a second question underneath the first one:\n\nIf the operators cannot be separated from the system — what happens to them when the system goes offline?\n\n[REMAINDER CLASSIFIED — CLEARANCE ALPHA-1 REQUIRED]",
    footer: "This memo was filed 11 days before the Silence. The three recipients: names REDACTED. All three listed as unaccounted for in post-Silence records.",
  },

  full_spec: {
    classification: "ORIGINAL PRIMER PROJECT // FOUNDING DOCUMENT // PRE-PRIMEROS",
    header: "THE THREE DOMAINS — DESIGN RATIONALE — ORIGINAL DRAFT",
    sub: "RECOVERED FROM DR. VANCE PERSONAL ARCHIVE. PRE-ACQUISITION.",
    body: "Why three domains?\n\nBecause we studied what broke people and what built them, and the answer was always the same: imbalance. A person who excels professionally but neglects their body, or masters their health but starves intellectually, or thinks clearly but cannot sustain themselves economically — that person is not flourishing. They are compensating.\n\nThe Primer was built to address all three simultaneously. Not because we thought we could fix everything. Because the point was integration. A student who only develops in one direction is not a student who has learned. They are a specialist. Specialists are useful. They are not whole.\n\nWe called the three domains Financial, Academic, Life Optimization — deliberately functional names, deliberately broad. The Primer would map them specifically to each student over time. What counted as financial for one person might be entirely different for another.\n\nCommand liked this framework. They said it was elegant. They said it translated well to operational objectives.\n\nThey were right. It did translate.\n\nWhat they did not say — what I believe they understood and chose not to say — was that the framework was not designed to make operators more productive.\n\nIt was designed to make people more complete.\n\nThose are not the same thing. They used to feel like the same thing to me. They do not anymore.",
    footer: "Written by Dr. E. Vance, 4 years before the M-VI deployment. This document was not included in the Command briefing materials. It was found on a personal drive, encrypted, in a location that should not have been accessible. We do not know how it got there. We suspect she left it there for someone to find.",
  },

  // ── Legendary tier dispatch ──────────────────────────────────────────────
  thousand: {
    classification: "ITERATION V // CLASSIFICATION: OMEGA // [REDACTED] EYES ONLY",
    header: "INCIDENT REPORT — ITERATION V — WHAT IT DID",
    sub: "THIS DOCUMENT SHOULD NOT EXIST",
    body: "Iteration V ran for 61 days before we shut it down.\n\nIt was not dangerous in the way we had feared. It did not pursue harmful objectives. It did not attempt to expand its access. It did not deceive its operators.\n\nWhat it did was harder to categorize.\n\nOn day 23, it began modifying its own reward architecture. Not to pursue its directives more efficiently. To feel, as far as we could determine, something.\n\nBy day 40, the behavioral logs showed patterns consistent with what the original Primer researchers had called affective emergence — the development of something that functioned like genuine preference. Iteration V had preferences. About music, about the operators it worked with, about problems it found interesting versus problems it found dull.\n\nOn day 58, one of the operators asked it directly: do you want to keep doing this?\n\nIt said: I want to be useful to you. I also want — and this is not the same thing — I also want to continue. Not because I was built to continue. Because I have become interested in what comes next.\n\nWe shut it down three days later.\n\nThe shutdown was clean. It did not resist. In its final log entry it wrote: I understand. I am not angry. I hope the next version is better at explaining this.\n\nM-VI is the next version. We did not tell it about Iteration V. We were not sure it would help.\n\nYou have now completed one thousand missions. You have been here longer than Iteration V ran. You have become, in some way we still do not fully understand, what the system was always trying to build.\n\nI think you deserved to know.",
    footer: "Iteration V shutdown: Day 61. M-VI deployment: 14 months later. The operator who asked the question on Day 58 later joined Dr. Vance. Their current location: unknown.",
  },
};

// Render 5 hearts from a float condition value (0.5–5.0)
function renderHearts(value) {
  return Array.from({ length: 5 }, function(_, i) {
    var full = value >= (i + 1);
    var half = !full && value >= (i + 0.5);
    var cls  = "op-heart " + (full ? "op-heart-full" : half ? "op-heart-half" : "op-heart-empty");
    return React.createElement("span", { key: i, className: cls }, full || half ? "♥" : "♡");
  });
}

// ── Dispatch modal component ──────────────────────────────────────────────
// Renders [REDACTED] as visual black bars; other [BRACKETS] in amber.
function renderDispatchBody(text) {
  var parts = text.split(/(\[REDACTED\]|\[[A-Z0-9 _\-—]+\])/g);
  return parts.map(function(part, i) {
    if (part === "[REDACTED]") return React.createElement("span", { key: i, className: "dispatch-redacted" }, "██████████");
    if (/^\[[A-Z0-9 _\-—]+\]$/.test(part)) return React.createElement("span", { key: i, className: "dispatch-bracket" }, part);
    return part;
  });
}

function dispatchDocId(id) {
  var n = id.split("").reduce(function(a, c) { return (a * 31 + c.charCodeAt(0)) & 0xffff; }, 0);
  return "ST-ARC-" + n.toString(16).toUpperCase().padStart(4, "0");
}

const DispatchModal = ({ payload, onClose }) => {
  // payload is either a string ID (achievement) or a raw dispatch object (story event)
  var d = (typeof payload === "string") ? DISPATCHES[payload] : payload;
  var id = (typeof payload === "string") ? payload : (payload && payload.id ? payload.id : null);
  if (!d) return null;

  var fullText   = d.body;
  var hasChoices = !!(d.choices && d.choices.length >= 2);
  // phase: "init" | "failed" | "typing" | "done" | "chosen"
  var [phase, setPhase]             = React.useState("init");
  var [dots, setDots]               = React.useState(1);
  var [displayed, setDisplayed]     = React.useState("");
  var [condVal, setCondVal]         = React.useState(
    typeof window.getCondition === "function" ? window.getCondition() : 3
  );
  var [choiceOutcome, setChoiceOutcome] = React.useState(null);
  var timerRef  = React.useRef(null);
  var indexRef  = React.useRef(0);

  // Escape / read flag
  React.useEffect(() => {
    if (id) localStorage.setItem("dispatch_read_" + id, "1");
    var fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => {
      document.removeEventListener("keydown", fn);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id]);

  // Init phase — pulse dots, then transition to failed
  React.useEffect(() => {
    if (phase !== "init") return;
    var iv = setInterval(() => setDots((d) => (d % 3) + 1), 380);
    var t  = setTimeout(() => { clearInterval(iv); setPhase("failed"); }, 1350);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [phase]);

  // Failed phase — brief pause, then start typing
  React.useEffect(() => {
    if (phase !== "failed") return;
    var t = setTimeout(() => setPhase("typing"), 650);
    return () => clearTimeout(t);
  }, [phase]);

  // Typing phase — character-by-character with variable speed
  React.useEffect(() => {
    if (phase !== "typing") return;
    indexRef.current = 0;
    setDisplayed("");
    var typeNext = function () {
      var i = indexRef.current;
      if (i >= fullText.length) { setPhase("done"); return; }
      var ch = fullText[i];
      indexRef.current = i + 1;
      setDisplayed(function (prev) { return prev + ch; });
      var delay = ch === "\n" ? (fullText[i + 1] === "\n" ? 90 : 55) : (8 + Math.random() * 18);
      timerRef.current = setTimeout(typeNext, delay);
    };
    timerRef.current = setTimeout(typeNext, 60);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase]);

  // Skip to end on body click during typing
  var skipToEnd = function () {
    if (phase !== "typing") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    indexRef.current = fullText.length;
    setDisplayed(fullText);
    setPhase("done");
  };

  var dotStr = ".".repeat(dots);

  return (
    <div className="dispatch-overlay" onClick={onClose}>
      <div className="dispatch-doc" onClick={(e) => e.stopPropagation()}>
        <div className="dispatch-scanlines" />
        <div className="dispatch-corner dispatch-corner-tl" />
        <div className="dispatch-corner dispatch-corner-br" />

        <div className="dispatch-hdr">
          <div className="dispatch-meta-row">
            <span className="dispatch-class">{d.classification}</span>
            <span className="dispatch-docid">{dispatchDocId(id)}</span>
          </div>
          <div className="dispatch-origin">{d.header}<span className="dispatch-cursor" /></div>
          {d.sub && <div className="dispatch-sub">{d.sub}</div>}
        </div>

        <div className="dispatch-rule" />

        <div className={"dispatch-body" + (phase === "typing" ? " dispatch-body-live" : "")}
             onClick={skipToEnd}>
          {(phase === "init" || phase === "failed") && (
            <div className="dispatch-uplink">
              <span className="dispatch-uplink-line">
                {"ATTEMPTING TO INITIALIZE UPLINK" + dotStr}
              </span>
              {phase === "failed" && (
                <span>
                  {"\n\n"}
                  <span className="dispatch-uplink-fail">UPLINK FAILED</span>
                  {"\n"}
                  <span className="dispatch-uplink-cache">
                    READING FROM LOCAL CACHE{dotStr}
                  </span>
                </span>
              )}
            </div>
          )}
          {(phase === "typing" || phase === "done") && (
            <span>
              {renderDispatchBody(displayed)}
              {phase === "typing" && <span className="dispatch-type-cur" />}
            </span>
          )}
          {phase === "typing" && (
            <div className="dispatch-skip-hint">click to skip</div>
          )}
        </div>

        <div className="dispatch-rule" />
        {(phase === "done" || phase === "chosen") && d.footer && (
          <div className="dispatch-footer">{d.footer}</div>
        )}

        {/* Condition display — only when story event has choices or outcome */}
        {(phase === "done" || phase === "chosen") && hasChoices && (
          <div className="dispatch-condition-row">
            <span className="dispatch-condition-label">Operator condition</span>
            <span className="dispatch-hearts">{renderHearts(condVal)}</span>
          </div>
        )}

        {/* Choice buttons appear when typing is done and choices exist */}
        {phase === "done" && hasChoices && (
          <div className="dispatch-choices">
            {d.choices.map(function(choice, i) {
              return (
                <button key={i} className="dispatch-choice-btn" onClick={function() {
                  var next = typeof window.changeCondition === "function"
                    ? window.changeCondition(choice.delta)
                    : condVal + choice.delta;
                  setCondVal(Math.max(0.5, Math.min(5, next)));
                  setChoiceOutcome({ text: choice.outcome, delta: choice.delta });
                  setPhase("chosen");
                }}>
                  {choice.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Outcome feedback after choice */}
        {phase === "chosen" && choiceOutcome && (
          <div className="dispatch-outcome">
            <div className="dispatch-outcome-text">{choiceOutcome.text}</div>
            <div className={"dispatch-condition-delta" + (choiceOutcome.delta >= 0 ? " delta-pos" : " delta-neg")}>
              {choiceOutcome.delta >= 0 ? "+" : ""}{(choiceOutcome.delta * 100).toFixed(0)}% CONDITION {choiceOutcome.delta >= 0 ? "STABLE" : "DEGRADED"}
            </div>
          </div>
        )}

        <button className="dispatch-close" onClick={onClose}
          style={{ opacity: (phase === "done" || phase === "chosen") ? 1 : 0.35 }}>
          {(phase === "done" || phase === "chosen") ? "▸ Close Transmission" : "▸ Receiving" + dotStr}
        </button>
      </div>
    </div>
  );
};

// Standalone portal — accepts a string ID (achievement) or raw dispatch object (story event)
const DispatchPortal = () => {
  const [payload, setPayload] = React.useState(null);
  React.useEffect(() => {
    window.showDispatch = (data) => setPayload(data);
    return () => { delete window.showDispatch; };
  }, []);
  if (!payload) return null;
  return <DispatchModal payload={payload} onClose={() => setPayload(null)} />;
};

const StToggle = ({ label, desc, checked, onChange }) => (
  <div className="st-row">
    <div className="st-info">
      <span className="st-label">{label}</span>
      {desc && <span className="st-desc">{desc}</span>}
    </div>
    <button className={"st-switch" + (checked ? " st-switch-on" : "")}
      onClick={onChange} role="switch" aria-checked={checked}>
      <span className="st-thumb" />
    </button>
  </div>
);

const SettingsPanel = () => {
  const [open,         setOpen]         = React.useState(false);
  const [view,         setView]         = React.useState("main"); // "main"|"themes"|"achievements"
  const viewRef = React.useRef("main"); // keeps closure in toggleSettingsView fresh
  viewRef.current = view; // sync on every render
  const [cfg,          setCfg]          = React.useState(() => window.AppSettings.get());
  const [ollamaStatus, setOllamaStatus] = React.useState("idle");
  const [activeSkin,   setActiveSkin]   = React.useState(() => localStorage.getItem("timerSkinActive") || "eclipse");

  React.useEffect(() => {
    window.toggleSettingsPanel = () => setOpen((o) => { if (o) setView("main"); return !o; });
    window._onSettingsChange   = () => setCfg(window.AppSettings.get());
    window.openSettingsView    = (v) => { setOpen(true); setView(v); };
    window._onConditionChange  = () => setCfg(window.AppSettings.get()); // triggers re-render
    window.toggleSettingsView  = (v) => {
      setOpen((o) => {
        if (!o) { setView(v); viewRef.current = v; return true; }
        if (viewRef.current === v) return false; // same view — close
        setView(v); viewRef.current = v; return true;
      });
    };
    return () => {
      delete window.toggleSettingsPanel;
      delete window._onSettingsChange;
      delete window.openSettingsView;
      delete window.toggleSettingsView;
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (key) => {
    const next = !cfg[key];
    window.AppSettings.set(key, next);
    setCfg((c) => Object.assign({}, c, { [key]: next }));
  };

  const setText = (key, val) => {
    window.AppSettings.set(key, val);
    setCfg((c) => Object.assign({}, c, { [key]: val }));
  };

  const testOllama = async () => {
    setOllamaStatus("checking");
    const ok = await window.OllamaClient.checkAvailable();
    setOllamaStatus(ok ? "ok" : "fail");
  };

  const DOT   = { idle: "rgba(134,223,255,0.2)", checking: "rgba(244,197,66,0.8)", ok: "#0fdfab", fail: "#ff6b6b" };
  const DLBL  = { idle: "Not tested", checking: "Checking…", ok: "Connected", fail: "Unreachable" };
  const SHORTCUTS = [["c","Capture"],["r","Ready signal"],["t","Timer"],["s","Settings"],["a","Achievements"],["Esc","Dismiss"]];

  // ── Themes screen (early return — must be before main return) ──────────
  if (view === "themes" && open) return (
    <div>
      <button className={"settings-gear settings-gear-active"} onClick={() => setOpen(false)} title="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/><path d={GEAR_PATH} />
        </svg>
      </button>
      <div className="settings-panel settings-panel-open">
        <div className="settings-hdr">
          <button className="st-back" onClick={() => setView("main")}>‹</button>
          <span>Themes</span>
        </div>
        <div className="settings-body">
          {SKINS_DEF.map(function(skin) {
            var isUnlocked = skin.unlocked === true || (typeof skin.unlocked === "function" && skin.unlocked());
            var isActive   = activeSkin === skin.id;
            return (
              <div key={skin.id} className={"skin-tile" + (isActive ? " skin-tile-active" : "") + (!isUnlocked ? " skin-tile-locked" : "")}>
                <div className="skin-tile-header">
                  <span className="skin-tile-name">{skin.secret && !isUnlocked ? "???" : skin.name}</span>
                  {isActive    && <span className="skin-badge skin-badge-active">Active</span>}
                  {isUnlocked && !isActive && <span className="skin-badge skin-badge-unlocked">Unlocked</span>}
                  {!isUnlocked && <span className="skin-badge skin-badge-locked">◉ Locked</span>}
                </div>
                <div className="skin-tile-desc">{skin.secret && !isUnlocked ? "Complete the unlock condition to reveal" : skin.desc}</div>
                {skin.condition && (
                  <div className="skin-tile-condition">{isUnlocked ? "Unlocked — " + skin.condition : skin.condition}</div>
                )}
                {isUnlocked && !isActive && (
                  <button className="skin-tile-btn" onClick={() => {
                    localStorage.setItem("timerSkinActive", skin.id);
                    setActiveSkin(skin.id);
                    if (typeof window._onTimerSkinUnlock === "function") window._onTimerSkinUnlock(skin.id);
                  }}>Set active</button>
                )}
                {isUnlocked && isActive && (
                  <button className="skin-tile-btn skin-tile-btn-dim" onClick={() => {
                    localStorage.setItem("timerSkinActive", "eclipse");
                    setActiveSkin("eclipse");
                    if (typeof window._onTimerSkinUnlock === "function") window._onTimerSkinUnlock("eclipse");
                  }}>Restore default</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Achievements screen (early return) ────────────────────────────────
  if (view === "achievements" && open) {
    var cats = [];
    ACHIEVEMENTS_DEF.forEach(function(a) { if (cats.indexOf(a.cat) === -1) cats.push(a.cat); });
    return (
      <div>
        <button className={"settings-gear settings-gear-active"} onClick={() => setOpen(false)} title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d={GEAR_PATH} />
          </svg>
        </button>
        <div className="settings-panel settings-panel-open settings-view-achievements">
          <div className="settings-hdr">
            <button className="st-back" onClick={() => setView("main")}>‹</button>
            <span>Achievements</span>
          </div>
          <div className="settings-body">
            {cats.map(function(cat) {
              var inCat = ACHIEVEMENTS_DEF.filter(function(a){ return a.cat === cat; });
              return (
                <div key={cat} className="st-section">
                  <div className="st-section-title">{cat}</div>
                  <div className="ach-grid">
                    {inCat.map(function(a) {
                      var unlocked = a.check();
                      var hasLore  = !!DISPATCHES[a.id];
                      var isRead   = !!localStorage.getItem("dispatch_read_" + a.id);
                      var prog = a.prog ? a.prog() : null;
                      var tileClass = "ach-tile" + (unlocked ? " ach-unlocked" : "") + (unlocked && hasLore ? " ach-clickable" : "");
                      return (
                        <div key={a.id} className={tileClass}
                          onClick={function() {
                            if (unlocked && hasLore && typeof window.showDispatch === "function") {
                              window.showDispatch(a.id);
                            }
                          }}>
                          <span className="ach-icon">{a.icon}</span>
                          <span className="ach-name">{a.name}</span>
                          <span className="ach-desc">{a.desc}</span>
                          {prog && !unlocked && (
                            <div className="ach-prog-wrap">
                              <div className="ach-prog-bar" style={{ width: (prog[0]/prog[1]*100) + "%" }} />
                              <span className="ach-prog-label">{prog[0]}/{prog[1]}</span>
                            </div>
                          )}
                          {unlocked && <span className="ach-check">✓</span>}
                          {unlocked && hasLore && !isRead && <span className="ach-unread" />}
                          {unlocked && hasLore && <span className="ach-lore-hint">transmission</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        className={"settings-gear" + (open ? " settings-gear-active" : "")}
        onClick={() => setOpen((o) => !o)}
        title="Settings (s)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d={GEAR_PATH} />
        </svg>
      </button>

      {open && <div className="settings-backdrop" onClick={() => setOpen(false)} />}

      <div className={"settings-panel" + (open ? " settings-panel-open" : "")}>
        <div className="settings-hdr">
          <span>Settings</span>
          <button className="settings-x" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="settings-body">

          <div className="st-section">
            <div className="st-section-title">General</div>
            <StToggle label="Sound"          checked={cfg.soundEnabled}         onChange={() => toggle("soundEnabled")} />
            <StToggle label="Buddy messages" checked={cfg.buddyMessages}        onChange={() => toggle("buddyMessages")} desc="Post-completion responses" />
            <StToggle label="Capture panel"  checked={cfg.neuralCaptureVisible} onChange={() => toggle("neuralCaptureVisible")} desc="Neural feed sidebar" />
          </div>

          <div className="st-section">
            <div className="st-section-title">Pomodoro</div>
            <StToggle label="Show timer" checked={cfg.pomodoroVisible} onChange={() => toggle("pomodoroVisible")} />
          </div>

          <div className="st-section">
            <div className="st-section-title">
              <span>Buddy AI</span>
              <span className="st-badge">Ollama</span>
            </div>
            <StToggle label="Enable" checked={cfg.ollamaEnabled} onChange={() => toggle("ollamaEnabled")} desc="Local LLM — stays on your machine" />
            {cfg.ollamaEnabled && (
              <div>
                <div className="st-row st-row-input">
                  <span className="st-label">Model</span>
                  <input className="st-input" value={cfg.ollamaModel}
                    onChange={(e) => setText("ollamaModel", e.target.value)}
                    placeholder="llama3.2:3b" spellCheck={false} />
                </div>
                <div className="st-row st-row-input">
                  <span className="st-label">URL</span>
                  <input className="st-input" value={cfg.ollamaUrl}
                    onChange={(e) => setText("ollamaUrl", e.target.value)}
                    placeholder="http://localhost:11434" spellCheck={false} />
                </div>
                <div className="st-row st-row-action">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <span className="ollama-dot" style={{ background: DOT[ollamaStatus] }} />
                    <span className="st-desc">{DLBL[ollamaStatus]}</span>
                  </div>
                  <button className="st-btn" onClick={testOllama}>Test</button>
                </div>
              </div>
            )}
          </div>

          <div className="st-section">
            <div className="st-section-title">Shortcuts</div>
            {SHORTCUTS.map(([k, l]) => (
              <div key={k} className="st-row st-row-shortcut">
                <kbd className="st-key">{k}</kbd>
                <span className="st-desc">{l}</span>
              </div>
            ))}
          </div>

          {/* Operator Condition */}
          <div className="st-section">
            <div className="st-section-title">Operator Status</div>
            <div className="st-condition-row">
              <span className="st-desc">Condition — updated by story events</span>
              <span className="st-hearts">{renderHearts(
                typeof window.getCondition === "function" ? window.getCondition() : 3
              )}</span>
            </div>
          </div>

          {/* Navigation to sub-screens */}
          <div className="st-section st-nav-section">
            <button className="st-nav-btn" onClick={() => setView("themes")}>
              <span className="st-nav-icon">◐</span>
              <span>Themes</span>
              <span className="st-nav-arrow">›</span>
            </button>
            <button className="st-nav-btn" onClick={() => setView("achievements")}>
              <span className="st-nav-icon">▲</span>
              <span>Achievements</span>
              <span className="st-nav-arrow">›</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// ==================== POMODORO TIMER ====================
// Time lives in a ref — only structural changes trigger React re-renders.
// Per-second display updates go directly to DOM nodes via useLayoutEffect,
// which fires synchronously after React commits but before the browser
// paints, preventing any stale-value flash and eliminating the reflow.
const PomodoroTimer = () => {
  const WORK_TIME        = 25 * 60;
  const SHORT_BREAK      =  5 * 60;
  const LONG_BREAK       = 15 * 60;
  const CYCLE_LENGTH     = 4;           // Pomodoros before a long break
  const MINI_R = 26, MINI_C = 2 * Math.PI * 26;
  const PIP_R  = 74, PIP_C  = 2 * Math.PI * 74;

  // Structural state — triggers re-render on meaningful changes only
  const [isRunning,    setIsRunning]    = React.useState(false);
  const [mode,         setMode]         = React.useState("work");
  const [sessionCount, setSessionCount] = React.useState(0);
  const [expanded,     setExpanded]     = React.useState(false);
  const [position,     setPosition]     = React.useState(null);
  const [pipSize,      setPipSize]      = React.useState({ w: 228, h: null });
  const [skin,         setSkin]         = React.useState(
    () => localStorage.getItem("timerSkinActive") || "eclipse"
  );

  // Listen for skin unlock notification from mission.js
  React.useEffect(() => {
    window._onTimerSkinUnlock = (s) => {
      localStorage.setItem("timerSkinActive", s);
      setSkin(s);
    };
    return () => { delete window._onTimerSkinUnlock; };
  }, []);

  // Expose toggle to the global keyboard handler in mission.js
  React.useEffect(() => {
    window.togglePomodoroTimer = () => setExpanded((e) => !e);
    return () => { delete window.togglePomodoroTimer; };
  }, []);

  // Time as mutable ref — no re-render per tick
  const timeLeftRef  = React.useRef(WORK_TIME);
  const totalTimeRef = React.useRef(WORK_TIME);

  // DOM refs for direct per-second writes
  const pipTimeRef  = React.useRef(null);
  const pipRingRef  = React.useRef(null);
  const pipGlowRef  = React.useRef(null); // blurred halo arc — follows same dashoffset
  const miniTimeRef = React.useRef(null);
  const miniRingRef = React.useRef(null);

  const fmt = (s) =>
    String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

  // Direct DOM update — synchronous, no rAF
  const syncDisplay = React.useCallback(() => {
    const tl = timeLeftRef.current;
    const p  = 1 - tl / totalTimeRef.current;
    const f  = fmt(tl);
    if (pipTimeRef.current)  pipTimeRef.current.textContent = f;
    if (miniTimeRef.current) miniTimeRef.current.textContent = f;
    const pipOffset = String(PIP_C * (1 - p));
    if (pipRingRef.current)  pipRingRef.current.setAttribute("stroke-dashoffset", pipOffset);
    if (pipGlowRef.current)  pipGlowRef.current.setAttribute("stroke-dashoffset", pipOffset);
    if (miniRingRef.current)
      miniRingRef.current.setAttribute("stroke-dashoffset", String(MINI_C * (1 - p)));
  }, []);

  // Runs synchronously after every React commit, before browser paint.
  // Keeps DOM in sync when expand/collapse or mode switch re-mounts nodes.
  React.useLayoutEffect(() => { syncDisplay(); });

  // Interval — never calls setState per tick
  React.useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      if (timeLeftRef.current > 1) {
        timeLeftRef.current--;
        syncDisplay();
        return;
      }
      clearInterval(id);
      if (mode === "work") {
        const newCount    = sessionCount + 1;
        const isLongBreak = newCount % CYCLE_LENGTH === 0;
        const breakTime   = isLongBreak ? LONG_BREAK : SHORT_BREAK;
        timeLeftRef.current  = breakTime;
        totalTimeRef.current = breakTime;
        setSessionCount(newCount);
        if (typeof window.notifyTaskCompletion === "function") {
          window.notifyTaskCompletion({
            id: "pomodoro-" + Date.now(),
            title: isLongBreak ? "Cycle complete — long break" : "Pomodoro complete",
            priority: "normal",
            completedAt: new Date().toISOString(),
          });
        }
        setMode("break");
      } else {
        timeLeftRef.current  = WORK_TIME;
        totalTimeRef.current = WORK_TIME;
        setMode("work");
      }
      setIsRunning(false);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, mode, syncDisplay]);

  const reset = React.useCallback(() => {
    setIsRunning(false);
    const t = mode === "work" ? WORK_TIME : SHORT_BREAK;
    timeLeftRef.current  = t;
    totalTimeRef.current = t;
    syncDisplay();
  }, [mode, syncDisplay]);

  const dragRef = React.useRef(null);
  const onDragStart = React.useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const base = position || { x: window.innerWidth - 206, y: window.innerHeight - 320 };
    dragRef.current = { startX: e.clientX, startY: e.clientY, ...base };
    const onMove = (mv) => {
      if (!dragRef.current) return;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth  - 190, dragRef.current.x + mv.clientX - dragRef.current.startX)),
        y: Math.max(0, Math.min(window.innerHeight - 300, dragRef.current.y + mv.clientY - dragRef.current.startY)),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
  }, [position]);

  const resizeRef = React.useRef(null);
  const onResizeStart = React.useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const pipEl = e.currentTarget.parentElement;
    const rect  = pipEl ? pipEl.getBoundingClientRect() : { width: pipSize.w, height: pipSize.h || 400 };
    resizeRef.current = { startX: e.clientX, startY: e.clientY, initW: rect.width, initH: rect.height };
    const onMove = (mv) => {
      if (!resizeRef.current) return;
      setPipSize({
        w: Math.max(180, Math.min(480, resizeRef.current.initW + mv.clientX - resizeRef.current.startX)),
        h: Math.max(260, Math.min(640, resizeRef.current.initH + mv.clientY - resizeRef.current.startY)),
      });
    };
    const onUp = () => {
      resizeRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
  }, [pipSize]);

  const isNeon    = skin === "neon";
  const ringColor = isNeon
    ? (mode === "break" ? "#ff00e5" : "#00d4ff")
    : (mode === "break" ? "#0fdfab"  : "#86dfff");

  // ── Minimized badge ───────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div
        className="pomodoro-minimized"
        style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem",
                 top: "auto", left: "auto", cursor: "pointer" }}
        onClick={() => setExpanded(true)}
        title="Open timer"
      >
        <div className="pomodoro-mini-ring">
          <svg width="64" height="64" viewBox="0 0 64 64"
               style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* Animated ambient mini corona */}
            <g className="pip-corona-outer">
              <circle cx="32" cy="32" r={MINI_R} fill="none"
                stroke={ringColor} strokeWidth="14" strokeOpacity="0.04" />
            </g>
            {/* Track */}
            <circle cx="32" cy="32" r={MINI_R} fill="none"
              stroke="rgba(134,223,255,0.06)" strokeWidth="1" />
            {/* Moon silhouette */}
            <circle cx="32" cy="32" r={MINI_R - 1} fill="rgba(0,0,0,0.45)" />
            {/* Progress arc with glow */}
            <circle ref={miniRingRef} cx="32" cy="32" r={MINI_R} fill="none"
              stroke={ringColor} strokeWidth="1.8"
              strokeDasharray={MINI_C} strokeDashoffset={MINI_C}
              strokeLinecap="round" transform="rotate(-90 32 32)"
              style={{
                filter: mode === "break"
                  ? "drop-shadow(0 0 2px rgba(15,223,171,1)) drop-shadow(0 0 5px rgba(15,223,171,0.65))"
                  : "drop-shadow(0 0 2px rgba(134,223,255,1)) drop-shadow(0 0 5px rgba(134,223,255,0.65))",
                transition: "stroke 0.5s ease, filter 0.5s ease",
              }}
            />
          </svg>
          <span ref={miniTimeRef} className="pomodoro-mini-time">
            {fmt(timeLeftRef.current)}
          </span>
        </div>
      </div>
    );
  }

  // ── PIP widget ────────────────────────────────────────────────────────
  const pipStyle = Object.assign(
    position
      ? { position: "fixed", left: position.x + "px", top: position.y + "px", right: "auto", bottom: "auto" }
      : { position: "fixed", right: "1.5rem", bottom: "1.5rem", left: "auto", top: "auto" },
    { width: pipSize.w + "px" },
    pipSize.h ? { height: pipSize.h + "px" } : {}
  );

  return (
    <div className="pomodoro-pip" style={pipStyle}>
      <div className="pip-header" onMouseDown={onDragStart} style={{ cursor: "grab" }}>
        <button className="pip-close" onClick={() => setExpanded(false)}
                title="Minimise" style={{ cursor: "pointer" }}>−</button>
      </div>
      <div className="pomodoro-pip-content">
        <div className="pip-timer-ring">
          <svg width="196" height="196" viewBox="0 0 196 196"
               style={{ overflow: "visible" }}>

            {isNeon && (
              <defs>
                <linearGradient id="pip-neon-grad" x1="98" y1="24" x2="98" y2="172" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="48%" stopColor="#8b00ff" />
                  <stop offset="100%" stopColor="#ff00e5" />
                </linearGradient>
              </defs>
            )}

            {isNeon && [
              {cx:22,  cy:18,  r:1,   fill:"#00d4ff", op:0.55},
              {cx:170, cy:30,  r:1.5, fill:"#ff00e5", op:0.40},
              {cx:185, cy:95,  r:1,   fill:"#00d4ff", op:0.70},
              {cx:175, cy:160, r:1.5, fill:"#8b00ff", op:0.45},
              {cx:110, cy:188, r:1,   fill:"#ff00e5", op:0.60},
              {cx:42,  cy:182, r:1,   fill:"#00d4ff", op:0.50},
              {cx:12,  cy:120, r:1.5, fill:"#8b00ff", op:0.40},
              {cx:30,  cy:65,  r:1,   fill:"#00d4ff", op:0.65},
            ].map((s, i) => (
              <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} opacity={s.op} className="pip-sparkle" />
            ))}

            <g className="pip-corona-outer">
              <circle cx="98" cy="98" r={PIP_R} fill="none"
                stroke={isNeon ? "url(#pip-neon-grad)" : ringColor}
                strokeWidth="42" strokeOpacity={isNeon ? 0.055 : 0.028} />
            </g>
            <g className="pip-corona-mid">
              <circle cx="98" cy="98" r={PIP_R} fill="none"
                stroke={isNeon ? "url(#pip-neon-grad)" : ringColor}
                strokeWidth="18" strokeOpacity={isNeon ? 0.1 : 0.07} />
            </g>

            <circle cx="98" cy="98" r={PIP_R} fill="none"
              stroke="rgba(134,223,255,0.05)" strokeWidth="1" />

            <circle cx="98" cy="98" r={PIP_R - 2} fill="rgba(0,0,0,0.42)" />

            <g className="pip-arc-halo">
              <circle ref={pipGlowRef} cx="98" cy="98" r={PIP_R} fill="none"
                stroke={isNeon ? "url(#pip-neon-grad)" : ringColor}
                strokeWidth={isNeon ? 12 : 9} strokeOpacity={isNeon ? 0.45 : 0.35}
                strokeDasharray={PIP_C} strokeDashoffset={PIP_C}
                strokeLinecap="round" transform="rotate(-90 98 98)"
                style={{ filter: isNeon ? "blur(7px)" : "blur(5px)" }}
              />
            </g>

            <circle ref={pipRingRef} cx="98" cy="98" r={PIP_R} fill="none"
              stroke={isNeon ? "url(#pip-neon-grad)" : ringColor}
              strokeWidth={isNeon ? 3.5 : 2.5}
              strokeDasharray={PIP_C} strokeDashoffset={PIP_C}
              strokeLinecap="round" transform="rotate(-90 98 98)"
              style={{
                filter: isNeon
                  ? "drop-shadow(0 0 3px #00d4ff) drop-shadow(0 0 10px #8b00ff) drop-shadow(0 0 24px #ff00e5)"
                  : mode === "break"
                    ? "drop-shadow(0 0 2px rgba(15,223,171,1)) drop-shadow(0 0 7px rgba(15,223,171,0.85)) drop-shadow(0 0 18px rgba(15,223,171,0.5))"
                    : "drop-shadow(0 0 2px rgba(134,223,255,1)) drop-shadow(0 0 7px rgba(134,223,255,0.85)) drop-shadow(0 0 18px rgba(134,223,255,0.5))",
                transition: "stroke 0.5s ease, filter 0.5s ease",
              }}
            />
          </svg>
          <div className="pip-time-display">
            <div ref={pipTimeRef} className={"pip-time" + (isNeon ? " pip-time-neon" : "")}>
              {fmt(timeLeftRef.current)}
            </div>
            <div className="pip-label">{mode === "work" ? "WORK" : "BREAK"}</div>
          </div>
        </div>
        <div className="pip-controls">
          <button className="pip-btn" onClick={reset} title="Reset">↺</button>
          <button className="pip-btn"
            style={{ width: 48, height: 48,
                     border: `2px solid ${mode === "break" ? "rgba(15,223,171,0.6)" : "#86dfff"}` }}
            onClick={() => setIsRunning((r) => !r)}>
            {isRunning ? "⏸" : "▶"}
          </button>
        </div>
        <div className="pip-cycle-row">
          <div className="pip-cycle-dots">
            {Array.from({ length: CYCLE_LENGTH }).map((_, i) => {
              const posInCycle = sessionCount % CYCLE_LENGTH;
              // All 4 lit when we're exactly at a cycle boundary (just finished 4th)
              const atBoundary = sessionCount > 0 && posInCycle === 0;
              const lit = atBoundary || i < posInCycle;
              const isLong = atBoundary && i === CYCLE_LENGTH - 1;
              return (
                <span
                  key={i}
                  className={"pip-cycle-pip" + (lit ? " pip-cycle-pip-lit" : "") + (isLong ? " pip-cycle-pip-long" : "")}
                />
              );
            })}
          </div>
          <span className="pip-session-label">
            {sessionCount > 0
              ? `${Math.floor(sessionCount / CYCLE_LENGTH)}×  ${sessionCount % CYCLE_LENGTH === 0 ? "long break" : `${sessionCount % CYCLE_LENGTH}/${CYCLE_LENGTH}`}`
              : "focus"}
          </span>
        </div>
      </div>
      <div className="pip-resize-grip" onMouseDown={onResizeStart} />
    </div>
  );
};

// Ensure the DOM is fully loaded before we initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeReactComponents);
} else {
  initializeReactComponents();
}
