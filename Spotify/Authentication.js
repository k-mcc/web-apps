var CLIENT_ID = 'clientid';
var CLIENT_SECRET = 'clientsecret';

// Refreshes the access token of expired sessions and makes a new request to Salesforce.
function refreshToken(sf, func) {
  var response;
  var content;
  try {
    // func() makes the UrlFetchApp request and returns the response.
    response = func();
    content = response.getContentText();
  } catch (e) {
    content = e.toString();
  }
  // Detects an expired session by selecting responses that contain the expired session error code. Calls the OAuth service refresh function to refresh the access token and retries the request.
  if (content.indexOf('INVALID_SESSION_ID') !== -1) {
    sf.refresh();
    return func();
  }
  // Returns the HTTP response of the successful request.
  return response;
}

// creates OAuth2 service and sets properties necessary for OAuth flow
function getService() {
  return OAuth2.createService('Spotify')
      .setAuthorizationBaseUrl('https://accounts.spotify.com/authorize')
      .setTokenUrl('https://accounts.spotify.com/api/token')
      .setClientId(CLIENT_ID)
      .setClientSecret(CLIENT_SECRET)
      .setCallbackFunction('callback')
      .setPropertyStore(PropertiesService.getUserProperties())
      .setScope('user-read-recently-played');
}

// Completes authentication flow by determining whether Spotify granted access to the specified scopes.
function callback(request) {
  var sp = getService();
  var authorized = sp.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Access Granted!');
  } else {
    return HtmlService.createHtmlOutput('Access Denied.');
  }
}

// Logs redirect uri to be used as the "callback url" in Spotify.
function getCallbackUrl() {
  Logger.log(OAuth2.getRedirectUri());
}
