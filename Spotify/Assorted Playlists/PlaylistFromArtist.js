// TODO: Playlist Cover Image.

function generatePlaylistFromBaseArtist() {
  var artist1 = "4yvcSjfu4PC0CYQyLy4wSq"; //make a better way of picking the base artist!!! interface? :)
  var httpResponse = makePlaylist(artist1);
  var uris = getValues(httpResponse, "uri");
  var playlistId = "";
  for (var i = 0; i < uris.length; i++) {
    if (uris[i].includes("playlist")) playlistId = (uris[i]).substring(17);
  }
  
  var limit = 4;
  var numArtists = 5;
  var artists = [];
  
  
  var focusAlbum1 = getBestAlbum(artist1);
  var tracksInAlbum1 = getNumAlbumTracks(focusAlbum1, limit); // call a get __#__ best tracks in album method
  //how to MERGE 2+ arrays and THEN shuffle? fill at once = less api calls as well
  
  var unshuffled = [];
  
  for (var i = 0; i < tracksInAlbum1.length; i++) {
    unshuffled.push(tracksInAlbum1[i]);
  }
  
  var relatedArtists = getRelatedArtists(artist1);
  
  for (var i = 0; i < numArtists; i++) {
    var nextArtist = pickRandomArtist(relatedArtists);
    while (artists.includes(nextArtist)) nextArtist = pickRandomArtist(relatedArtists);
    artists.push(nextArtist);
    
    var album = getBestAlbum(nextArtist);
    var tracksInAlbum;
    if (limit-i > 0) tracksInAlbum = getNumAlbumTracks(album, limit-i);
    else tracksInAlbum = getNumAlbumTracks(album, 1);
    
    for (var j = 0; j < tracksInAlbum.length; j++) {
      unshuffled.push(tracksInAlbum[j]);
    }
  }
  
  var shuffled = shufflePlaylist(unshuffled);
  fillPlaylist(playlistId, shuffled);
  
}

function getRelatedArtists(artistId) {
  var sp = getService();
  var url = "https://api.spotify.com/v1/artists/" + artistId + "/related-artists";
  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  var relatedArtists = getValues(result, "id");
  return relatedArtists;
}

function pickRandomArtist(artists) {
  var max = artists.length;
  
  var randomNum = Math.floor(Math.random() * Math.floor(max));
  
  return artists[randomNum];
}

// popularity of album (integer): 
// The popularity of the album between 0 and 100, with 100 being the most popular. 
// The popularity is calculated from the popularity of the album’s individual tracks.
function getBestAlbum(artistId) {
  var albumIds = getAlbums(artistId);
  var popularities = getAlbumPopularities(albumIds);
  var mostPopularAlbum = getMax(albumIds, popularities);
  return mostPopularAlbum;
}

//Return an array of album ids of the artist.
function getAlbums(artistId) {
  var sp = getService();
  var url = "https://api.spotify.com/v1/artists/" + artistId + "/albums";
  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  var itemIds = getValues(result, "id"); // ids of all items
  var itemTypes = getValues(result, "type"); // looking for items of type "album"
  var albumIds = []; // ids of items of type "album"
  
  for (var i = 0; i < itemIds.length; i++) if (itemTypes[i] == "album") albumIds.push(itemIds[i]);
  
  return albumIds;
}

// Return an array of popularity for the artist's albums.
function getAlbumPopularities(albumIds) {
  var str;
  for (var i = 0; i < albumIds.length; i++) {
    if (i != 0) str = str + "%2C" + albumIds[i];
    else str = albumIds[i];
  }
  
  var sp = getService();
  var url = "https://api.spotify.com/v1/albums?ids=" + str;
  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  
  var popularities = getValues(result, "popularity"); // popularity of each album
  
  return popularities;
}

function getMax(keys, values) { //returns the key with the highest value.
  if (keys.length > 0) {
    var max = values[0];
    var keyOfMax = keys[0];
    for (var i = 0; i < keys.length; i++) {
      if (values[i] >= max) {
        max = values[i];
        keyOfMax = keys[i];
        if (values[i] == max) Logger.log("Max values are currently equal."); // *1
      }
      // *1--> TODO: if equal pops, then compare by date 
      //(overload this method or add another param for releaseDates of each album)
    }
    return keyOfMax;
  }
}

