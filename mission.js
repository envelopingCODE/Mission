"use strict"; // Strict mode helps catch common coding errors and "unsafe" actions


const inputEl = document.getElementById("addMission"); // Get the input element for mission names
const missionButtonEl = document.getElementById("addMissionButton"); // Get the button to add missions
const missionListEl = document.getElementById('missionList'); // Get the list where missions will be displayed
const resetButtonEl = document.getElementById('resetButton'); // Get the reset button element
const errorMessageEl = document.getElementById('errorMessage'); // Get the element for displaying error messages
const xpMeterEl = document.getElementById('xp-meter'); // Get the element for the XP meter
const streakBonusEl = document.getElementById('streak-bonus'); // Get the element for displaying streak bonus
const completionSound = document.getElementById('completionSound'); // Get the sound element for mission completion
const levelUpSound = document.getElementById('levelUpSound') // Get the sound element for level up
const addMissionSound = document.getElementById('addMissionSound') // Get the sound element for adding missions
const initializingSound = document.getElementById('initializingSound') // Get the sound element for initializing
const mediaQuery = window.matchMedia('(max-width: 600px)');

let xpSelectorCallback = null;

// Add this to your mission.js file
window.addEventListener('error', function(e) {
    console.error('Script error:', e);
});

// let currentStreak = 0; // Variable to track the current streak of completed missions

missionButtonEl.disabled = true; // Initially disable the mission button until input is valid

function minimumInput() {
    const input = inputEl.value // Get the current value from the input field
    const sanitizedInput = sanitizeInput(input); // Sanitize the input to remove any HTML tags

    if (sanitizedInput.length > 3) { // Check if the sanitized input length is more than 3 characters
        errorMessageEl.textContent = " "; // Clear any error message
        missionButtonEl.disabled = false; // Enable the mission button
    } else {
        errorMessageEl.textContent = "Your mission name has to be 3 characters long . . "; // Show error message
        missionButtonEl.disabled = true; // Disable the mission button
    }
}


// Event listeners 

missionButtonEl.addEventListener('mousedown', function(){
    const input = inputEl.value; // Get the value from the input field
    const sanitizedInput = sanitizeInput(input); // Sanitize the input
    addMission(sanitizedInput); // Add the mission with the sanitized input
});

inputEl.addEventListener('keypress', e => { 
    if (e.key === 'Enter') { // Check if the Enter key is pressed
        const input = inputEl.value; // Get the value from the input field
        const sanitizedInput = sanitizeInput(input); // Sanitize the input
        addMission(sanitizedInput); // Add the mission with the sanitized input
    }
});

xpMeterEl.addEventListener('click', clearXP);





missionButtonEl.addEventListener('mouseup', clearTextField); // Clear the text field when the button is released
resetButtonEl.addEventListener('click', clearData); // Clear all data when the reset button is clicked
inputEl.addEventListener('keyup', minimumInput); // Check the input length after every key press
document.addEventListener('DOMContentLoaded', loadMissions); // Load missions when the document is ready


function sanitizeInput(input) {
    return input.trim().replace(/<[^>]*>?/gm, ''); // Trim and sanitize input
}

const motivationalMessages = [  
    "Great Job! 🎉", "Way to go! 👍", "You deserve a small break soon! ☕", 
    "Excellent! 🌟", "You'll be done in no time! ⏳", "Success! 🏆", 
    "You're unstoppable! 🚀", "Yay! 🎊", "Keep up the great work! 💪", 
    "You're doing amazing! 🌈", "Almost there, keep pushing! 💪", 
    "Fantastic effort! 👏", "You're on the right track! 🛤️", 
    "Stay focused, you're doing great! 🧠", "Believe in yourself! 🌠", 
    "You're capable of amazing things! 🏅", "Keep the momentum going! 🔄", 
    "You're making a difference! 🌍", "One step at a time! 👣", 
    "Stay positive and keep going! 😊", "You got this! ✊"
]; // List of motivational messages to display

function displayRandomMessage() {
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]; // Select a random message
    const messageElement = document.createElement("div"); // Create a new div element
    messageElement.textContent = randomMessage; // Set the text content of the div to the random message
    messageElement.classList.add("motivational-message"); // Add a class to the div for styling

    document.body.appendChild(messageElement); // Add the div to the body

    setTimeout(() => {
        messageElement.remove(); // Remove the div after 3 seconds
    }, 3000);
}


