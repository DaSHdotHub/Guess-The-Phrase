class QuizApp {
    constructor() {
        this.data = [];
        this.randomQuestionNumber = null;
        this.displayOptions = [];
        this.alreadyQuestioned = [];
    }

    /**
    * Inits the application and resets the results to 0
    */
    async init() {
        await this.loadPhrases();
        document.getElementById('correct-score').innerText = 0;
        document.getElementById('incorrect-score').innerText = 0;
        this.displayNextQuestion();
        document.getElementById('answer-button-container').addEventListener("click", (event) => {
            this.checkAnswer(event);
        });
    }

    /**
    * Loads the phrases from a JSON datafile.
    */
    async loadPhrases() {
        try {
            //await fetch returns a promise in form of an http object which is rather a representation of the JSON, it does not contain it actually.
            let response = await fetch('assets/data/phrases.json');
            //awair response returns a second promise, resolving the result of parsing the response body text as JSON.
            this.data = await response.json();
            //CallBack function that runs when data is loaded
            this.onPhrasesLoaded();
            //catch error when something went wrong fetching the JSON file
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
 * 
 * @param {*} duration - Given duration in milliseconds
 * @param {*} onComplete - Callback 
 */
    showCorrectPhraseForDuration(duration, onComplete) {
        let originalHeader = document.getElementById("display-question-header").textContent;
        let originalText = document.getElementById("display-question").textContent;
    
        document.getElementById("display-question-header").textContent = "Correct Phrase";
        document.getElementById("display-question").textContent = this.data[this.randomQuestionNumber].original_phrase;
    
        startCountdown(duration, () => {
            document.getElementById("display-question-header").textContent = originalHeader;
            document.getElementById("display-question").textContent = originalText;
            if (onComplete) {
                onComplete();
            }
        });
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
        if (type === 'correct') {
            pulse = 'greenPulse';
        } else {
            pulse = 'redPulse';
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
     */
    gameFinished() {
        this.alreadyQuestioned = [];
        alert("Congratulation! You've corrected all phrases in this game. Press ok if you want to play again.");
        document.getElementById('game').style.display = "none";
        document.getElementById('reveal-game-btn').style.display = 'block';
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
*Toggle the display of the hint of the quiz
*/
function revealHint() {
    document.getElementById('reveal-game-hint').addEventListener('click', function (event) {
        if (document.getElementById('game-hint').style.display === 'none') {
            document.getElementById('game-hint').style.display = 'block';
            document.getElementById('game-hint-header').style.display = 'none';
        } else {
            document.getElementById('game-hint').style.display = 'none';
            document.getElementById('game-hint-header').style.display = 'block';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    revealAudioBtn('reveal-intro-btn', 'audio-control-intro');
    revealAudioBtn('reveal-howto-btn', 'audio-control-howto');
    revealAudioBtn('reveal-rules-btn', 'audio-control-rules');
    revealGame();
    revealHint();
});
