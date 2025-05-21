// test_runner.js
(function(window) {
    'use strict';

    let testsRun = 0;
    let testsPassed = 0;

    /**
     * Simple assertion function.
     * @param {*} actual - The actual value.
     * @param {*} expected - The expected value.
     * @param {string} message - The message for the test.
     */
    function assertEqual(actual, expected, message) {
        testsRun++;
        if (actual === expected) {
            console.log(`✅ PASS: ${message}`);
            testsPassed++;
        } else {
            console.error(`❌ FAIL: ${message}. Expected "${expected}" but got "${actual}"`);
        }
    }

    /**
     * Asserts that a condition is true.
     * @param {boolean} condition - The condition to test.
     * @param {string} message - The message for the test.
     */
    function assertTrue(condition, message) {
        testsRun++;
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            testsPassed++;
        } else {
            console.error(`❌ FAIL: ${message}. Expected condition to be true.`);
        }
    }

    console.log("🚀 Starting Pet Countdown Timer Tests...");

    // --- Test Setup ---
    // Ensure the testing interface is available
    if (!window.petCountdownAppForTesting) {
        console.error("❌ CRITICAL: `window.petCountdownAppForTesting` is not defined. Cannot run tests.");
        return;
    }
    if (!window.changeTheme) {
        console.error("❌ CRITICAL: `window.changeTheme` is not defined. Cannot run theme tests.");
        return;
    }

    const appTestInterface = window.petCountdownAppForTesting;
    const initialThemeIndex = appTestInterface.currentThemeIndex;
    const THEMES = appTestInterface.THEMES;

    // --- Theme Switching Tests ---
    console.log("\n🧪 Running Theme Switching Tests...");
    
    assertEqual(document.body.className, THEMES[initialThemeIndex], "Initial theme should be the first in the list.");

    // Test cycling through themes
    for (let i = 1; i <= THEMES.length; i++) {
        const expectedThemeIndex = (initialThemeIndex + i) % THEMES.length;
        window.changeTheme();
        assertEqual(document.body.className, THEMES[expectedThemeIndex], `Theme should change to ${THEMES[expectedThemeIndex]} after ${i} call(s) to changeTheme().`);
        assertEqual(appTestInterface.currentThemeIndex, expectedThemeIndex, `currentThemeIndex should be ${expectedThemeIndex}.`);
    }

    // Test wrapping around to the first theme
    window.changeTheme(); // This should bring it back to the theme after the first one in the list if we started at 0
    const finalExpectedThemeIndex = (initialThemeIndex + THEMES.length + 1) % THEMES.length;
    assertEqual(document.body.className, THEMES[finalExpectedThemeIndex], "Theme should wrap around correctly.");
    assertEqual(appTestInterface.currentThemeIndex, finalExpectedThemeIndex, `currentThemeIndex should be ${finalExpectedThemeIndex} after wrapping.`);

    // Reset theme to initial for other tests if necessary (not strictly needed here yet)
    // For a full reset, one might need to re-initialize currentThemeIndex in script.js or provide a reset function.
    // For now, we'll just log the current state.
    console.log(`Current theme after tests: ${document.body.className}`);


    // --- Countdown Logic Tests ---
    console.log("\n🧪 Running Countdown Logic Tests (Date Input Handling)...");
    const dateInput = appTestInterface.dateInputElement;

    if (dateInput) {
        // Test 1: Setting a future date
        const futureDateString = "2099-12-31T23:59";
        dateInput.value = futureDateString;
        // Manually dispatch change event as programmatic value change doesn't trigger it
        dateInput.dispatchEvent(new Event('change')); 
        const expectedFutureTime = new Date(futureDateString).getTime();
        assertEqual(appTestInterface.countdownTargetDate, expectedFutureTime, "countdownTargetDate should be set to the future date's timestamp.");

        // Test 2: Setting a past date
        const pastDateString = "2000-01-01T00:00";
        dateInput.value = pastDateString;
        dateInput.dispatchEvent(new Event('change'));
        const expectedPastTime = new Date(pastDateString).getTime();
        assertEqual(appTestInterface.countdownTargetDate, expectedPastTime, "countdownTargetDate should be set to the past date's timestamp.");

        // Test 3: Setting an invalid date
        const invalidDateString = "not-a-date";
        dateInput.value = invalidDateString;
        dateInput.dispatchEvent(new Event('change'));
        // In the current script.js, countdownTargetDate becomes null for invalid dates.
        assertEqual(appTestInterface.countdownTargetDate, null, "countdownTargetDate should be null for an invalid date.");

        // Test 4: Setting an empty date (should also be handled as invalid or reset)
        dateInput.value = "";
        dateInput.dispatchEvent(new Event('change'));
         assertEqual(appTestInterface.countdownTargetDate, null, "countdownTargetDate should be null when date input is cleared.");

    } else {
        console.error("❌ SKIPPING Date Input Tests: #dateInput element not found in testing interface.");
    }

    // --- Test Time Difference Calculation ---
    console.log("\n🧪 Running Time Difference Calculation Tests...");
    console.warn("⚠️ SKIPPING: Time Difference Calculation tests are not implemented as `calculateTimeDifference` helper was not extracted from `updateCountdown` in this step.");


    // --- Summary ---
    console.log("\n--------------------");
    console.log("📜 Test Summary:");
    console.log(`Total tests run: ${testsRun}`);
    console.log(`Tests passed: ${testsPassed}`);
    console.log(`Tests failed: ${testsRun - testsPassed}`);
    console.log("--------------------");

    if (testsRun - testsPassed > 0) {
        console.error("❌ Some tests failed. Please review the logs above.");
    } else if (testsRun > 0) {
        console.log("🎉 All tests passed!");
    } else {
        console.warn("⚠️ No tests were executed. Check critical errors above.");
    }

})(window);