// Function to smoothly scroll to the XP meter
function scrollToXPMeter() {
    const xpMeterEl = document.getElementById('xp-meter');
    xpMeterEl.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
    });
}

// Modify the mission click event listener in the loadMissions and addMission functions
function createMissionClickHandler(element) {
    element.addEventListener('click', function(e) {
        const xp = parseInt(e.target.dataset.xp);
        addXp(xp);
        e.target.remove();
        saveMissions();
        displayRandomMessage();
        playCompletionSound();
        scrollToXPMeter(); // Add scroll to XP meter when mission is completed
    });
}

// Adding the mission to the list

function addMission(sanitizedInput) {
    const modifiedMission = TaskSystem.modifyMissionText(sanitizedInput);
    const prefix = modifiedMission.match(/^(\d+\.)/)?.[0];
    const prefixClass = TaskSystem.getClassForPrefix(prefix);
 

    if (mediaQuery.matches) {
        typeAdditionalMessage(2);
    }

    // Create a callback function to handle XP selection
    
    xpSelectorCallback = (xpValue) => {
        const newEl = document.createElement("li");
        newEl.innerHTML = `<span class="${prefixClass}">${modifiedMission.split(':')[0]}:</span> ${modifiedMission.split(':')[1]} — ${xpValue} XP`;
        newEl.className = "mission";
        newEl.dataset.xp = xpValue;

          
        // Add drag attributes
        newEl.draggable = true;
        newEl.addEventListener('dragstart', handleDragStart);
        newEl.addEventListener('dragend', handleDragEnd);
        newEl.addEventListener('dragover', handleDragOver);
        newEl.addEventListener('drop', handleDrop);

        // Add touch events for mobile support
        newEl.addEventListener('touchstart', handleTouchStart);
        newEl.addEventListener('touchmove', handleTouchMove);
        newEl.addEventListener('touchend', handleTouchEnd);
                
            
        // Use the new click handler function
        createMissionClickHandler(newEl);

        missionListEl.appendChild(newEl);


        // Play the sound after XP is selected and mission is added
        playAddMissionSound();


        setTimeout(() => {
            newEl.classList.add("active");
            saveMissions();
        }, 10);
    };

    // Show the XP selector
    const mountPoint = document.getElementById('xp-selector-mount');
    if (mountPoint) {
        mountPoint.style.display = 'flex';
        const backdrop = document.createElement('div');
        backdrop.id = 'xp-selector-backdrop';
        document.body.appendChild(backdrop);
    }

    // Call the showXPSelector function from your React component
    if (typeof window.showXPSelector === 'function') {
        window.showXPSelector(xpSelectorCallback);
    } else {
        console.error('XP Selector not initialized');
    }
}

// Add this function to handle closing the XP selector
function closeXPSelector() {
    const mountPoint = document.getElementById('xp-selector-mount');
    const backdrop = document.getElementById('xp-selector-backdrop');
    
    if (backdrop) {
        backdrop.remove();
    }
    
    if (mountPoint) {
        mountPoint.style.display = 'none';
    }

}

