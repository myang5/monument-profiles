import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';
import { stringify } from 'query-string';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

const redirect_uri = 'http://localhost:3000/spotify-test';

const SPOTIFY_AUTHORIZE_URL = `https://accounts.spotify.com/authorize?${stringify({
  client_id: process.env.SPOTIFY_CLIENT_ID,
  response_type: 'code',
  redirect_uri,
})}`;

const getSpotifyAccessTokenUrl = () => `https://accounts.spotify.com/api/token`;

const authorize = async () => {
  document.location = SPOTIFY_AUTHORIZE_URL;
};

const useAccessToken = () => {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();
  const [state, getToken] = useAsyncFn(
    async (code) => {
      const body = stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      });
      const response = await fetch(getSpotifyAccessTokenUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
      const data = await response.json();
      if (data.access_token) {
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setExpiresIn(data.expires_in);
      }
    },
    [router.query.code],
  );

  if (router.query.code && !state.loading && !accessToken) {
    const code = router.query.code;
    router.replace(router.pathname);
    getToken(code);
  }

  return accessToken;
};

export default function SpotifyTest() {
  const accessToken = useAccessToken();

  return (
    <div>
      <button onClick={authorize}>Authorize</button>
      <p>Access token: {JSON.stringify(accessToken)}</p>
    </div>
  );
}
