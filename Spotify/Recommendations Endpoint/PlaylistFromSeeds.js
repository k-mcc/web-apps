// Leverages the Spotify API's built-in recommendations endpoint 
// to create a new playlist using top artists as recommendation seeds.

function myFunction() {
  var httpResponse = createPlaylist("Recommendations From Seeds","Description goes here");
  Logger.log(httpResponse);
  var uris = getValues(httpResponse, "uri");
  var playlistId = "";
  for (var i = 0; i < uris.length; i++) {
    if (uris[i].includes("playlist")) playlistId = (uris[i]).substring(17);
  }
  fillPlaylist(playlistId);
}

function createPlaylist(name, description) {
  var sp = getService();
  if (sp.hasAccess()) {

  var log = '<br>Upload Includes:<br><br>';

  var payload =  Utilities.jsonStringify(
    {"name" : name,
     "description" : description
    }
  );

    var userID = getUserID();
    var url = "https://api.spotify.com/v1/users/" + userID + "/playlists";

    // Makes request through refreshToken(), which accommodates for both valid and expired sessions.
    var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        'method': 'post',
        'contentType': 'application/json',
        'payload': payload,
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
    var result = JSON.parse(response.getContentText());
    log += result;
    return result;
   } else {
    var authUrl = sp.getAuthorizationUrl();
    Logger.log('Browse to URL below. Then run the script. %s',
        authUrl);
   }
}

/* @param playlistId      id of the target playlist
 *
 * Adds tracks to a playlist.
 */
function fillPlaylist(playlistId) {

  var playlist = getPlaylist();
  var trackUris = "";

  for (var i = 0; i < playlist.length; i++) {
    if (i < playlist.length-1) trackUris = trackUris + ("\"" + getTrackUri(playlist[i]) + "\"" + ",");
    else trackUris = trackUris + ("\"" + getTrackUri(playlist[i]) + "\"");
  }

  var arr = JSON.parse("[" + trackUris + "]");

  var sp = getService();
  if (sp.hasAccess()) {

  var payload =  Utilities.jsonStringify(
    {"uris" : arr
    }
  );

    Logger.log(payload);

    var url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";

    // Makes request through refreshToken(), which accommodates for both valid and expired sessions.
    var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        'method': 'post',
        'contentType': 'application/json',
        'payload': payload,
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
    var result = JSON.parse(response.getContentText());
    Logger.log(result);
   } else {
    var authUrl = sp.getAuthorizationUrl();
    Logger.log('Browse to URL below. Then run the script. %s',
        authUrl);
   }

}

/* @param obj    the JavaScript object to be searched
 * @param key    the key word to search the JavaScript object for
 * @return array of values that the key maps to in obj
 *
 * Returns an array of values that are mapped to the key.
 */
function getValues(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getValues(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}

/* @param trackID      ID of the track
 * @return uri for the track as a String
 *
 * Formats a track ID into a Spotify track uri
 */
function getTrackUri(trackID) {
  return "spotify:track:" + trackID;
}

/* @param requirements    array of requirements for tracks to be added
 * @param clean           false if added tracks can be marked as "explicit"
 * @return array of tracks that meet the requirements
 *
 * Returns an array of tracks that meet the requirements.
 */
function getPlaylist() {
  var tracks = [];
  var result = getTracks();

  var trackType = getValues(result, "type");
  var trackUri = getValues(result, "uri");

  for (var i = 0; i < trackUri.length; i++) {
    if (  trackType[i] == "track"  ) {
      var id = trackUri[i].substring(14);
      tracks.push(id);
    }
  }
  
  return tracks;
}

/* @param id      id of the target artist
 * @return http response containing the artist's top tracks
 *
 * Pulls the most popular tracks of the artist from Spotify's API.
 */
function getTracks() {

  var sp = getService();
  
  var artistSeed = "&seed_artists=";
  var artists = getArtists();
  //var trackSeed = "&seed_tracks=";
  //var tracks = "0c6xIDDpzE81m2q797ordA";

  var url = "https://api.spotify.com/v1/recommendations?market=US" + artistSeed + artists + "&min_energy=0.4&min_popularity=50";

  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());

  return result;
}

/* @return user ID of the Spotify account that initially authorized web app access.
 */
function getUserID() {
  var sp = getService();
  var url = "https://api.spotify.com/v1/me";
  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  var id = getValues(result, "id");
  return id[0];
}

function getArtists() { //  ~ TEMPORARY IMPLEMENTATION!!!!!!! ~
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("topArtists");
  
  var artists = [];
  for (var row = 2; row <= 5; row++) {
    artists.push(sheet.getRange(row, 2).getValue());
  }
  
  var str;
  for (var i = 0; i < artists.length; i++) {
    if (i != 0) str = str + "%2C" + artists[i];
    else str = artists[i];
  }
  
  return str;
}