const TaskSystem = {
    taskFrequency: new Map(),
    categories: {
      "1.": {
        prefix: "1.",
        title: "Secure Funding",
        description: "Financial and resource acquisition tasks",
        color: "rgba(26, 228, 46, 0.835)",
        weight: 700,
        defaultTasks: [
          "1. Do SoME marketing",
          "1. Obtain new Client",
          "1. Prevent loss of assets"
        ]
      },
      "2.": {
        prefix: "2.",
        title: "Graduate",
        description: "Academic and educational goals",
        color: "rgba(20, 255, 208, 0.835)",
        weight: 600,
        defaultTasks: [
          "2. Study for one unit",
          "2. Code for one unit",
          "2. Complete paper"
        ]
      },
      "3.": {
        prefix: "3.",
        title: "Optimal State",
        description: "Personal wellness and optimization",
        color: "rgba(26, 211, 228, 0.892)",
        weight: 600,
        defaultTasks: [
          "3. Morning meditation",
          "3. TRX",
          "3. Journal"
        ]
      }
    },
    fadeTimeout: null,
    cycleTimeout: null,
  
    init() {
      try {
        const saved = localStorage.getItem('taskFrequency');
        if (saved) {
          this.taskFrequency = new Map(JSON.parse(saved));
        }
      } catch (e) {
        console.warn('Neural memory retrieval failed:', e);
      }
  
      const input = document.getElementById('addMission');
      if (!input) return;
  
      // Initialize with default tasks if no history exists
      if (this.taskFrequency.size === 0) {
        Object.values(this.categories).forEach(category => {
          category.defaultTasks.forEach(task => this.recordTask(task));
        });
      }
  
      let currentSuggestionIndex = 0;
      let currentSuggestions = this.getMostFrequentTasks();
  
      const updatePlaceholder = (suggestions, instant = false) => {
        if (!suggestions?.length) return;
        
        clearTimeout(this.fadeTimeout);
        clearTimeout(this.cycleTimeout);
        
        const doUpdate = () => {
          const suggestion = suggestions[currentSuggestionIndex];
          input.placeholder = suggestion;
          input.style.opacity = '1';
          
          currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
          this.cycleTimeout = setTimeout(() => {
            updatePlaceholder(suggestions);
          }, 3000);
        };
  
        if (instant) {
          doUpdate();
        } else {
          input.style.opacity = '0.6';
          this.fadeTimeout = setTimeout(doUpdate, 300);
        }
      };
  
      // Initialize suggestions immediately
      updatePlaceholder(currentSuggestions, true);
  // Inside TaskSystem.init()
input.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value) {
        if (value.match(/^[123]\.$/)) {
            // Show category-specific suggestions when user types a prefix
            const suggestions = this.getSuggestionsForPrefix(value);
            if (suggestions.length) {
                currentSuggestions = suggestions;
                currentSuggestionIndex = 0;
                input.classList.add('cycling-placeholder');
                updatePlaceholder(suggestions, true);
            }
        } else {
            const suggestions = this.getSuggestionsForPrefix(value);
            if (suggestions.length) {
                currentSuggestions = suggestions;
                currentSuggestionIndex = 0;
                updatePlaceholder(suggestions, true);
            }
        }
    } else {
        currentSuggestions = this.getMostFrequentTasks();
        currentSuggestionIndex = 0;
        updatePlaceholder(currentSuggestions);
    }
});

// Add tab completion
input.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey && currentSuggestions.length > 0) {
        e.preventDefault();
        input.value = currentSuggestions[currentSuggestionIndex];
        currentSuggestionIndex = (currentSuggestionIndex + 1) % currentSuggestions.length;
        input.classList.add('cycling-placeholder');
    }
});

// Add wheel scrolling
input.addEventListener('wheel', (e) => {
    if (currentSuggestions.length > 0) {
        e.preventDefault();
        currentSuggestionIndex = (currentSuggestionIndex + (e.deltaY > 0 ? 1 : -1) + currentSuggestions.length) % currentSuggestions.length;
        input.placeholder = currentSuggestions[currentSuggestionIndex];
        input.classList.add('cycling-placeholder');
    }
});
  

// Add this inside TaskSystem.init() after the existing input event listeners
input.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (currentSuggestions.length > 0) {
        currentSuggestionIndex = (currentSuggestionIndex + (e.deltaY > 0 ? 1 : -1) + currentSuggestions.length) % currentSuggestions.length;
        input.placeholder = currentSuggestions[currentSuggestionIndex];
        input.classList.add('cycling-placeholder');
    }
});

