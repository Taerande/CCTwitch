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

# 1. Channel

    해당 채널의 클립들을 다양한 정렬방식으로 제공합니다.

Category & Sort Options

| Category | Option 1 | Option 2 |
| :------: | :------: | :------: |
| By Video |  video   | timeline |
| By Date  |   date   | keyword  |

- ## 1-1. 다시보기별(Video) 클립 확인

  - ## Twitch API로 Video와 CLip 나열

    1. Twitch API를 통해 `type === 'Archive'` 인 video를 받아옴.

    2. 받아온 Video data는 list화 하여 carousel 및 dialog 형태로 보여줌.

    3. Video를 선택시 해당 Video 생성일로 부터 현재까지 Clip data를 가져와 video_id 일치 여부 판단하여 나열.

    4. infinite scroll loader로 추가 Clip들 가져오기.

  - ## Timeline 만들기

    ### `Cloud Functions`로 해당 Video와 관련된 Clip들을 시간순으로 나열

    1. _`Firebase Cloud functions > Http Request > timeline.js`_ 실행

    2. 해당 Video가 isLive === 'live' ? '10분에 1번 업데이트' : '3시간에 1번 업데이트'

    3. req.body.vid_id로 twitch api를 통해 video data 재확인

    4. req.body.broadcaster_id로 twitch api를 통해 clip을 가져온 뒤, 각 클립의 video_id와 video data의 일치하는지 확인.

    5. `video_id === null`인 clip은 video data의 started_at 과 duration을 통해 클립 생성시간과 비교하여 stream 상태에서 생성된 클립인지 확인 판별함.

    6. 확인된 클립을 시간순으로 나열하여 최대 100개까지 firestore에 저장.

    7. 생성된 firestore doc id를 res.send로 보냄.

- ## 1-2. 날짜별(Date) 클립 확인

  - ## Twitch API로 Clip 나열

    지정된 기간내 등록한 Clip을 조회수 순으로 나열

    제공하는 옵션 : 24Hours, Week, Month, Year, All, Custom

    _*(Custom: Channel 생성일부터 현재까지 Date Picker를 통해 지정가능)*_

  - ## Keyword 검색

    Keyword 검색을 통해 해당 기간내 등록한 키워드를 가진 Clip들을 나열

    1. 최대 15자, 5개의 키워드 등록(대소문자 구분X),
    2. Date Picker을 통해 검색할 날짜 지정가능
    3. 검색된 클립제목의 키워드를 highlight 처리함.
       ```javascript
       filters:{
         highlight: function(words, queries){
           let result = words;
           queries.forEach((query) => {
             let targetReg = query.text;
             let regex = new RegExp(targetReg, 'gi');
             result = result.replace(regex, '<span class="'+query.color+'--text">' + query.text + '</span>');
           })
           return result;
         }
       },
       ```

# 2. Cliplist

    Cliplist를 만들어 최대 100개의 Clip Data를 수집 및 관리할 수 있게 도와줍니다.

## 2-1. About Cliplist

|    Category    | period |      Option       |
| :------------: | :----: | :---------------: |
|  User Created  | always | Rearrange, Import |
| Daily Hotclips | daily  |  Auto generated   |
|   Weekly Wak   | weekly |  Auto generated   |

- User Crated : Channel 등에서 찾은 Clip들을 저장하고 관리할 수 있습니다.

- Daily Hotclips : 매일 07:00에 전날 저장된 Stream Data에서 조회수가 높은 100개의 클립을 저장한다.

  _`(Google Cloud Scheduler - createHotClip)`_

- Weekly Wak : _`Google Cloud Scheduler - createHotClip`_ 을 호출하여 매주 수요일에 특정 스트리머들의 Clip을 주간단위로 수집하여 게시한다.

  ```javascript
  if (new Date().getDay() === 3) {
    axios.get(`HttpRequestURL`)
  }
  ```

## 2-2. 기능

- Cliplist내 Clip들의 정렬을 바꿀 수 있다.
- Twitch Clip ID값을 통해 Clip을 불러오고 저장할 수 있다.
- 저장된 Clip들을 볼 수 있다.
- 만일 삭제된 클립이있다면, Twitch 서버에서 완전히 삭제되기 전까지 해당 클립의 소스를 볼 수 있다.

# 3. Login Proccess

- Social Login with Twitch

- Twitch API + Firebase Auth

![plot](./src/assets/Login%20flow%20chart.png)

# 4. Streamer

```
Twitch API, Localstorage를 통해 저장된 유저정보를 카드형태로 보여줍니다.
```

|          | Login |         Storage          |
| :------: | :---: | :----------------------: |
| Bookmark |   X   |       Localstorage       |
| On Live  |   O   | Twitch API + OAuth Token |
|   All    |   O   | Twitch API + OAuth Token |

1. Localstorage에 저장된 Data를 카드형태로 보여줍니다.
2. Twitch OAuth Token을 통해 follow된 유저중 Stream 상태인 스트리머를 스트림 정보와 함께 카드형태로 보여줍니다.
3. 내가 Follow한 스트리머들을 카드형태로 보여줍니다.

# 5. Report

```
Twitch에서 언어 설정이 한국어인 채널들의 실시간 Stream 정보를 매 30분마다 수집하여 Chart로 보여줍니다.
```

`Google Cloud Scheduler`을 이용하여 매 30분마다 `viewer_count > 9`인 모든 스트림 정보를 수집 및 저장하고 이 중 `viewer_count`가 높은순으로 Total Stream, Total Viewer, Top 100 Stream, Top 50 Category를 따로 저장합니다.

- ## 5-1 Overall

  ApexChartJS Library 을 이용하여 Chart 생성 (x: time, y: stream, viewer)

  해당 날짜의 07:00를 기준으로 익일 07:00까지의 Total Stream, Total Viewer을 시계열로 보여줍니다.

  Viewer_count로 Top100 Stream, Top50 Category를 보여줍니다.

  - Streamer : streamer의 viewer를 시계열로 Chart를 그려 나타내고, 기간내 Clip을 보여줍니다. (Annotation: Title, Category)
  - Catergory : viewer_count가 가장 많았던 시각의 Top10 Stream 정보를 Card 형태로 보여줍니다.

