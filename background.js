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

// Running the forecast ////////////////////////////////////////////////////////////////
chrome.runtime.onMessage.addListener((popupRequest, sender, popupResponse) => {
  if (popupRequest.message === "startForecast") {
    fetchUploadsPlaylistId()
      .then((uploadsPlaylistId) => {
        return fetchUploads(uploadsPlaylistId);
      })
      .then((uploads) => {
        let uploadDatetimes = uploads.map((upload) => upload.snippet.title);
        uploadDatetimes.forEach((uploadDatetime) => {
          console.log(uploadDatetime);
        });
      })
      .then((uploadDatetimes) => {
        popupResponse({ result: "Got uploads successfully!" });
      })
      .catch((error) => {
        popupResponse({ result: "Error: " + error });
      });
  }
  return true;
});

async function fetchUploadsPlaylistId() {
  let response = await fetch(buildChannelsApiCall());
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    let jsonResponse = await response.json();
    // Assuming only the first channel in list is relevant
    return jsonResponse.items[0].contentDetails.relatedPlaylists.uploads;
  }
}

async function fetchUploads(uploadsPlaylistId) {
  let response = await fetch(buildPlaylistItemsApiCall(uploadsPlaylistId));
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    let jsonResponse = await response.json();
    return jsonResponse.items;
  }
}

function buildChannelsApiCall() {
  const apiKey = "&key=" + getGoogleApiKey();
  const apiUrl = "https://youtube.googleapis.com/youtube/v3/channels";
  const apiOptions = "?part=contentDetails&forUsername=tomscott";
  const apiCall = apiUrl + apiOptions + apiKey;
  return apiCall;
}

function buildPlaylistItemsApiCall(uploadsPlaylistId) {
  const apiKey = "&key=" + getGoogleApiKey();
  const apiUrl = "https://youtube.googleapis.com/youtube/v3/playlistItems";
  const apiOptions =
    "?part=contentDetails%2Csnippet&maxResults=5&playlistId=" +
    uploadsPlaylistId;
  const apiCall = apiUrl + apiOptions + apiKey;
  return apiCall;
}

function getGoogleApiKey() {
  return "[API_KEY]";
}
