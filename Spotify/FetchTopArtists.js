/* Kate McCarthy
 * Working with the Spotify REST API through OAuth 2.0 to fetch and upload data.
 */

var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("topArtists");

/* fetchTopArtists() calls the wrapper function, fillCells(), to fill the spreadsheet with the Spotify user's top artists
 * within three different periods of time.
 */
function fetchTopArtists() {
  var column = 1;
  var sf = getService();
  if (sf.hasAccess()) {
    
    var lengthOfTime = "short";
    column = fillCells(column, sf, lengthOfTime);
    
    lengthOfTime = "medium";
    column = fillCells(column, sf, lengthOfTime);
    
    lengthOfTime = "long";
    column = fillCells(column, sf, lengthOfTime);
    
  } else {
    var authUrl = sf.getAuthorizationUrl();
    Logger.log('Browse to URL below. Then run the script. %s',
        authUrl);
  }
}

/* Calls the Spotify API with the GET request and fills the sheet with the artist names contained in the response to the query.
 */
function fillCells(column, sf, lengthOfTime) {
  
  var url = "https://api.spotify.com/v1/me/top/artists?time_range=" + lengthOfTime + "_term&limit=10";
  
  var log = '<br>Fetching data from Spotify...<br><br>';
  var response = refreshToken(sf, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sf.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  
  if (column == 1) {
    sheet.clear();
    sheet.setFrozenRows(1);
  }
  
  var cell = sheet.getRange(1,column);
  
  cell.offset(0, 0).setValue("Top Artists (" + lengthOfTime + " term)");
  
  var topArtists = getValues(result, "name");
  
  for (var i = 0; i < topArtists.length; i++) {
    cell.offset(i+1, 0).setValue(topArtists[i]);
  }
  
  return column + 1;
  
}

/* Returns an array of the artist names contained in the parsed JSON response.
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

