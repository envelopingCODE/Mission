// =============================================
// #1: GLOBAL VARIABLES AND INITIALIZATION
// =============================================
let xpSelectorRoot = null;

// =============================================
// #2: HELPER FUNCTIONS
// =============================================
function closeXPSelector() {
  const mountPoint = document.getElementById('xp-selector-mount');
  const backdrop = document.getElementById('xp-selector-backdrop');
  
  if (backdrop) {
    backdrop.remove();
  }
  
  if (mountPoint) {
    mountPoint.style.display = 'none';
    if (xpSelectorRoot) {
      xpSelectorRoot.unmount();
      xpSelectorRoot = null;
    }
  }
}

function showXPSelector(onXPSelect) {
  const mountPoint = document.getElementById('xp-selector-mount');
  if (!mountPoint) return;

  let backdrop = document.getElementById('xp-selector-backdrop');
  
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'xp-selector-backdrop';
    mountPoint.parentNode.insertBefore(backdrop, mountPoint.nextSibling);
  }

  requestAnimationFrame(() => {
    mountPoint.style.display = 'flex';
  });

  if (!xpSelectorRoot) {
    xpSelectorRoot = ReactDOM.createRoot(mountPoint);
  }

  xpSelectorRoot.render(
    React.createElement(XPSelector, {
      onXPSelect: (xp) => {
        onXPSelect(xp);
        closeXPSelector();
      },
      onCancel: closeXPSelector
    })
  );
}

// Make it available globally
window.showXPSelector = showXPSelector;

// =============================================
// #3: COMPONENT DEFINITION AND STATE SETUP
// =============================================
const XPSelector = ({ onXPSelect, onCancel }) => {
  const [sliderValue, setSliderValue] = React.useState(20);
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [autoConfirmTimer, setAutoConfirmTimer] = React.useState(null);
  const containerRef = React.useRef(null);
  
  // Predefined XP values for the selector
  const xpValues = [
    { value: 10, label: 'Easy' },
    { value: 15, label: 'Medium-Easy' },
    { value: 20, label: 'Normal' },
    { value: 25, label: 'Hard' },
    { value: 30, label: 'Very Hard' },
    { value: -1, label: 'Custom' }
  ];

  // =============================================
  // #4: TIMER AND AUTO-CONFIRMATION LOGIC
  // =============================================
  React.useEffect(() => {
    return () => {
      if (autoConfirmTimer) {
        clearTimeout(autoConfirmTimer);
      }
    };
  }, [autoConfirmTimer]);

  const startAutoConfirmTimer = (value) => {
    if (autoConfirmTimer) {
      clearTimeout(autoConfirmTimer);
    }
    
    const timer = setTimeout(() => {
      if (!showCustomInput) {
        onXPSelect(value);
      }
    }, 1200);
    
    setAutoConfirmTimer(timer);
  };

  // =============================================
  // #5: KEYBOARD INTERACTION HANDLERS
  // =============================================
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        if (showCustomInput) {
          const customInput = document.querySelector('.xp-custom-input');
          if (customInput && customInput.value) {
            const customXP = parseInt(customInput.value);
            if (!isNaN(customXP) && customXP > 0) {
              onXPSelect(customXP);
            }
          }
        } else {
          onXPSelect(sliderValue);
        }
      } else if (e.key === 'Escape') {
        if (autoConfirmTimer) {
          clearTimeout(autoConfirmTimer);
        }
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sliderValue, showCustomInput, autoConfirmTimer, onXPSelect, onCancel]);

  // =============================================
  // #6: MOUSE AND TOUCH INTERACTION HANDLERS
  // =============================================
  React.useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (showCustomInput) return;
      
      const direction = e.deltaY > 0 ? -1 : 1;
      const currentIndex = xpValues.findIndex(v => v.value === sliderValue);
      let newIndex = currentIndex;

      if (direction > 0 && currentIndex < xpValues.length - 2) {
        newIndex = currentIndex + 1;
      } else if (direction < 0 && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }

      const newValue = xpValues[newIndex].value;
      setSliderValue(newValue);
      updateSliderPosition(newValue);
      startAutoConfirmTimer(newValue);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [sliderValue, showCustomInput]);

  // =============================================
  // #7: UI UPDATE HANDLERS
  // =============================================
  const updateSliderPosition = (value) => {
    const slider = document.querySelector('.xp-range');
    if (slider) {
      slider.value = value;
    }
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    if (value === -1) {
      setShowCustomInput(true);
      if (autoConfirmTimer) {
        clearTimeout(autoConfirmTimer);
      }
    } else {
      setShowCustomInput(false);
      startAutoConfirmTimer(value);
    }
    setSliderValue(value);
  };

  const handleCustomInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      startAutoConfirmTimer(value);
    } else {
      if (autoConfirmTimer) {
        clearTimeout(autoConfirmTimer);
      }
    }
  };

  // =============================================
  // #8: MEMOIZED XP LABELS
  // =============================================
  const xpLabels = React.useMemo(() => 
    xpValues.map(({ value, label }) =>
      React.createElement('div', {
        key: value,
        className: `xp-label ${value === sliderValue ? 'selected' : ''}`,
        style: {
          textAlign: 'center',
          minWidth: '100px',
          padding: '12px 8px',
          transition: 'all 0.3s ease',
          transform: value === sliderValue ? 'scale(1.05)' : 'scale(1)',
          color: value === sliderValue ? '#22d3ee' : '#9ca3af',
          cursor: 'pointer',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          position: 'relative'
        }
      }, [
        React.createElement('span', {
          key: 'value',
          style: {
            display: 'block',
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '8px',
            lineHeight: '1.2'
          }
        }, value === -1 ? '⚡' : value),
        React.createElement('span', {
          key: 'label',
          style: {
            display: 'block',
            fontSize: '14px',
            opacity: '0.8',
            whiteSpace: 'nowrap',
            lineHeight: '1.4'
          }
        }, label)
      ])
    ), [sliderValue]
  );

  // =============================================
  // #9: COMPONENT RENDER
  // =============================================
  return React.createElement('div', {
    ref: containerRef,
    className: 'xp-selector',
    style: {
      width: '100%',
      maxWidth: '500px',
      padding: '20px 16px',
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      borderRadius: '12px',
      border: '1px solid rgb(55, 65, 81)',
      zIndex: 1001,
      margin: '0 auto',
      position: 'relative',
      overflowX: 'hidden'
    }
  }, [
    React.createElement('div', {
      key: 'slider-container',
      className: 'slider-container',
      style: { 
        marginBottom: '28px',
        padding: '0 12px'
      }
    }, [
      React.createElement('input', {
        key: 'range',
        type: 'range',
        className: 'xp-range',
        min: '10',
        max: '30',
        step: '5',
        value: sliderValue,
        onChange: handleSliderChange,
        style: {
          width: '100%',
          marginBottom: '24px',
          height: '8px'
        }
      })
    ]),
    React.createElement('div', {
      key: 'labels',
      className: 'xp-labels',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '12px',
        padding: '0 8px',
        marginBottom: '20px'
      }
    }, xpLabels),
    showCustomInput && React.createElement('div', {
      key: 'custom-input',
      style: { 
        marginTop: '20px',
        padding: '0 12px'
      }
    }, [
      React.createElement('input', {
        type: 'number',
        className: 'xp-custom-input',
        placeholder: 'Enter custom XP value',
        min: '1',
        autoFocus: true,
        onChange: handleCustomInputChange,
        style: {
          width: '100%',
          padding: '12px',
          backgroundColor: 'rgb(31, 41, 55)',
          border: '1px solid rgb(75, 85, 99)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '16px',
          appearance: 'none'
        }
      })
    ]),
    React.createElement('div', {
      key: 'status',
      style: {
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '14px',
        color: 'rgb(156, 163, 175)',
        padding: '0 16px'
      }
    }, autoConfirmTimer ? 'Auto-confirming in 1s...' : 'Tap or drag to select • Tap Enter to confirm')
  ]);
};

