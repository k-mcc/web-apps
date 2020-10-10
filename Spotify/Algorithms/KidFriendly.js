// Creates a playlist of kid-friendly top hits from your latest favorite artists, 
// so that everyone in the room can enjoy the music.

function createKidFriendlyPlaylist() {
  var requirements = [];
  var valence = [];
  valence.push("valence");
  valence.push(0.6);
  requirements.push(valence);
  var energy = [];
  energy.push("energy");
  energy.push(0.6);
  requirements.push(energy);
  
  var httpResponse = createPlaylist("Kid-Friendly Playlist","Kid-friendly top hits from your latest favorite artists, so that everyone in the room can enjoy the music.");
  Logger.log(httpResponse);
  var uris = getValues(httpResponse, "uri");
  var playlistId = "";
  for (var i = 0; i < uris.length; i++) {
    if (uris[i].includes("playlist")) playlistId = (uris[i]).substring(17);
  }
  fillPlaylist(playlistId, requirements, true);
}

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

function analyzeTrackList(tracks, requirements, clean) {
  
  var passingTracks = [];
  
  for (var i = 0; i < tracks.length; i++) {
    var properties = getTrackProperties(tracks[i]);
    var pass = true;
    
    for (var j = 0; j < requirements.length; j++) {
      var score = getValues(properties, (requirements[j])[0]);
      if (score[0] < (requirements[j])[1]) pass = false;
    }
    
    
    // if clean, include: 
    var isExplicit = getIsExplicit(tracks[i]);
    if (isExplicit == true) pass = false;
    
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
