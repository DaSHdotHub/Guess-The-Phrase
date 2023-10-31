class QuizApp {
    constructor() {
        this.data = [];
        this.randomQuestionNumber = null;
        this.displayOptions = [];
        this.alreadyQuestioned = [];
        //bind future event listeners to instance variable
        this.boundCheckAnswer = this.checkAnswer.bind(this);
    }

    /**
    * Inits the application and resets the results to 0
    */
    async init() {
        await this.loadPhrases();
        document.getElementById('correct-score').innerText = 0;
        document.getElementById('incorrect-score').innerText = 0;
        this.displayNextQuestion();
        this.revealHint();
        document.getElementById('answer-button-container').addEventListener("click", this.boundCheckAnswer);
    }

    /**
    * Loads the phrases from a JSON datafile with async await.
    */
    async loadPhrases() {
        try {
            let response = await fetch('assets/data/phrases.json');
            this.data = await response.json();
            this.onPhrasesLoaded();
        } catch (error) {
            console.error("There was an error fetching the JSON file", error);
        }
    }

    /** Callback function executed after the phrases are loaded.
    * It triggers the display of the next question.
    */
    onPhrasesLoaded() {
        this.displayNextQuestion();
    }

    /**
    * Displays the next question and possible answers on the screen.
    */
    displayNextQuestion() {
        document.getElementById('game-hint').style.display = 'none';
        document.getElementById('game-hint-header').style.display = 'block';

        do {
            this.randomQuestionNumber = Math.floor(Math.random() * this.data.length);
        } while (this.alreadyQuestioned.includes(this.randomQuestionNumber));
        this.alreadyQuestioned.push(this.randomQuestionNumber);
        if (this.alreadyQuestioned.length === this.data.length) {
            this.gameFinished();
        }

        let questionObject = this.data[this.randomQuestionNumber];
        let wrongOptions = this.data[this.randomQuestionNumber].wrong_options;
        let numberOfPossibleAnswers = document.getElementById("answer-button-container").children.length;

        this.displayOptions = this.generateAnswerObject(wrongOptions, questionObject.original_word, numberOfPossibleAnswers - 1);

        document.getElementById("display-question").textContent = questionObject.altered_phrase;
        document.getElementById("display-hint").textContent = questionObject.source;

        for (let i = 0; i < numberOfPossibleAnswers; i++) {
            document.getElementById(`answer${i + 1}`).textContent = this.displayOptions[i].displayValue;
        }
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
                    this.displayNextQuestion();

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
        let originalHeader = document.getElementById("display-question-header").textContent;
        let originalText = document.getElementById("display-question").textContent;

        document.getElementById("display-question-header").textContent = "Correct Phrase";
        document.getElementById("display-question").textContent = this.data[this.randomQuestionNumber].original_phrase;

        this.flashElement('display-question');

        startCountdown(duration, () => {
            document.getElementById("display-question-header").textContent = originalHeader;
            document.getElementById("display-question").textContent = originalText;
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
     * Pulses either the correct or incorrect row for visual feedback.
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
     * Event Listener for game hint
     */
    revealHint() {
        document.getElementById('reveal-game-hint').addEventListener('click', () => this.toggleHint());
    }

    /**
    * Toggle the display of the hint of the quiz
    */
    toggleHint() {
        const gameHint = document.getElementById('game-hint');
        const gameHintHeader = document.getElementById('game-hint-header');

        if (gameHint.style.display === 'none') {
            gameHint.style.display = 'block';
            gameHintHeader.style.display = 'none';
        } else {
            gameHint.style.display = 'none';
            gameHintHeader.style.display = 'block';
        }
    }

    /**
     * On finish alert the user, reset the alreadyQuestioned Array, reset the game-section of the DOM.
     * Also remove the event listener so it wont be stacked on a new gamerun.
     */
    gameFinished() {
        this.alreadyQuestioned = [];
        alert("Congratulation! You've corrected all phrases in this game. Press ok if you want to play again.");
        document.getElementById('game').style.display = "none";
        document.getElementById('reveal-game-btn').style.display = 'flex';
        document.getElementById('answer-button-container').removeEventListener("click", this.boundCheckAnswer);

    }
}

/**
 * Countdown that will show remaining time in seconds and run a callback once timer reaches 0
 * 
 * @param {BigInt} duration - in milliseconds 
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
    document.getElementById(buttonId).addEventListener('click', function (event) {
        var audioControl = document.getElementById(audioControlId);
        var buttonControl = event.target;
        if (audioControl.style.display === "none") {
            audioControl.style.display = "block";
            buttonControl.style.display = "none";
        } else {
            audioControl.style.display = "none";
        }
    });
}

/**
*Reveal the display of the quiz
*/
function revealGame() {
    document.getElementById('reveal-game-btn').addEventListener('click', function (event) {
        document.getElementById('game').style.display = "block";
        event.target.style.display = "none";
        let app = new QuizApp();
        app.init();
    });
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
 * Entrypoint of the whole logic
 */
document.addEventListener('DOMContentLoaded', () => {
    revealAudioBtn('reveal-intro-btn', 'audio-control-intro');
    revealAudioBtn('reveal-howto-btn', 'audio-control-howto');
    revealAudioBtn('reveal-rules-btn', 'audio-control-rules');
    preventMultipleAudios();
    revealGame();
});
