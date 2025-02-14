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

function getClassForPrefix(prefix) {
    // Return a class based on the prefix
    switch (prefix) {
        case "1.":
            return "prefix-one"; // Class for "1."
        case "2.":
            return "prefix-two"; // Class for "2."
        case "3.":
            return "prefix-three"; // Class for "3."
        default:
            return "prefix-default"; // Default class for other prefixes
    }
}
function modifyMissionText(input) {
    // Check if input starts with '1.', '2.' or '3.'
    const missionPrefixes = ["1.", "2.", "3."];
    for (const prefix of missionPrefixes) {
        if (input.startsWith(prefix)) {
            // Modify the mission text by adding the mission title after the prefix
            switch (prefix) {
                case "1.":
                    return input.replace(prefix, "1. Secure Funding: ");
                case "2.":
                    return input.replace(prefix, "2. Graduate: ");
                case "3.":
                    return input.replace(prefix, "3. Optimal State: ");
                default:
                    return input; // Return unchanged if no match is found
            }
        }
    }
    return input; // Return unchanged if no prefix is found
}

// Adding the mission to the list
function addMission(sanitizedInput) {
    const modifiedMission = modifyMissionText(sanitizedInput);


    // Get the prefix (first part of the mission)
    const prefixRegex = /^(\d+\.)/; 

    const prefix = modifiedMission.match(prefixRegex)[0];
    const prefixClass = getClassForPrefix(prefix); // Get the class based on the prefix


    playAddMissionSound();

    // Check if the viewport is 600px or less (mobile mode)
    const mediaQuery = window.matchMedia('(max-width: 600px)');
    if (mediaQuery.matches) {
        // Call typeAdditionalMessage only if in mobile mode
        typeAdditionalMessage(2);
    }

    const xpValue = parseInt(prompt(`Enter XP for "${modifiedMission}"`));
    if (isNaN(xpValue)) {
        alert("Please enter a valid number for XP");
        return; // Prevent adding the mission if XP is invalid
    }

    const newEl = document.createElement("li"); // Create a new list item element
    newEl.innerHTML = `<span class="${prefixClass}">${modifiedMission.split(':')[0]}:</span> ${modifiedMission.split(':')[1]} — ${xpValue} XP`; // Apply class to the prefix
    newEl.className = "mission"; // Add a class to the list item
    newEl.dataset.xp = xpValue; // Set the XP value as a data attribute on the list item

    
    newEl.addEventListener('click', function (e) {
        const xp = parseInt(e.target.dataset.xp); // Get the XP value from the clicked list item
        addXp(xp); // Add the XP to the meter
        e.target.remove(); // Remove the clicked list item
        saveMissions(); // Save the updated list of missions
        displayRandomMessage(); // Display a random motivational message
        playCompletionSound(); // Play the completion sound
    //    updateStreak(); // Update the streak count
    });

    missionListEl.appendChild(newEl); // Add the new list item to the mission list

    setTimeout(() => {
        newEl.classList.add("active"); // Add the 'active' class after a short delay for animation
        saveMissions(); // Save the updated list of missions
    }, 10);
    
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

            newEl.className = "mission"; // Add the mission class to the list item
            newEl.dataset.xp = mission.xp; // Set the XP value as a data attribute

            // Add click listener for adding XP
            newEl.addEventListener('click', function (e) {
                const xp = parseInt(e.target.dataset.xp); // Get the XP value from the clicked list item
                addXp(xp); // Add the XP to the meter
                e.target.remove(); // Remove the clicked list item
                saveMissions(); // Save the updated list of missions
                displayRandomMessage(); // Display a random motivational message
                playCompletionSound(); // Play the completion sound
            });

            missionListEl.appendChild(newEl); // Add the new list item to the mission list

            setTimeout(() => {
                newEl.classList.add("active"); // Add the 'active' class after a short delay for animation
            }, 10);
        });
    }

   
   // Load current XP and high score from localStorage
let currentXp = parseInt(localStorage.getItem("currentXp")) || 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0; // Get the high score or default to 0

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
    const level = Math.floor(totalXp / 100) + 1;  // Calculate current level
    const xpForCurrentLevel = totalXp % 100;      // XP within current level
    
    // Check if we just leveled up
    if (xpForCurrentLevel === 0 && totalXp > 0) {
        playLevelUpSound();
        resetXpMeterVisual();  // Only reset the visual display, not the actual XP
        xpText.textContent = `LEVEL ${level} — GREAT JOB OPERATIVE`;
    }
    
    // Update the XP meter to show progress within current level
    const xpPercentage = (xpForCurrentLevel / 100) * 100;
    xpMeterEl.style.width = `${xpPercentage}%`;
    xpMeterEl.textContent = `${xpForCurrentLevel} XP`;
    
    // Update level text
    xpText.textContent = `Level ${level} — XP: ${xpForCurrentLevel}/100`;
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
    let currentXp = parseInt(localStorage.getItem("currentXp")) || 0;
    const oldLevel = Math.floor(currentXp / 100) + 1;
    
    currentXp += xp;  // Add new XP
    const newLevel = Math.floor(currentXp / 100) + 1;
    
    // Save total XP
    localStorage.setItem("currentXp", currentXp);
    xpMeterEl.dataset.xp = currentXp;
    
    // Check for level up
    if (newLevel > oldLevel) {
        playLevelUpSound();
    }
    
    // Update high score if needed
    let highScore = parseInt(localStorage.getItem("highScore")) || 0;
    if (currentXp > highScore) {
        localStorage.setItem("highScore", currentXp);
        updateHighScoreDisplay(currentXp);
        displayCongratulatoryMessage();
    }
    
    checkXP(currentXp);
}

// Only resets the visual display without touching the actual XP
function resetXpMeterVisual() {
    xpMeterEl.style.width = '0%';
    xpMeterEl.textContent = '0 XP';
}

// Use this function when you actually want to reset all progress
function resetXpMeter() {
    localStorage.setItem("currentXp", 0);
    xpMeterEl.dataset.xp = 0;
    resetXpMeterVisual();
    xpText.textContent = 'Level 1 — XP: 0/100';
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

