"use strict";

// Variables, specifying how to access DOM

const inputEl = document.getElementById("addMission");
const missionButtonEl = document.getElementById("addMissionButton");
const missionListEl = document.getElementById('missionList');
const resetButtonEl = document.getElementById('resetButton');
const errorMessageEl = document.getElementById('errorMessage');
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
"Great Job!",
"Way to go!",
"You deserve a small break soon!",
"Excellent!",
"You'll be done in no time!",
"Success!",
"You're unstoppable!",
"Yay!"];



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
    const newEl = document.createElement("li");
    const newTextNode = document.createTextNode(sanitizedInput);
    newEl.appendChild(newTextNode);
    newEl.className = "mission";

    // Add click function for deletion + save
    newEl.addEventListener('click', function (e) {
        e.target.remove();
        displayRandomMessage() 

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

    let jsonStringify = JSON.stringify(tempArray);
    localStorage.setItem("missions", jsonStringify);
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
            missionListEl.appendChild(newEl);

            // Add click function for deletion + save
            newEl.addEventListener('click', function (e) {   // Anonymous 
             e.target.remove()
             displayRandomMessage();
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
    localStorage.clear();
    missionListEl.textContent = "";
}

// Clear textfield
function clearTextField() {
    inputEl.value = "";
    missionButtonEl.disabled = true;
}