//Read in the JSON file after DOM has loaded up.
let data;
let randomQuestionNumber;
let answerOptions = [];
let displayOptions = [];

document.addEventListener("DOMContentLoaded", () => {
    loadPhrases();
    checkAnswer();
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

function onPhrasesLoaded() {
    displayQuestion();
}

function checkAnswer() {
    let pushedButtons = document.getElementsByClassName('answer-button');
    //This code snippet will return the pushed button as number.
    for (let button of pushedButtons) {
        button.addEventListener("click", (event) => {
            let userResponse = displayOptions[parseInt(event.target.id.toString().slice(-1)) - 1].displayCorrect;
            if (userResponse) {
                userResponse = "correct";
                alert("Genius! That was correct.");
                incrementScore(userResponse);
                displayQuestion();
            } else {
                userResponse = "incorrect";
                alert("Try again");
                incrementScore(userResponse);
            }

        });
    }
}

//Displays the question
function displayQuestion() {
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
function incrementScore(userResponse) {
    let oldScore = parseInt(document.getElementById(userResponse).innerText);
    document.getElementById(userResponse).innerText = ++oldScore;
}
