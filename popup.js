// Checking if the extension should be active on the current page
chrome.storage.local.get(["allowForecasting"], function (storage) {
  if (storage.allowForecasting) {
    showForecastButton();
    hideForecastCard();
  } else {
    hideForecastButton();
    showForecastCard();
    document.getElementById("status").innerHTML = "Go to a Youtube Video page";
  }
});

// Logic for button
document.getElementById("forecastButton").addEventListener("click", () => {
  hideForecastButton();
  showLoader();
  setTimeout(startForecast, 2000);
});

function startForecast() {
  chrome.runtime.sendMessage({ message: "startForecast" }, (response) => {
    hideLoader();
    showForecastCard();
    if (response.successful) {
      let channelTitle = document.createElement("SPAN");
      channelTitle.style.color = "blue";
      channelTitle.innerHTML = response.channelTitle;

      let dummyForecastDate = document.createElement("SPAN");
      dummyForecastDate.style.color = "green";
      dummyForecastDate.innerHTML = "06/03/2021";

      let startText = document.createTextNode(
        "Forecasted next upload date for "
      );
      let endText = document.createTextNode(" is on: ");

      document.getElementById("status").innerHTML = response.channelTitle;
      // document.getElementById("status").appendChild(channelTitle);

      // document.getElementById("forecastCard").innerHTML =
      //   "Most frequent upload days: " + response.forecast.days;
    } else {
      document.getElementById("status").innerHTML = response.error;
    }
  });
}

function hideForecastButton() {
  document.getElementById("forecastButton").style.display = "none";
}

function showForecastButton() {
  document.getElementById("forecastButton").style.display = "";
}

function hideLoader() {
  document.getElementById("forecastLoader").style.display = "none";
}

function showLoader() {
  document.getElementById("forecastLoader").style.display = "block";
}

function hideForecastCard() {
  document.getElementById("forecastCard").style.display = "none";
}

function showForecastCard() {
  document.getElementById("forecastCard").style.display = "";
}
