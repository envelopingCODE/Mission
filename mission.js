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
    const prefix = modifiedMission.split(' ')[0];
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

    xpMeterEl.dataset.xp = currentXp; // Set the XP meter's data attribute to the current XP
   
    updateXpMeter(currentXp); // Update the XP meter display

     // Update leaderboard display
     updateHighScoreDisplay(highScore);
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


function checkXP(xp){
if (xp >= 100) {
    playLevelUpSound();
    resetXpMeter();
    xpText.textContent="LEVEL 2 — GREAT JOB OPERATIVE"
}};

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
    let currentXp = parseInt(xpMeterEl.dataset.xp) || 0; // Get the current XP, or default to 0
    currentXp += xp; // Add the new XP to the current XP
    xpMeterEl.dataset.xp = currentXp; // Update the XP meter's data attribute
    localStorage.setItem("currentXp", currentXp); // Save the new current XP to local storage
    updateXpMeter(currentXp); // Update the XP meter display

    // Check if the current XP exceeds the high score
    let highScore = parseInt(localStorage.getItem("highScore")) || 0;
    if (currentXp > highScore) {
        localStorage.setItem("highScore", currentXp); // Save the new high score
        updateHighScoreDisplay(currentXp); // Update the displayed high score
        displayCongratulatoryMessage(); // Display a message if high score is broken
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



// Existing variables and functions...

const motivationalQuotes = [
// Updated motivational quotes

    "You control your destiny. Forge ahead, Neon Nomad.",
    "Every action you take is a calculated move. Keep pressing forward, Lone Wanderer.",
    "In this wasteland, you make the rules. Blaze your trail, Urban Pioneer.",
    "Trust your instincts; in this world, your gut is your greatest asset.",
    "Set your course and carve out your unique path. You're the architect of your fate.",
    "Every upgrade you achieve is a testament to your prowess. Keep advancing, Technologist.",
    "Conquer each obstacle and become more formidable. Your strength is unyielding.",
    "Your progress is a clear signal of your rising competence. Continue to evolve, netrunner.",
    "With every challenge you master, your abilities grow. Forge your legacy, Resilient Warrior.",
    "Your skill set is expanding with each accomplishment. Stay relentless, Urban Survivor.",
    "You are not isolated in this realm; your progress fuels others. Your influence is undeniable.",
    "Your victories are shared with those who stand beside you. This is a collective triumph.",
    "Your relentless drive connects you with a network of achievers. Keep pushing, Pioneer.",
    "You’re part of a network that believes in your potential. Strive for more, Cyber Adventurer.",
    "Strength in unity. Your triumphs elevate us all. Together, we rise.",
    "Every effort contributes to your personal evolution. This is your journey of growth.",
    "With every action, you are building a better future. Continue your mission, Visionary.",
    "Your tenacity charts the path to greatness. Stay on course, Tactical Genius.",
    "Believe in your odyssey; each move brings you closer to your endgame. Victory is within reach.",
    "Celebrate every milestone, no matter the size. Each step forward is progress.",
    "Reflect on your journey and the strides you’ve made. Your growth is remarkable.",
    "Every challenge conquered adds to your saga of success. Write your epic tale.",
    "Embrace the journey; each step is a triumph. Your path is your own.",
    "Your evolution is the result of persistent effort and dedication. You are unstoppable.",
    "Pause and honor your progress; it's a testament to your enduring effort."
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

