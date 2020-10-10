var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("topArtists");

/* @param name          title of new playlist
 * @param description   description of new playlist
 * @return the http response containing the new playlist's Spotify uri
 *
 * Creates a new playlist in the user's Spotify account.
 */
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
 * @param requirements    array of requirements for tracks to be added
 * @param clean           false if added tracks can be marked as "explicit"
 *
 * Adds tracks to a playlist.
 */
function fillPlaylist(playlistId, requirements, clean) {

  var playlist = getPlaylist(requirements, clean);
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

/* @param requirements    array of requirements for tracks to be added
 * @param clean           false if added tracks can be marked as "explicit"
 * @return array of tracks that meet the requirements
 *
 * Returns an array of tracks that meet the requirements.
 */
function getPlaylist(requirements, clean) {
  var playlist = [];

  for (var row = 2; row <= sheet.getLastRow(); row++) {
    var column = 2;
    var hits = [];
    var tracks = [];
    var topArtistId = sheet.getRange(row, column).getValue();
    hits.push(getArtistTracks(topArtistId));

    var trackType = getValues(hits[0], "type");
    var trackUri = getValues(hits[0], "uri");

    for (var i = 0; i < trackUri.length; i++) {
      if (  trackType[i] == "track"  ) {
        var id = trackUri[i].substring(14);
        tracks.push(id);
      }
    }

    var passingTracksInRow = analyzeTrackList(tracks, requirements, clean);
    for (var i = 0; i < passingTracksInRow.length; i++) playlist.push(passingTracksInRow[i]);

  }

  return playlist;
}

/* @param id      id of the target artist
 * @return http response containing the artist's top tracks
 *
 * Pulls the most popular tracks of the artist from Spotify's API.
 */
function getArtistTracks(id) {

  var sp = getService();

  var url = "https://api.spotify.com/v1/artists/" + id + "/top-tracks?market=ES";

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

/* @param tracks          array of track ids
 * @param requirements    array of requirements for tracks to be added
 * @param clean           false if added tracks can be marked as "explicit"
 * @return array of tracks that satisfy the requirements
 *
 * Identifies all tracks in the array that meet the given requirements.
 */
function analyzeTrackList(tracks, requirements, clean) {

  var passingTracks = [];
  var cleanTracks = getCleanTracks(tracks);
  var properties = getAudioFeatures(tracks);

  for (var i = 0; i < tracks.length; i++) {
    var pass = true;

    for (var j = 0; j < requirements.length; j++) {
      var scores = getValues(properties, (requirements[j])[0]);
      if (!compare((requirements[j])[2], scores[i], (requirements[j])[1])) pass = false;
    }

    if (!cleanTracks.includes(tracks[i])) pass = false;

    if (pass == true) passingTracks.push(tracks[i]);
  }
  return passingTracks;
}

/* @param idArr      array of track ids
 * @return JavaScript object of the audio features for the tracks
 *
 * Returns the audio features for all tracks in the array
 */
function getAudioFeatures(idArr) {
  var sp = getService();

  var idStr = "";
  for (var i = 0; i < idArr.length; i++) {
    if (i < idArr.length-1) idStr = idStr + (idArr[i] + ",");
    else idStr = idStr + (idArr[i]);
  }

  var sp = getService();
  if (sp.hasAccess()) {

  var url = "https://api.spotify.com/v1/audio-features/?ids=" + idStr;

  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  return result;
  } else {
    var authUrl = sp.getAuthorizationUrl();
    Logger.log('Browse to URL below. Then run the script. %s',
        authUrl);
   }
}

/* @param idArr      array of track ids
 * @return array of the clean tracks' ids
 *
 * Returns an array of ids of all the racks not marked "explicit"
 */
function getCleanTracks(idArr) {
  var sp = getService();

  var idStr = "";
  for (var i = 0; i < idArr.length; i++) {
    if (i < idArr.length-1) idStr = idStr + (idArr[i] + ",");
    else idStr = idStr + (idArr[i]);
  }

  var sp = getService();
  if (sp.hasAccess()) {

  var url = "https://api.spotify.com/v1/tracks?ids=" + idStr;

  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  var explicitArr = getValues(result, "explicit"); // An array of booleans
  var cleanIdArr = [];
  for (var i = 0; i < idArr.length; i++) if (explicitArr[i] == false) cleanIdArr.push(idArr[i]);
  return cleanIdArr;
  } else {
    var authUrl = sp.getAuthorizationUrl();
    Logger.log('Browse to URL below. Then run the script. %s',
        authUrl);
   }
}

/* @param trackID      ID of the track
 * @return uri for the track as a String
 *
 * Formats a track ID into a Spotify track uri
 */
function getTrackUri(trackID) {
  return "spotify:track:" + trackID;
}

/* @param operator      a String containing the operator that will compare the 2 values
 * @param score         the value being judged
 * @param target        the baseline value to be compared to
 * @return the result of the comparison
 *
 * Returns the validity of the score + operator + target statement
 */
function compare(operator, score, target) {
  if (operator == ">") return score > target;
  else if (operator == "<") return score < target;
  else if (operator == "<=") return score <= target;
  else if (operator == ">=") return score >= target;
  else if (operator == "==") return score == target;
  else if (operator == "!=") return score != target;
}
