# CCTwitch - Collect Clip for Twitch

```
  Twitch Clip Download, Search and Collect easily. CCTwitch provide various sort of clips by keyword, date, vids. Also can save, download clips.
  Only for kr server, It provide periodicly kr twitch stream data every 30min.
```

- Site: [CCTwitch](https://cctwitch.xyz)
- API: [TwitchAPI](https://dev.twitch.tv/docs)

# Stack

- Front : Vuejs
- Back : Firebase, Node.Js

# Structure & Features

## 1. Channel

    해당 채널의 클립들을 다양한 정렬방식으로 제공합니다.

Category & Sort Options

| Category | Option 1 | Option 2 |
| :------: | :------: | :------: |
| By Video |  video   | timeline |
| By Date  |   date   | keyword  |

- ## 1-1. 다시보기별(Video) 클립 확인

  - ## Twitch API로 Video와 CLip 나열

    > 1.Twitch API를 통해 `type === 'Archive'` 인 video를 받아옴.
    >
    > 2.받아온 Video data는 list화 하여 carousel 및 dialog 형태로 보여줌.
    >
    > 3.Video를 선택시 해당 Video 생성일로 부터 현재까지 Clip data를 가져와 video_id 일치 여부 판단하여 나열.
    >
    > 4.infinite scroll loader로 추가 Clip들 가져오기.

  - ## Timeline 만들기
    > ## Cloud Functions로 해당 Video와 관련된 Clip들을 시간순으로 나열
    >
    > 1.Firebase Cloud functions > Http Request > timeline.js 실행
    >
    > 2.해당 Video가 isLive === 'live' ? '10분에 1번 업데이트' : '3시간에 1번 업데이트'
    >
    > 3.req.body.vid_id로 twitch api를 통해 video data 재확인
    >
    > 4.req.body.broadcaster_id로 twitch api를 통해 clip을 가져온 뒤, 각 클립의 video_id와 video data의 일치하는지 확인.
    >
    > 5.video_id === null인 clip은 video data의 started_at 과 duration을 통해 클립 생성시간과 비교하여 stream 상태에서 생성된 클립인지 확인 판별함.
    >
    > 6.확인된 클립을 시간순으로 나열하여 최대 100개까지 firestore에 저장.
    >
    > 7.생성된 firestore doc id를 res.send로 보냄.

- ### 1-2. 날짜별(Date) 클립 확인

  - ## Twitch API로 Clip 나열
    > 1.Keyword 검색을 통해 해당 기간내 등록한 키워드를 가진 Clip들을 나열
    >
    > 2.제공하는 옵션 : 24Hours, Week, Month, Year, All, Custom
    >
    > ##### (\*Custom: Channel 생성일부터 현재까지 Date Picker를 통해 지정가능)
  - ## Keyword 검색

    > 1.
    > 2.

  - Twitch API, Keyword 검색을 통해 Clip 나열

## 2. Cliplist

```
ㅁㄴㅇㄹ
```

## 3. Login Session

- 로그인 요청 -> Twitch 서버에 로그인 정보 요청 -> login page로 리다이렉션 ->

  > case 1. 기존유저) Clound functions sigin -> 유저 프로필 업데이트 -> Firebase Auth를 통해 로그인
  >
  > case 2. 신규유저) Clound functions sigin -> Firebase Auth 유저 등록 -> Firebase Auth를 통해 로그인

## 4. Streamer

```
Twitch API, Localstorage를 통해 저장된 유저정보를 카드형태로 보여줍니다.
```

|          | Login |         Storage          |
| :------: | :---: | :----------------------: |
| Bookmark |   X   |       Localstorage       |
| On Live  |   O   | Twitch API + OAuth Token |
|   All    |   O   | Twitch API + OAuth Token |

1. Localstorage에 저장된 bookmark 스트리머 (로그인)
2. Twitch API를 통해 follow된 유저중 Stream 상태인 스트리머
3. Twitch Follow된 유저

## 5. Report

```
Twitch에서 언어 설정이 한국어인 채널들의 실시간 Stream 정보를 매 30분마다 수집하여 Chart로 보여줍니다.
```

- ## 5-1 Overall

  - 해당 날짜의 07:00를 기준으로 Total Stream, Total Viewer을 시계열로 보여줍니다.
  - Viewer_count로 Top100 Stream, Top50 Category를 보여줍니다.
  -

- ## 5-2 Channel

  - Twitch API 30분 간격으로 Stream Data 수집
  - Kr
  - Overall, Channel 구분
  -

## Cloud functions with Node.JS

- Cloud scheduler

- Firebase Cloud Message

- Http Request

  1. timeline
  2. twitch Authentication & issue twitch token
  3.

- etc

# Database

|        DB        |   Data    |          Data           |        Data        |
| :--------------: | :-------: | :---------------------: | :----------------: |
|    Firestore     | Cliplist  |        Timeline         |      Hotclip       |
| Realtime Databse | User Data | Notification Data (fcm) | Twitch Stream Data |

- Firestore

  1. Cliplist
  2. Timeline
  3. Hotclip

- realtime database

  1. User Data :
  2. Notification Data
  3. Twitch Stream Data

- localstorage
  1. bookmark
  2. dark mode theme
  3. twitch token
  4. auto login

# Accessibility

## 1. PWA

## 1-1 Install

- asdf

## 1-2 Push Notificaiton with Firebase Cloud Message

- asdf

---

## 2. SEO

Google Search

Naver Search

## 3. Open Graph

- ### Set Open graph web version

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="CCTwitch - Twitch Clip Collector" />
<meta
  property="og:description"
  content="Download, search twitch clips easily. CCTwitch provide various sort of clips by keyword, date, videos."
/>
<meta
  property="og:image"
  content="https://firebasestorage.googleapis.com/v0/b/twitchhotclip.appspot.com/o/open_graph%2F192x192.png?alt=media&token=520a77f0-be36-44bf-93c1-724ccbf16b78"
/>
<meta property="og:url" content="https://cctwitch.xyz" />
<meta property="og:site_name" content="CCTwitch" />
```

## 4. Google Analytics & Adsense

1.
