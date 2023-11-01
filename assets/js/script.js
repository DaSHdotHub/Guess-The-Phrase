/**
 * Helperclass to increase readability, organize DOM interactions
 */
class DOMHelper {
    static getElementById(id) {
        return document.getElementById(id);
    }

    static setTextContent(id, content) {
        this.getElementById(id).textContent = content;
    }

    static setDisplayStyle(id, style) {
        this.getElementById(id).style.display = style;
    }

    static addClass(id, className) {
        this.getElementById(id).classList.add(className);
    }

    static removeClass(id, className) {
        this.getElementById(id).classList.remove(className);
    }

    static addEventListener(id, event, callback) {
        this.getElementById(id).addEventListener(event, callback);
    }

    static removeEventListener(id, event, callback) {
        this.getElementById(id).removeEventListener(event, callback);
    }
}

/**
 * Mainclass of the quiz game
 */
class QuizApp {
    constructor() {
        this.data = [];
        this.randomQuestionNumber = null;
        this.displayOptions = [];
        this.alreadyQuestioned = [];
        this.boundCheckAnswer = this.checkAnswer.bind(this);
    }

    /**
     * Entrypoint to the QuizApp class, load data, reset scores, load new phrase
     */
    async init() {
        await this.loadPhrases();
        DOMHelper.setTextContent('correct-score', '0');
        DOMHelper.setTextContent('incorrect-score', '0');
        this.setupNewPhrase();
    }

    /**
    * Loads the phrases from a JSON datafile with async await.
    */
    async loadPhrases() {
        try {
            let response = await fetch('assets/data/phrases.json');
            this.data = await response.json();
        } catch (error) {
            console.error("There was an error fetching the JSON file", error);
        }
    }

    /**
     * Setup new question, toggle hint, add eventListener to Buttons
     */
    setupNewPhrase() {
        DOMHelper.removeEventListener('answer-button-container', "click", this.boundCheckAnswer);
        this.displayNextQuestion();
        DOMHelper.addEventListener('answer-button-container', "click", this.boundCheckAnswer);
    }

    /**
    * Displays the next question and possible answers on the screen.
    */
    displayNextQuestion() {
        DOMHelper.getElementById('game-hint').style.display = 'none';
        DOMHelper.getElementById('game-hint-header').style.display = 'block';

        do {
            this.randomQuestionNumber = Math.floor(Math.random() * this.data.length);
        } while (this.alreadyQuestioned.includes(this.randomQuestionNumber));

        let questionObject = this.data[this.randomQuestionNumber];
        let wrongOptions = this.data[this.randomQuestionNumber].wrong_options;
        let numberOfPossibleAnswers = DOMHelper.getElementById('answer-button-container').children.length;

        this.displayOptions = this.generateAnswerObject(wrongOptions, questionObject.original_word, numberOfPossibleAnswers - 1);

        DOMHelper.setTextContent('display-question', questionObject.altered_phrase);
        DOMHelper.setTextContent('display-hint', questionObject.source);

        for (let i = 0; i < numberOfPossibleAnswers; i++) {
            DOMHelper.setTextContent(`answer${i + 1}`, this.displayOptions[i].displayValue);
        }
        this.alreadyQuestioned.push(this.randomQuestionNumber);
    }

    /**
    * Generates an array of answer objects, including wrong and one correct answers.
    * 
    * @param {Array} wrongOptions - Array containing potential wrong answers.
    * @param {string} correctWord - The correct answer.
    * @param {number} numberOfWrongAnswers - The number of wrong answers to be included.
    * 
    * @returns {Array} - An array of answer objects shuffled.
    */
    generateAnswerObject(wrongOptions, correctWord, numberOfWrongAnswers) {
        let shuffledWrongOptions = this.fisherYatesShuffle([...wrongOptions]);
        let selectedWrongOptions = shuffledWrongOptions.slice(0, numberOfWrongAnswers).map(option => ({
            displayValue: option,
            displayCorrect: false
        }));

        let correctOption = {
            displayValue: correctWord,
            displayCorrect: true
        };

        return this.fisherYatesShuffle([...selectedWrongOptions, correctOption]);
    }

