import Axios from 'axios';

const globals = require('./Globals');

const apiUrl = 'http://www.last.fm/api/';
const scrobblingApiUrl = 'http://ws.audioscrobbler.com/2.0/';

function sign(url) {
  var tokens = decodeURIComponent((url.split('?')[1].split('&').sort().join()).replace(/,/g, '').replace(/=/g,''));

  return require('md5')(tokens+globals.lastfmApiSecret);
}

function prepareUrl(url) {
  var withApiKey = `${url}&api_key=${globals.lastfmApiKey}`;
  return `${withApiKey}&api_sig=${sign(withApiKey)}` ;
}

function lastfmLoginConnect(callback) {
  Axios.get(prepareUrl(scrobblingApiUrl + '?method=auth.getToken&format=json'))
  .then((response) => {
    var authToken = response.data.token;

    require('electron').shell.openExternal(
      'http://www.last.fm/api/auth/?api_key=' + globals.lastfmApiKey + '&token=' + authToken
    );

    callback(authToken);
  });
}

function lastfmLogin(authToken, callback) {
    Axios.get(prepareUrl(scrobblingApiUrl + '?method=auth.getSession&token=' + authToken)+'&format=json')
    .then((response) => {
        callback(response.data.session.key, response.data.session.name);
    });
}

function scrobble(session, artist, track) {
  Axios.post(prepareUrl(
    scrobblingApiUrl +
    '?method=track.scrobble&sk=' +
    session +
    '&artist=' +
    encodeURIComponent(artist) +
    '&track=' +
    encodeURIComponent(track) +
    '&timestamp=' +
    (Math.floor(new Date()/1000))
  ))
  .then((response) => {

  });
}

function updateNowPlaying(session, artist, track) {
  Axios.post(prepareUrl(
    scrobblingApiUrl+
    '?method=track.updateNowPlaying&sk=' +
    session +
    '&artist=' +
    encodeURIComponent(artist) +
    '&track=' +
    encodeURIComponent(track)
  ))
  .then((response) => {

  });
}

module.exports = {
  lastfmLoginConnect: lastfmLoginConnect,
  lastfmLogin: lastfmLogin,
  scrobble: scrobble,
  updateNowPlaying: updateNowPlaying
}
