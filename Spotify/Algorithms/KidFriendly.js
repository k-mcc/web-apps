/* Creates and fills a Kid-Friendly playlist through the Kid-Friendly algorithm.
 * Makes new playlist and fills it with kid-friendly tracks from the most
 * popular tracks of the user's top artists within the past 4 weeks.
 */
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