- ## 5-2 Channel

  - Twitch API 를 통해 streamer을 검색하고, 만일 서버에 stream data가 저장되었다면 `<v-icon>mdi-calendar</v-icon>` 표시를 합니다.
  - `Firebase Realtime Database`에 저장된 해당 유저의 Stream Data를 읽고 Data Picker에 나타냄.
  - 해당 날짜의 Stream Data를 읽고 streamer의 viewer를 시계열로 Chart를 그려 나타내고, 기간내 Clip을 보여줍니다.

---

# Cloud functions with Node.JS

|                           |    Trigger    |                             Functions                              |
| :-----------------------: | :-----------: | :----------------------------------------------------------------: |
|       createHotClip       |   scheduler   |     매일 수집된 Stream Data를 기반으로 Top 100 클립리스트 생성     |
| twitchStreamDataCollector |   scheduler   |                매 30분마다 kr서버 Stream Data 수집                 |
|   deleteClipsInCliplist   |   firestore   |                Cliplist 삭제시 저장된 Clip 자동삭제                |
|       deleteHotClip       |   firestore   |              Hotclip 삭제시 저장된 Comments 자동삭제               |
|      deleteComments       |   firestore   |              Comments 삭제시 저장된 Replies 자동삭제               |
|        deleteUser         |   firestore   |           User 삭제시 저장된 Hotclip, Cliplist 자동 삭제           |
|        twitchAuth         | https request |           트위치 소셜로그인시 User 정보 업데이트 및 생성           |
|   twitchTokenValidation   | https request |                  Twitch App Access Token Validate                  |
|     twitchOauthToken      | https request |                      Twitch OAuth Token 발행                       |
|     weeklyWaktaverse      | https request |          매주 지정된 스트리머들의 top 100 클립리스트 생성          |
|         timeLine          | https request | Video_id를 기반으로 해당 기간내 클립을 시계열로 나열한 리스트 생성 |
|            fcm            | https request |                   Firebase Cloud functions의 key                   |
|       twitchWebHook       | https request |                                                                    |

---

# Database

## 1. DB & Data sets

|        DB        |   Data1   |          Data2          |         Data3         |
| :--------------: | :-------: | :---------------------: | :-------------------: |
|    Firestore     | Cliplist  |        Timeline         |        Hotclip        |
| Realtime Databse | User Data | Notification Data (fcm) |  Twitch Stream Data   |
|   LocalStorage   | Bookmark  |      Twitch tokens      | Environment variables |

## 2. ERD

