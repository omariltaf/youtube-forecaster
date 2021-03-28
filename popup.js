// Checking if the extension should be active on the current page
chrome.storage.local.get(["allowForecasting"], function (storage) {
  if (storage.allowForecasting) {
    document.getElementById("doForecast").style.display = "";
    document.getElementById("status").innerHTML = "";
  } else {
    document.getElementById("doForecast").style.display = "none";
    document.getElementById("status").innerHTML = "Go to a Youtube Video page";
  }
});

// Logic for button
document.getElementById("doForecast").addEventListener("click", () => {
  document.getElementById("status").innerHTML = "Forecasting...";
  document.getElementById("doForecast").style.display = "none";

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

      document.getElementById("status").innerHTML = "";
      document.getElementById("status").appendChild(startText);
      document.getElementById("status").appendChild(channelTitle);
      document.getElementById("status").appendChild(endText);
      document.getElementById("status").appendChild(dummyForecastDate);
    } else {
      document.getElementById("status").innerHTML = response.error;
    }
  });
});
