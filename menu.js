// ==UserScript==
// @name         Blacket Xtra Menu with Custom Features and Glow Control
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Adds a draggable menu with Settings, Admin, Help, Discord, Add Feature, Glow Control, and trashcan delete mode for blacket.org
// @match        https://blacket.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Initialize saved features and glow amount from localStorage
    const savedFeatures = JSON.parse(localStorage.getItem("blacketXtraFeatures")) || [];
    let glowAmount = localStorage.getItem("blacketXtraGlow") || 0.5;

    // Set up document styles
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // Create main menu container
    const menuContainer = document.createElement("div");
    menuContainer.style.position = "fixed";
    menuContainer.style.width = "250px";
    menuContainer.style.padding = "20px";
    menuContainer.style.backgroundColor = "#1c1c1c";
    menuContainer.style.borderRadius = "12px";
    menuContainer.style.boxShadow = `0 0 15px rgba(255, 85, 0, ${glowAmount})`;
    menuContainer.style.color = "#FFD700";
    menuContainer.style.fontFamily = "Arial, sans-serif";
    menuContainer.style.zIndex = "9999";
    menuContainer.style.overflowY = "auto";
    menuContainer.style.top = "20%";
    menuContainer.style.left = "10px";
    document.body.appendChild(menuContainer);

    // Title
    const title = document.createElement("h2");
    title.innerText = "Blacket Xtra";
    title.style.textAlign = "center";
    title.style.color = "#FF4500";
    menuContainer.appendChild(title);

    // Glow Amount Slider
    const glowLabel = document.createElement("label");
    glowLabel.innerText = "Glow Amount:";
    glowLabel.style.color = "white";
    glowLabel.style.fontSize = "12px";
    glowLabel.style.display = "block";
    glowLabel.style.marginBottom = "5px";
    menuContainer.appendChild(glowLabel);

    const glowSlider = document.createElement("input");
    glowSlider.type = "range";
    glowSlider.min = 0;
    glowSlider.max = 1;
    glowSlider.step = 0.1;
    glowSlider.value = glowAmount;
    glowSlider.style.width = "100%";
    menuContainer.appendChild(glowSlider);

    // Update the glow effect when the slider value changes
    glowSlider.addEventListener("input", () => {
        glowAmount = glowSlider.value;
        menuContainer.style.boxShadow = `0 0 15px rgba(255, 85, 0, ${glowAmount})`;
        localStorage.setItem("blacketXtraGlow", glowAmount);
    });

    // Create button function
    function createMenuButton(text, onClickHandler) {
        const button = document.createElement("button");
        button.innerText = text;
        button.style.width = "100%";
        button.style.padding = "10px";
        button.style.margin = "5px 0";
        button.style.backgroundColor = "#444";
        button.style.color = "white";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";
        button.addEventListener("click", onClickHandler);
        menuContainer.appendChild(button);
    }

    // Standard buttons
    createMenuButton("Settings", () => alert("Settings menu will be available soon!"));
    createMenuButton("Admin", () => {
        const password = prompt("Enter Admin Password:");
        if (password === "6104") {
            alert("Access granted to Admin features!");
        } else {
            alert("Incorrect password.");
        }
    });
    createMenuButton("Help", () => alert("Help information will be added here."));
    createMenuButton("Discord", () => window.open("https://discord.com", "_blank"));

    // Add Feature button
    createMenuButton("Add Feature", () => {
        const featureName = prompt("Enter the feature name:");
        const featureCode = prompt("Enter JavaScript code for the feature:");

        if (featureName && featureCode) {
            const feature = { name: featureName, code: featureCode };
            savedFeatures.push(feature);
            localStorage.setItem("blacketXtraFeatures", JSON.stringify(savedFeatures));
            addFeatureButton(feature);
        }
    });

    // Function to add feature button to the menu
    function addFeatureButton(feature) {
        const featureButton = document.createElement("button");
        featureButton.innerText = feature.name;
        featureButton.style.width = "100%";
        featureButton.style.padding = "10px";
        featureButton.style.margin = "5px 0";
        featureButton.style.backgroundColor = "#555";
        featureButton.style.color = "white";
        featureButton.style.border = "none";
        featureButton.style.borderRadius = "5px";
        featureButton.style.cursor = "pointer";
        featureButton.addEventListener("click", () => {
            try {
                eval(feature.code); // Execute saved feature code
            } catch (error) {
                alert("Error in feature code: " + error.message);
            }
        });

        // Add delete functionality to the feature button when in delete mode
        featureButton.addEventListener("click", () => {
            if (isDeleteMode) {
                savedFeatures.splice(savedFeatures.indexOf(feature), 1); // Remove feature from the list
                localStorage.setItem("blacketXtraFeatures", JSON.stringify(savedFeatures));
                featureButton.remove(); // Remove button from the UI
            }
        });

        menuContainer.appendChild(featureButton);
    }

    // Load saved features on script start
    savedFeatures.forEach(addFeatureButton);

    // Trashcan emoji for delete mode
    const trashcanIcon = document.createElement("div");
    trashcanIcon.innerText = "🗑️";
    trashcanIcon.style.position = "absolute";
    trashcanIcon.style.top = "10px";
    trashcanIcon.style.left = "10px";
    trashcanIcon.style.fontSize = "30px";
    trashcanIcon.style.cursor = "pointer";
    trashcanIcon.style.color = "red";
    trashcanIcon.style.transition = "all 0.3s ease-in-out";
    menuContainer.appendChild(trashcanIcon);

    let isDeleteMode = false;

    // Enable/disable delete mode when trashcan icon is clicked
    trashcanIcon.addEventListener("click", () => {
        isDeleteMode = !isDeleteMode;
        if (isDeleteMode) {
            trashcanIcon.style.color = "green";  // Change icon color when in delete mode
        } else {
            trashcanIcon.style.color = "red";
        }
    });

    // Draggable menu functionality
    let isDragging = false;
    let offsetX, offsetY;

    menuContainer.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - menuContainer.offsetLeft;
        offsetY = e.clientY - menuContainer.offsetTop;
        menuContainer.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            menuContainer.style.left = e.clientX - offsetX + "px";
            menuContainer.style.top = e.clientY - offsetY + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        menuContainer.style.cursor = "grab";
    });
})();
