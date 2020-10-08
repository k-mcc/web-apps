var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("topArtists");


// returns a list of track IDs from the top artists
// with field scores greater than or equal to the minScore for the 
// specified qualifier.

// qualifier options: acousticness, danceability, energy, instrumentalness, 
//                    liveness, loudness, speechiness, valence, & tempo
function calculateBestPlaylist(qualifier, minScore) {
  var playlist = [];
  
  for (var row = 2; row <= sheet.getLastRow(); row++) {
    var column = 2;
    var hits = [];
    for (var i = 0; i < 3; i++) { // iterates 3 times, once for each of the time lengths.
      var topArtistId = sheet.getRange(row, column).getValue();
      hits.push(getArtistTracks(topArtistId));
      column = column + 2;
    }
    var cell = sheet.getRange(sheet.getLastRow()+1, 1);
  
  
    var track1Types = getValues(hits[0], "type");
    var track1Uris = getValues(hits[0], "uri");
  
    var topTracks = [];
  
    for (var i = 0; i < track1Uris.length; i++) {
      if (  track1Types[i] == "track"  ) {
        var id = track1Uris[i].substring(14);
        topTracks.push(id);
      }
    }
  
    var track2Types = getValues(hits[1], "type");
    var track2Uris = getValues(hits[1], "uri");
  
    for (var i = 0; i < track2Uris.length; i++) {
      if (  track2Types[i] == "track"  ) {
        var id = track2Uris[i].substring(14);
        topTracks.push(id);
      }
    }
  
    var track3Types = getValues(hits[2], "type");
    var track3Uris = getValues(hits[2], "uri");
    
    for (var i = 0; i < track3Uris.length; i++) {
      if (  track3Types[i] == "track"  ) {
        var id = track3Uris[i].substring(14);
        topTracks.push(id);
      }
    }
    
    var bestTracksInRow = analyzeTrackList(topTracks, qualifier, minScore);
    for (var i = 0; i < bestTracksInRow.length; i++) {
      playlist.push(bestTracksInRow[i]);
    }
  }
  
  return playlist;
}


/* returns an array of track IDs with scores above the minScore
 * for the specified qualifier, e.g. analyzeTrackList(tracks, "danceability", 0.5)
 * returns an array containing tracks with a danceability score greater than or 
 * equal to 0.5 
 */
function analyzeTrackList(tracks, qualifier, minScore) { // qualifier is a string of the audio feature to be analyzed.
  var qualifyingTracks = [];
  
  for (var i = 0; i < tracks.length; i++) {
    var properties = getTrackProperties(tracks[i]);
    var qualifierValues = getValues(properties, qualifier);
    Logger.log(qualifierValues[0]);
    
    if (qualifierValues[0] > minScore) {
      Logger.log("madeit-->" + tracks[i]);
      qualifyingTracks.push(tracks[i]);
    }
    Logger.log(tracks[i]);
  }
  
  return qualifyingTracks;
  
}

function getTrackProperties(id) {
  
  var sp = getService();
  
  var url = "https://api.spotify.com/v1/audio-features/" + id;
  
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