// Add adaptive learning rate based on user interaction patterns
let learningRate = 1;
const updateLearningRate = (task) => {
    const categoryPrefix = task.match(/^(\d+\.)/)?.[0];
    if (categoryPrefix) {
        const existingTasks = this.getSuggestionsForPrefix(categoryPrefix);
        learningRate = Math.min(2, 1 + (existingTasks.length * 0.1));
    }
};


      // Generate styles for categories
      this.updateCategoryStyles();
    },
  
    updateCategoryStyles() {
      let styleSheet = document.getElementById('category-styles');
      if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'category-styles';
        document.head.appendChild(styleSheet);
      }
  
      const styles = Object.entries(this.categories).map(([prefix, config]) => `
        .prefix-${prefix.replace('.', '')} {
          color: ${config.color};
          font-weight: ${config.weight};
        }
        
        .prefix-${prefix.replace('.', '')}:hover::after {
          content: '${config.description}';
          background-color: #33333346;
          color: white;
          padding: 14px;
          position: absolute;
          z-index: 100;
          left: 110%;
          top: 50%;
          transform: translateY(-47%);
          border-radius: 5px;
          white-space: nowrap;
          font-family: 'Courier New', Courier, monospace;
        }
      `).join('\n');
  
      styleSheet.textContent = styles;
    },
  
    getSuggestionsForPrefix(prefix) {
      prefix = prefix.toLowerCase();
      return Array.from(this.taskFrequency.entries())
        .filter(([task]) => task.toLowerCase().startsWith(prefix))
        .sort((a, b) => b[1] - a[1])
        .map(([task]) => task);
    },
  
    getMostFrequentTasks() {
      return Array.from(this.taskFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([task]) => task);
    },
  
    recordTask(task) {
      if (!task) return;
      const frequency = (this.taskFrequency.get(task) || 0) + 1;
      this.taskFrequency.set(task, frequency);
      
      try {
        localStorage.setItem('taskFrequency', 
          JSON.stringify(Array.from(this.taskFrequency.entries()))
        );
      } catch (e) {
        console.warn('Neural memory storage failed:', e);
      }
    },
  
    getClassForPrefix(prefix) {
      if (this.categories[prefix]) {
        return `prefix-${prefix.replace('.', '')}`;
      }
      return 'prefix-default';
    },
  
    modifyMissionText(input) {
      const prefix = input.match(/^(\d+\.)/)?.[0];
      if (prefix && this.categories[prefix]) {
        const category = this.categories[prefix];
        return input.replace(prefix, `${prefix} ${category.title}: `);
      }
      return input;
    },
  
    // Method to add new categories dynamically
    addCategory(prefix, config) {
      if (this.categories[prefix]) {
        console.warn(`Category ${prefix} already exists. Updating configuration...`);
      }
      this.categories[prefix] = {
        prefix,
        ...config
      };
      
      this.updateCategoryStyles();
    }
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    TaskSystem.init();
    loadMissions();
    const initialSuggestions = TaskSystem.getMostFrequentTasks();
    if (initialSuggestions.length) {
        inputEl.placeholder = initialSuggestions[0];
    }
});



  // Add this after your existing event listeners
inputEl.addEventListener('focus', () => {
    // Reset placeholder cycling when input is focused
    const suggestions = TaskSystem.getMostFrequentTasks();
    if (suggestions.length) {
        inputEl.placeholder = suggestions[0];
        inputEl.classList.add('cycling-placeholder');
    }
});

inputEl.addEventListener('blur', () => {
    inputEl.classList.remove('cycling-placeholder');
});

// Enhanced input handling for prefix suggestions
inputEl.addEventListener('input', (e) => {
    const value = e.target.value;
    if (value.match(/^[123]\.$/)) {
        // Show category-specific suggestions when user types a prefix
        const suggestions = TaskSystem.getSuggestionsForPrefix(value);
        if (suggestions.length) {
            inputEl.placeholder = suggestions[0];
        }
    }
});



// Lock in timer




// Click dragging functionality


// Drag and Drop event handlers
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = e.target;
    e.target.classList.add('dragging');
    
    // Set ghost drag image
    const ghost = e.target.cloneNode(true);
    ghost.style.opacity = '0.5';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    const targetItem = e.target.closest('li');
    
    if (!targetItem || !draggedItem || targetItem === draggedItem) return;

    const boundingRect = targetItem.getBoundingClientRect();
    const draggedRect = draggedItem.getBoundingClientRect();
    
    if (e.clientY < boundingRect.top + boundingRect.height / 2) {
        targetItem.parentNode.insertBefore(draggedItem, targetItem);
    } else {
        targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
    }
    
    saveMissions();
}

function handleDrop(e) {
    e.preventDefault();
    saveMissions();
}

let touchDraggedItem = null;
let touchStartY = 0;

function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchDraggedItem = e.target.closest('li');
    if (touchDraggedItem) {
        touchDraggedItem.classList.add('dragging');
    }
}



// Track previous priority mission
let previousPriorityMission = null;

