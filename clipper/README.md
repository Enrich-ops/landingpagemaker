# Clipper

Turn long videos into vertical 9:16 shorts and post them to TikTok and YouTube Shorts.

```
upload / URL ─► Whisper (word timestamps) ─► Claude picks viral moments ─► ffmpeg cut + 9:16 + captions ─► review ─► TikTok / YouTube
```

## Run it

Requires Node 22+, `ffmpeg`, and (for URL input) `yt-dlp`.

```bash
cd clipper
pnpm install
cp .env.example .env     # fill in keys
pnpm start               # http://localhost:3000
pnpm test && pnpm check
```

## Two modes

**Make clips (default)** – AI finds the best 20–60s moments, cuts them, reframes to 9:16 (blurred-background or center-crop), burns in word-highlight captions. Edit the title/caption, review, then publish, or enable auto-post (only clips scoring ≥ `AUTO_POST_MIN_SCORE`, spaced `POST_INTERVAL_MINUTES` apart).

**Campaign edit (no cuts)** – for briefs like the Vyro / Ketone-IQ one that forbid trimming, cropping or altering the supplied edit. The video is never trimmed or cropped, and the audio is stream-copied (verified bit-identical). The tool only adds a border and an optional hook overlay. Publishing is blocked unless the caption contains one of the brief's mandatory lines and has no hashtags. Trim/reframe edits are ignored in this mode. Likes/comments stay enabled. Edit the rules in `src/campaign.ts`.

## Connecting accounts

- **YouTube**: create an OAuth "Web application" client in Google Cloud with YouTube Data API v3 enabled; redirect URI `${PUBLIC_URL}/auth/youtube/callback`. `YOUTUBE_CHANNEL_ID` locks posting to your channel; a different channel is rejected at sign-in.
- **TikTok**: register an app at developers.tiktok.com, add *Login Kit* and *Content Posting API*, scopes `video.upload` + `video.publish`; redirect URI `${PUBLIC_URL}/auth/tiktok/callback`.

## Platform limits you need to know

- **TikTok unaudited apps can only post privately** (`SELF_ONLY`) until TikTok audits your app. Until then public posting won't work through the API. The app falls back to the most public level TikTok allows for your account.
- **TikTok Shop product links cannot be attached through the API.** For campaigns that need the product tag, choose "send to app inbox", then add the product and post inside the TikTok app.
- **YouTube**: uploads from an unverified Google Cloud project are forced private until the project passes API audit, and each upload costs 1,600 of the 10,000 daily quota units (~6 uploads/day).
- Don't "boost" campaign posts; many briefs reject paid promotion.

## Security

Tokens are stored in `data/tokens.json` (mode 0600). The server binds to `127.0.0.1` unless `APP_PASSWORD` is set, in which case it uses HTTP basic auth and listens on all interfaces. Put it behind HTTPS if you expose it.

## Not built yet

Face-tracking reframe, speaker diarization, B-roll/emoji, analytics feedback loop, Instagram Reels.
