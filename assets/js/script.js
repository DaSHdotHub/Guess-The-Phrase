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

function onPhrasesLoaded() {
    displayNextQuestion();
}

//Displays next question
function displayNextQuestion() {
    //Create random number between 0 and length of dataArray
    randomQuestionNumber = (Math.floor(Math.random() * data.length));
    let questionObject = data[randomQuestionNumber];
    wrongOptions = data[randomQuestionNumber].wrong_options;
    //Create possible answers array
    generateAnswerObject();

    //Render data from JSON to DOM
    document.getElementById("display-question").textContent = questionObject.altered_phrase;
    document.getElementById("display-hint").textContent = questionObject.source;

    document.getElementById("answer1").textContent = displayOptions[0].displayValue;
    document.getElementById("answer2").textContent = displayOptions[1].displayValue;
    document.getElementById("answer3").textContent = displayOptions[2].displayValue;
    document.getElementById("answer4").textContent = displayOptions[3].displayValue;

    function generateAnswerObject() {
        // Grab 3 random wrong options
        const shuffledWrongOptions = fisherYatesShuffle([...wrongOptions]);
        const selectedWrongOptions = shuffledWrongOptions.slice(0, 3).map(option => ({
            displayValue: option,
            displayCorrect: false
        }));

        const correctOption = {
            displayValue: data[randomQuestionNumber].original_word,
            displayCorrect: true
        };

        displayOptions = fisherYatesShuffle([...selectedWrongOptions, correctOption]);
    }

}
//Algorithm to check if clicked button is 'correct' or 'incorrect'
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
//Increment score for correct answers in th DOM
function incrementScore(type) {
    const element = document.getElementById(type);
    const oldScore = parseInt(element.innerText);
    element.innerText = oldScore + 1;
}
//Shuffle an array with fisher yates algorithm
function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
//Readin the JSON datafile
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