function handleDragOver(e) {
    e.preventDefault();
    const targetItem = e.target.closest('li');
    
    if (!targetItem || !draggedItem || targetItem === draggedItem) return;

    const boundingRect = targetItem.getBoundingClientRect();
    
    if (e.clientY < boundingRect.top + boundingRect.height / 2) {
        targetItem.parentNode.insertBefore(draggedItem, targetItem);
    } else {
        targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
    }
    
    // Check if priority mission changed
    const currentPriorityMission = missionListEl.firstElementChild;
    if (currentPriorityMission !== previousPriorityMission) {
        // Remove priority class from previous
        if (previousPriorityMission) {
            previousPriorityMission.classList.remove('becoming-priority');
        }
        // Add priority class to new top mission
        currentPriorityMission.classList.add('becoming-priority');
        // Play priority change sound
        playPriorityChangeSound();
        
        previousPriorityMission = currentPriorityMission;
    }
    
    saveMissions();
}

// Add a subtle sound effect for priority changes
function playPriorityChangeSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Initialize the priority system when loading missions
function initializePrioritySystem() {
    const firstMission = missionListEl.firstElementChild;
    if (firstMission) {
        previousPriorityMission = firstMission;
        firstMission.classList.add('becoming-priority');
    }
}

// Touch dragging functionality

function handleTouchMove(e) {
    e.preventDefault();
    if (!touchDraggedItem) return;

    const touch = e.touches[0];
    const currentY = touch.clientY;
    
    // Get all mission items
    const items = Array.from(document.querySelectorAll('.mission'));
    const draggedIndex = items.indexOf(touchDraggedItem);
    
    items.forEach((item, index) => {
        if (item === touchDraggedItem) return;
        
        const rect = item.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        
        if (currentY < centerY && index < draggedIndex) {
            item.parentNode.insertBefore(touchDraggedItem, item);
        } else if (currentY > centerY && index > draggedIndex) {
            item.parentNode.insertBefore(touchDraggedItem, item.nextSibling);
        }
    });
}

function handleTouchEnd(e) {
    if (!touchDraggedItem) return;
    
    touchDraggedItem.classList.remove('dragging');
    touchDraggedItem = null;
    saveMissions();
}


function saveMissions() {
    const missionsEl = document.getElementsByClassName("mission"); // Get all elements with the 'mission' class
    const missionsData = Array.from(missionsEl).map(missionEl => {
        const prefixClass = missionEl.querySelector('span').className; // Get the prefix class from the <span>
        const missionText = missionEl.textContent.split(' — ')[0]; // Get the mission text before the XP
        const xp = missionEl.dataset.xp; // Get the XP value from the data attribute

        return {
            text: missionText,
            prefixClass: prefixClass,
            xp: xp
        };
    });

    localStorage.setItem("missions", JSON.stringify(missionsData)); // Save the structured data to localStorage
}

function loadMissions() {
    let missions = JSON.parse(localStorage.getItem("missions")); // Get the saved missions from localStorage

    if (missions) { // If there are saved missions
        missions.forEach(mission => {
            const newEl = document.createElement("li"); // Create a new list item element

            // Create the span with the prefix class
            const prefixSpan = document.createElement("span");
            prefixSpan.className = mission.prefixClass; // Apply the saved prefix class
            prefixSpan.textContent = mission.text.split(':')[0] + ':';

            const missionText = document.createTextNode(' ' + mission.text.split(':')[1] + ' — ' + mission.xp + ' XP');

            // Append the prefix and mission text
            newEl.appendChild(prefixSpan);
            newEl.appendChild(missionText);
            newEl.className = "mission";
            newEl.dataset.xp = mission.xp;

            // Add drag functionality
            newEl.draggable = true;
            newEl.addEventListener('dragstart', handleDragStart);
            newEl.addEventListener('dragend', handleDragEnd);
            newEl.addEventListener('dragover', handleDragOver);
            newEl.addEventListener('drop', handleDrop);

            // Add touch events for mobile support
            newEl.addEventListener('touchstart', handleTouchStart);
            newEl.addEventListener('touchmove', handleTouchMove);
            newEl.addEventListener('touchend', handleTouchEnd);

            // Use the new click handler function
            createMissionClickHandler(newEl);

            missionListEl.appendChild(newEl);

            setTimeout(() => {
                newEl.classList.add("active");
            }, 10);
        });
    }

       
   
    // Load current XP, level, and high score from localStorage
    let currentXp = parseInt(localStorage.getItem("currentXp")) || 0;
    let currentLevel = parseInt(localStorage.getItem("currentLevel")) || 1;
    let highScore = parseInt(localStorage.getItem("highScore")) || 0;

// Update XP meter to show progress within the current level
xpMeterEl.dataset.xp = currentXp;
updateXpMeter(currentXp); // Update the XP meter display with the adjusted function

// Update leaderboard display
updateHighScoreDisplay(highScore);

// Function to update the XP meter to show progress for the current level
function updateXpMeter(currentXp) {
    const level = Math.floor(currentXp / 100) + 1;           // Calculate level
    const xpForCurrentLevel = currentXp % 100;               // XP within the current level
    const xpProgress = (xpForCurrentLevel / 100) * 100;      // Calculate percentage within level

    
    // Update meter width based on current level XP
    xpMeterEl.style.width = `${xpProgress}%`;

    // Update level and XP text (optional for clarity)
    xpText.textContent = `LEVEL ${level} — XP: ${xpForCurrentLevel}/100`;
    xpMeterEl.textContent = `${xpForCurrentLevel} XP`; // Update the text content of the XP meter

}

// Update high score display
function updateHighScoreDisplay(highScore) {
    const highScoreEl = document.getElementById('highScore');
    highScoreEl.textContent = highScore;
}
}


