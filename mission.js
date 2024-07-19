"use strict";

// Variables, specifying how to access DOM

const inputEl = document.getElementById("addMission");
const missionButtonEl = document.getElementById("addMissionButton");
const missionListEl = document.getElementById('missionList');
const resetButtonEl = document.getElementById('resetButton');
const errorMessageEl = document.getElementById('errorMessage');
const xpMeterEl = document.getElementById('xp-meter'); // Get the element for the XP meter
const streakBonusEl = document.getElementById('streak-bonus'); // Get the element for streak bonus

const input = inputEl.value;

// Deactivate add mission-button
missionButtonEl.disabled = true;

// Checks input

function minimumInput() {
    console.log("Controlling input . . ");
    const input = inputEl.value
    const sanitizedInput = sanitizeInput(input);

    // Controls if correct length

    if (sanitizedInput.length > 3) {
        errorMessageEl.textContent = " ";
        missionButtonEl.disabled = false;

    } else {
        errorMessageEl.textContent = "Your mission name has to be 5 characters long . . ";
        missionButtonEl.disabled = true;
    }
}

// Special Event listener to sanitize inputfield

missionButtonEl.addEventListener('mousedown', function(){
    const input = inputEl.value;                          // input equals the value of the textfield
    const sanitizedInput = sanitizeInput(input);         // SanitizedInput declared as the cleaned text after the sanitizeInput function has run 
    addMission(sanitizedInput); });                       // After which the addMission function will be called with the sanitized text


    // Special Event listener for ENTER + sanitize inputfield

    inputEl.addEventListener('keypress',e => { 
        if (e.key === 'Enter') {
            const input = inputEl.value;                          // input equals the value of the textfield
            const sanitizedInput = sanitizeInput(input);         // SanitizedInput declared as the cleaned text after the sanitizeInput function has run 
            addMission(sanitizedInput); } });                      // After which the addMission function will be called with the sanitized text
        

   
    
        


// Event listeners

missionButtonEl.addEventListener('mouseup', clearTextField);
resetButtonEl.addEventListener('click', clearData);
inputEl.addEventListener('keyup', minimumInput);
document.addEventListener('DOMContentLoaded', loadMissions);

// JS native malicious script shield

function sanitizeInput(input) {
    return input.replace(/<[^>]*>?/gm, '');      // // JS native sanitizing shield: Provides an initial defense against common malicious HTML or JavaScript code by replacing those signs with whitespaces. 
} 

const motivationalMessages = [  
    "Great Job! 🎉",
    "Way to go! 👍",
    "You deserve a small break soon! ☕",
    "Excellent! 🌟",
    "You'll be done in no time! ⏳",
    "Success! 🏆",
    "You're unstoppable! 🚀",
    "Yay! 🎊",
    "Keep up the great work! 💪",
    "You're doing amazing! 🌈",
    "Almost there, keep pushing! 💪",
    "Fantastic effort! 👏",
    "You're on the right track! 🛤️",
    "Stay focused, you're doing great! 🧠",
    "Believe in yourself! 🌠",
    "You're capable of amazing things! 🏅",
    "Keep the momentum going! 🔄",
    "You're making a difference! 🌍",
    "One step at a time! 👣",
    "Stay positive and keep going! 😊",
    "You got this! ✊",];



// Display random motivational message
function displayRandomMessage() {
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    const messageElement = document.createElement("div");
    messageElement.textContent = randomMessage;
    messageElement.classList.add("motivational-message"); // Add a class for styling 

    // Add the message element to the DOM
    document.body.appendChild(messageElement);

    // Remove the message after a brief delay (e.g., 3 seconds)
    setTimeout(() => {
        messageElement.remove();
    }, 3000); // Adjust timing as needed
}


// Adds mission

