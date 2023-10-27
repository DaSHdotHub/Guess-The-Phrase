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


//Algorithm to check if clcked button is 'correct' or 'incorrect'
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

function onPhrasesLoaded() {
    displayNextQuestion();
}

//Displays the question
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
        //Flush answerOptions and DisplayOptions before filling with new data
        answerOptions = [];
        displayOptions = [];
        //Pickup 3 random wrong answers from the dataset "wrong_options"
        for (i = 0; i < 3; i++) {
            randomNumber = Math.floor(Math.random() * wrongOptions.length);
            answerOptions.push({
                answerValue: wrongOptions[randomNumber],
                answerCorrect: false
            });
            //remove picked up dataset for next iteration
            wrongOptions.splice(randomNumber, 1);
        }
        //Add correct answer to set
        answerOptions.push({
            answerValue: questionObject.original_word,
            answerCorrect: true
        });
        //Reorder elements
        arraySize = answerOptions.length;
        for (i = 0; i < arraySize; i++) {
            randomNumber = Math.floor(Math.random() * answerOptions.length);
            displayOptions.push({
                displayValue: answerOptions[randomNumber].answerValue,
                displayCorrect: answerOptions[randomNumber].answerCorrect
            });
            //remove picked up dataset for next iteration
            answerOptions.splice(randomNumber, 1);
        }
    }
}
//Increment score for correct answers in th DOM
function incrementScore(type) {
    const element = document.getElementById(type);
    const oldScore = parseInt(element.innerText);
    element.innerText = oldScore + 1;
}
