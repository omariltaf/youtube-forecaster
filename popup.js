// Checking if the extension should be active on the current page
chrome.storage.local.get(["allowForecasting"], function (storage) {
  if (storage.allowForecasting) {
    document.getElementById("forecast").style.display = "";
    document.getElementById("result").innerHTML = "";
  } else {
    document.getElementById("forecast").style.display = "none";
    document.getElementById("result").innerHTML = "Go to a Youtube Video page";
  }
});

// Logic for button
document.getElementById("forecast").addEventListener("click", () => {
  document.getElementById("result").innerHTML = "Forecasting...";
  document.getElementById("forecast").style.display = "none";

  // Start Forecasting
  chrome.runtime.sendMessage({ message: "startForecast" }, (response) => {
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

      document.getElementById("result").innerHTML = "";
      document.getElementById("result").appendChild(startText);
      document.getElementById("result").appendChild(channelTitle);
      document.getElementById("result").appendChild(endText);
      document.getElementById("result").appendChild(dummyForecastDate);
    } else {
      document.getElementById("result").innerHTML = response.error;
    }
  });
});