    /**
    * Checks if the clicked answer button corresponds to the correct answer and triggers the next Phrase to display
    * 
    * @param {Event} event - The click event.
    */
    checkAnswer(event) {
        if (event.target.classList.contains('answer-button')) {
            let index = parseInt(event.target.id.toString().slice(-1)) - 1;
            if (this.displayOptions[index].displayCorrect) {
                this.incrementScore('correct-score');
                this.flashElement('correct');
                this.showCorrectPhraseForDuration(5000, () => {
                    if (this.alreadyQuestioned.length === this.data.length) {
                        this.gameFinished();
                    } else {
                        this.displayNextQuestion();
                    }

                });
            } else {
                this.incrementScore('incorrect-score');
                this.flashElement('incorrect');
            }
        }
    }

    /**
    * Shows the "Correct Phrase" for a given duration of time on the DOM
    * Header of the Phrase will be pulsed
    * Answerbuttons will be disabled for the duration
    * 
    * @param {*} duration - Given duration in milliseconds
    * @param {*} onComplete - Callback 
    */
    showCorrectPhraseForDuration(duration, onComplete) {
        this.setAnswerButtonsEnabled(false);
        let originalHeader = document.getElementById('display-question-header').textContent;
        let originalText = document.getElementById('display-question').textContent;

        DOMHelper.setTextContent('display-question-header', 'Correct Phrase:');
        DOMHelper.setTextContent('display-question', this.data[this.randomQuestionNumber].original_phrase);

        this.flashElement('display-question');

        startCountdown(duration, () => {
            DOMHelper.setTextContent('display-question-header', originalHeader);
            DOMHelper.setTextContent('display-question', originalText);
            this.setAnswerButtonsEnabled(true);
            if (onComplete) {
                onComplete();
            }
        });
    }

    /**
     * Toggle the answer-buttons on/off
     * 
     * @param {boolean} enabled - Boolean state
     */
    setAnswerButtonsEnabled(enabled) {
        let buttons = document.getElementById('answer-button-container').children;
        for (let button of buttons) {
            if (enabled) {
                button.removeAttribute('disabled');
            } else {
                button.setAttribute('disabled', 'true');
            }
        }
    }

    /**
    * Increases the score (either 'correct' or 'incorrect') in the DOM.
    * 
    * @param {string} type - Type of score to increment ('correct' or 'incorrect').
    */
    incrementScore(type) {
        let element = document.getElementById(type);
        let oldScore = parseInt(element.innerText);
        element.innerText = oldScore + 1;
    }

    /**
     * Pulses either #incorrect or #type for visual feedback.
     * 
     * @param {string} type - Type of score to pulse green or red.
     */
    flashElement(type) {
        let element = document.getElementById(type);
        let pulse;
        if (type === 'incorrect') {
            pulse = 'redPulse';
        } else {
            pulse = 'greenPulse';
        }
        element.classList.add(pulse);
        setTimeout(function () {
            element.classList.remove(pulse);
        }, 600);
    }

    /**
    * Shuffles an array using the Fisher-Yates algorithm.
    * 
    * @param {Array} array - The array to shuffle.
    * @returns {Array} - The shuffled array.
    */
    fisherYatesShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * On finish alert the user, reset the alreadyQuestioned Array, reset the game-section of the DOM.
     * Add a new event listener to reveal-game-btn as the old one was already removed
     */
    gameFinished() {
        this.alreadyQuestioned = [];
        alert("Congratulation! You've corrected all phrases in this game. Press ok if you want to play again.");
        DOMHelper.setDisplayStyle('game', 'none');
        DOMHelper.setDisplayStyle('reveal-game-btn', 'flex');
        DOMHelper.addEventListener('reveal-game-btn', 'click', handleRevealGameClick);
        DOMHelper.setTextContent('display-hint', 'Wait for the next game to start...');
    }
}

