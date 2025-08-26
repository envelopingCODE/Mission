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

//################## SECTION 1: CuteRobotFace Component Start ##################
// Update the CuteRobotFace component
const CuteRobotFace = ({
  taskCompletionLevel = 0,
  currentLevel = 1,
  isTaskCompleted = false,
}) => {
  //################## SECTION 2: State and Hooks ##################
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [currentEmotion, setCurrentEmotion] = React.useState("curious");
  const [eyePosition, setEyePosition] = React.useState({ x: 0, y: 0 });
  const [isTracking, setIsTracking] = React.useState(false);
  const [pupilSize, setPupilSize] = React.useState(1);
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
      setTimeout(() => setCurrentEmotion("neutral"), 2000);
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
        </g>

        {/* Enhanced Mouth with smoother transitions */}
        <PathComponent
          id="robot-mouth"
          d={currentExpression.mouth}
          fill={currentExpression.color || "#86dfff"}
          className={`mouth ${
            currentExpression.isGlitched ? "glitching-element" : ""
          }`}
          animate={motion ? { d: currentExpression.mouth } : undefined}
          transition={
            window.CraftedMotion && window.CraftedMotion.EASING
              ? { ease: window.CraftedMotion.EASING.softBounce, duration: 0.4 }
              : { ease: "easeOut", duration: 0.4 }
          }
          style={{
            transition: "d 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            filter: "drop-shadow(0 0 2px rgba(134, 223, 255, 0.5))",
            transform: isGlitching
              ? `translateX(${glitchOffset.x * 0.7}px) translateY(${
                  glitchOffset.y * 0.5
                }px)`
              : "",
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

// Ensure the DOM is fully loaded before we initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeReactComponents);
} else {
  initializeReactComponents();
}
