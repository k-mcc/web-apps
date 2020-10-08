var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("topArtists");

function getPopularArtistsHits() {
  var column = 2;
  
  var hits = [];
  
  for (var i = 0; i < 3; i++) { // iterates 3 times, once for each of the time lengths.
    var topArtistId = sheet.getRange(2, column).getValue();
    
    hits.push(getArtistTopHits(topArtistId));
    
    column = column + 2;
  }
  
  var cell = sheet.getRange(sheet.getLastRow()+1, 1);
  
  var track1 = getObjects(hits[0], "type");
  var track2 = getObjects(hits[1], "type");
  var track3 = getObjects(hits[2], "type");
  
  var trackNames1 = getValues(track1, "uri");
  var trackNames2 = getValues(track2, "uri");
  var trackNames3 = getValues(track3, "uri");
  
  //TODO: remove all name values w the names of the artists. so that only track names remain.
  
  //TODO: identify songs and ids of those songs. Do we even need the names? I don't think so, that's backend stuff! You just need to be
  //      able to upload the songs to the new playlist by analyzing and leveraging specific fields of the existing track object!
  
  //TODO: upload randomly or algorithmically (eventually) selected songs to a new playlist by matching their ids.
  
  /*var x = 0;
  
  
  //TODO: debug this...
  
  
  
  for (var i = 0; i < trackNames1.length; i++) {
    if ((""+trackNames1).includes("track")) {
      var id = (""+trackNames1).substring(14);
    }
    cell.offset(i+1, x).setValue(id);
  }
  x++;
  
  for (var i = 0; i < trackNames2.length; i++) {
    cell.offset(i+1, x).setValue(trackNames2[i]);
  }
  x++;
  
  for (var i = 0; i < trackNames3.length; i++) {
    cell.offset(i+1, x).setValue(trackNames3[i]);
  }
  x++;*/
  
  
}

function getArtistTopHits(id) {
  
  var sf = getService();
  
  var url = "https://api.spotify.com/v1/artists/" + id + "/top-tracks?market=ES";
  // related artists--> https://api.spotify.com/v1/artists/{id}/related-artists
  
  var response = refreshToken(sf, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sf.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  
  Logger.log(result);
  
  return result;
}








function main() {
  var column = 2;
  var hits = [];
  for (var i = 0; i < 3; i++) { // iterates 3 times, once for each of the time lengths.
    var topArtistId = sheet.getRange(2, column).getValue();
    hits.push(getArtistTopHits(topArtistId));
    column = column + 2;
  }
  var cell = sheet.getRange(sheet.getLastRow()+1, 1);
  
  //let tracks = new Map();
  // tracks.set('type','uri');
  
  var track1Types = getValues(hits[0], "type");
  for (var i = 0; i < track1Types.length; i++) {
    cell.offset(i+1, 1).setValue(track1Types[i]);
  }
  
  var track1Uris = getValues(hits[0], "uri");
  for (var i = 0; i < track1Uris.length; i++) {
    cell.offset(i+1, 2).setValue(track1Uris[i]);
  }
  
  for (var i = 0; i < track1Uris.length; i++) {
    if (  track1Types[i] == "track"  ) {
      var id = track1Uris[i].substring(14);
      Logger.log(track1Types[i] + "-->" + id + "<br>");
      cell.offset(i+1, 3).setValue(id);
    }
  }
  
}
