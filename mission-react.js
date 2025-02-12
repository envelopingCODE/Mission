const CyberpunkInterface = () => {
    const [status, setStatus] = React.useState('CONNECTED');
    const [threat, setThreat] = React.useState('LOW');
    const [time, setTime] = React.useState('');
    
    React.useEffect(() => {
      // Simulated system checks
      const intervals = [];
      
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
      
      // Random threat level updates
      intervals.push(setInterval(() => {
        const threats = ['LOW', 'MODERATE', 'HIGH'];
        const randomThreat = threats[Math.floor(Math.random() * threats.length)];
        setThreat(randomThreat);
      }, 5000));
      
      return () => intervals.forEach(clearInterval);
    }, []);
    
    return (
      <div className="cyber-container">
        {/* Neural Interface Header */}
        <div className="cyber-header">
          <div className="cyber-line"></div>
          <div className="header-content">
            <div className="status-indicator">
              <span className="dot"></span>
              NEURAL_LINK:{status}
            </div>
            <div className="time-display">{time}_UTC</div>
          </div>
        </div>
     
        
        {/* Scanner Effect */}
        <div className="scan-line"></div>
      </div>
    );
  };
  
  // Initialize
  const container = document.getElementById('react-mission-control');
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<CyberpunkInterface />);
  }