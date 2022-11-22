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

- User Crated :

- Daily Hotclips : 매일 07:00에 전날 저장된 Stream Data에서 Top 50 Catergory를 추출하여 Category id로 Clip Data를 수집하고 조회수가 높은 100개의 클립을 저장한다.

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

- 로그인 요청 -> Twitch 서버에 로그인 정보 요청 -> login page로 리다이렉션 ->

  > case 1. 기존유저) Clound functions sigin -> 유저 프로필 업데이트 -> Firebase Auth를 통해 로그인
  >
  > case 2. 신규유저) Clound functions sigin -> Firebase Auth 유저 등록 -> Firebase Auth를 통해 로그인

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

## DB & Data sets

|        DB        |   Data1   |          Data2          |         Data3         |
| :--------------: | :-------: | :---------------------: | :-------------------: |
|    Firestore     | Cliplist  |        Timeline         |        Hotclip        |
| Realtime Databse | User Data | Notification Data (fcm) |  Twitch Stream Data   |
|   LocalStorage   | Bookmark  |      Twitch tokens      | Environment variables |

## ERD

- [Firestore Diagram](https://viewer.diagrams.net/index.html?tags=%7B%7D&highlight=0000ff&edit=_blank&layers=1&nav=1#R7Z1tb9s2EMc%2FjV%2Bu0LPkl42TrcWaIUs6rHs1MBZjs5VEQ6KTuJ9%2BlPVgSack9krlguKKojVpihL5O5rU%2F07izF2kj7%2FlbLO%2BlDFPZo4VP87c85nj2K491%2F%2BVObsqJ7KcKmOVi7gudMi4Ed95nWnVuVsR86JXUEmZKLHpZy5llvGl6uWxPJcP%2FWJ3MumfdcNWHGTcLFkCc%2F8WsVrXrXDCQ%2F4HLlbr5sx2UDc4ZU3huiXFmsXyoZPlXszcRS6lqj6ljwuelJ3X9Et13K9PfNteWM4zdcwB0dePX%2B%2F59dUyZPbv2z93Kljbv9QXe8%2BSbd3gRSI2iShUfdFq1%2FRE8SDShGU6dXYnM3VTf2Pp9HItkvgT28lteSWFYstvTepsLXPxXZdnif7K1hn661zVoF2rV%2BKmPLKuM%2BeFLnPVNM8eZF2yx17BT6xQzdXIJGGbQtzur688MGX5SmRnUimZ1oVYIlaZ%2FrzUdfG8aVN1Vban03XH8Fzxxyd73G456gHAZcpVvtNF6gMaI6lN360reDjYkWfVxrHu2JDn15mstt1VW3N7smtt6yxb6Ra2Zwus3tls1wKni0bO5g5OxhLdHxlT%2FExus7jompT%2B0GnmIWtvaCcYXTO2O1ZXln%2B%2Ft7dcZCtge5qB2ptOLr%2FxhUykJnaeycoYRZIMsooNW%2BpqPvG7spHeIee6bneZJTXbu2Q%2FItcijnlW2pJUTLHb1rA3UmRq3zH%2Bmf6rr3thvfNnvr6mhU7bh7T%2BWxbP1UJm%2BjKZ2JsI11b5wEvL7NmXc6x9PT1modHt%2BjxfsrIh966R9YCfTNcGdNlW6UH%2BkRgbYhygM3YA46WeNxb6J0NVkMu%2BIcL%2Fm%2FAcm7A7QrjCQ0PYBGDbQSfsjo5hoef8PWO9emY7QvwDiH10xB5ArG%2BmlrnYKCEzGsqGOEfonH24oC6utreJWNJsbIBwq0agEY7gdJyIEhstuAwh9rARu8Eo4r9oQjbGOERnHALGiq2IrynpA51vBPkKVfYpLbWMEEZXtzy41FLrbXqbMZH8u80TIm2INLrG5cH5eLuJmeLx%2B3rJVSaI8Q8wRle5PDgfL3NOjM0x9tB1rmZh32EMgPJ4xRuHpm6tULtrnrBSJLk4fAP6bK3SxqnJs%2Fh96W3WyYvrlGW7We3oBLl56VbjcU2UPwr1palDf%2F6nzNcIq9T5Y6fY%2Ba5JZLpbvnQTnaPK5OGwfao5rmp12dQnAddZhdzmS%2F7cOqfWDnULV%2Fw54%2FDccevoWIM9Zg1tZr7ncN%2B%2F5Gcco1dyfyPcOEU9e%2BCDDQZVVE2tj3I63vNBRf6gImdYUdUVoCJTPlMPetVKT30BTHkKN70TzH5iN73v99HazSq%2BY6SOP2akdjDVb9a4f408qMdPS94T0Nvxexzj6aalEfcLLT2MMvbRGUP%2FC90sTkE6wibtQ9KfRcoTkcEhTIF0p87Qg0A6vwkxevGeYv4M758hks4fcfzRGuHoX5Vq1L7dUDofSlAUSmcYMrrO6I9oUBRLZxIxuszoQ7cQBdOZJIwfTefDJykoms4sY%2FRwumaqoHC6aUGjx9MFUGyleDqTiPED6gIov1EkjkHA6OF0AVRk7kX8maJxTFJGD6gLKBzntbQQdNQUjzM5ZHTFK4BiiP7VXpBjzCxndNErgIrIB6nKO2YAltwlEPpJ7pL50S8ecJ7B%2FTO4SwIo0pC75PhflWrQvl13SbMaJXfJdJDRZ44QajPkLjGKGN1dEjoA8W0uWbzUncHJaWKKM77TJKRXEEzNGN1pEtI7CF4FNLrTJKSXEEyLGN9pEtIj6pNDRnechPSM%2BqSA0X0mIdTeyDNmXAtBpwy1LvKMTYIaXfdqln7kGZsOMrruFUHdizxj5jmji18R1EQWMk152ZVDsvSsL6T%2BwrO%2BQ99YCH1jo0%2BOOfOpnvWdQ7VTl3csmqCPHdPREy8ZeCuP%2BkZQAmv9UsTZGGf0x33tkRfbx6LYJGz3B0vp5soUaPSnfSModdKz%2B2YZt%2B%2FWQIM8p3jDySF72JAjCHmTS82Jk0ZiEnSIDXoOb59zvkl2FDdibp1toUOGC23yTxmG7KJDhosvehW6WcYBOmPog7wuf60BVlLAIPLTFDC%2FCcJCVMCgQ5IUsJMGdDVe3q4CNofOSFLAzHPGV8AsCLqrgBFrY6zRRbD2Fb2kgk0GGV8Fsy1440wymGHK6DKY3ezKTTrYtKTRdTDbgvEFJIQZXm6jC2G2RUrY5JTRlTDbIils8jtnfMjQRQWQmt2%2FRHP%2FLC9Htytptx55Z1nerLf9iO2Gs%2Bc3INmnrngudM%2BU8tZJu5JARK%2B2h8hAMbPbu9yTNxFxIlDTO%2F1P%2B%2Bd19xSxLSi84ZuWPZtoV5sXN6upV8F4lhaGA0uzGmfHyZZmDeIc56ZMSydzKVW3eM4260sZ87LEfw%3D%3D)

- [Realtime Database](https://app.diagrams.net/?title=%EC%A0%9C%EB%AA%A9%20%EC%97%86%EB%8A%94%20%EB%8B%A4%EC%9D%B4%EC%96%B4%EA%B7%B8%EB%9E%A8.drawio#R7Z1bc6M2FMc%2FjWfah2a42vCYOJveNt3MZju9vHgULNuaBeQBeW3301cyYGOOiHEswGk1k9k1AgTop8v%2FnCPBwB5Hmx8TtFw80ikOB5Yx3Qzs%2B4FlWcbQ4v%2BJlG2WYhqen6XMEzLN0w4Jz%2BQfXByYp67IFKdHBzJKQ0aWx4kBjWMcsKM0lCR0fXzYjIbHV12iOQYJzwEKYeofZMoWWarnGof0nzCZL4orm0a%2BJ0LFwXlCukBTuj5Kwhv2QGOW3%2BITTiIU45jxPY8o%2BYqTgfthwZh40tuB9cD%2FZuLomzml8xCjJUlvAhrx5CDlhzzMUERCUc6ljO7yjPjl7A8De5xQyrJf0WaMQwGrwJDd00PN3n05JCLfBicY8SeyWP29vtv8vfjl9yfj6Sm0fjCtvD58Q%2BEqL%2BG8dNi2KHJeUEvxk5fOwL6b0tXLbo%2FJNxK6iqdYXMHgW%2BsFYfh5iQKxe80rIE9bsCjMD86vhBOGN7UPYe6LhtdhTCPMki0%2FpDihoJlXXyffXB%2BqgmkXdWFRrgf2KE9FOd35PvNDofEfebmdUYawBH9PM8LHpbgmUchrAS8IUWue8z2i3IIFCacf0ZauxN2mDAVfi627BU3IP%2Fx4VJQi352wvF1aw6MjnsWZeZ4JTvkxT0XJmpWkR7Q5OvAjSllxNzQM0TIlB8oRSuYkvqOM8dqdHYRCMo%2F574DnxR82f6bsrkxHDWzXcY9gm0MX0h5KYNu8XNph7QDWZPrd06%2Ff7zoETjsh8RyQZ1nD4XvpVzymIeXldR%2FTrCqQMKwkpbwB8Ww%2B4pl4HOeQ8jl%2FQpFEecnOwl33tSDTKY53jZEhhl721WpJSd6XuXf8jxfU2LhxBy6%2FpzHfNg%2Fb%2FE8cnrAxjfltIrIDhHmdWGNRL47oWk3p1rcWiDxHXIA7SbitxmxaNkA8C6JJguck5TV9wnk%2FaN6qeLt983YB7ZeEommAdrDZVgx8t5rzpZy9vjl7gHOQYMTwdIL4pW%2Bn%2FKfm%2B3a%2Bptk3YB8A5mZKkJAlIzTWbVgFY6dvxoUNWoZM0mWItpMYRbqnVkJ51DtlE1DGESKhxqtCYBu944X2cki5eanxqsBr944X2k%2FLhHJMeEKi%2BWSV6HasxlDuHTT0hXwjeD0J6Eo8160oGg347YD9vgEPAd%2FMr8mvN0SR8O1m%2F%2FKU3ygjMxKgnda2jLHwRpJY4gQ9swKUnMelcrecig9V7BcE%2BB2Et7ljMuJ1QeyEnspGxE54JotCrzdvXZkX2mmL1Qiwembcvo142j1vCf9HJm5hLfQGxYROh1kgkJSciSnAoeME55L3jUqcwGkYJ9h7LdSjh%2B4I7UW%2BYKzMmtL1hg0siWcCfyOB9kko4dt7mMCCPgntcVJFt%2FfggAVdEgAons5xMRbzpyVs%2BxmHO8H74bAHlFlJLOF4eivmv%2FDND5859S%2F0EcXbQXUOBc872f5Z3vhLbNyYtl0k3G%2FKu%2B%2B35a0nnBBeKGKo3SVmzyFu%2FvXBlT8rXSUBfq2UsuO4rJjjV%2B0aQ067jNeQjcZFYrIr2G%2FHdyyDnl%2Fjie5szb0cqEwbcH33OIvsSfOzDlUHZGQalZycak5ZWYCcdpVw%2F%2BQX1EvoS%2Fkk7Ks1YsGC%2F59pfD3XpAUNafevIS3ZZBMtGRu7V%2Bwrl4yvTz0g8YxmsH95%2FvSbRn0B6t7Vow31Rbp6EdHpF5xkk0nF3Fi01ZgvwNy7jLThcN2yjIwyBbkbpkFqM13pnlKVG8L%2BLK7Nf5fO4luHk8RGcY5C0VlEC0%2BrTlerTjWq04YDU9WZfLfdq0%2BtPS%2F3XDvOzTHyocR3ve%2B3yrXXa0t82jD6o8Vn86HKrumN6sWnFG97QxUMGIkpkAentJ4QeSFiiejsGDEMQUi78XsZad2Jn9uJ24ZR6cRHnqQT92QSZNTachUYlqj24sZ3WVM3ZjSJEPteN%2FpXG71%2Fdr8uI95ao3dgnOITf04kctG%2BBAWEZd16p4RHsEl%2FIZFowM84ITjVnJVwljgTuuXsw5b8hS55wo9Z3FFDvhyybNVKx5ShZzCjnEs1zVkJZ8nKlY7HZehTyXvtlOx6bS3ALxXgvu1XBLgrEeDyGJ7TmgCHbpSdnf2k7eymbds525XSrdffga4URliItbNMEeHew3cOnMc75yKsWHOoKaug3Hv0zoH%2BMrGeBSf7FS0iB72o5SLK%2Fa8Td6H9DIh2Ndcvu7CSOGkRtDsZJ60D1FWc1PWrwa6RX1FfTSOlI5iV7dz4%2FnFuLUdL3XqPm9b0l2r6oVd1qnuSyGjH8%2FJcaLNrTX%2FeKOHWYL8WTe%2FCmTyMl2s4SUtuGa0FLqPcu6534QTbjHKm%2BzRlFZR71%2FUudMG8A8F3Use5jZVhjW%2B0K8E3HFbHcH9YYd1U8MGsTKN7xTeEg0Phy8Xal6tG9zmgznhOs36ktRlxQzhaaNl33lAxvPIlGUPoyh1zqHOabH%2FWC7ZVou5d%2Bw2hT%2Fe%2FoAqKsen6VcEIDuXVN3Q3lgVgtDANr3NZMHqXOvNkRRmNGla93OHSo2fRc6uiwa5k0nwNhg%2BrVLEat6v6VDsYaY2pQmN60C6RfU1A6ltsbcLuSPKe4lyB6HfGnClBsgZ0vWrTg5EDRpfFmv6f7zVthbR7F5wjGF7WkwhUU%2B7d2ehZgLKeRKCacv%2BTCDzoAswiQxqzQsy9v2%2Fegy4%2FQPQdmnSFk%2BCkSVcHqLM19WbVojMNu2KFNZ4sYsG8qtN%2BW7bofEngoDzZX9t0l9p0tgnN9mFTo65wCapf5AG7kTRX%2BRP9%2BbDzxgz%2FykMIPvQC6tngKgn3bsjxIUiCuDDidBDwQr69m3BcFgC%2B2lJXjbmxDdfapzxNA67J07a6cs6O1TNnH8ZRANF3aMQVr3c5acTVAerKiHMkoTSv0nk3jvS6IC%2BzGjVu24iDEZrSunxtwl1qwkmC%2BY0%2FSbf%2FuJn6TgR678txOW3CnTNiXPm3HPYdX21gTuNWh%2FsK7DkYh9V6XzXmKzDroGdGx2xUY%2B4%2FNGcasvcxaPeMKsC9B%2BW49QAAa7tdOef%2BPwNtWIAzQPqfNtxrCHU2RRsG00zrjYa7AxZy87wq8baWDXdT8vX4cvh192lTIj6vU1h2oLZpa76m2tdPsoXcZV8gt0xZPW7trVym5BPz2sJ781CSt6xzLHop8PaGEsk353VUVilj2XtxO2YMw7KrlItCbcar5Cx7L27HnOXfndfyXyln6atxOwYN47PvQP83WCdnNLQU%2BjYAPPBJA9MavXH6pWuD6ZeWX7mj1g0A6AHUBkDLBoBp%2BNXX8vou%2FLRm5waAxEmoDYC3DyY1S3%2BvxwCAPkNtAChlfAUGAIzRawNAOef%2BDYDCB6kNgDY5t2kA8M2EUlaWdwlaLh7pFIsj%2FgU%3D)

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

## 4. Google Analytics & Adsense

1.
