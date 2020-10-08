var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("topArtists");

function getArtistTopHits(id) {
  
  var sp = getService();
  
  var url = "https://api.spotify.com/v1/artists/" + id + "/top-tracks?market=ES";
  // related artists--> https://api.spotify.com/v1/artists/{id}/related-artists
  
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
