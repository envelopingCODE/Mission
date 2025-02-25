// crafted-motion.js - An elegant animation system inspired by natural physics
(function(global) {
  // Utility functions for animation calculations
  const Utils = {
    // Map a value from one range to another (like Arduino/Processing map function)
    map: (value, fromLow, fromHigh, toLow, toHigh) => {
      return toLow + (toHigh - toLow) * ((value - fromLow) / (fromHigh - fromLow));
    },
    
    // Clamp a value between min and max
    clamp: (value, min, max) => {
      return Math.min(Math.max(value, min), max);
    },
    
    // Smooth interpolation with custom curve shape
    smoothstep: (min, max, value) => {
      const x = Utils.clamp((value - min) / (max - min), 0, 1);
      return x * x * (3 - 2 * x);
    }
  };

  // Physics simulation utilities
  const Physics = {
    // Spring simulation constants
    SPRING_CONFIGS: {
      gentle: { mass: 1, stiffness: 170, damping: 26 },
      wobbly: { mass: 1, stiffness: 180, damping: 12 },
      bouncy: { mass: 1, stiffness: 300, damping: 10 },
      stiff: { mass: 1, stiffness: 300, damping: 30 },
      slow: { mass: 3, stiffness: 120, damping: 30 }
    },
    
    // Simplified spring simulation step - Hooke's law with damping
    springSimulation: (params, dt = 1/60, iterations = 8) => {
      const { fromValue, toValue, velocity = 0, mass = 1, stiffness = 100, damping = 10 } = params;
      let position = fromValue;
      let currentVelocity = velocity;
      
      // Simulate over multiple tiny steps for better accuracy
      for (let i = 0; i < iterations; i++) {
        const stepDt = dt / iterations;
        
        // Spring force: -k * displacement
        const springForce = -stiffness * (position - toValue);
        
        // Damping force: -c * velocity
        const dampingForce = -damping * currentVelocity;
        
        // Net force
        const force = springForce + dampingForce;
        
        // Acceleration = force / mass (F = ma)
        const acceleration = force / mass;
        
        // Update velocity: v += a * dt
        currentVelocity += acceleration * stepDt;
        
        // Update position: x += v * dt
        position += currentVelocity * stepDt;
      }
      
      return {
        position,
        velocity: currentVelocity
      };
    }
  };

  // Animation system with keyframes and physics
  const CraftedMotion = {
    // Library of natural easing functions that imitate real-world physics
    EASING: {
      // Standard CSS easing functions
      linear: [0, 0, 1, 1],
      ease: [0.25, 0.1, 0.25, 1],
      easeIn: [0.42, 0, 1, 1],
      easeOut: [0, 0, 0.58, 1],
      easeInOut: [0.42, 0, 0.58, 1],
      
      // Advanced organic motion
      anticipate: [0.68, -0.55, 0.265, 1.55],
      backIn: [0.6, -0.28, 0.735, 0.045],
      backOut: [0.175, 0.885, 0.32, 1.275],
      backInOut: [0.68, -0.55, 0.265, 1.55],
      
      // Special effects
      spring: 'spring-physics',
      bounce: 'bounce-physics'
    },
    
    // Convert cubic bezier points to CSS timing function
    cssTimingFunction: function(points) {
      if (Array.isArray(points)) {
        return `cubic-bezier(${points.join(',')})`;
      } else if (typeof points === 'string') {
        return points; // Already a named timing function
      }
      return 'ease'; // Default
    },

    // Create keyframe animation dynamically
    createKeyframes: function(name, keyframes) {
      // Don't recreate if already exists
      if (document.querySelector(`style[data-keyframes="${name}"]`)) {
        return name;
      }
      
      const styleEl = document.createElement('style');
      styleEl.setAttribute('data-keyframes', name);
      
      let cssText = `@keyframes ${name} {\n`;
      Object.entries(keyframes).forEach(([position, props]) => {
        cssText += `  ${position} {\n`;
        Object.entries(props).forEach(([prop, value]) => {
          cssText += `    ${prop}: ${value};\n`;
        });
        cssText += '  }\n';
      });
      cssText += '}\n';
      
      styleEl.textContent = cssText;
      document.head.appendChild(styleEl);
      
      return name;
    },
    
    // Generate unique IDs for animations
    generateUniqueId: function(prefix = 'anim') {
      return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Transitions system
    createTransition: function(config = {}) {
      const { 
        type = 'tween', 
        duration = 0.4, 
        delay = 0, 
        ease = 'easeOut',
        repeat = 0,
        repeatType = 'loop',
        stiffness,
        damping,
        mass 
      } = config;
      
      // Default CSS transition
      let cssTransition = {
        property: 'all',
        duration: `${duration}s`,
        timingFunction: CraftedMotion.cssTimingFunction(
          CraftedMotion.EASING[ease] || CraftedMotion.EASING.easeOut
        ),
        delay: `${delay}s`
      };
      
      // Special physics-based transitions
      if (type === 'spring') {
        const presetName = stiffness ? 'custom' : 'gentle';
        const preset = presetName === 'custom' 
          ? { stiffness, damping, mass } 
          : Physics.SPRING_CONFIGS[presetName];
        
        // Use a known good approximation for CSS
        cssTransition.timingFunction = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
        cssTransition.duration = `${Utils.map(preset.stiffness, 100, 300, 0.8, 0.3)}s`;
      }
      
      return {
        toString: () => {
          return `${cssTransition.property} ${cssTransition.duration} ${cssTransition.timingFunction} ${cssTransition.delay}`;
        },
        getCss: () => cssTransition
      };
    },
    
    // Component factory
    createComponent: function(elementType) {
      return function(props) {
        const {
          children,
          initial,
          animate,
          exit,
          transition = {},
          variants,
          whileHover,
          whileTap,
          className,
          style = {},
          ...restProps
        } = props;
        
        // Component state tracking
        const [state, setState] = React.useState({
          isVisible: false,
          isHovering: false,
          isTapping: false,
          animationId: CraftedMotion.generateUniqueId()
        });
        
        // Track which variant/state we're showing
        const [currentVariant, setCurrentVariant] = React.useState(initial || {});
        
        // Setup initial animation on mount
        React.useEffect(() => {
          // Start with initial, then animate to target
          const timeout = setTimeout(() => {
            setState(prev => ({ ...prev, isVisible: true }));
            
            // Determine which values to animate to
            const targetValues = variants && animate && variants[animate] 
              ? variants[animate]
              : animate || {};
            
            setCurrentVariant(targetValues);
          }, 10); // Small delay for initial state to take effect
          
          return () => clearTimeout(timeout);
        }, []);
        
        // Update animation when 'animate' prop changes
        React.useEffect(() => {
          if (!state.isVisible) return;
          
          const targetValues = variants && animate && variants[animate]
            ? variants[animate]
            : animate || {};
            
          setCurrentVariant(targetValues);
        }, [animate, variants]);
        
        // Build the final style object
        const transitionObj = CraftedMotion.createTransition(transition);
        
        // Compute the current visual state
        const computeVisualState = () => {
          // Determine which variant/state to show based on interaction hierarchy
          if (state.isTapping && whileTap) {
            return whileTap;
          }
          
          if (state.isHovering && whileHover) {
            return whileHover;
          }
          
          // Use the current animation variant
          return currentVariant;
        };
        
        const currentVisualState = computeVisualState();
        
        // Generate transform string from properties
        const generateTransform = (state) => {
          const parts = [];
          
          // Scale transform
          if (state.scale !== undefined) {
            parts.push(`scale(${state.scale})`);
          } else {
            // Handle individual scale dimensions
            const scaleX = state.scaleX !== undefined ? state.scaleX : 1;
            const scaleY = state.scaleY !== undefined ? state.scaleY : 1;
            
            if (scaleX !== 1 || scaleY !== 1) {
              parts.push(`scale(${scaleX}, ${scaleY})`);
            }
          }
          
          // Rotation transform
          if (state.rotate !== undefined) {
            parts.push(`rotate(${state.rotate}deg)`);
          }
          
          // Translation transform
          const x = state.x !== undefined ? state.x : 0;
          const y = state.y !== undefined ? state.y : 0;
          const z = state.z !== undefined ? state.z : 0;
          
          if (x !== 0 || y !== 0) {
            parts.push(`translate(${x}px, ${y}px)`);
          }
          
          if (z !== 0) {
            parts.push(`translateZ(${z}px)`);
          }
          
          return parts.length > 0 ? parts.join(' ') : undefined;
        };
        
        // Combine all styles
        const computedStyle = {
          transition: transitionObj.toString(),
          opacity: currentVisualState.opacity,
          transform: generateTransform(currentVisualState),
          ...style
        };
        
        // Event handlers for interactive states
        const interactionHandlers = {};
        
        if (whileHover) {
          interactionHandlers.onMouseEnter = (e) => {
            setState(prev => ({ ...prev, isHovering: true }));
            if (props.onMouseEnter) props.onMouseEnter(e);
          };
          
          interactionHandlers.onMouseLeave = (e) => {
            setState(prev => ({ ...prev, isHovering: false }));
            if (props.onMouseLeave) props.onMouseLeave(e);
          };
        }
        
        if (whileTap) {
          interactionHandlers.onMouseDown = (e) => {
            setState(prev => ({ ...prev, isTapping: true }));
            if (props.onMouseDown) props.onMouseDown(e);
          };
          
          interactionHandlers.onMouseUp = (e) => {
            setState(prev => ({ ...prev, isTapping: false }));
            if (props.onMouseUp) props.onMouseUp(e);
          };
          
          interactionHandlers.onTouchStart = (e) => {
            setState(prev => ({ ...prev, isTapping: true }));
            if (props.onTouchStart) props.onTouchStart(e);
          };
          
          interactionHandlers.onTouchEnd = (e) => {
            setState(prev => ({ ...prev, isTapping: false }));
            if (props.onTouchEnd) props.onTouchEnd(e);
          };
        }
        
        // Create the element with computed properties
        return React.createElement(
          elementType,
          {
            className,
            style: computedStyle,
            ...restProps,
            ...interactionHandlers
          },
          children
        );
      };
    },
    
    // Presence management
    AnimatePresence: function({ children }) {
      // Real implementation would track elements entering and exiting
      // and apply exit animations before removing
      return children;
    },
    
    // Animation orchestration for sequences and staggered animations
    sequence: function(animations, options = {}) {
      // In a real implementation, this would return a function that
      // orchestrates the sequence of animations
      return {
        start: () => Promise.resolve()
      };
    },
    
    stagger: function(duration = 0.1, options = {}) {
      return {
        delay: (index) => index * duration
      };
    }
  };
  
  // Build motion components for all HTML & SVG elements
  CraftedMotion.motion = {};
  
  // HTML Elements
  ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 
   'a', 'ul', 'ol', 'li', 'header', 'footer', 'main', 'section', 'nav'].forEach(tag => {
    CraftedMotion.motion[tag] = CraftedMotion.createComponent(tag);
  });
  
  // SVG Elements
  ['svg', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
   'g', 'defs', 'mask', 'text', 'tspan'].forEach(tag => {
    CraftedMotion.motion[tag] = CraftedMotion.createComponent(tag);
  });
  
  // Export to global scope for compatibility
  global.CraftedMotion = CraftedMotion;
  
  // Provide compatibility with Framer Motion naming conventions
  global.framerMotion = { 
    motion: CraftedMotion.motion, 
    AnimatePresence: CraftedMotion.AnimatePresence
  };
  
  // Also export as FramerMotion for UMD compatibility
  global.FramerMotion = global.framerMotion;
  
  // Initialize any global styles needed
  const setupGlobalStyles = () => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Base animation keyframes */
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-30px); }
        60% { transform: translateY(-15px); }
      }
    `;
    document.head.appendChild(styleEl);
  };
  
  // Run setup
  setupGlobalStyles();
  
})(window);