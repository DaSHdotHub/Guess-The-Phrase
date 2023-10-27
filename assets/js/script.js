//Read in the JSON file after DOM has loaded up.
let data;
let randomQuestionNumber;
let answerOptions = [];
let displayOptions = [];

document.addEventListener("DOMContentLoaded", () => {
    loadPhrases();
    document.getElementById('answer-button-container').addEventListener("click", (event) => {
        checkAnswer(event);
    });
});

/**
 * Callback function executed after the phrases are loaded.
 * It triggers the display of the next question.
 */
function onPhrasesLoaded() {
    displayNextQuestion();
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
function generateAnswerObject(wrongOptions, correctWord, numberOfWrongAnswers) {

    // Grab random wrong answers
    const shuffledWrongOptions = fisherYatesShuffle([...wrongOptions]);
    const selectedWrongOptions = shuffledWrongOptions.slice(0, numberOfWrongAnswers).map(option => ({
        displayValue: option,
        displayCorrect: false
    }));

    const correctOption = {
        displayValue: correctWord,
        displayCorrect: true
    };

    return fisherYatesShuffle([...selectedWrongOptions, correctOption]);
}

/**
 * Displays the next question and possible answers on the screen.
 */
function displayNextQuestion() {
    //Create random number between 0 and length of dataArray
    randomQuestionNumber = (Math.floor(Math.random() * data.length));
    let questionObject = data[randomQuestionNumber];
    let wrongOptions = data[randomQuestionNumber].wrong_options;
    // The number of wrong possible answers is one less than number of buttons to click.
    const numberOfPossibleAnswers = document.getElementById("answer-button-container").children.length;

    // Generate possible answers
    displayOptions = generateAnswerObject(wrongOptions, questionObject.original_word, numberOfPossibleAnswers - 1);

    // Render data from JSON to DOM
    document.getElementById("display-question").textContent = questionObject.altered_phrase;
    document.getElementById("display-hint").textContent = questionObject.source;

    for (let i = 0; i < numberOfPossibleAnswers; i++) {
        document.getElementById(`answer${i + 1}`).textContent = displayOptions[i].displayValue;
    }
}
/**
 * Checks if the clicked answer button corresponds to the correct answer.
 * 
 * @param {Event} event - The click event.
 */
function checkAnswer(event) {
    //Get clicked answer-button
    if (event.target.classList.contains('answer-button')) {
        const index = parseInt(event.target.id.toString().slice(-1)) - 1;
        if (displayOptions[index].displayCorrect) {
            alert("Genius! That was correct.");
            incrementScore('correct');
            displayNextQuestion();
        } else {
            alert("Try again");
            incrementScore('incorrect');
        }
    }
}
/**
 * Increases the score (either 'correct' or 'incorrect') in the DOM.
 * 
 * @param {string} type - Type of score to increment ('correct' or 'incorrect').
 */
function incrementScore(type) {
    const element = document.getElementById(type);
    const oldScore = parseInt(element.innerText);
    element.innerText = oldScore + 1;
}
/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * 
 * @param {Array} array - The array to shuffle.
 * @returns {Array} - The shuffled array.
 */
function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
/**
 * Loads the phrases from a JSON datafile.
 */
async function loadPhrases() {
    try {
        //await fetch returns a promise in form of an http object which is rather a representation of the JSON, it does not contain it actually.
        const response = await fetch('assets/data/phrases.json');
        //awair response returns a second promise, resolving the result of parsing the response body text as JSON.
        data = await response.json();
        //CallBack function that runs when data is loaded
        onPhrasesLoaded();
        //catch error when something went wrong fetching the JSON file
    } catch (error) {
        console.error("There was an error fetching the JSON file", error);
    }
}
