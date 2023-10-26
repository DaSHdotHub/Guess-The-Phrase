//Read in the JSON file after DOM has loaded up.
let data;
let answerOptions = [];
let displayOptions = [];

document.addEventListener("DOMContentLoaded", () => {
    loadPhrases();
});

async function loadPhrases() {
    try {
        //await fetch returns a promise in form of an http object which is rather a representation of the JSON, it does not contain it actually.
        const response = await fetch('/assets/data/phrases.json');
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

function displayQuestion() {
    //Create random number between 0 and length of dataArray
    let randomQuestionNumber = (Math.floor(Math.random() * data.length));
    let questionObject = data[randomQuestionNumber];
    wrongOptions = data[randomQuestionNumber].wrong_options;
    //Create possible answers array
    generateAnswerObject();
    console.log(displayOptions);

    //Render data from JSON to DOM
    document.getElementById("display-question").textContent = questionObject.altered_phrase;
    document.getElementById("display-hint").textContent = questionObject.source;

    function generateAnswerObject() {
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
        debugger;
        arraySize = answerOptions.length;
        for (i = 0; i < arraySize; i++) {
            randomNumber = Math.floor(Math.random() * answerOptions.length);
            displayOptions.push({
                displayValue: answerOptions[randomNumber].answerValue,
                displaCorrect: answerOptions[randomNumber].answerCorrect
            });
            //remove picked up dataset for next iteration
            answerOptions.splice(randomNumber, 1);
        }
    }
}