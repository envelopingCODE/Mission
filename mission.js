"use strict"; // Strict mode helps catch common coding errors and "unsafe" actions

const inputEl = document.getElementById("addMission"); // Get the input element for mission names
const missionButtonEl = document.getElementById("addMissionButton"); // Get the button to add missions
const missionListEl = document.getElementById('missionList'); // Get the list where missions will be displayed
const resetButtonEl = document.getElementById('resetButton'); // Get the reset button element
const errorMessageEl = document.getElementById('errorMessage'); // Get the element for displaying error messages
const xpMeterEl = document.getElementById('xp-meter'); // Get the element for the XP meter
const streakBonusEl = document.getElementById('streak-bonus'); // Get the element for displaying streak bonus
const completionSound = document.getElementById('completionSound'); // Get the sound element for mission completion

let currentStreak = 0; // Variable to track the current streak of completed missions

missionButtonEl.disabled = true; // Initially disable the mission button until input is valid

function minimumInput() {
    const input = inputEl.value // Get the current value from the input field
    const sanitizedInput = sanitizeInput(input); // Sanitize the input to remove any HTML tags

    if (sanitizedInput.length > 3) { // Check if the sanitized input length is more than 3 characters
        errorMessageEl.textContent = " "; // Clear any error message
        missionButtonEl.disabled = false; // Enable the mission button
    } else {
        errorMessageEl.textContent = "Your mission name has to be 5 characters long . . "; // Show error message
        missionButtonEl.disabled = true; // Disable the mission button
    }
}

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

missionButtonEl.addEventListener('mouseup', clearTextField); // Clear the text field when the button is released
resetButtonEl.addEventListener('click', clearData); // Clear all data when the reset button is clicked
inputEl.addEventListener('keyup', minimumInput); // Check the input length after every key press
document.addEventListener('DOMContentLoaded', loadMissions); // Load missions when the document is ready

function sanitizeInput(input) {
    return input.replace(/<[^>]*>?/gm, ''); // Remove any HTML tags from the input
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

function addMission(sanitizedInput) {
    let xpValue = parseInt(prompt(`Enter XP for "${sanitizedInput}"`)); // Prompt the user to enter XP for the mission
    while (isNaN(xpValue)) { // Keep prompting if the entered value is not a number
        xpValue = parseInt(prompt("Please enter a valid number for XP"));
    }

    const newEl = document.createElement("li"); // Create a new list item element
    const newTextNode = document.createTextNode(`${sanitizedInput} — ${xpValue} XP`); // Create a text node with the mission and XP
    newEl.appendChild(newTextNode); // Append the text node to the list item
    newEl.className = "mission"; // Add a class to the list item
    newEl.dataset.xp = xpValue; // Set the XP value as a data attribute on the list item

    newEl.addEventListener('click', function (e) {
        const xp = parseInt(e.target.dataset.xp); // Get the XP value from the clicked list item
        addXp(xp); // Add the XP to the meter
        e.target.remove(); // Remove the clicked list item
        saveMissions(); // Save the updated list of missions
        displayRandomMessage(); // Display a random motivational message
        playCompletionSound(); // Play the completion sound
        updateStreak(); // Update the streak count
    });

    missionListEl.appendChild(newEl); // Add the new list item to the mission list

    setTimeout(() => {
        newEl.classList.add("active"); // Add the 'active' class after a short delay for animation
        saveMissions(); // Save the updated list of missions
    }, 10);
}

function saveMissions() {
    const missionsEl = document.getElementsByClassName("mission"); // Get all elements with the 'mission' class
    const tempArray = Array.from(missionsEl).map(missionEl => missionEl.textContent); // Create an array of the text content of each mission

    let jsonStringify = JSON.stringify(tempArray); // Convert the array to a JSON string
    localStorage.setItem("missions", jsonStringify); // Save the JSON string to local storage
}

function loadMissions() {
    let missions = JSON.parse(localStorage.getItem("missions")); // Get the saved missions from local storage

    if (missions) { // If there are saved missions
        missions.forEach(mission => { // For each saved mission
            const newEl = document.createElement("li"); // Create a new list item element
            const [missionText, xpText] = mission.split(' — '); // Split the mission text and XP
            const xpValue = parseInt(xpText.replace(' XP', '')); // Parse the XP value
            const newTextNode = document.createTextNode(mission); // Create a text node with the mission
            newEl.appendChild(newTextNode); // Append the text node to the list item
            newEl.className = "mission"; // Add a class to the list item
            newEl.dataset.xp = xpValue; // Set the XP value as a data attribute on the list item

            missionListEl.appendChild(newEl); // Add the new list item to the mission list

            newEl.addEventListener('click', function (e) {
                const xp = parseInt(e.target.dataset.xp); // Get the XP value from the clicked list item
                addXp(xp); // Add the XP to the meter
                e.target.remove(); // Remove the clicked list item
                saveMissions(); // Save the updated list of missions
                displayRandomMessage(); // Display a random motivational message
                playCompletionSound(); // Play the completion sound
                updateStreak(); // Update the streak count
            });

            setTimeout(() => {
                newEl.classList.add("active"); // Add the 'active' class after a short delay for animation
            }, 10);
        });
    }

    let currentXp = parseInt(localStorage.getItem("currentXp")) || 0; // Get the current XP from local storage, or default to 0
    xpMeterEl.dataset.xp = currentXp; // Set the XP meter's data attribute to the current XP
    updateXpMeter(currentXp); // Update the XP meter display
}

function clearData() {
    localStorage.clear(); // Clear all data from local storage
    missionListEl.textContent = ""; // Clear the mission list
    resetXpMeter(); // Reset the XP meter
    resetStreak(); // Reset the streak count
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

function updateStreak() {
    currentStreak++; // Increase the current streak count
    streakBonusEl.textContent = `Streak Bonus: ${currentStreak * 5} XP`; // Update the streak bonus display
}

function resetStreak() {
    currentStreak = 0; // Reset the current streak count to 0
    streakBonusEl.textContent = `Streak Bonus: 0 XP`; // Update the streak bonus display
}

function playCompletionSound() {
    completionSound.currentTime = 0; // Reset the sound to the beginning
    completionSound.play(); // Play the completion sound
}