function addMission(sanitizedInput) {
    let xpValue = parseInt(prompt(`Enter XP for "${sanitizedInput}"`)); // Prompt to enter XP value
    while (isNaN(xpValue)) {
        xpValue = parseInt(prompt("Please enter a valid number for XP")); // Prompt again if invalid input
    }

    const newEl = document.createElement("li");
    const newTextNode = document.createTextNode(`${sanitizedInput} — ${xpValue} XP`); // Create a text node with the mission name and XP
    newEl.appendChild(newTextNode);
    newEl.className = "mission";
    newEl.dataset.xp = xpValue; // Store the XP value in a data attribute


    // Add click function for deletion + save
    newEl.addEventListener('click', function (e) {
        const xp = parseInt(e.target.dataset.xp); // Get the XP value from the data attribute
                addXp(xp); // Add the XP to the meter
        e.target.remove();
        displayRandomMessage() 
        updateStreak(); // Update the streak

        // Apply the 'active' class with a slight delay
        setTimeout(() => {
            newEl.classList.add("active");
            saveMissions();
        }, 10);
    });

    // Add to list
    missionListEl.appendChild(newEl);

    // Apply the 'active' class with a slight delay
    setTimeout(() => {
        newEl.classList.add("active");
        saveMissions();
    }, 10);

    
}



//Store missions in web storage API

function saveMissions() {
    const missionsEl = document.getElementsByClassName("mission");
    const tempArray = Array.from(missionsEl).map(missionEl => missionEl.innerHTML);

    let jsonStringify = JSON.stringify(tempArray);   // Convert the array to a JSON string
    localStorage.setItem("missions", jsonStringify);  // Save the JSON string to local storage
}

// Load Missions

function loadMissions() {
    let missions = JSON.parse(localStorage.getItem("missions"));

    if (missions) {
        missions.forEach(mission => {
            const newEl = document.createElement("li");
            const newTextNode = document.createTextNode(mission);
            newEl.appendChild(newTextNode);
            newEl.className = "mission";
            newEl.dataset.xp = mission.xp; // Store the XP value in a data attribute

            missionListEl.appendChild(newEl);

            // Add click function for deletion + save
            newEl.addEventListener('click', function (e) {   // Anonymous 
                const xp = parseInt(e.target.dataset.xp); // Get the XP value from the data attribute
                addXp(xp); // Add the XP to the meter
             e.target.remove()
             displayRandomMessage();
             updateStreak(); // Update the streak

            } );
        
            // Apply the 'active' class with a slight delay
            setTimeout(() => {
                newEl.classList.add("active");
            }, 10);
        });
    }
}

// Clear data

function clearData() {
    localStorage.clear(); // Clear local storage
    MissionListEl.textContent = ""; // Clear the course list content
    resetXpMeter(); // Reset the XP meter
    resetStreak(); // Reset the streak
}


// Clear textfield
function clearTextField() {
    inputEl.value = "";
    missionButtonEl.disabled = true;
}

// Function to add XP to the XP meter and update the streak bonus
function addXp(xp) {
    let currentXp = parseInt(xpMeterEl.dataset.xp) || 0; // Get the current XP from the data attribute or default to 0
    currentXp += xp; // Add the new XP
    xpMeterEl.dataset.xp = currentXp; // Update the XP data attribute

    // Determine the maximum XP (you can adjust this based on your application)
    const maxXP = 100; // For example, assume a maximum of 1000 XP

    // Calculate the percentage of XP progress
    const xpPercentage = (currentXp / maxXP) * 100;

    // Limit the width to 100% (if currentXp exceeds maxXP)
    const xpMeterWidth = Math.min(xpPercentage, 100);

    // Update the width of the XP meter bar
    xpMeterEl.style.width = `${xpMeterWidth}%`;

    // Update the text content of the XP meter
    xpMeterEl.textContent = `${currentXp} XP`; // Adjust as per your UI needs
}


// Function to reset the XP meter
function resetXpMeter() {
    xpMeterEl.dataset.xp = 0; // Reset the XP data attribute to 0
    xpMeterEl.style.width = '0px'; // Reset the width of the XP meter
    xpMeterEl.textContent = '0 XP'; // Reset the text content of the XP meter
}

// Function to update the streak
function updateStreak() {
    currentStreak++; // Increment the current streak
    streakBonusEl.textContent = `Streak Bonus: ${currentStreak * 5} XP`; // Update the streak bonus display
}

// Function to reset the streak
function resetStreak() {
    currentStreak = 0; // Reset the current streak
    streakBonusEl.textContent = `Streak Bonus: 0 XP`; // Update the streak bonus display
}

