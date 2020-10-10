// qualifier options: acousticness, danceability, energy, instrumentalness, 
//                    liveness, loudness, speechiness, valence, & tempo
function main() {
  var qualifier = "energy";
  var minScore = 0.8;
  
  var name = "API Playlist 1";
  var description = "The most danceable songs from top artists. Algorithmically calculated by my web app";
  //createPlaylist(name, description);
  
  fetchTopArtists();
  
  fillPlaylist(qualifier, minScore);
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

// returns the ID of the user who initially authorized web-app access
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

function fillPlaylist(qualifier, minScore) {
  
  var bestTracks = calculateBestPlaylist(qualifier, minScore);
  
  var bestTracksUris = "";
  
  for (var i = 0; i < bestTracks.length; i++) {
    if (i < bestTracks.length-1) bestTracksUris = bestTracksUris + ("\"" + getTrackUri(bestTracks[i]) + "\"" + ",");
    else bestTracksUris = bestTracksUris + ("\"" + getTrackUri(bestTracks[i]) + "\"");
  }
  
  var arr = JSON.parse("[" + bestTracksUris + "]");
  
  var sp = getService();
  if (sp.hasAccess()) {
    
  var payload =  Utilities.jsonStringify(
    {"uris" : arr
    }
  );
    
    Logger.log(payload);
    
    var playlistID = "6dehfboMSkAogN12rSCZp0"; // future: figure out how to create a new playlist and retrieve its uri or id. 
    var url = "https://api.spotify.com/v1/playlists/" + playlistID + "/tracks";
    
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


function getTrackUri(trackID) {
  return "spotify:track:" + trackID;
}
