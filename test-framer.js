console.log("Global variables check:");
console.log("window.framerMotion:", window.framerMotion);
console.log("window.FramerMotion:", window.FramerMotion);
console.log("window.motion:", window.motion);
// See what other properties might exist
for (let prop in window) {
  if (prop.toLowerCase().includes('framer') || prop.toLowerCase().includes('motion')) {
    console.log(`Found: window.${prop}`);
  }
}


// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Get a test container
    const testContainer = document.createElement('div');
    testContainer.id = 'framer-test';
    testContainer.style.position = 'fixed';
    testContainer.style.top = '10px';
    testContainer.style.right = '10px';
    testContainer.style.zIndex = '9999';
    document.body.appendChild(testContainer);
    
    // Try to render a simple animation if motion is available
    try {
      const testMotion = window.framerMotion || window.FramerMotion;
      if (testMotion && testMotion.motion) {
        const TestComponent = () => {
          return React.createElement(
            testMotion.motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              style: { padding: '10px', background: 'green', color: 'white' }
            },
            "Framer Motion Working!"
          );
        };
        
        ReactDOM.createRoot(testContainer).render(React.createElement(TestComponent));
        console.log("Test component rendered successfully");
      } else {
        console.error("Could not detect Framer Motion for test");
      }
    } catch (e) {
      console.error("Error testing Framer Motion:", e);
    }
  });