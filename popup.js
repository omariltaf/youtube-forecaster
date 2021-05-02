// Checking if the extension should be active on the current page
chrome.storage.local.get(["allowForecasting"], function (storage) {
  if (storage.allowForecasting) {
    shouldShowElementById("forecastResults", false);
    shouldShowElementById("forecastMessages", false);
    shouldShowElementById("forecastButton", true);
  } else {
    shouldShowElementById("forecastButton", false);
    shouldShowElementById("forecastResults", false);
    shouldShowElementById("forecastMessages", true);
    outputForecastMessages("Go to a YouTube Video page");
  }
});

// Button Logic
document.getElementById("forecastButton").addEventListener("click", () => {
  shouldShowElementById("forecastButton", false);
  shouldShowElementById("forecastLoader", true);
  setTimeout(startForecast, 0);
});

function startForecast() {
  chrome.runtime.sendMessage({ message: "startForecast" }, (response) => {
    shouldShowElementById("forecastLoader", false);
    if (response.successful) {
      shouldShowElementById("forecastResults", true);
      outputForecastResults(response);
      // let channelTitle = document.createElement("SPAN");
      // channelTitle.style.color = "blue";
      // channelTitle.innerHTML = response.channelTitle;
      // let dummyForecastDate = document.createElement("SPAN");
      // dummyForecastDate.style.color = "green";
      // dummyForecastDate.innerHTML = "06/03/2021";
      // let startText = document.createTextNode(
      //   "Forecasted next upload date for "
      // );
      // let endText = document.createTextNode(" is on: ");
      // document.getElementById("status").innerHTML = response.channelTitle;
      // document.getElementById("status").appendChild(channelTitle);
      // document.getElementById("forecastResults").innerHTML =
      //   "Most frequent upload days: " + response.forecast.days;
    } else {
      shouldShowElementById("forecastMessages", true);
      outputForecastMessages(response.error);
    }
  });
}

function outputForecastResults(response) {
  document.getElementById("forecastDisplay").textContent =
    response.channelTitle;
}

function outputForecastMessages(forecastMessage) {
  document.getElementById("forecastMessages").textContent = forecastMessage;
}

function shouldShowElementById(elementId, shouldShow) {
  document.getElementById(elementId).style.display = shouldShow
    ? "block"
    : "none";
}