function getNumAlbumTracks(albumId, numTracks) {
  
  var sp = getService();
  var url = "https://api.spotify.com/v1/albums/" + albumId + "/tracks";
  
  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  Logger.log(result);
  
  var items = getValues(result, "id"); // ids of the tracks in the album
  var typesOfItems = getValues(result, "type"); // ids of the tracks in the album
  //var popularities = getValues(result, "popularity"); // popularities of the tracks in the album
  
  var tracks = [];
  
  for (var i = 0; i < items.length; i++) {
    if (typesOfItems[i] == "track") tracks.push(items[i]);
  }
  
  var popularities = getTrackPopularities(tracks);
  //Logger.log(tracks);
 // Logger.log(popularities);
  var ranked = rankTracks(tracks, popularities);
  
  //Logger.log(ranked);
  
  
  if (numTracks > 0) {
    var rankedCutOff = [];
    
    for (var i = 0; i < numTracks; i++) {
      if (ranked.length - i >= 0) {
        rankedCutOff.push(ranked[ranked.length-1 - i]);
      }
    }
    
    return rankedCutOff;
  }
  
  else {
    return ranked;
  }
  
}

// Return an array of popularity for the albums's tracks.
function getTrackPopularities(tracksIds) {
  var str;
  for (var i = 0; i < tracksIds.length; i++) {
    if (i != 0) str = str + "%2C" + tracksIds[i];
    else str = tracksIds[i];
  }
  
  var sp = getService();
  var url = "https://api.spotify.com/v1/tracks?ids=" + str;
  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  
  var popularities = getValues(result, "popularity"); // popularity of each album
  
  return popularities;
}

function rankTracks(tracks, pops) {
  
  for (let i = 1; i < pops.length; i++) {
    let j = i - 1;
    let temp = pops[i];
    let trackTemp = tracks[i];
    while (j >= 0 && pops[j] > temp) {
      pops[j + 1] = pops[j];
      tracks[j + 1] = tracks[j];
      j--;
    }
    pops[j+1] = temp;
    tracks[j+1] = trackTemp;
  }
  return tracks;
  
}

function getAlbumTracks(albumId) {
  return getNumAlbumTracks(albumId, -1);
}

// Creates a new playlist with an appropriate name, description, and image for the artist.
function makePlaylist(artistId) {
  var sp = getService();
  var url = "https://api.spotify.com/v1/artists/" + artistId;
  
  var response = refreshToken(sp, function() {
      return UrlFetchApp.fetch(url, {
        headers: {
          Authorization: 'Bearer ' + sp.getAccessToken(),
        }
      });
    });
  var result = JSON.parse(response.getContentText());
  
  var nameArr = getValues(result, "name");
  //var genres = getValues(result, "genres"); // genres associated with the artist
  //var images = getValues(result, "url"); // images of the artist, sorted by width
  var name = nameArr[0];
  //Logger.log(name);
  var description = callMusicService(name);
  
  var httpResponse = createPlaylist(name, description);
  //Logger.log(httpResponse);
  return httpResponse;
}

function callMusicService(searchTerm) {
  var lastFmApiKey = "41e7132ffa0aebd9bffda95e4736d943";
  var url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + searchTerm + "&api_key=" + lastFmApiKey + "&format=json";
  var response = UrlFetchApp.fetch(url);
  
  //Logger.log(response.getContentText());
  var result = response.getContentText();
  //var summArr = getValues(result, "summary");
  
  // remove any chars like "/n" or "/t" from the description.
  var abridge = result.substring(result.indexOf("summary") + 10);
  //Logger.log(abridge);
  
  var abridgedSummary = getFirstXSentences(abridge, 2);
  //Logger.log(abridgedSummary);
  
  return abridgedSummary;
}

function getFirstXSentences(text, x) { //remove any "/n" or "/t" segments.
  var abridge = "";
  for (var i = 0; i < x; i++) {
    if (text.indexOf(".") != -1) {
      if (i > 0) abridge = abridge + "." + text.substring(0,text.indexOf("."));
      else abridge = abridge + text.substring(0,text.indexOf("."));
      text = text.substring(text.indexOf(".") + 1);
    }
  }
  return abridge + ".";
}

/* @param playlist
 * @return playlist in randomized order
 * 
 * Sorts the playlist into a randomized order.
 */
function shufflePlaylist(playlist) {
  
  var shuffled = playlist;
  
  var ctr = shuffled.length, temp, index;

  // While there are elements in the array
    while (ctr > 0) {
      // Pick a random index
        index = Math.floor(Math.random() * ctr);
      // Decrease ctr by 1
        ctr--;
      // And swap the last element with it
        temp = shuffled[ctr];
        shuffled[ctr] = shuffled[index];
        shuffled[index] = temp;
    }
    return shuffled;
  
}