// Update high score function
function updateHighScoreDisplay(highScore) {
    const highScoreEl = document.getElementById('highScore');
    highScoreEl.textContent = highScore;
}

function displayCongratulatoryMessage() {
    const messageElement = document.createElement("div");
    messageElement.textContent = "New High Score! 🎉";
    messageElement.classList.add("congratulatory-message");

    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove(); // Remove the message after 3 seconds
    }, 3000);
}

function checkXP(totalXp) {
    const level = Math.floor(totalXp / 100) + 1;
    const xpForCurrentLevel = totalXp % 100;

    // Level up condition with visual reset
    if (xpForCurrentLevel === 0 && totalXp > 0) {
        playLevelUpSound();
        // Reset visual bar but maintain total XP
        xpMeterEl.style.width = '0%';
        xpMeterEl.textContent = '0/100 XP';
        xpText.textContent = `LEVEL ${level} — NEURAL INTERFACE UPGRADED`;
        
        // Add a subtle flash effect for level up
        xpMeterEl.classList.add('level-up-flash');
        setTimeout(() => {
            xpMeterEl.classList.remove('level-up-flash');
        }, 1000);
    } else {
        // Normal XP update within current level
        const xpProgress = (xpForCurrentLevel / 100) * 100;
        xpMeterEl.style.width = `${xpProgress}%`;
        xpMeterEl.textContent = `${xpForCurrentLevel}/100 XP`;
        xpText.textContent = `Level ${level} — XP: ${xpForCurrentLevel}/100`;
    }
}

function updateXpMeter(totalXp) {
    const xpForCurrentLevel = totalXp % 100;
    const xpProgress = (xpForCurrentLevel / 100) * 100;
    
    // Always show progress within current level
    xpMeterEl.style.width = `${xpProgress}%`;
    xpMeterEl.textContent = `${xpForCurrentLevel}/100 XP`;
}


function clearData() {
    playResetDataSound();
    typeAdditionalMessage(3);
    localStorage.clear(); // Clear all data from local storage
    missionListEl.textContent = ""; // Clear the mission list
    resetXpMeter(); // Reset the XP meter
  //  resetStreak(); // Reset the streak count
    console.log("Data has been wiped . . ");
}

function clearXP() {
    playResetDataSound();
    resetXpMeter(); // Reset the XP meter
  //  resetStreak(); // Reset the streak count
    console.log("XP meter has been reset.");
}

function clearTextField() {
    inputEl.value = ""; // Clear the input field
    missionButtonEl.disabled = true; // Disable the mission button
}

function addXp(xp) {
    let currentXp = parseInt(xpMeterEl.dataset.xp) || 0;
    currentXp += xp;
    
    // Calculate the current level
    const currentLevel = Math.floor(currentXp / 100) + 1;
    
    // Store both XP and level
    xpMeterEl.dataset.xp = currentXp;
    localStorage.setItem("currentXp", currentXp);
    localStorage.setItem("currentLevel", currentLevel);

    // Rest of the existing function remains the same
    updateXpMeter(currentXp);

    let highScore = parseInt(localStorage.getItem("highScore")) || 0;
    if (currentXp > highScore) {
        localStorage.setItem("highScore", currentXp);
        updateHighScoreDisplay(currentXp);
        displayCongratulatoryMessage();
    }

    checkXP(currentXp);
}