- [Firestore Diagram](https://viewer.diagrams.net/?tags=%7B%7D&target=blank&highlight=0000ff&edit=_blank&layers=1&nav=1#R7Z1bc9o4FMc%2FDY%2Fp%2BG54TCC9bbLNJtnZ5GlHwQpWaixGFgX2068EFrfjBNLKVdM5nU6LhSzb53dkS%2F9zZDphfzz%2FIMgkv%2BQZLTqBl8074aATBKEf9NR%2FumSxKgmCnr8qGQmWrcq2Cm7Yf7Qu9OrSKctotVNRcl5INtktHPKypEO5U0aE4LPdao%2B82D3qhIwoKLgZkgKW%2FsMyma9Ku0G6Kf9I2Sg3R%2FaT%2BorHxFSur6TKScZnW0XheSfsC87l6tN43qeFtp6xy2q%2F9898uz4xQUt5zA531e2Xh6fM%2B1wwL8yf2PxeDk7qVr6RYlpfcH2ycmEsIPi0zKhuxOuEZ7OcSXozIUP97UxBV2W5HBdqy1cf4UmZI1Ah6XyrqD7JD5SPqRQLVaX%2B9iStd6ld5qRbG3C2sX8vrcvybdvHa%2FA19NG68Y1d1IfaNM1m6j59evpGr6%2BGKfH%2FmP61kEnun%2FSAmfoFmxSsksBc1YyNC1KqrbNHXsqb%2Bhttu2HOiuyCLPhUn3ElyfCr2TrLuWD%2FqfrEWFJ9LWTdH0Jvp8aN3rNuU9BK1bkyBvf3ii7JfKfiBamkORteFGRSsYfl%2Bekdx0SMWHnGpeTjuhIp2KhUn4eqLSrMNa3Oyo%2FsADd9aWFuGgB35DXgjmLvedr1wa7VLYGUI3WF66Ml3s7R%2FBB6V7fhaOHewUih7FESSc9096iAh60v8%2FudztwCt7xO1z9d%2Bptg5Qj4njK4XLqO4F9pnxdcERuUfOWMrCj2iirVjVUzF%2FRRX2S0Kbmur1sXcQXysVjeuHKWZbTUvsQlkeRh7dgTzkq5NEx8pv6q8%2B577%2BJOrM6pr7b9zbb6q6sL2eelOk3Cll5DlVfOqPbMHf8KGv3rxQ562OkWuzwPedk%2Bd2u3FB%2FeeslUqk7%2BCRlbYpw4ZxwAxkP13OirW4ZcQda2QcLfTbjnmnDYQHiFB7uwDcB%2B4Jxw2NiHmXrmLxmrSQZZIOIfQBw7RxwBxGrOORRsIhkvsStb4twwj%2FvJnGM4oK6upg8FG%2BLT2ALhtWjjjHAXPo4LprHhgMsS4sg14jBpRPw3PpCtMU6dM04BY0lGyNeW9OGcbxfyZVLbFIdaVgg7V7ciONSS%2BXT8UBJW%2FDsVBZK2RNq5xhXB5%2FF0khFJs9N6yKU3kPEPMHauckXweTwUFBnbYxw517kiGI%2FQMc4KUG0jwBkknd84wBkbhWuthMQAdhA3wPb9pC3azZEJjD0d6h3Hz6KS4xi316EbhGu8aVtlHDtnDJVrHGa3QbrrmnQMSd%2ByMS1YCbswpiC99gm9l4IUm%2BSMg6Ox3gu8f4ccpLghZIJjhANd9O0kIcVw8o5JSJYhO1do4obZO2Yh2UTsXKCJoaCOaUg2CbvPQ4phDjrmIdll7DwRyTwqMBGpXdDOM5ESKLZiJpJNxO5TkRIov2EOg0XAzhOREqjIfGPZLeYx2KTsPBUpwUSGn6WFOEeNmQytQ3aueCVQDFF37T4Gxuxydi56JVAR%2BcilnjEDsBguORpvc7ikd%2FSS7eAF3L9DuCSBIg2GSw710LcTLjGjUQyXtAfZ%2BZMjhdoMhkusInYeLkkDgPhBcJINlTEoBk1scXYfNElx8XbbjJ0HTVJcvf1TQDsPmqS4fLtdxO6DJiku7m0dsvPASYqre1sF7DxmkkLtDSNj1rUQ55Sh1oWRsVZQO9e9zNAPI2PtQXaue3Wh7oWRMfucnYtfXaiJ9Pl4TLUp98niWt%2Bj%2BZq1vvuxsRTGxhpXjgW9ttb69qDaqeoHHj6gX%2B4fb2epbxdKYOu4FHK2xtn5cl%2B%2F4ZXgGasmBVn8ScY4ubIF2vlq3y6UOnHtvl3G63drOIPcw3zD1iFHriF3IeSJ4IoTRY3EJujUNegenD4LOikWmDdib5ztOYcMB9oYn7IMOXQOGQ6%2B8CXSdhknzhnDGOS1vlsDrKiAHQ33GQUsNklYDhUwGJBEBeyIzvF2FLAeDEaiAmafs3sFzIOgtxUwZG2NtXMRzPeg2okqmF3I7lUw34MTZ5TBLFN2LoP5HgxCog7WAmnnOpjvwfwCFMIsD7edC2G%2Bh0pY65SdK2G%2Bh1JY6zNn95BhiAogpdmIGu1LmYDJxTUtiF5gdb75Blgtl2Ojf9EyOxViye%2F8WnG%2F5ZekXCwhTsuMZjVC1bZY3OmNd54XmYL7ZYEfpqZgMN%2BuP1hsb11RwZRltLy1LITo6gGnvqYXEW0h8ZtS9NaFYmmLb3Sn%2BRfecXDFl93GKGbRnmLmr2e5po2KT8WQ1rtteIOW4qALWnqn%2Fln%2F2Ts3ScSIStCurdch%2BB4U3ty7lr%2FrVvEBp3rWf1bGO2bQ%2B8t4WprueZpngh2v9jRvL8%2Bx15pr3VW3Xx6eMu9zwbwwf2Lzezk4gdMJ947lvc6x6JzJtT%2Bqz1t7qa3NTnrjoDOuuL3gjObHbw96rfndkF%2FGaaP9n8%2FZf4vM0T6719B%2BO%2FZc9uLuapb0po9n02nGB%2BJ%2Bfp%2FcnUCd4z0TarjBhdYtz68HPzqQ2nLdLa8Oos5u7Ep%2FrwcobEiK0zogNFZjqmV3ABGiZwY0DU74bETINz%2FLW9v9pGkpsXlf5s77gl4%2F5lGbgnO5TU6QSX7JM6pr%2FA8%3D)

![plot](./src/assets/Firestore%20ERD.png)

- [Realtime Database](https://viewer.diagrams.net/?tags=%7B%7D&target=blank&highlight=0000ff&edit=_blank&layers=1&nav=1&title=%EC%A0%9C%EB%AA%A9%20%EC%97%86%EB%8A%94%20%EB%8B%A4%EC%9D%B4%EC%96%B4%EA%B7%B8%EB%9E%A8.drawio#R7Z1bb%2BI4FMc%2FDdLuw1a5Anls6XT2Mt2pprPaywtyEwPWJDFKTIH99GuTGEKOW9LiEJi1VM0Qx5jEP1%2F%2B5xw76bmjZPUxQ%2FPZPY1w3HOsaNVzb3uO41h9h%2F8nUtZFim07Zco0I1GZtkt4JP%2FiMtEqUxckwvleRkZpzMh8PzGkaYpDtpeGsowu97NNaLz%2Fq3M0xSDhMUQxTP2TRGxWpA59a5f%2BMybTmfxl2yrPJEhmLhPyGYroci8Jr9gdTVl5iQ84S1CKU8bP3KPsG856%2FocZY%2BJOr3vOHf%2BbiNxXU0qnMUZzkl%2BFNOHJYc6z3E1QQmJRz5WCbsqC%2BM%2B5H3ruKKOUFZ%2BS1QjHApbEUFzT3Qtnt%2FWQiXIbfMFKP5PZ4p%2Flzeqf2a9%2FPFgPD7Hz05b%2BM4oXZQ2XtcPWssp5Rc3FR147PfcmoounzRmbH2R0kUZY%2FILFj5YzwvDjHIXi9JI3QJ42Y0lcZoZXXN7EM84YXlWSyjv4iGmCWbbmWeRZSbNsvl55uNw1BduVbWFWbQfuoExFJd3ptvBdpfEPZb29oQ5hDf6RF4T3a3FJkpi3Al4RotU8lmdEvYUzEkef0JouxNXmDIXf5NHNjGbkX54fyVrkpzNW9kunv5fjUXyzLDPDOc%2FzICvbriXdo9Vexk8oZ%2FJqaByjeU52lBOUTUl6QxnjrbvIhGIyTfnnkJfFb7a8p%2BKqbE8PbN%2Fz92DbfR%2FS7itgu7xe2mHtAdYk%2BuHhtx83AwKnnZF0CsizouPws%2FQbHtGY8vq6TWnRFEgc15Jy3oF4MZ%2FwRNyOt0v5Ut6hSKK8GifxZviakSjC6aYzMsTQ07ZZzSkpxzL%2Fhv%2FxihpZV37P59c04sf27pj%2FiewZG9GUXyYiG2aYt4klFu1ij66jpPtq1ziMvEQswR0k3FZnth0XIJ6EyTjDU5Lzlj7mvO8Mb128%2Fa55%2B4D2U0ZRFKINbLYWE9%2B14Xws52HXnIeAc5hhxHA0RvynryP%2B0fB9P1%2Fb7hpwAABzMyXMyJwRmpo%2BrIOx1zVjaYNWIZN8HqP1OEWJGam1UB50TtkGlHGCSGzw6hDYVud4ob0cU25eGrw68Lqd44X20zyjHBMek2Q6XmSmH%2BsxlDsHDX0hzwQvxyFdiFu9FlVjAL8fcNA14D7gW%2Fg1%2Be%2F1USJ8u8W%2FPOV3ysiEhGijtR1rJLyRJFU4Qd%2FYACrO40q9O17NhyrOi5rlVxBfl47JhLcFcRJ6KiGxt3smZaW%2FbN76Ki%2B01xarAWD1yLh9m%2FC0W94T%2Fo9MfGktdAbFhk6HSSiQVJyJOcBh4gRvJR9YtTiB1zBOsPVa6EcP3RHGi9x0rtz2m8sJGzgKzwR%2BJqHxSWjh23mYwIE%2BCeNx0kW38%2BCAA10SACiOpljOxbwCCFt%2FwfFG8H7YnQF1VhFLOI2uxfoXfvjhC6f%2Bld6jdN2rr6HgZWfrv6oHf4uDK9t1ZcLtqnr6dl09esAZ4ZUiptpN4ovTa04XWYhfq5QiH1cRU%2FyqZSPXzkR7C3cg7SpeSzUby8RsU7HPeO96VdDL33igG1tzKwdqywb8wN8vorj18lu7pgMKsq1aSV69pKJyQEmbRri98yPaJfSlfBb21RKxcMb%2FLzS%2BWWvSgoZ0u9eQjmqxiZGMr%2FeUC5KMry89IOmEFrB%2Fffz8u0F9BOrO1aML9UW%2BeBLR6SecFYtJxdpYtDaYj8DcuYx04XTdsoxMCgW5maZBajNd6R9SlSvC%2FpK%2FzT9XvsWPdl8SB%2FI77xedMjh4WHX6RnW2pDpdODHVnck36636NNrzeM%2B1513tI%2B8rfNfbcavaeodtiU8XRn%2BM%2BDzUYY4Rn0q87U1VMGAklkDunNJmQeSRiBWi88SIYQhCOYzfqkibQfytg7hrWbVBfDBUDOJDlQQZtLZdBYYl6qO49UPR1a0JzRLEfjSdHvago8Z1FfHWOr0H4xSf%2BeUjUYrxJWggrBrWT0p4ALv0V5KIDvyIM4Jzw1kLZ4Uz4bScA9iTv9I5T%2FhYxB0N5OMhq3atnJgy9AwWlEupZjhr4azYuXLieRn6VMpROyebUdsI8GMFeOAGNQHuKwS4OobntSbAoRtlY2c%2FGDv79X5yOXE8D7pSGGExNs4yTYQ7D995cB3vlIswuefQUNZBufPonQf9ZWI%2FC862O1pECWZTy1GUu98n7kP7GRA91Vq%2FF1XPwTip9EcfjJN65xYn9YN6sGsQ1NRX00jpABbleldBsF9ay9FS%2F2WPm9H0x2r6%2FrDuVB8qIqMnXpfnQ5vdaPomPeRyNL0PV%2FIwXq%2FxOK%2B4ZYwWOI5y57rehwtsC8qF7jOUdVDuXNf70AVziYIvaCj4JKGzEXz9fn0OD%2Fo11k0FHyzKtk6v%2BPpwcpC%2BXGx8uXp0nwfazNBrNo60tiKuD2cLI%2FuadJPLkX196ModcahTmq1%2FMRu2daLuXPv1oU%2F3e1YFktD5qIIBnMrrT%2BhuLAvAbGFbw5PLgsF3oTMHg4YtautfOZsm5Q%2F9umhwa4U034MRwCYldySdqj29OBkZjalDYw6hXaJ6m4DSt9jagt2B4jnFpQIxz4x5bTja9pbLUZtDGDlgdC739P9ya2hrpN254BzA8LJZRKCbcufOxqEDKJtFBLopd7%2BIYAhdgEVkyGDWiLnz580PocsPED1%2Fk07a%2FgdNOonobCy6wK5bdLbl1qywxotFHFhWfdlvyxZdoAgcVBf7G5vuWJvOtaHZ3m9q1EmXoP5NHnAYyUuVPzavD2vSYS7HqAugF9CsBtdJuHNDjk9BCsTSiDNBwCP5dm7CcVkA%2BBpLXTfmxjZca6%2FytC24J8%2FY6to5e07HnAMYRwFEz9%2BIaxzpDc4t0uspQmnD2uDdONLrg7LsetS4bSMORmgq%2B%2FKNCXesCacI5jd%2BJd325Wb6BxHova%2FG5YwJd7C7XI4Jtx34XgzMGdz6cJ%2BBPQfjsEbv68Z8BmYd9MyYmI1uzN2H5mxL9TwG457RBbjzoBy3HgBgY7dr59z9a6AtB3AGSL8nw71kdDaGex8G02znnYa7BzZy87Jq8baWDXdb8fb4avh182pTIl6vIy070NqMNd94GJGLbCF31RvIHVvVjlt7KpeteMW8sfCaTSW7bnTUU3FVwNubShTvnDdRWa2MVc%2FFPTFjGJZd5FwUGjNeJ2fVc3FPzFn93nkj%2F7VyVj4a98SgYXz2AvW%2FlPUNNtRZZ2YADMErDWxn8M7ll74Lll86Qe2KWjcAoAfQGAAtGwC2FdQfyxv48NWaJzcAFE5CYwA0nEz6jRvB%2BRgA0GdoDACtjM%2FAAIAxemMAaOfcvQEgfZDGAGiTc5sGAD%2FMKGVVeZeh%2BeyeRljk%2BA8%3D)

![plot](./src/assets/Realtime%20Database%20ERD.png)

- localstorage
  1. Bookmark : All likes, liked
  2. Twitch tokens : App Access token, OAuth token
  3. Environment variables : autoLogin, dark mode theme, ...

# Accessibility

## 1. PWA

## 1-1 Install

## 1-2 Push Notification with Firebase Cloud Message

- [Flow Chart](https://viewer.diagrams.net/?tags=%7B%7D&target=blank&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Cloud%20Messaging.drawio#R7V1Zc5vKtv41qXPvQ1zMwyMgEAJJgBAg8bILEJMAMYPQr7%2BNbdmWrMROYu9k73NdlRi6oaHX8K2hF%2B0vKJcdp5VTRIt856dfEGh3%2FIJOviAIgqEw%2BDW2DA8tMIXQDy1hFe8e254b9PjkPzZCj61tvPPriwubPE%2BbuLhs9PLDwfeaizanqvL%2B8rIgTy%2BfWjih%2F6pB95z0dasV75rooZXCoed20Y%2FD6PxkGHrsyZzzxY8NdeTs8v5FE8p%2FQbkqz5uHo%2BzI%2BelIvTNdHu4TvtH79GKVf2jec4MTRpuvFeOm8kqgtgIvDF34FX18uc5J28cZP75tM5xJUOXtYeePo0BfULaP4sbXC8cbe3vAddAWNVkKzmBwGOSH5pGLMAHOH4f3q8Y%2FfvPF4SdyAEHy88xvqgFc8njDV4S%2Bwx9uepSir%2FTja%2FfPLKHPEhO9ZAeCPc7HeZSD8Gn4Z1KBg0dq3aacto4ltukrwvlr3uDzxtO18Cv%2BNuEAx4vxMM7uhYwdqRAD0Zo7rp%2BqeR03cX4A%2FW7eNHkGLkjHDtbxkvCe5lye5hXo3%2FmB06bNixGYNA7HO5t8JL9TFw%2BiH8THkU%2Fs%2FQOZcyt0bgHHUdOMisOMc0eEunHAcHd7p3OaIo8PzZ0H3gMRmrbJq9gBNBCCuPJdp%2FbB4f0Y9Yu2r16at7uvmV%2FXThgfwrviED6x%2FBV%2Fb0jBN1mOktAFw0n8Fb%2Fhm%2Fw%2BN344u%2Bm32T0yrXj%2F5J8wy3HPI0DfJQpBvU0UlLwjsBt0gfBPogv271GDpo8bL%2FJ2h7uD34Bmp679ZpT3LHfj1P8rLqL84H%2FFEcLBIAj3SA8iCchzKTR4lPws7x6ZOUJh5dfx6eV5Dp7z4hzYSv%2Flub%2BLX55eSgd8U7G%2BK6pva9u15KAkDp1%2FkNdSRJF3nyVG1A0xIu55PRqUC3kiyjY%2Fd3yt700N4CMEU8XxnkbnfnAUjr%2FX92wFVzDqDPyv%2BxWgzHn0Ec3uH%2FBw7SvZBRQc2%2BumyhP%2FLIgHIAbjC8RpetV02xAi2Pn8cWD4hgxn8W43drLOY4MHuAxe9J8nVWfnD7%2BDCBqBcBSDYBjD4EsbTr424aN8QTBO0ShMkyQM%2FIdXIoh%2BlgDC73CEPh3gL%2FH9hpPz5F1egvtnGT3iHwnuO6APABMeThFhhGaEi01WWfWQPA1zBvwsdSPijRAcTQ3wH5twzBb85oKZipfjBdyGnVmbBTgiOfCf0oe8KfP3XUuYT3nNXGGbFt5x5mDAKxc8ZyptmdXaToUVy68YjReWmT8VSi6rOnrB1xBElbWYusQiaUjcVQWaOsoy1M0rW%2BJOW8NPi7wOw3pwc46p67ycMSd3MVP11lEDhelPp3ngIX7wBWEDgFesuvVdz6MooBAC2oKGFofJ6jiNMCeD8sW0w1p3B8mljlc8nLpDGLU5cqBcYtd0JI0WC03UlVnHN3MeknzCY08a0ZrJRhEb29awwLXFPYZMDbwV9qZcl1U1PnUJC1bfifM5F3U0hS7LoiFDOKHaLt0GMrv2Fv3OWaDRQjzhte1jrJrMyKjnl2q28OrDMBG34H3J6JQHTZTWw25hWCRr8rPalzRjuR2IXWnsZydn8PzSJ04rZDuLuUW95g7HROsXdXhcIjpn0TJ2pGHU2jV2I8znRdSXzVYCEs8eJlFcLQ4gQjGFk4ur4HHaFLciaU%2FUTDhJfMEP4J3BbQkoJaxA0MrjYOC1q4SOpwouScO4GNs22jCJRzlxLA4kt9qFxrGGdmB4Lpw0ZoJJdZWVE2mNwDGxfvAiQKf3cERIo2ORAYTIZzpslIO7rU2goyxQgj1mjCxU9uqGiHWok7vUZOo86I5Orc5JFPR1pbLM%2BYng8FBq2Xy%2BUPGpdgAdDhj1NFVKrzIgJw1TWbOOzZGYd3MLarrlDN8UkVzie%2FgYdb7i69S0Q3Icko%2Fu1DKqib1ORDcJiiOWW7LJTtaRBQaF%2BM1INZcaCsbMtzQpLgJ5KkURS1hxu0hJ8FDamftQNUwH6cgR7Wg0xTw7HVH8uFa6vdHx8qqxjLmkpItT0AUHzzxNHDGX1jqPHpa6FOqqo8O%2BoCpkvizrWSSfbG0yCi1Rx0L6QDUD1fSwEmdSMQVOJcvCOWg0uzmDLPZYeOKsSeUft5p6iBLQfepOhGOpcluRmrcEhl1QAF0FOMCSMsYwI4GoTotsDZXpLtD36OwkI37PG3OROmw7a3JAGj0AsQ6LkhOTo61cHI50cirhzdKsjX4OEJwVKBqnR2bp2ootjsGiEVbYTkdV2XXRBCLtkOWrOsE7lFiDyQibpF%2FVXRkOxsZuBzodpzEiUF1I4aY0VqQSWsimSRSVnmaE0qiIIIdsRs7BNXMBnjUDQxfrYNToVq1VlxnfgcfFAC7DwyTVGwVgVi1Wxowp4VOVE7IiNeyWVKmKKJxpdrKJ0pNWbGiaTHCMixyzK0bYZMBHEIWWgakdHBo8gmdQb6ci7M7bfjJGe9updlJOPQO3qLXC6A3NS2svNVS7UQCwsU1b9mnMFBMGgymO4oDzJGBQZbneQXbllZYybWEGfBEhQFZYexavcjeQzQMzV7IKlSnT0HNe2iSiQBp7WTqJyYTd5nOihPVdMcqAMXrbrlgKx9U2F3IV0o39YhHFW06IQqBd7NolBqbQIGPOzU6DZqVFOR%2F1LfADqtnalZwYHB4G6EYF2LZixx5U7Bgq4vuSWwxaaikTIvLzol1l5qL1lvYml1dcpgwdsV%2FyvFRH0VatZAbaZkC4BAYZJpx8YtY0XIvMkpcXveE5hU5HU3huGHxwapf1llpOsn3rpUx%2FgHuOq0crwAJjoIwP0YW1yKqptTZYXCf0gjy1%2BWp%2FIvlysp53A72mN5V%2BOulR7HccWfFHGG%2BjZSNULodrYJwK2F4BSoUmB6BhCmSctVvOBNqjt1s06IXCyOTBY%2BeiEXQwMTQHw8IaOx3WQr8ovBGpZrnVpagntWKCmw4V5f3G4AeyNVZj8oo1TwHcYnB6QOXNoLTNsYY1t8NFhcey2Kp6Nml3SlrysHDi887Eg1FHqXJDaIgbWNhWJESIxbzt3i7ClAj7aR6nnYlIboydEsXKYCzahfsjMQKadyDM0y4j5Trj9qom79uJMxk4iEZm9dLrMlaoqlWVRJaiari8bldThffWW22RUd10t1ibHr2JEWtxlMVk4yDOEdsWxIY7ePu1ZGMiJtY4v97BGD%2BRS%2F643hQr8cSbtVtvV2000fR4zeSL3Qlq2NCIcXajUFRdGSssLJf%2BKEedTGSyVk3bBHZnHBu5nL2VazEXdHOpjbJJiYPMwer%2B4FajTgMgZkf9rPTxbj3ZTffQJOHXYsVOYokQ5sq9KRBN0JsfZm4pT8XSWQFAY3k1R5iZOVWxPgnIZWdI%2FFQjCxlcnijMQC%2FtCNlNmWCPUdtUleMijrOl3bh%2BEnvmjmJmK2sjzvzVYYVM6b0uMqwZJE7gzbNEsRcx7zlwaBVEhhdKnUxMlMKBnGh8nSd6CEvuqZPS3vGzfGtLyxFolD5bKVXls0IMsQWGmgVs4bu14ZuO3XL0bAaAUBAyD88d5Xhasfp6seYAPNqyFuy8Ktu23WZ1JKHDWlpvYYRcboNANlaiG8cLJ51ms1mMUiweIMZGw8sRTCUtBMAozMSQU%2FcoJLdzeI2ZSJM7izqGNd6vQoWFgMPKUvv1acrkCW%2ByBrMSd3DCzIxYlgus2AihJlcIneuxGujTCTON1ePStMJZdcSiCbr0dCswp%2BsZcVwYu5Bi3WVfNPttVnm2xgo9xBwXp13L4lOIjoxM9XPfVgQmV8yDa0AWA%2FUSjy7nUI83rGEO4TbhGRDuNzvXn60YDIn2jj2FO23D1izcxstkUyXxkZEkk8E4Nmw41FbMcPQXeGo0cKyANmEL243fLbkR19eNGDtsYvT8RIGKOeNIqqjMc6WNGY41CGSeG%2BnWq8huYhV0bmKneNGm%2BhrlwwxejPfPMgqC2n0F7UQZVWLNObkNYbV%2BofVMZhsFwW1LI9G2POUMFkCCNX3QSP6EJvh2ut4YYAhJU8W%2BHgWVG8zI7BYTbOj5xNjOhgCbHvbx0V1UK0kIlmYmrkdb2W9JfBsx1KpID709mttl3qyyzqsjXLJ1i2Y5aWa1Iug5%2BOuOAt6WGHu6xHA1PGCF1ODcSrcX29l%2B24oHNy1HsZ%2BlE29Fh2Z%2FEMhmSkuLiTnlqWMJJquZ4amsEI3Be7VPgamd2A3swWahcHOgRPWC63KmGYAb20yMo7wiOYJqFJoVl8pUnh6O5kQvbbIOjpONi1Urb%2FQoSr5dgamE3DasKqIs5KSCckKcRowOmlN2SXKzPjVhd9tPlmZDHbvDfFLtLfY4F9lJ64WT0WnoedU2WuBpeXoorCzLWebOeD%2FbyjlryLhmHDApkthDrni%2BukR7JJpXGlrMtxpcah2fDYGrDDag4b03tQojviXarVUMcifkC2438%2BYqXJyUUNmT8mbNr%2FwFv2gK39ouYMIVpz2Uhy5MZUSeRSxpbYLNFpOppWszcEbsQg3Sxpikh2CqNfju6HMzSoUhzZj6szZp2tl0Re6tSN9PtGDCNAeT34%2BGlrB7H2qgnOk5n5jitppxO4UKBt0kqsUYTEKFZ%2BRKWOKdRbDYaL33HaqiMGcJ08mK9pmkcayqMXMltySomifbYeEy6cFaM%2BJ6vhtWtU2QaYXtWqNvZbVFN02E4Mn%2BqKeFyW%2F3KWMom%2F3pSBRhOfrViz09I%2FdJ4ruTZiGHzegzNnNb2W%2BXLHZo17aEhLFfVahNxGzB1VR5OKzDxlsR6oZrAOxV0Infj25uxOwjbJBmKmVs%2FIHSJ%2FxIIGAVdwc9lLmuWNhWtaY7d5W4rdv4G52d%2BQnJ6jBvoHV64qfHDJZP05HJ03YZK1J8WlASosfTdSWo8owot9QYIXWcyRtcipzmaJ559%2FFAghMqLakSI7tHfYngJyxJoGy6gqlwtd8HRoLBTJfhJ3QHQWpq2hu7Pm2GyVRRNhyNZjSxjRq43IyuybIhOx7OhKFH%2BYws%2BuWkZNZ6s5F2Zmqvq9QPvREe9AbYjaCLHE6cKDqHtWm1Oa2KfU1vdkw%2BQIKMMCKdafnEM%2FoAuMDp6DKIVS7HtesNA4rDjGX21EyCTigaHk4bZdYuZANZ2dKoRUnDAqM4ErBhrbVkCPLhgHeKyRLMDG%2BNNPImgZcdFuFy4UyoQgwzADrm2t1Ro%2B3kq5kMlygphlrBart7NVBLjF3WURpbhBOnJrHa0Km6Q6bSwjNTzZfMCYNv12q1KkeDJEWwnI1vwgoIwlosvDyp0clleblzIpYp4iXncksLbamSRTF56YxmTC5k2SyWsp0dc3hu5ruVmrTLRRzNICuZr4B8s7vFFMUavMyamTvv4ZZYZjPW53PbXKdFuJW38xTbdaFkyVtanxsTlVhXoVQ1vCX78c6haNfktGSMRHDD6%2Bt4fmI6wimtfj%2FYA6b4I%2FS3QjewVVouNH4qdPP86Ofl5oBCGarN4UjCVAh4YuBqiVQDADUZsp0bVSuhG1srNy6O5W2aB%2FkQTItSGlEZVsYAYoSlbbdZLwpYn9m7ac%2Fk5hgoKRaxwPzWFjbLrV7ykxao14bCfdH0utFTrk4RYxkSu8I8onWtgxg3ot3mxyAGSrzuFnNnUPwY38epJ1kTZAhnvBimwFB2IHJCtT6QPV%2BpQcTBj1hOthoaz9NkTZcD2vWKNaqEfgzz2SIV%2FaMSya3YDI108gzOs1WqiVFihvS4OzlyTZvMwRz5CbcjNQla6S0xiVCyDTIHY9MZmy3WObEVZMpv4uLQ1EcfXfM5G63WQ99mA6KNsdYYhw3g37EpkDk9cCU%2BDRh5Zo%2Bk8OmppM2qAa2bIx92tiZzWYbho0rjIjF674cxkGy5nVg2tX0slwY8FVuKP9l4xoWaBaeS5DAhBqza0vAYe69QwKdModmgILBl8av1MTIPw9BE2LiwKuyF%2FOQXeWgdR2%2BmZDDDaLp5thktBVagEB2qCxBtByuBFFm6PQyZML7ngVJzkTHyMh4KkV3pNeY6yxbE4kJTYS6JHDdBt5vExXqqCmywwdhJ6e3xfIwYZm2uyGP8I9jqvoAZV5bk0pssqhGqrcTUT6mdjvHFzI%2BJaKC8JHfofMm3nE2GbNIFZNV5nY8abV2WvMPOkBBr1Rk5H4hsZ6AxTtZZCWW2Oj04KTCox2WbT%2FdUaAu%2BBMHiOE3qKG5nHopF053DmosQ3keaNDVbx8%2Bh%2BQDnMdd37R5ES93oFzH7fD4D7vlyu6vmepzTecgzkTEjJhmsVLWq7GmonSJyhNG7adzT3jQ5Grp4RE%2Bi2hyWssL08JiUY%2FhUWCd6q2Uc9%2F6k9lPW991ZbRi7I54XScAP8SpJS0J35OssLflZSVry85ZOOO68ePLPWS35eM4Pl9n5t9Lx2GcxGoZvcPqKA2l8T9kHDpwLVkaC7uLK9x5z8XXeju0v6V%2F4VQzecqTgxHW8xAUcUp%2Fb2PvqgPsJ4ewXfAJawBjjw7inuhvoqvqD%2BphSAAy5XBWBqVt8eM0G%2BvP4gPw38oHE0DsKpp9%2FLrlyqxjh7%2BUK%2Bt%2FIlafCjj9HO27Zoys%2B%2BIcdM9bmjbidOnUde5f0vqw4uybbpXn5gqCCQNMo%2Bj2C%2BruLKr%2FX5Kz81Gni7rLo7xZtHm9VR46%2FYMMZmx%2FZgGD05RBAqCrPf7zrZZHe1UAYgn5%2FoMapQr95NRAgpzO8uOxRIr%2F9wldrzefnPHP%2BYcRnOXgi1i%2BIxgdUeRDfcFWEpzo1aHGuRwPHgFZrICyH93owo6DcL11fVVpAlwL6yuv4pn%2Fyts5%2FV4tuVxC8CyHeLdK%2Fpu63CuM%2BiKeV37QVYB0UeNkPcfEFp64Z81SH8AKD8gIMDYyAU0f3oAM%2FdD%2ByjfoFQAJMrobNeNsdjFLnhu19A34%2BnRwfx304G16evbAy940%2Fj3DnYlroDoLQK6PxKGy%2FCIKvsIu6KtZ5Lwg%2BVXE%2BDoSi1B2JvAsHn8cabs4iD4Lav7jjo8DtSTM%2Fze49CRP8Y4L0E%2Fbygbrfmy3yNxlWiL4ShZ80rAhFXgyEoeS7BOrDxONW8PZBOMkfqnx8A8LJxlKpg1sXD733w49Llg%2FXgVg%2B%2Bgk0%2FVNs4lnD%2FnibiLyjKPrXoOBlMgUo9KjOgnBL1UkBgu57nsED4D92BSAk%2BaG26E30QLHf45bjFHKHEz%2BJICh6aZWId7rmH4Ug6K1qzEsEOX89dQYI9DVW6K1be1Xsjo4yk1ZO9homfgYXfgoHrsHkdRj9Qu6JHwCKs%2F79ckXu6Lado5bzt0fwhzhLTx7%2B3%2BCZ3MpXfZDpOQ9UF87h2wP1j5mHcSgSesAOaEwWf30UlrEj9YPmu89obz7g9fVBe7jP5Tx84DGauxcS3d6Q8oeXv2x%2BVgd95ApgdxjXQJ7%2FAqQG9B4n29bjdwTQ5Jv3HPImDoDkjy%2FzV%2BIP37zxLU17Ngajgv3AF3jUVW6r9%2Bvmph79cOIJoS%2FVAsUf0fBF4gnBHwOAi49IsE%2Byuugtq%2FuGmP9egf4w7ftJzXj44MnyXTHPx9oCr%2FKdxn86%2F7bOPAu6UxR3RV43%2F%2FOfl%2FdH4P7%2F%2FO83pfs7BueWKv4LtAPH3qkdJPHr2nH7Q9%2FPDz%2Bgnd%2FFgOz%2FuCTNMW6ewmpw%2FCKqBmfPHvF4cnaIb%2FqvN4Xmwb180zz%2FjoQNcGkvhsWoq0WBn03YYNeL3b8zW3NTHf7ECO1RDKHfI4Zn8%2Flm8AZ%2FQ15%2FURjx6%2FCKoO%2BeVhl%2FVCBJGL%2B7guCb431cyHZTym7tEfDDEduDVQUXPxrWf17A9u447FJyv624%2F5p47eYU347zf9pUv4xIXssRYHk6Lm%2F%2FUyz4E6g%2BL7N8%2BaHM%2BPvh8yUq3mQa%2BaZcnvM354AJ%2BRC5JDH8jkIunU36J804dk6cnD%2FRJn7UjH%2B%2BcvxEtdv%2FB3kfGeS9hJB%2Feoz3S9sSXcd4xI3Sm9sZkA9Yd7ipG%2B%2FYo%2Ba3ObV35NmT3b50ZG96tS9WzZ8QfPuy75fh%2FKU3%2FD2YeRP2H6rOPtwZRrFLZ5i63tfo3cueV9WT9Dsjs4%2BC65vbavywC%2Fx9t%2BW%2Fyf2lf5v7eylH5w17Pt%2Fg36jrbIvdQ0T0jQT7tYAAi5c2cTbeMe4N8lAm9lEG5oM2uUPwK42%2FVciJ36rk%2FIBCztuEf50j8fKsSP170vfnYBS6dyjuFRMKUmBZ%2FjTKYsQ7KEvcoCz%2BaZR9x96Bv89QI%2F9OQ%2F2NxMGvZq3wyxQqdb0X03sNNQ7DI%2BUvbDX192ar4E9MPDzCxV%2FnFMNfQKVfmfT%2FBgP%2BoPu%2FwYJfpR%2B%2BXsnW5xnwM7i9EKv7JXmhBhh3P6%2ByHYOyPwcBXwIg%2FF0A%2FEAgO%2Fs5b%2Bff3yzwxWjsitkfk2tCUeKOvMaoq1HenWu68ndg6J2RyY9%2B6YAS1w9CL%2FZJvvzU4e9MZSGv3QD9QSUEbvGL6vDtXOltD%2BttEf7uAiVMX6YgzxD2wRXlMEQgPydu15WAr0f6A3KbyA%2Fst%2Fiw6bJ%2FKQNvfnX2bpf6OwL7WhBeJrxu7U%2BJfYgwvApB%2F7YFGeR10tnv%2FAeP6KGcsvh%2BZuJ1yy7ubvpTP5xe%2FmYK233aYvOr9wADzH14HDfjxt63hoTv7gcC4Vx2lx%2Fuv5V8M2l7P48%2Ff2rIy6kFwb9qbug4Ny9ygM6nd%2BfUyA%2FN7Q8L2F%2Ftcw7fCNgx6mnZ68P3wr0NAp%2F48eL%2FL8tefm3wt1XCfBfuf3HNF%2FhFMIVeuh3IxxRukTACpB%2B63qv9OsH1wzmI660WIBi63vH9D3CTzjR9oYlqW49fNl3q0X068itAxnHnYuj546dXCvPnbFvyaylkCLr%2BOynoa%2BTEbiWRf2I3AHD6%2FLdrHlj7%2FCeAUP7%2FAA%3D%3D)

![plot](./src/assets/Push%20notification%20flow-chart%20with%20fcm.png)

---

## 2. SEO

## 2-1. SEO 등록

- Google Search Console

- Naver Search Advisor

## 2-2 Open graph tags

- Set Open graph web version

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

## 2-3 Sitemap.xml

- sitemap: [Sitemap](https://cctwitch.xyz/sitemap.xml)

## 3. Google Analytics & Adsense
