// Creates a playlist of kid-friendly top hits from your latest favorite artists, 
// so that everyone in the room can enjoy the music.

function createKidFriendlyPlaylist() {
  var httpResponse = createPlaylist("Kid-Friendly Playlist","Kid-friendly top hits from your latest favorite artists, so that everyone in the room can enjoy the music.");
  Logger.log(httpResponse);
  var uris = getValues(httpResponse, "uri");
  var playlistId = "";
  for (var i = 0; i < uris.length; i++) {
    if (uris[i].includes("playlist")) playlistId = (uris[i]).substring(17);
  }
  fillPlaylist(playlistId);
}

function fillPlaylist(playlistId) {
  
  var playlist = getPlaylist();
  Logger.log(playlist);
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

function getPlaylist() {
  var playlist = [];
  
  for (var row = 2; row <= sheet.getLastRow(); row++) {
    var column = 2;
    var hits = [];
    var tracks = [];
    var topArtistId = sheet.getRange(row, column).getValue();
    hits.push(getArtistTracks(topArtistId));
    
    var trackType = getValues(hits[0], "type");
    var trackExplicitness = getValues(hits[0], "explicit");
    var trackUri = getValues(hits[0], "uri");
    
    for (var i = 0; i < trackUri.length; i++) {
      if (  trackType[i] == "track"  ) {
        var id = trackUri[i].substring(14);
        tracks.push(id);
      }
    }
    
    var passingTracksInRow = analyzeTrackList(tracks);
    for (var i = 0; i < passingTracksInRow.length; i++) playlist.push(passingTracksInRow[i]);
    
  }
  
  return playlist;
}

function analyzeTrackList(tracks) {
  var valenceMin = 0.6;
  var energyMin = 0.6;
  
  var passingTracks = [];
  var pass = false;
  
  for (var i = 0; i < tracks.length; i++) {
    var sum = 0;
    var properties = getTrackProperties(tracks[i]);
    
    var valenceScore = getValues(properties, "valence");
    if (valenceScore[0] >= valenceMin) pass = true;
    
    var energyScore = getValues(properties, "energy");
    if (energyScore[0] >= energyMin) pass = true;
    else pass = false;
    
    var isExplicit = getIsExplicit(tracks[i]);
    if (isExplicit == false) pass = true;
    else pass = false;
    
    if (pass == true) passingTracks.push(tracks[i]);
  }
  return passingTracks;
}

function getIsExplicit(id) {
  
  var sp = getService();
  
  var url = "https://api.spotify.com/v1/tracks/" + id;

  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  
  var isExplicit = getValues(result, "explicit");
  
  return isExplicit[0];
}
