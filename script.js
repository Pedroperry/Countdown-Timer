// script.js

// IIFE to encapsulate the application logic
(function(window) {
    'use strict';

    // --- DOM Element Cache ---
    const body = document.body;
    const h1 = document.querySelector('h1');
    const dateInputElement = document.getElementById('dateInput');
    const countdownContainer = document.getElementById('countdown');
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const progressElement = document.getElementById('progress');
    const creditsModalElement = document.getElementById('creditsModal');
    const secretMessageElement = document.getElementById('secretMessage');
    const secretMessage2Element = document.getElementById('secretMessage2');
    const containerElement = document.querySelector('.container');
    const originalLabels = Array.from(document.querySelectorAll('.label')).map(label => label.textContent);

    // --- State Variables ---
    let currentThemeIndex = 0;
    let emojiClickCounter = 0;
    let konamiCodeIndex = 0;
    let titleClickCounter = 0;
    let discoCodeSequence = [];
    let countdownTargetDate;
    let countdownInterval;

    // --- Constants ---
    const THEMES = ['theme-space', 'theme-nature', 'theme-retro', 'theme-ocean', 'theme-forest'];
    const EMOJIS = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼']; // Added more variety
    const KONAMI_CODE_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    const SPECIAL_DATE_MS = new Date('2007-10-18').getTime(); // Pet's birthday or adoption day?
    const PET_FACTS = [
        "Cats have 32 muscles in each ear, allowing them 180-degree rotation!",
        "Dogs can learn over 100 words and gestures!",
        "A rabbit's teeth never stop growing!",
        "Foxes use the Earth's magnetic field to hunt!",
        "Pandas spend around 12 hours a day eating bamboo!",
        "Bears can run up to 40 mph, faster than Usain Bolt!"
    ];

    // --- Theme Management ---
    /**
     * Changes the application theme to the next one in the THEMES array.
     */
    function changeTheme() {
        currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
        body.className = THEMES[currentThemeIndex];
    }

    // --- Countdown Logic ---
    /**
     * Updates the countdown timer display every second.
     */
    function updateCountdown() {
        if (!countdownTargetDate) return;

        const now = Date.now();
        const diff = countdownTargetDate - now;
        const isPast = diff < 0;
        const absoluteDiff = Math.abs(diff);

        // Update labels to indicate if the date is in the past
        document.querySelectorAll('.label').forEach((label, index) => {
            label.textContent = isPast ? `Ago ${originalLabels[index]}` : originalLabels[index];
        });

        // Calculate time units
        const days = Math.floor(absoluteDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((absoluteDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((absoluteDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absoluteDiff % (1000 * 60)) / 1000);

        // Update DOM elements
        daysElement.textContent = String(days).padStart(2, '0');
        hoursElement.textContent = String(hours).padStart(2, '0');
        minutesElement.textContent = String(minutes).padStart(2, '0');
        secondsElement.textContent = String(seconds).padStart(2, '0');

        // Update progress bar
        if (isPast) {
            progressElement.style.width = '100%';
            progressElement.style.background = '#4CAF50'; // Green for completed
        } else {
            // Calculate initial total duration to correctly show progress towards the future date
            // This assumes the 'now' at the moment of setting the targetDate was the "start"
            // For simplicity, we'll base progress on time elapsed from a fixed point if we had one,
            // or more simply, the percentage of time remaining from a larger window.
            // A more accurate progress would require storing the initial `now` when targetDate is set.
            // Current implementation: Progress is 100% - percentage of time *remaining*.
            const initialDiff = countdownTargetDate - new Date(dateInputElement.value).getTime(); // This might not be perfect if set long ago
            const timeElapsed = initialDiff - diff;
            let progressPercentage = 0;
            if (initialDiff > 0) { // Avoid division by zero if target is in the past or now
                 progressPercentage = Math.min((timeElapsed / initialDiff) * 100, 100);
            } else if (diff <=0) { // if target is in the past or now, progress is 100%
                progressPercentage = 100;
            }


            progressElement.style.width = `${progressPercentage}%`;
            progressElement.style.background = '#ff6b6b'; // Red for upcoming
        }
    }

    /**
     * Handles the change event on the date input field.
     * Sets the target date for the countdown and starts the interval.
     * @param {Event} e - The change event object.
     */
    function handleDateInputChange(e) {
        clearInterval(countdownInterval);
        const selectedDate = new Date(e.target.value);
        if (isNaN(selectedDate.getTime())) { // Check for invalid date
            // Optionally, provide user feedback about invalid date
            console.warn("Invalid date selected");
            countdownTargetDate = null; // Reset target date
             // Clear previous countdown values
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            progressElement.style.width = '0%';
            document.querySelectorAll('.label').forEach((label, index) => {
                label.textContent = originalLabels[index];
            });
            return;
        }
        countdownTargetDate = selectedDate.getTime();
        updateCountdown(); // Initial call to display immediately
        countdownInterval = setInterval(updateCountdown, 1000);

        // Easter egg: Special date check
        if (countdownTargetDate === SPECIAL_DATE_MS) {
            showTemporaryMessage(secretMessage2Element, '🐾 Special Date Discovered! 🎉', 3000);
        }
    }

    // --- UI Interactions (Emojis, Hearts, Modals) ---
    /**
     * Creates a floating emoji element and appends it to the body.
     */
    function createFloatingEmoji() {
        const emojiElement = document.createElement('div');
        emojiElement.className = 'emoji';
        emojiElement.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        emojiElement.style.left = Math.random() * 100 + 'vw'; // Use vw for full width
        emojiElement.style.animationDuration = (Math.random() * 10 + 10) + 's'; // 10-20 seconds

        emojiElement.onclick = (event) => {
            emojiClickCounter++;
            createHeartBurst(event.clientX, event.clientY);
            if (emojiClickCounter === 7) { // Lucky number 7 for secret message
                showTemporaryMessage(secretMessageElement, 'YOU LOVE PETS! 🐾', 5000);
                emojiClickCounter = 0; // Reset counter
            }
            // Make emoji disappear stylishly
            emojiElement.style.transition = 'opacity 0.5s, transform 0.5s';
            emojiElement.style.opacity = '0';
            emojiElement.style.transform = 'scale(0.5)';
            setTimeout(() => emojiElement.remove(), 500);
        };
        body.appendChild(emojiElement);
    }

    /**
     * Creates a heart burst animation at the specified coordinates.
     * @param {number} x - The x-coordinate for the burst.
     * @param {number} y - The y-coordinate for the burst.
     */
    function createHeartBurst(x, y) {
        for (let i = 0; i < 8; i++) { // Create 8 hearts for a fuller burst
            const heart = document.createElement('div');
            heart.className = 'heart-burst';
            heart.textContent = '💖';
            heart.style.position = 'fixed'; // Use fixed to position relative to viewport
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            // Randomize direction and distance for a more natural burst
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50 + 50;
            heart.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            heart.style.setProperty('--ty', `${Math.sin(angle) * distance - 50}px`); // move upwards more
            
            body.appendChild(heart);
            setTimeout(() => heart.remove(), 1000); // Hearts disappear after 1 second
        }
    }
    
    /**
     * Shows the credits modal.
     */
    function showCredits() {
        creditsModalElement.style.display = 'flex';
    }

    /**
     * Hides the credits modal.
     */
    function hideCredits() {
        creditsModalElement.style.display = 'none';
    }

    /**
     * Shows a message element temporarily.
     * @param {HTMLElement} element - The message element to show.
     * @param {string} text - The text to display in the message.
     * @param {number} duration - How long to show the message in milliseconds.
     */
    function showTemporaryMessage(element, text, duration) {
        if (element) {
            element.textContent = text; // Set text if needed (for secretMessageElement)
            element.style.display = 'block';
            setTimeout(() => {
                element.style.display = 'none';
            }, duration);
        }
    }


    // --- Easter Eggs ---
    /**
     * Handles keydown events for Konami code detection.
     * @param {KeyboardEvent} e - The keydown event object.
     */
    function handleKonamiCode(e) {
        if (e.key === KONAMI_CODE_SEQUENCE[konamiCodeIndex]) {
            konamiCodeIndex++;
            if (konamiCodeIndex === KONAMI_CODE_SEQUENCE.length) {
                body.classList.add('party-time');
                setTimeout(() => body.classList.remove('party-time'), 3000);
                konamiCodeIndex = 0; // Reset for next attempt
            }
        } else {
            konamiCodeIndex = 0; // Reset if wrong key is pressed
        }
    }

    /**
     * Handles clicks on the main title (h1) for a rotate animation.
     */
    function handleTitleClick() {
        titleClickCounter++;
        if (titleClickCounter === 3) {
            h1.classList.add('rotate-title');
            setTimeout(() => {
                h1.classList.remove('rotate-title');
                titleClickCounter = 0; // Reset counter
            }, 2000); // Animation duration
        }
    }

    /**
     * Handles double clicks on the main container to show a pet fact.
     */
    function handleContainerDoubleClick() {
        alert(PET_FACTS[Math.floor(Math.random() * PET_FACTS.length)]);
    }

    /**
     * Handles keypress events for "disco" mode detection.
     * @param {KeyboardEvent} e - The keypress event object.
     */
    function handleDiscoMode(e) {
        discoCodeSequence.push(e.key.toLowerCase());
        // Keep the sequence from getting too long to avoid memory issues with long inputs
        if (discoCodeSequence.length > 10) {
            discoCodeSequence.shift();
        }
        if (discoCodeSequence.join('').includes('disco')) {
            body.classList.add('disco-mode');
            setTimeout(() => {
                body.classList.remove('disco-mode');
                discoCodeSequence = []; // Reset sequence
            }, 5000); // Disco mode duration
        }
    }

    // --- Initialization ---
    /**
     * Sets up initial event listeners and configurations.
     */
    function initialize() {
        // Set default theme
        body.className = THEMES[currentThemeIndex];

        // Event Listeners
        if(dateInputElement) dateInputElement.addEventListener('change', handleDateInputChange);
        if(h1) h1.addEventListener('click', handleTitleClick);
        if(containerElement) containerElement.addEventListener('dblclick', handleContainerDoubleClick);
        
        document.addEventListener('keydown', handleKonamiCode);
        document.addEventListener('keypress', handleDiscoMode); // For 'disco'

        // Close modal if backdrop is clicked
        if(creditsModalElement) {
            creditsModalElement.addEventListener('click', (e) => {
                if (e.target === creditsModalElement) {
                    hideCredits();
                }
            });
        }
        

        // Start spawning emojis
        // Initial burst of emojis
        for (let i = 0; i < 3; i++) {
            setTimeout(createFloatingEmoji, i * 500); // Stagger initial emojis
        }
        // Then create emojis at intervals
        setInterval(createFloatingEmoji, 2500); // Adjusted interval for more emojis
    }

    // --- Expose necessary functions to global scope (for HTML onclick attributes) ---
    window.changeTheme = changeTheme;
    window.showCredits = showCredits;
    window.hideCredits = hideCredits;
    // Note: createFloatingEmoji, createHeartBurst, showSecretMessage are not directly called from HTML in this version
    // showSecretMessage was internal, now handled by showTemporaryMessage
    // updateCountdown is internal, triggered by date input change

    // --- Expose for testing purposes ---
    // It's better to have a dedicated testing interface than polluting the window object directly
    // for variables, but for this exercise, we'll keep it simple.
    window.petCountdownAppForTesting = {
        get THEMES() { return THEMES; }, // Expose a copy or getter
        get currentThemeIndex() { return currentThemeIndex; },
        get countdownTargetDate() { return countdownTargetDate; },
        get dateInputElement() { return dateInputElement; }, // To simulate input changes
        // Expose a way to reset or re-initialize parts if needed for testing, e.g.
        // resetTheme: () => { currentThemeIndex = 0; body.className = THEMES[0]; },
        // setDate: (val) => { if(dateInputElement) dateInputElement.value = val; }
        // For now, direct access is sufficient for the planned tests.
    };
    
    // --- Start the application ---
    initialize();

})(window);