// =============================================
// #10: INITIALIZATION AND STYLE INJECTION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  let mountPoint = document.getElementById('xp-selector-mount');
  if (!mountPoint) {
    mountPoint = document.createElement('div');
    mountPoint.id = 'xp-selector-mount';
    mountPoint.style.display = 'none';
    document.getElementById('react-mission-control').insertAdjacentElement('afterend', mountPoint);
  }

  if (!document.getElementById('xp-selector-styles')) {
    const selectorStyles = document.createElement('style');
    selectorStyles.id = 'xp-selector-styles';
    selectorStyles.textContent = `
      #xp-selector-mount {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1001;
      }

      #xp-selector-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      #xp-selector-mount[style*="display: flex"] + #xp-selector-backdrop {
        opacity: 1;
        pointer-events: auto;
      }

      .xp-range {
        -webkit-appearance: none;
        appearance: none;
        height: 8px;
        background: rgb(55, 65, 81);
        border-radius: 4px;
        outline: none;
        margin: 10px 0;
      }

      .xp-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        background: #22d3ee;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s;
        border: 2px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .xp-range::-moz-range-thumb {
        width: 24px;
        height: 24px;
        background: #22d3ee;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s;
        border: 2px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      @media screen and (max-width: 600px) {
        .xp-selector {
          width: 90%;
          padding: 16px;
          margin: 10px;
        }

        .xp-range {
          height: 10px;
        }

        .xp-range::-webkit-slider-thumb {
          width: 28px;
          height: 28px;
        }

        .xp-range::-moz-range-thumb {
          width: 28px;
          height: 28px;
        }

        .xp-labels {
          gap: 8px;
        }

        .xp-label {
          padding: 10px 6px;
        }

        .xp-custom-input {
          font-size: 16px;
          padding: 12px;
        }
      }
    `;
    document.head.appendChild(selectorStyles);
  }
});