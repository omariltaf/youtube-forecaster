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
    document.getElementById("channelTitle").innerHTML = response.channelTitle;
    document.getElementById("result").innerHTML = response.result;
  });
});
