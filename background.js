try {
  importScripts(
    "src/determineForecast.js",
    "src/googleApi.js",
    "src/pageChecking.js"
  );
} catch (e) {
  console.error(e);
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
            forecast: forecast,
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