function updateXpMeter(currentXp) {
    const maxXP = 100; // Set the maximum XP for the meter
    const xpPercentage = (currentXp / maxXP) * 100; // Calculate the XP as a percentage of the maximum
    const xpMeterWidth = Math.min(xpPercentage, 100); // Ensure the XP meter doesn't exceed 100%
    xpMeterEl.style.width = `${xpMeterWidth}%`; // Set the width of the XP meter
    xpMeterEl.textContent = `${currentXp} XP`; // Update the text content of the XP meter
}

function resetXpMeter() {
    xpMeterEl.dataset.xp = 0; // Reset the XP meter's data attribute to 0
    xpMeterEl.style.width = '0px'; // Set the XP meter width to 0
    xpMeterEl.textContent = '0 XP'; // Update the text content of the XP meter to 0
    localStorage.setItem("currentXp", 0); // Reset the current XP in local storage to 0
}

function resetXpMeterVisual() {
    xpMeterEl.style.width = '0%'; // Visually reset the XP bar to 0%
    xpMeterEl.textContent = '0 XP'; // Update the text content to show 0 XP
}
/*
function updateStreak() {
    currentStreak++; // Increase the current streak count
    streakBonusEl.textContent = `Streak Bonus: ${currentStreak * 5} XP`; // Update the streak bonus display
}

function resetStreak() {
    currentStreak = 0; // Reset the current streak count to 0
    streakBonusEl.textContent = `Streak Bonus: 0 XP`; // Update the streak bonus display
} */


function playCompletionSound() {
    completionSound.currentTime = 0; // Reset the sound to the beginning
    completionSound.play(); // Play the completion sound
};


function playLevelUpSound() {
    levelUpSound.currentTime = 0; // Reset the sound to the beginning
    levelUpSound.play(); // Play the completion sound
};

function playResetDataSound() {
    resetDataSound.currentTime = 0; // Reset the sound to the beginning
    resetDataSound.play(); // Play the completion sound
};

function playAddMissionSound(){
    addMissionSound.currentTime = 0; // Reset the sound to the beginning
    addMissionSound.play(); // Play the completion sound
};

function playInitSound(){
    initializingSound.currentTime = 0; // Reset the sound to the beginning
    initializingSound.play(); // Play the completion sound
};



const motivationalQuotes = [
    // Updated motivational quotes with revised character names
    
        "The wasteland doesn’t define you; you define yourself. Forge your own path, Nomad.", 
        "Every choice you make brings you closer to your purpose. Reflect and decide your way forward.", 
        "You are the architect of your own world. Build it with purpose, Creator.", 
        "Your story is yours alone to write. Every line matters, and every choice is yours, Author.", 
        "Trust in your ability to overcome. Each obstacle is a stepping stone, Survivor.", 
        "Take a moment to breathe and appreciate how far you’ve come. You've earned it.", 
        "Your potential is limitless; believe in your ability to adapt and evolve.", 
        "You are in control of your journey. Each step is a conscious move toward your greater goal, Architect.", 
        "You’ve got the tools, now use them to craft the future you want. You’ve got this, Tinkerer.", 
        "In the chaos, you’re the constant. Trust your inner compass and keep moving forward, Navigator.", 
        "No one else can walk your path for you. Forge your own way, pathfinder.", 
        "Every victory, no matter how small, is a testament to your resilience. Take pride in it.", 
        "Look back at your progress only to fuel your next move. Your journey isn’t over yet, Pathfinder.", 
        "Your actions ripple through this world, affecting others more than you realize. Keep leading the way, Vanguard.", 
        "Every setback is an opportunity to learn and grow. You’re stronger than any failure, Builder.", 
        "The world shifts as you shape it. Stay the course and claim your power, Architect.", 
        "Your legacy is built on moments like these. Make them count, Explorer.", 
        "Listen to your instincts. They’ve gotten you this far for a reason, Traveler.", 
        "Progress isn’t always linear, but each step forward is a testament to your determination, Pioneer.", 
        "You’re not alone in this journey. Every connection you make strengthens your cause, Networker.", 
        "Your resilience is unmatched. Each challenge is an opportunity to rise stronger, Athelete.", 
        "The horizon may seem distant, but you’ve already crossed galaxies to get here. Keep going, Visionary.", 
        "Celebrate your wins—no matter how small. They’re the building blocks of your future, Vault Dweller.", 
        "This world is what you make of it. You’re the one in control of your destiny.", 
        "Your mind is your greatest asset. Use it to solve, adapt, and conquer.", 
        "The wasteland only hardens those who rise above it. You’ve proven you can, Survivor.", 
        "Let every step be a reminder of how far you’ve come. Keep building, Maker.", 
    ];
    
