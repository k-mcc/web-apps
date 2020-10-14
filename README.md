# Spotify Algorithms: Configuration Steps

### 1. Add the OAuth2 Library to the script. 
 * In the top menu, click "Resources" → "Libraries" 
 * Copy and paste this library code: 
> #### __1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF__
 * Click “Add,” select the most recent version (38), and press “Save”. 
### 2. Rename the spreadsheet. 
 * Rename “Sheet1” to “TopArtists” 
### 3. Set up the web app in Spotify 
 * To get the callback URL, run __getCallbackUrl()__ in Authentication.gs and authorize the script’s request. In “View” → “Logs,” copy the URL that was logged. 
 * Enter your unique callback URL into Spotify under the new web app.
### 4. Enter Client ID and Client Secret 
 * Copy the Consumer Key and Consumer Secret from the web app’s page in Spotify. 
 * In Authentication.gs, paste the Client ID within the single quotes of __CLIENT_ID__.
 * In Authentication.gs, paste the Client Secret within the single quotes of __CLIENT_SECRET__. 
### 5. Publish the script file 
 * In the top menu, click “Publish” → “Deploy as web app” 
 * Under “Project Version:” select “New” (or “1” if this is the first time publishing it) 
 * Click the blue button at the bottom of the box. 
### 6. Run __fetchTopArtists()__ for the first time 
 * In “View” → “Logs,” browse to the URL provided. 
 * Log into your Spotify account if prompted. 
 * Allow the web app to use the scopes specified earlier. 
 * Close the “Access Granted!” tab. Run __fetchTopArtists()__ again. The “Fetch” sheet should now be filled with your top artists.

![Spotify Access](https://docs.google.com/drawings/d/e/2PACX-1vSTifLCqoex15t7EW7FskW8wVmbmTnscZ19wpU_oVgm7KWsK3qBEo4PyqUA8xmhaIvBSRsuHoSMegi1/pub?w=187&h=237)
