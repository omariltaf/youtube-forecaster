// Google API ////////////////////////////////////////////////////////////////
function getGoogleApiKey() {
  return "[API_KEY]";
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
