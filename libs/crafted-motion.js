
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
    },
    
    // Enhanced smoothing functions for more natural motion
    easeOutElastic: (x) => {
      const c4 = (2 * Math.PI) / 3;
      return x === 0 ? 0 : x === 1 ? 1 :
        Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    
    // Simulated natural deceleration like physical objects
    easeOutBack: (x) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
    
    // Bezier curve interpolation for smooth path following
    bezier: (t, p0, p1, p2, p3) => {
      const cX = 3 * (p1.x - p0.x);
      const bX = 3 * (p2.x - p1.x) - cX;
      const aX = p3.x - p0.x - cX - bX;
      
      const cY = 3 * (p1.y - p0.y);
      const bY = 3 * (p2.y - p1.y) - cY;
      const aY = p3.y - p0.y - cY - bY;
      
      const x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
      const y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
      
      return { x, y };
    },
    
    // Perlin noise-like randomness for natural variation
    smoothNoise: function(time) {
      // A simple yet effective approximation of perlin noise
      return Math.sin(time) * 0.5 + 
             Math.sin(time * 0.31) * 0.2 + 
             Math.sin(time * 1.73) * 0.1 + 
             Math.sin(time * 3.79) * 0.05;
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
      slow: { mass: 3, stiffness: 120, damping: 30 },
      // New biologically-inspired presets
      breathing: { mass: 2, stiffness: 60, damping: 15, restSpeed: 0.01 },
      organic: { mass: 1.5, stiffness: 120, damping: 14, restSpeed: 0.005 },
      lifelike: { mass: 1, stiffness: 200, damping: 22, velocity: 5, restSpeed: 0.01 }
    },
    
    // Enhanced spring simulation with better rest detection
    springSimulation: (params, dt = 1/60, iterations = 8) => {
      const { 
        fromValue, 
        toValue, 
        velocity = 0, 
        mass = 1, 
        stiffness = 100, 
        damping = 10,
        restSpeed = 0.001, // When to consider the spring at rest
        restDisplacement = 0.001 // How close to target is "at rest"
      } = params;
      
      let position = fromValue;
      let currentVelocity = velocity;
      let isAtRest = false;
      
      // Simulate over multiple tiny steps for better accuracy
      for (let i = 0; i < iterations; i++) {
        const stepDt = dt / iterations;
        
        // Spring force: -k * displacement
        const displacement = position - toValue;
        const springForce = -stiffness * displacement;
        
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
        
        // Check if we're at rest (both nearly stopped and nearly at target)
        isAtRest = Math.abs(currentVelocity) < restSpeed && 
                   Math.abs(displacement) < restDisplacement;
                   
        // If at rest, snap to final position
        if (isAtRest) {
          position = toValue;
          currentVelocity = 0;
          break;
        }
      }
      
      return {
        position,
        velocity: currentVelocity,
        isAtRest
      };
    },
    
    // Particle system for emergent motion effects
    particles: function(count = 10, options = {}) {
      const {
        gravity = 0.1,
        friction = 0.97,
        randomness = 0.3,
        lifespan = 100
      } = options;
      
      const particles = Array(count).fill().map(() => ({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * randomness * 10,
        vy: (Math.random() - 0.5) * randomness * 10 - 2, // Initial upward bias
        life: Math.random() * lifespan * 0.5 + lifespan * 0.5, // Varied lifespan
        size: Math.random() * 5 + 1,
        color: options.colorFn ? options.colorFn() : '#ffffff'
      }));
      
      // Return a simulation step function
      return {
        update: () => {
          particles.forEach(p => {
            p.vy += gravity;
            p.vx *= friction;
            p.vy *= friction;
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            // Reduce size as life decreases
            if (p.life < lifespan * 0.3) {
              p.size *= 0.98;
            }
          });
          
          return particles.filter(p => p.life > 0);
        }
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
      
      // New biomimetic easing functions
      softBounce: [0.2, 1.8, 0.3, 1],
      gentleBreathe: [0.4, 0, 0.6, 1],
      heartbeat: [0.4, 0, 0.2, 1, 0.6, 0.2, 1, 1],
      flutter: [0.12, 0, 0.39, 0, 0.68, 0.31, 0.94, 0.83],
      
      // Special effects
      spring: 'spring-physics',
      bounce: 'bounce-physics',
      elastic: 'elastic-physics',
      breathing: 'breathing-physics'
    },
    
    // Convert cubic bezier points to CSS timing function
    cssTimingFunction: function(points) {
      if (Array.isArray(points)) {
        if (points.length === 4) {
          return `cubic-bezier(${points.join(',')})`;
        } else if (points.length === 8) {
          // For multi-segment bezier, fallback to a simpler approximation
          return `cubic-bezier(${points.slice(0, 4).join(',')})`;
        }
        return 'cubic-bezier(0.4, 0, 0.2, 1)'; // Material default
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
    
    // Path morphing utilities for SVG animations
    pathUtils: {
      // Parse an SVG path into segments for morphing
      parsePath: function(path) {
        const commands = [];
        const commandRegex = /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi;
        let match;
        
        while ((match = commandRegex.exec(path))) {
          const [_, command, paramsStr] = match;
          const params = paramsStr.trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
          commands.push({ command: command.toUpperCase(), params });
        }
        
        return commands;
      },
      
      // Normalize two paths to have the same number of points
      normalizePaths: function(path1, path2) {
        const commands1 = this.parsePath(path1);
        const commands2 = this.parsePath(path2);
        
        // Simple normalization - in practice would need more complex logic
        if (commands1.length !== commands2.length) {
          console.warn('Path commands do not match for morphing');
          return { commands1, commands2 }; // Return as-is
        }
        
        return { commands1, commands2 };
      },
      
      // Interpolate between two normalized paths
      interpolatePath: function(path1, path2, progress) {
        const { commands1, commands2 } = this.normalizePaths(path1, path2);
        let result = '';
        
        // For each command pair, interpolate the parameters
        for (let i = 0; i < commands1.length; i++) {
          const cmd1 = commands1[i];
          const cmd2 = commands2[i];
          
          // Use command type from first path
          result += cmd1.command;
          
          // Interpolate parameters
          for (let j = 0; j < cmd1.params.length; j++) {
            const p1 = cmd1.params[j];
            const p2 = cmd2.params[j];
            
            // Linear interpolation
            const interpolated = p1 + (p2 - p1) * progress;
            result += j === 0 ? ' ' : ',';
            result += interpolated.toFixed(3);
          }
        }
        
        return result;
      }
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
        mass,
        // New options for more organic transitions
        randomness = 0,
        trail = 0,
        staggerChildren = 0
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
      else if (type === 'breathing') {
        // Special breathing animation
        cssTransition.timingFunction = 'cubic-bezier(0.4, 0.0, 0.2, 1)';
        cssTransition.duration = '3s';
        cssTransition.property = 'transform, opacity';
      }
      
      // Apply subtle randomness if requested
      if (randomness > 0) {
        // Add a tiny random delay for natural feel
        const randDelay = (Math.random() * 0.1 * randomness);
        cssTransition.delay = `${parseFloat(cssTransition.delay) + randDelay}s`;
      }
      
      return {
        toString: () => {
          return `${cssTransition.property} ${cssTransition.duration} ${cssTransition.timingFunction} ${cssTransition.delay}`;
        },
        getCss: () => cssTransition,
        // Additional properties for advanced animations
        staggerChildren,
        trail
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
          // New interactive states
          whileFocus,
          whileInView,
          ...restProps
        } = props;
        
        // Component state tracking
        const [state, setState] = React.useState({
          isVisible: false,
          isHovering: false,
          isTapping: false,
          isFocused: false,
          isInView: false,
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
        
        // Setup IntersectionObserver for whileInView
        React.useEffect(() => {
          if (!whileInView) return;
          
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach(entry => {
                setState(prev => ({ ...prev, isInView: entry.isIntersecting }));
              });
            },
            { threshold: 0.1 } // Trigger when 10% visible
          );
          
          // Get the DOM node after render
          const timeout = setTimeout(() => {
            const element = document.getElementById(state.animationId);
            if (element) observer.observe(element);
          }, 50);
          
          return () => {
            clearTimeout(timeout);
            observer.disconnect();
          };
        }, [whileInView]);
        
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
          
          if (state.isFocused && whileFocus) {
            return whileFocus;
          }
          
          if (state.isInView && whileInView) {
            return whileInView;
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
          
          // Skew transform
          if (state.skewX || state.skewY) {
            parts.push(`skew(${state.skewX || 0}deg, ${state.skewY || 0}deg)`);
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
        
        if (whileFocus) {
          interactionHandlers.onFocus = (e) => {
            setState(prev => ({ ...prev, isFocused: true }));
            if (props.onFocus) props.onFocus(e);
          };
          
          interactionHandlers.onBlur = (e) => {
            setState(prev => ({ ...prev, isFocused: false }));
            if (props.onBlur) props.onBlur(e);
          };
        }
        
        // Create the element with computed properties
        return React.createElement(
          elementType,
          {
            id: state.animationId,
            className,
            style: computedStyle,
            ...restProps,
            ...interactionHandlers
          },
          children
        );
      };
    },
    
    // Micro-animations system for subtle continuous movement
    microAnimations: {
      _registry: [],
      _animationFrame: null,
      
      // Register a subtle continuous animation
      register: function(element, config = {}) {
        const { 
          property = 'transform', 
          amplitude = 1, 
          frequency = 2,
          phase = 0,
          waveform = 'sine',
          baseValue = 0,
          onUpdate = null
        } = config;
        
        // Store animation data
        const animData = {
          element: typeof element === 'string' ? document.querySelector(element) : element,
          property,
          amplitude,
          frequency,
          phase,
          waveform,
          baseValue,
          onUpdate,
          startTime: performance.now() / 1000,
          lastValue: 0
        };
        
        // Add to animation registry
        if (!this._registry) this._registry = [];
        this._registry.push(animData);
        
        // Start the animation loop if not already running
        if (!this._animationFrame) {
          this._startLoop();
        }
        
        // Return control object
        return {
          update: (newConfig) => {
            Object.assign(animData, newConfig);
          },
          stop: () => {
            const idx = this._registry.indexOf(animData);
            if (idx >= 0) this._registry.splice(idx, 1);
          }
        };
      },
      
      // Wave function generator
      _computeWave: function(animData, time) {
        const t = time - animData.startTime;
        const { amplitude, frequency, phase, waveform, baseValue } = animData;
        
        let value = baseValue;
        
        switch (waveform) {
          case 'sine':
            value += amplitude * Math.sin(2 * Math.PI * frequency * t + phase);
            break;
          case 'triangle':
            const period = 1 / frequency;
            const currentTime = (t + phase / (2 * Math.PI * frequency)) % period;
            const normalizedTime = currentTime / period;
            value += amplitude * (
              normalizedTime < 0.5 
                ? 4 * normalizedTime - 1 
                : 3 - 4 * normalizedTime
            );
            break;
          case 'breathing':
            // Asymmetrical wave that mimics breathing
            const breathCycle = (t * frequency) % 1;
            const inhale = breathCycle < 0.4; // Inhale is faster than exhale
            value += amplitude * (
              inhale
                ? Math.sin(breathCycle * Math.PI / 0.4) * 0.8
                : Math.sin((0.4 + 0.6 * (breathCycle - 0.4) / 0.6) * Math.PI) * 0.8
            );
            break;
        }
        
        return value;
      },
      
      // Main animation loop
      _startLoop: function() {
        const updateAnimations = (time) => {
          time = time / 1000; // Convert to seconds
          
          // Update all registered animations
          this._registry.forEach(animData => {
            if (!animData.element && !animData.onUpdate) return;
            
            const newValue = this._computeWave(animData, time);
            
            // Only update if value changed enough (optimization)
            if (Math.abs(newValue - animData.lastValue) > 0.001) {
              animData.lastValue = newValue;
              
              // If custom update function is provided, use it
              if (typeof animData.onUpdate === 'function') {
                animData.onUpdate(newValue);
                return;
              }
              
              if (animData.property === 'transform') {
                // Handle transform properties
                const transforms = [];
                
                // Get existing transform
                const computedStyle = window.getComputedStyle(animData.element);
                const existingTransform = computedStyle.transform;
                if (existingTransform && existingTransform !== 'none') {
                  transforms.push(existingTransform);
                }
                
                // Apply animation transform
                transforms.push(`scale(${1 + newValue / 100})`);
                
                // Apply combined transform
                animData.element.style.transform = transforms.join(' ');
              } else {
                // Direct property
                animData.element.style[animData.property] = newValue;
              }
            }
          });
          
          // Continue loop if we have animations
          if (this._registry && this._registry.length > 0) {
            this._animationFrame = requestAnimationFrame(updateAnimations);
          } else {
            this._animationFrame = null;
          }
        };
        
        this._animationFrame = requestAnimationFrame(updateAnimations);
      }
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
    },
    
    // Timeline system for orchestrating animations
    timeline: function(config = {}) {
      const { duration = 1, ease = 'easeInOut', stagger = 0 } = config;
      const sequence = [];
      let totalDuration = 0;
      
      return {
        // Add animation to timeline
        add: function(target, props, timeConfig = {}) {
          const { at = totalDuration, duration: segmentDuration = duration } = timeConfig;
          
          sequence.push({
            target,
            props,
            at: at,
            duration: segmentDuration,
            ease: timeConfig.ease || ease
          });
          
          // Update total duration for default sequencing
          const endTime = at + segmentDuration;
          if (endTime > totalDuration) {
            totalDuration = endTime;
          }
          
          return this;
        },
        
        // Chain multiple targets with staggered timing
        stagger: function(targets, props, timeConfig = {}) {
          const { each = stagger } = timeConfig;
          
          targets.forEach((target, i) => {
            this.add(target, props, {
              ...timeConfig,
              at: (timeConfig.at || totalDuration) + (i * each)
            });
          });
          
          return this;
        },
        
        // Play the timeline
        play: function() {
          let completed = 0;
          
          return new Promise(resolve => {
            sequence.forEach(item => {
              // Create animation
              const { target, props, at, duration, ease } = item;
              
              // If target is a string, find DOM element
              const element = typeof target === 'string' 
                ? document.querySelector(target) 
                : target;
                
              if (!element) return;
              
              // Apply animation with delay
              setTimeout(() => {
                // Convert props for CSS animation
                const cssProps = {};
                
                // Handle special properties
                if (props.d) {
                  // SVG path
                  element.setAttribute('d', props.d);
                }
                
                Object.entries(props).forEach(([key, value]) => {
                  if (key === 'x' || key === 'y' || key === 'scale' || key === 'rotate') {
                    // Handle transform properties
                    const transforms = [];
                    if (props.x !== undefined || props.y !== undefined) {
                      transforms.push(`translate(${props.x || 0}px, ${props.y || 0}px)`);
                    }
                    if (props.scale !== undefined) {
                      transforms.push(`scale(${props.scale})`);
                    }
                    if (props.rotate !== undefined) {
                      transforms.push(`rotate(${props.rotate}deg)`);
                    }
                    element.style.transform = transforms.join(' ');
                  } else if (key === 'r') {
                    // SVG circle radius
                    element.setAttribute('r', value);
                  } else if (key !== 'd') {
                    // Direct CSS properties (excluding already handled ones)
                    cssProps[key] = value;
                  }
                });
                
                // Apply transitions
                const easing = CraftedMotion.cssTimingFunction(
                  CraftedMotion.EASING[ease] || CraftedMotion.EASING.easeInOut
                );
                element.style.transition = `all ${duration}s ${easing}`;
                
                // Apply CSS properties
                Object.assign(element.style, cssProps);
                
                // Track completion
                setTimeout(() => {
                  completed++;
                  if (completed === sequence.length) {
                    resolve();
                  }
                }, duration * 1000);
              }, at * 1000);
            });
          });
        }
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
      
      /* New advanced animation keyframes */
      @keyframes breathing {
        0%, 100% { transform: scale(1); }
        40% { transform: scale(1.012); }
        80% { transform: scale(0.995); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes subtle-glow {
        0%, 100% { filter: brightness(1) drop-shadow(0 0 3px rgba(0, 255, 255, 0.5)); }
        50% { filter: brightness(1.1) drop-shadow(0 0 5px rgba(0, 255, 255, 0.7)); }
      }
      
      @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.1); }
        35% { transform: scale(1); }
        50% { transform: scale(1.1); }
        75% { transform: scale(1); }
      }
    `;
    document.head.appendChild(styleEl);
  };
  
  // Run setup
  setupGlobalStyles();
  
})(window);