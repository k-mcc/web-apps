// FIND YOUR NEW FAVORITE MUSIC ARTIST

// Selects a single artist from the array of related artists to the initially chosen artist.

// Fills a new playlist with 10 of their songs to explore and RANK.

// Searches a separate database for the selected artist and fills playlist description
// with certain information about them to make it a more comprehensive experience.

// Information to display:
// 1. Name
// 2. Biographical Info
// 3. Genres

// Uploads one of the images of that artist as the Playlist Cover Image.


function newFavoriteArtist(artistID) { // essentially the main method of this script.
  
  var relatedArtists = getRelatedArtists(artistID);
  var focusArtist = pickRandomArtist(relatedArtists);
  
  // collect info about the spotlight artist @ this spot.
  
  var httpResponse = makePlaylist(focusArtist);
  var uris = getValues(httpResponse, "uri");
  var playlistId = "";
  for (var i = 0; i < uris.length; i++) {
    if (uris[i].includes("playlist")) playlistId = (uris[i]).substring(17);
  }
  
  var focusAlbum = getBestAlbum(focusArtist);
  //Logger.log(focusAlbum);
  var tracksInAlbum = getAlbumTracks(focusAlbum); 
  //Logger.log(tracksInAlbum);
  fillPlaylist(playlistId, tracksInAlbum); //TODO: Randomize order, mix in other things of artist.
  
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

// Find the artist in the array with the ______est _____.
// or
// Purely random selection from the list of related artists.
function pickRandomArtist(artists) {
  var max = artists.length;
  
  var randomNum = Math.floor(Math.random() * Math.floor(max));
  
  return artists[randomNum]; // TODO: MAKE THIS RANDOM
}

// Return the ________ album of the selected artist.

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

// humble
// hardworking
// determined
// insane underdog
// unexpected
// inspiring
// a love for life
// confident

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

function getAlbumTracks(albumId) {
  
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
  
  var tracks = [];
  
  for (var i = 0; i < items.length; i++) {
    if (typesOfItems[i] == "track") tracks.push(items[i]);
  }
  
  //Logger.log(tracks);
  return tracks;
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

function main() {
  var str = callMusicService("Tame Impala");
  Logger.log(str);
}

function callMusicService(searchTerm) {
  var lastFmApiKey = "41e7132ffa0aebd9bffda95e4736d943";
  var url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + searchTerm + "&api_key=" + lastFmApiKey + "&format=json";
  var response = UrlFetchApp.fetch(url);
  
  //Logger.log(response.getContentText());
  var result = response.getContentText();
  //var summArr = getValues(result, "summary");
  
  
  var abridge = result.substring(result.indexOf("summary") + 10);
  //Logger.log(abridge);
  
  var abridgedSummary = getFirstXSentences(abridge, 2);
  //Logger.log(abridgedSummary);
  
  return abridgedSummary;
}

// test method of getFirstXSentences()
function main2() {
  var summary1 = "Tame Impala is a psychedelic music project of Australian musician Kevin Parker, who writes, records, produces, and performs. As a touring act, Tame Impala consists of Parker (guitar, vocals), Dominic Simper (guitar, synthesiser), Jay Watson (synthesiser, vocals, guitar), Cam Avery (bass guitar, vocals), and Julien Barbagallo (drums, vocals). Many of them are collaborators of fellow Australian psychedelic rock band Pond. Previously signed to Modular Recordings, Tame Impala is now signed to Interscope Records in the US, and Fiction Records in the UK.\n\nParker originally conceived the project in Perth in 2007. After a series of singles and EPs, Tame Impala's debut studio album, Innerspeaker, was released in 2010; it was certified gold in Australia and well received by critics. Parker's 2012 follow-up, Lonerism, was also acclaimed, reaching platinum status in Australia and receiving a Grammy Award nomination for Best Alternative Music Album. Tame Impala's third album, Currents, was released in July 2015,[6] and like its predecessor, it won ARIA Awards for Best Rock Album and Album of the Year. Parker won the APRA Award for Song of the Year 2016 for Currents' first track, \"Let It Happen\". The fourth and most recent studio album, The Slow Rush, was released 14 February 2020.";
  var summary2 = "Tame Impala is a psychedelic music project of Australian musician Kevin Parker, who writes, records, produces, and performs.";
  Logger.log("beep beep ! " + getFirstXSentences(summary1, 2));
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