/**
 * Countdown that will show remaining time in seconds and run a callback once timer reaches 0
 * 
 * @param {Integer} duration - in milliseconds 
 * @param {*} callback - function(s) which should be run
 */
function startCountdown(duration, callback) {
    let timer = duration / 1000;
    let timerElement = document.getElementById("countdown-timer");
    let timerText = timerElement.parentNode;

    timerElement.textContent = timer + ' s';
    timerElement.style.display = 'block';
    timerText.style.display = 'block';


    let countdown = setInterval(() => {
        timer--;
        timerElement.textContent = timer + ' s';
        if (timer <= 0) {
            clearInterval(countdown);
            timerElement.style.display = 'none';
            timerText.style.display = 'none';
            callback();
        }
    }, 1000);
}

/**
 * Reveals the audio controls after clicking the linked button.
 * 
 * @param {String} buttonId - The clicked button
 * @param {String} audioControlId - The audio control to reveal
 */
function revealAudioBtn(buttonId, audioControlId) {
    DOMHelper.addEventListener(buttonId, 'click', function (event) {
        var audioControl = DOMHelper.getElementById(audioControlId);
        var audioControlState = audioControl.style.display;

        DOMHelper.setDisplayStyle(audioControlId, audioControlState === "none" ? "block" : "none");
        DOMHelper.setDisplayStyle(buttonId, audioControlState === "none" ? "none" : "block");
    });
}

/**
 * Event handler for the 'click' event on the 'reveal-game-btn' button.
 * - Toggles the display state of the game element
 * - Initializes a new instance of the QuizApp and invokes its initialization.
 * - Hides the clicked button
 * - Removes itself as an event listener to prevent subsequent triggers.
 * 
 * @param {Event} event - The triggered event object.
 */
function handleRevealGameClick(event) {
    let gameDisplayState = DOMHelper.getElementById('game').style.display;
    DOMHelper.setDisplayStyle('game', gameDisplayState === 'none' ? 'block' : 'none');
    let app = new QuizApp();
    app.init();
    event.target.style.display = 'none';
    DOMHelper.removeEventListener('reveal-game-btn', 'click', handleRevealGameClick);
}

/**
* Add Event Listener to reveal the game
*/
function revealGame() {
    DOMHelper.addEventListener('reveal-game-btn', 'click', handleRevealGameClick);
}

/**
 * Sets up event listeners to prevent multiple audios from playing simultaneously.
 */
function preventMultipleAudios() {
    let audioElements = document.querySelectorAll('.audio');

    audioElements.forEach(audioEl => {
        audioEl.addEventListener('play', function () {
            pauseOtherAudios(audioEl);
        });
    });
}

/**
 * Pauses all audio elements except the one that's currently playing.
 * 
 * @param {HTMLAudioElement} currentAudio - currently played audio element
 */
function pauseOtherAudios(currentAudio) {
    let audioElements = document.querySelectorAll('.audio');

    audioElements.forEach(audioElement => {
        if (audioElement !== currentAudio) {
            audioElement.pause();
        }
    });
}

/**
* Toggle the display of the hint of the quiz
*/
function toggleHint() {
    if (DOMHelper.getElementById('game-hint').style.display === 'none') {
        DOMHelper.setDisplayStyle('game-hint', 'block');
        DOMHelper.setDisplayStyle('game-hint-header', 'none');
    } else {
        DOMHelper.setDisplayStyle('game-hint', 'none');
        DOMHelper.setDisplayStyle('game-hint-header', 'block');
    }
}

/**
 * Entrypoint of the whole logic
 */
document.addEventListener('DOMContentLoaded', () => {
    revealAudioBtn('reveal-intro-btn', 'audio-control-intro');
    revealAudioBtn('reveal-howto-btn', 'audio-control-howto');
    revealAudioBtn('reveal-rules-btn', 'audio-control-rules');
    preventMultipleAudios();
    revealGame();
    DOMHelper.addEventListener('reveal-game-hint', 'click', toggleHint);
});