document.addEventListener("DOMContentLoaded", function() {
    const mediaQuery = window.matchMedia('(max-width: 600px)');

    // Function to display the quote based on the media query
    function updateQuote() {
        if (mediaQuery.matches) {
            // Mobile mode
            displayQuote("motivationalQuoteMobile");
        } else {
            // Desktop mode
            displayQuote("motivationalQuoteWidescreen");
        }
    }

    // Function to display a quote in the specified element
    function displayQuote(elementId) {
        let quoteElement = document.getElementById(elementId);
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        quoteElement.textContent = randomQuote;
    }

    // Initial quote display
    updateQuote();
    setInterval(updateQuote, 10 * 60 * 1000); // Updates every 10 minutes

    // Listen for changes in the viewport size
    mediaQuery.addEventListener('change', updateQuote);
});





// Array containing the messages to be displayed
const messages = [
    "Initializing Uplink . . ", // First message
    "Uplink established.", // Second message
    "OP. accepted", // Third message
    "Data wipe initiated . . " // Fourth message
];

let index = 0; // Index to track the current message being typed
const outputDiv = document.getElementById('output'); // Get the output div element

// Function to type out messages one by one
function typeMessage() {
    // Check if there are more messages to type
    if (index < 2) { // Only type the first three messages
        let message = messages[index]; // Get the current message
        let charIndex = 0; // Index to track the current character being typed

        // Set an interval to type each character of the message
        const typeInterval = setInterval(() => {
            outputDiv.textContent += message.charAt(charIndex); // Append the current character to the output div
            charIndex++; // Move to the next character

            // Check if the entire message has been typed
            if (charIndex === message.length) {
                clearInterval(typeInterval); // Stop the typing interval
                index++; // Move to the next message
                outputDiv.textContent += '\n'; // Add a new line after the message

                // Add an extra line space after the first message
                if (index === 1) {
                    outputDiv.textContent += '\n'; // Add an extra line space after the first message
                }

                // Start the fade-out effect after 10 seconds
                setTimeout(() => {
                    outputDiv.style.opacity = 0; // Start fading out
                    setTimeout(() => {
                        outputDiv.style.display = "none"; // Remove the div from the display
                    }, 1000); // Wait for 1 second after fading out
                }, 4000); // Wait for 8 seconds before starting the fade-out

                if (index < 3) { // Only type the first three messages
                    setTimeout(typeMessage, 1000); // Wait for 1 second before typing the next message
                }
            }
        }, 60); // Typing speed: 60 milliseconds per character
    }
}   

// Call typeMessage on page load to start typing the first message
window.onload = typeMessage;

// Function to type out additional messages (e.g., when a task is added)
function typeAdditionalMessage(messageIndex) {
    // Ensure the output div is visible and fully opaque before typing the new message
    outputDiv.style.display = "block";
    outputDiv.style.opacity = 1;

    // Check if the message index is within the array bounds
    if (messageIndex >= 0 && messageIndex < messages.length) {
        let message = messages[messageIndex]; // Get the current message
        let charIndex = 0; // Index to track the current character being typed

         // Clear the output div before typing the new message
         outputDiv.textContent = '';

        // Set an interval to type each character of the message
        const typeInterval = setInterval(() => {
            outputDiv.textContent += message.charAt(charIndex); // Append the current character to the output div
            charIndex++; // Move to the next character

            // Check if the entire message has been typed
            if (charIndex === message.length) {
                clearInterval(typeInterval); // Stop the typing interval
                outputDiv.textContent += '\n'; // Add a new line after the message

                // Start the fade-out effect after 10 seconds
                setTimeout(() => {
                    outputDiv.style.opacity = 0; // Start fading out
                    setTimeout(() => {
                        outputDiv.style.display = "none"; // Remove the div from the display
                    }, 1000); // Wait for 1 second after fading out
                }, 2000); // Wait for 4 seconds before starting the fade-out
            }
        }, 60); // Typing speed: 60 milliseconds per character
    } else {
        console.error("Message index out of bounds."); // Log an error if the index is invalid
    }
}




