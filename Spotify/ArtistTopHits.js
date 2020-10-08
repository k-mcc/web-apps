var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("topArtists");

function getArtistTopHits(id) {
  
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
  
  Logger.log(result);
  
  return result;
}


var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("topArtists");


// returns a list of track IDs from the top artists
// with field scores greater than or equal to the minScore for the 
// specified qualifier.

// qualifier options: acousticness, danceability, energy, instrumentalness, 
//                    liveness, loudness, speechiness, valence, & tempo
function calculateBestPlaylist(qualifier, minScore) {
  var column = 2;
  var hits = [];
  for (var i = 0; i < 3; i++) { // iterates 3 times, once for each of the time lengths.
    var topArtistId = sheet.getRange(2, column).getValue();
    hits.push(getArtistTracks(topArtistId));
    column = column + 2;
  }
  var cell = sheet.getRange(sheet.getLastRow()+1, 1);
  
  //let tracks = new Map();
  // tracks.set('type','uri');
  
  var track1Types = getValues(hits[0], "type");
  
  var track1Uris = getValues(hits[0], "uri");
  
  var topTracks = [];
  
  for (var i = 0; i < track1Uris.length; i++) {
    if (  track1Types[i] == "track"  ) {
      var id = track1Uris[i].substring(14);
      topTracks.push(id);
    }
  }
  
  return analyzeTrackList(topTracks, qualifier, minScore);
}


/* returns an array of track IDs with scores above the minScore
 * for the specified qualifier, e.g. analyzeTrackList(tracks, "danceability", 0.5)
 * returns an array containing tracks with a danceability score greater than or 
 * equal to 0.5 
 */
function analyzeTrackList(tracks, qualifier, minScore) { // qualifier is a string of the audio feature to be analyzed.
  var trackProperties = [];
  let qualifierMap = new Map();
  var qualifyingTracks = [];
  
  for (var i = 0; i < tracks.length; i++) {
    trackProperties.push(getTrackProperties(tracks[i]));
    qualifierMap.set(tracks[i], getValues(trackProperties[i], qualifier));
  }
  
  for (var i = 0; i < tracks.length; i++) {
   
    if (qualifierMap.get(tracks[i]) >= minScore) qualifyingTracks.push(tracks[i]);
  
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
  
  Logger.log(result);
  
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
