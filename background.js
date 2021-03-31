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
          let uploadDatetimes = uploads.map(
            (upload) => new Date(upload.contentDetails.videoPublishedAt)
          );

          let uploadDatetimesInRange = getUploadDatetimesInRange(
            uploadDatetimes
          );

          return determineForecast(uploadDatetimesInRange);
        })
        .then((forecast) => {
          popupResponse({
            successful: true,
            channelTitle: channelTitle,
            forecast: null,
          });
        })
        .catch((error) => {
          popupResponse({ successful: false, error: error.toString() });
        });
    });
  }
  return true;
});

function getUploadDatetimesInRange(uploadDatetimes) {
  const rangeOfMonths = 12;
  let cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - rangeOfMonths);

  let uploadDatetimesInRange = uploadDatetimes.filter(
    (datetime) => datetime > cutoff
  );
  if (uploadDatetimesInRange.length === 0) {
    throw new Error("Forecasting error! No uploads found within range");
  }
  return uploadDatetimesInRange;
}

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
    "?part=contentDetails%2Csnippet&maxResults=50&playlistId=" +
    uploadsPlaylistId;
  const apiCall = apiUrl + apiOptions + apiKey;
  return apiCall;
}

// Determine the forecast ////////////////////////////////////////////////////////////
function determineForecast(uploadDatetimes) {
  let uploadDays = new Map();
  let uploadHours = new Map();
  uploadDatetimes.forEach((uploadDatetime) => {
    incrementUploadDaysMap(uploadDays, getDayOfWeek(uploadDatetime.getDay()));
    incrementUploadHoursMap(uploadHours, uploadDatetime.getHours());
  });
  let sortedUploadDays = new Map(
    [...uploadDays.entries()].sort((a, b) => b[1] - a[1])
  );
  let sortedUploadHours = new Map(
    [...uploadHours.entries()].sort((a, b) => b[1] - a[1])
  );
  sortedUploadDays.forEach((count, day) => {
    console.log(`${count} uploads on ${day}s`);
  });
  sortedUploadHours.forEach((count, hour) => {
    console.log(`${count} uploads at hour: ${hour}`);
  });
}

function incrementUploadDaysMap(uploadDays, day) {
  if (!uploadDays.has(day)) {
    uploadDays.set(day, 1);
  } else {
    let count = uploadDays.get(day);
    uploadDays.set(day, count + 1);
  }
}

function incrementUploadHoursMap(uploadHours, hour) {
  if (!uploadHours.has(hour)) {
    uploadHours.set(hour, 1);
  } else {
    let count = uploadHours.get(hour);
    uploadHours.set(hour, count + 1);
  }
}

function getDayOfWeek(dayIndex) {
  let orderedDaysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return orderedDaysOfWeek[dayIndex];
}
