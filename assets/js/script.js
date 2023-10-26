//Read in the JSON file after DOM has loaded up.
let data;

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
    let randomNumber = (Math.floor(Math.random() * data.length));
    document.getElementById("display-question").textContent = data[randomNumber].altered_phrase;
}

