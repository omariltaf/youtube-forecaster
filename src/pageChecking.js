// Checking the current page ////////////////////////////////////////////////////////////////
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    setForecastingPermission(tab.url);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    setForecastingPermission(changeInfo.url);
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId != chrome.windows.WINDOW_ID_NONE) {
    let queryOptions = { populate: true };
    chrome.windows.get(windowId, queryOptions, (window) => {
      window.tabs.forEach((tab) => {
        if (tab.active) {
          setForecastingPermission(tab.url);
        }
      });
    });
  }
});

function setForecastingPermission(url) {
  let validPageToForecastOn = isYoutubeVideoPage(url);
  let videoId;
  if (validPageToForecastOn) {
    videoId = new URL(url).searchParams.get("v");
  }
  chrome.storage.local.set({
    allowForecasting: validPageToForecastOn,
    videoId: videoId,
  });
}

function isYoutubeVideoPage(url) {
  const urlsToMatch = /www.youtube.com\/watch/;
  return urlsToMatch.test(url);
}
