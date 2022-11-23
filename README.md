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

# Database

## 1. DB & Data sets

|        DB        |   Data1   |          Data2          |         Data3         |
| :--------------: | :-------: | :---------------------: | :-------------------: |
|    Firestore     | Cliplist  |        Timeline         |        Hotclip        |
| Realtime Databse | User Data | Notification Data (fcm) |  Twitch Stream Data   |
|   LocalStorage   | Bookmark  |      Twitch tokens      | Environment variables |

## 2. ERD

- [Firestore Diagram](https://viewer.diagrams.net/index.html?tags=%7B%7D&target=blank&&highlight=0000ff&edit=_blank&layers=1&nav=1#R7Z1tb9s2EMc%2FjV%2Bu0LPkl42TrcWaIUs6rHs1MBZjs5VEQ6KTuJ9%2BlPVgSack9krlguKKojVpihL5O5rU%2F07izF2kj7%2FlbLO%2BlDFPZo4VP87c85nj2K491%2F%2BVObsqJ7KcKmOVi7gudMi4Ed95nWnVuVsR86JXUEmZKLHpZy5llvGl6uWxPJcP%2FWJ3MumfdcNWHGTcLFkCc%2F8WsVrXrXDCQ%2F4HLlbr5sx2UDc4ZU3huiXFmsXyoZPlXszcRS6lqj6ljwuelJ3X9Et13K9PfNteWM4zdcwB0dePX%2B%2F59dUyZPbv2z93Kljbv9QXe8%2BSbd3gRSI2iShUfdFq1%2FRE8SDShGU6dXYnM3VTf2Pp9HItkvgT28lteSWFYstvTepsLXPxXZdnif7K1hn661zVoF2rV%2BKmPLKuM%2BeFLnPVNM8eZF2yx17BT6xQzdXIJGGbQtzur688MGX5SmRnUimZ1oVYIlaZ%2FrzUdfG8aVN1Vban03XH8Fzxxyd73G456gHAZcpVvtNF6gMaI6lN360reDjYkWfVxrHu2JDn15mstt1VW3N7smtt6yxb6Ra2Zwus3tls1wKni0bO5g5OxhLdHxlT%2FExus7jompT%2B0GnmIWtvaCcYXTO2O1ZXln%2B%2Ft7dcZCtge5qB2ptOLr%2FxhUykJnaeycoYRZIMsooNW%2BpqPvG7spHeIee6bneZJTXbu2Q%2FItcijnlW2pJUTLHb1rA3UmRq3zH%2Bmf6rr3thvfNnvr6mhU7bh7T%2BWxbP1UJm%2BjKZ2JsI11b5wEvL7NmXc6x9PT1modHt%2BjxfsrIh966R9YCfTNcGdNlW6UH%2BkRgbYhygM3YA46WeNxb6J0NVkMu%2BIcL%2Fm%2FAcm7A7QrjCQ0PYBGDbQSfsjo5hoef8PWO9emY7QvwDiH10xB5ArG%2BmlrnYKCEzGsqGOEfonH24oC6utreJWNJsbIBwq0agEY7gdJyIEhstuAwh9rARu8Eo4r9oQjbGOERnHALGiq2IrynpA51vBPkKVfYpLbWMEEZXtzy41FLrbXqbMZH8u80TIm2INLrG5cH5eLuJmeLx%2B3rJVSaI8Q8wRle5PDgfL3NOjM0x9tB1rmZh32EMgPJ4xRuHpm6tULtrnrBSJLk4fAP6bK3SxqnJs%2Fh96W3WyYvrlGW7We3oBLl56VbjcU2UPwr1palDf%2F6nzNcIq9T5Y6fY%2Ba5JZLpbvnQTnaPK5OGwfao5rmp12dQnAddZhdzmS%2F7cOqfWDnULV%2Fw54%2FDccevoWIM9Zg1tZr7ncN%2B%2F5Gcco1dyfyPcOEU9e%2BCDDQZVVE2tj3I63vNBRf6gImdYUdUVoCJTPlMPetVKT30BTHkKN70TzH5iN73v99HazSq%2BY6SOP2akdjDVb9a4f408qMdPS94T0Nvxexzj6aalEfcLLT2MMvbRGUP%2FC90sTkE6wibtQ9KfRcoTkcEhTIF0p87Qg0A6vwkxevGeYv4M758hks4fcfzRGuHoX5Vq1L7dUDofSlAUSmcYMrrO6I9oUBRLZxIxuszoQ7cQBdOZJIwfTefDJykoms4sY%2FRwumaqoHC6aUGjx9MFUGyleDqTiPED6gIov1EkjkHA6OF0AVRk7kX8maJxTFJGD6gLKBzntbQQdNQUjzM5ZHTFK4BiiP7VXpBjzCxndNErgIrIB6nKO2YAltwlEPpJ7pL50S8ecJ7B%2FTO4SwIo0pC75PhflWrQvl13SbMaJXfJdJDRZ44QajPkLjGKGN1dEjoA8W0uWbzUncHJaWKKM77TJKRXEEzNGN1pEtI7CF4FNLrTJKSXEEyLGN9pEtIj6pNDRnechPSM%2BqSA0X0mIdTeyDNmXAtBpwy1LvKMTYIaXfdqln7kGZsOMrruFUHdizxj5jmji18R1EQWMk152ZVDsvSsL6T%2BwrO%2BQ99YCH1jo0%2BOOfOpnvWdQ7VTl3csmqCPHdPREy8ZeCuP%2BkZQAmv9UsTZGGf0x33tkRfbx6LYJGz3B0vp5soUaPSnfSModdKz%2B2YZt%2B%2FWQIM8p3jDySF72JAjCHmTS82Jk0ZiEnSIDXoOb59zvkl2FDdibp1toUOGC23yTxmG7KJDhosvehW6WcYBOmPog7wuf60BVlLAIPLTFDC%2FCcJCVMCgQ5IUsJMGdDVe3q4CNofOSFLAzHPGV8AsCLqrgBFrY6zRRbD2Fb2kgk0GGV8Fsy1440wymGHK6DKY3ezKTTrYtKTRdTDbgvEFJIQZXm6jC2G2RUrY5JTRlTDbIils8jtnfMjQRQWQmt2%2FRHP%2FLC9Htytptx55Z1nerLf9iO2Gs%2Bc3INmnrngudM%2BU8tZJu5JARK%2B2h8hAMbPbu9yTNxFxIlDTO%2F1P%2B%2Bd19xSxLSi84ZuWPZtoV5sXN6upV8F4lhaGA0uzGmfHyZZmDeIc56ZMSydzKVW3eM4260sZ87LEfw%3D%3D)

- [Realtime Database](https://viewer.diagrams.net/?tags=%7B%7D&target=blank&highlight=0000ff&edit=_blank&layers=1&nav=1&title=%EC%A0%9C%EB%AA%A9%20%EC%97%86%EB%8A%94%20%EB%8B%A4%EC%9D%B4%EC%96%B4%EA%B7%B8%EB%9E%A8.drawio#R7Z1bb%2BI4FMc%2FDdLuw1a5Anls6XT2Mt2pprPaywtyEwPWJDFKTIH99GuTGEKOW9LiEJi1VM0Qx5jEP1%2F%2B5xw76bmjZPUxQ%2FPZPY1w3HOsaNVzb3uO41h9h%2F8nUtZFim07Zco0I1GZtkt4JP%2FiMtEqUxckwvleRkZpzMh8PzGkaYpDtpeGsowu97NNaLz%2Fq3M0xSDhMUQxTP2TRGxWpA59a5f%2BMybTmfxl2yrPJEhmLhPyGYroci8Jr9gdTVl5iQ84S1CKU8bP3KPsG856%2FocZY%2BJOr3vOHf%2BbiNxXU0qnMUZzkl%2BFNOHJYc6z3E1QQmJRz5WCbsqC%2BM%2B5H3ruKKOUFZ%2BS1QjHApbEUFzT3Qtnt%2FWQiXIbfMFKP5PZ4p%2Flzeqf2a9%2FPFgPD7Hz05b%2BM4oXZQ2XtcPWssp5Rc3FR147PfcmoounzRmbH2R0kUZY%2FILFj5YzwvDjHIXi9JI3QJ42Y0lcZoZXXN7EM84YXlWSyjv4iGmCWbbmWeRZSbNsvl55uNw1BduVbWFWbQfuoExFJd3ptvBdpfEPZb29oQ5hDf6RF4T3a3FJkpi3Al4RotU8lmdEvYUzEkef0JouxNXmDIXf5NHNjGbkX54fyVrkpzNW9kunv5fjUXyzLDPDOc%2FzICvbriXdo9Vexk8oZ%2FJqaByjeU52lBOUTUl6QxnjrbvIhGIyTfnnkJfFb7a8p%2BKqbE8PbN%2Fz92DbfR%2FS7itgu7xe2mHtAdYk%2BuHhtx83AwKnnZF0CsizouPws%2FQbHtGY8vq6TWnRFEgc15Jy3oF4MZ%2FwRNyOt0v5Ut6hSKK8GifxZviakSjC6aYzMsTQ07ZZzSkpxzL%2Fhv%2FxihpZV37P59c04sf27pj%2FiewZG9GUXyYiG2aYt4klFu1ij66jpPtq1ziMvEQswR0k3FZnth0XIJ6EyTjDU5Lzlj7mvO8Mb128%2Fa55%2B4D2U0ZRFKINbLYWE9%2B14Xws52HXnIeAc5hhxHA0RvynryP%2B0fB9P1%2Fb7hpwAABzMyXMyJwRmpo%2BrIOx1zVjaYNWIZN8HqP1OEWJGam1UB50TtkGlHGCSGzw6hDYVud4ob0cU25eGrw68Lqd44X20zyjHBMek2Q6XmSmH%2BsxlDsHDX0hzwQvxyFdiFu9FlVjAL8fcNA14D7gW%2Fg1%2Be%2F1USJ8u8W%2FPOV3ysiEhGijtR1rJLyRJFU4Qd%2FYACrO40q9O17NhyrOi5rlVxBfl47JhLcFcRJ6KiGxt3smZaW%2FbN76Ki%2B01xarAWD1yLh9m%2FC0W94T%2Fo9MfGktdAbFhk6HSSiQVJyJOcBh4gRvJR9YtTiB1zBOsPVa6EcP3RHGi9x0rtz2m8sJGzgKzwR%2BJqHxSWjh23mYwIE%2BCeNx0kW38%2BCAA10SACiOpljOxbwCCFt%2FwfFG8H7YnQF1VhFLOI2uxfoXfvjhC6f%2Bld6jdN2rr6HgZWfrv6oHf4uDK9t1ZcLtqnr6dl09esAZ4ZUiptpN4ovTa04XWYhfq5QiH1cRU%2FyqZSPXzkR7C3cg7SpeSzUby8RsU7HPeO96VdDL33igG1tzKwdqywb8wN8vorj18lu7pgMKsq1aSV69pKJyQEmbRri98yPaJfSlfBb21RKxcMb%2FLzS%2BWWvSgoZ0u9eQjmqxiZGMr%2FeUC5KMry89IOmEFrB%2Fffz8u0F9BOrO1aML9UW%2BeBLR6SecFYtJxdpYtDaYj8DcuYx04XTdsoxMCgW5maZBajNd6R9SlSvC%2FpK%2FzT9XvsWPdl8SB%2FI77xedMjh4WHX6RnW2pDpdODHVnck36636NNrzeM%2B1513tI%2B8rfNfbcavaeodtiU8XRn%2BM%2BDzUYY4Rn0q87U1VMGAklkDunNJmQeSRiBWi88SIYQhCOYzfqkibQfytg7hrWbVBfDBUDOJDlQQZtLZdBYYl6qO49UPR1a0JzRLEfjSdHvago8Z1FfHWOr0H4xSf%2BeUjUYrxJWggrBrWT0p4ALv0V5KIDvyIM4Jzw1kLZ4Uz4bScA9iTv9I5T%2FhYxB0N5OMhq3atnJgy9AwWlEupZjhr4azYuXLieRn6VMpROyebUdsI8GMFeOAGNQHuKwS4OobntSbAoRtlY2c%2FGDv79X5yOXE8D7pSGGExNs4yTYQ7D995cB3vlIswuefQUNZBufPonQf9ZWI%2FC862O1pECWZTy1GUu98n7kP7GRA91Vq%2FF1XPwTip9EcfjJN65xYn9YN6sGsQ1NRX00jpABbleldBsF9ay9FS%2F2WPm9H0x2r6%2FrDuVB8qIqMnXpfnQ5vdaPomPeRyNL0PV%2FIwXq%2FxOK%2B4ZYwWOI5y57rehwtsC8qF7jOUdVDuXNf70AVziYIvaCj4JKGzEXz9fn0OD%2Fo11k0FHyzKtk6v%2BPpwcpC%2BXGx8uXp0nwfazNBrNo60tiKuD2cLI%2FuadJPLkX196ModcahTmq1%2FMRu2daLuXPv1oU%2F3e1YFktD5qIIBnMrrT%2BhuLAvAbGFbw5PLgsF3oTMHg4YtautfOZsm5Q%2F9umhwa4U034MRwCYldySdqj29OBkZjalDYw6hXaJ6m4DSt9jagt2B4jnFpQIxz4x5bTja9pbLUZtDGDlgdC739P9ya2hrpN254BzA8LJZRKCbcufOxqEDKJtFBLopd7%2BIYAhdgEVkyGDWiLnz580PocsPED1%2Fk07a%2FgdNOonobCy6wK5bdLbl1qywxotFHFhWfdlvyxZdoAgcVBf7G5vuWJvOtaHZ3m9q1EmXoP5NHnAYyUuVPzavD2vSYS7HqAugF9CsBtdJuHNDjk9BCsTSiDNBwCP5dm7CcVkA%2BBpLXTfmxjZca6%2FytC24J8%2FY6to5e07HnAMYRwFEz9%2BIaxzpDc4t0uspQmnD2uDdONLrg7LsetS4bSMORmgq%2B%2FKNCXesCacI5jd%2BJd325Wb6BxHova%2FG5YwJd7C7XI4Jtx34XgzMGdz6cJ%2BBPQfjsEbv68Z8BmYd9MyYmI1uzN2H5mxL9TwG457RBbjzoBy3HgBgY7dr59z9a6AtB3AGSL8nw71kdDaGex8G02znnYa7BzZy87Jq8baWDXdb8fb4avh182pTIl6vIy070NqMNd94GJGLbCF31RvIHVvVjlt7KpeteMW8sfCaTSW7bnTUU3FVwNubShTvnDdRWa2MVc%2FFPTFjGJZd5FwUGjNeJ2fVc3FPzFn93nkj%2F7VyVj4a98SgYXz2AvW%2FlPUNNtRZZ2YADMErDWxn8M7ll74Lll86Qe2KWjcAoAfQGAAtGwC2FdQfyxv48NWaJzcAFE5CYwA0nEz6jRvB%2BRgA0GdoDACtjM%2FAAIAxemMAaOfcvQEgfZDGAGiTc5sGAD%2FMKGVVeZeh%2BeyeRljk%2BA8%3D)

- localstorage
  1. Bookmark : All likes, liked
  2. Twitch tokens : App Access token, OAuth token
  3. Environment variables : autoLogin, dark mode theme, ...

# Accessibility

## 1. PWA

## 1-1 Install

- asdf

## 1-2 Push Notification with Firebase Cloud Message

- asdf

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
