let submitElement = document.getElementById("submit").addEventListener("click", () => displaySum());

function displaySum() {
    let num1 = parseInt(document.getElementById("number1").value);
    let num2 = parseInt(document.getElementById("number2").value);
    document.getElementById("result").innerHTML = num1 + num2;
}
