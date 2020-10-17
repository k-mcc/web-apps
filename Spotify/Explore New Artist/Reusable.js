// Creates a new playlist with the specified name and description.
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

/* @param playlistId      id of the target playlist
 *
 * Adds tracks to a playlist.
 */
function fillPlaylist(playlistId, tracks) {
  var trackUris = "";
  
  for (var i = 0; i < tracks.length; i++) { //i < tracks.length
    if (i < tracks.length - 1) trackUris = trackUris + ("\"" + getTrackUri(tracks[i]) + "\"" + ","); // i < tracks.length - 1
    else trackUris = trackUris + ("\"" + getTrackUri(tracks[i]) + "\"");
  }

  var arr = JSON.parse("[" + trackUris + "]");
  Logger.log(arr);

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
