// Google API Key ////////////////////////////////////////////////////////////////
function getGoogleApiKey() {
  return "[API_KEY]";
}

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
    chrome.storage.local.get(["videoId"], function (storage) {
      let channelTitle;
      fetchChannelIdAndTitleFromVideoId(storage.videoId)
        .then((channelIdAndTitle) => {
          channelTitle = channelIdAndTitle.channelTitle;
          return fetchUploadsPlaylistIdFromChannelId(
            channelIdAndTitle.channelId
          );
        })
      .then((uploadsPlaylistId) => {
          return fetchUploadsFromUploadsPlaylistId(uploadsPlaylistId);
      })
      .then((uploads) => {
        let uploadDatetimes = uploads.map((upload) => upload.snippet.title);
        uploadDatetimes.forEach((uploadDatetime) => {
          console.log(uploadDatetime);
        });
      })
      .then((uploadDatetimes) => {
          popupResponse({
            result: "Got uploads successfully!",
            channelTitle: channelTitle,
          });
      })
      .catch((error) => {
        popupResponse({ result: "Error: " + error });
      });
    });
  }
  return true;
});

async function fetchChannelIdAndTitleFromVideoId(videoId) {
  let response = await fetch(buildVideosApiCall(videoId));
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    let jsonResponse = await response.json();
    return {
      channelId: jsonResponse.items[0].snippet.channelId,
      channelTitle: jsonResponse.items[0].snippet.channelTitle,
    };
  }
}

async function fetchUploadsPlaylistIdFromChannelId(channelId) {
  let response = await fetch(buildChannelsApiCall(channelId));
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    let jsonResponse = await response.json();
    return jsonResponse.items[0].contentDetails.relatedPlaylists.uploads;
  }
}

async function fetchUploadsFromUploadsPlaylistId(uploadsPlaylistId) {
  let response = await fetch(buildPlaylistItemsApiCall(uploadsPlaylistId));
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else {
    let jsonResponse = await response.json();
    return jsonResponse.items;
  }
}

function buildVideosApiCall(videoId) {
  const apiKey = "&key=" + getGoogleApiKey();
  const apiUrl = "https://youtube.googleapis.com/youtube/v3/videos";
  const apiOptions = "?part=snippet&id=" + videoId;
  const apiCall = apiUrl + apiOptions + apiKey;
  return apiCall;
}

function buildChannelsApiCall(channelId) {
  const apiKey = "&key=" + getGoogleApiKey();
  const apiUrl = "https://youtube.googleapis.com/youtube/v3/channels";
  const apiOptions = "?part=contentDetails&id=" + channelId;
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
