<template>
<v-container fluid fill-height>
  <v-row>
    <v-col v-for="item in cliplist" :key="item.id">
      <v-card width="350px">
        <v-card-title class="d-flex align-center">
          {{item.title}}
          <v-spacer></v-spacer>
          <v-icon>mdi-playlist-play</v-icon>
          <span>{{item.cliplist.length}}</span>
          <v-icon class="pl-5">mdi-thumb-up</v-icon>
          <span>123</span>
        </v-card-title>
        <v-card-text :style="{background: item.color}">
          <div class="d-flex align-center">
            <span>{{item.authorName}}</span>
            <v-spacer></v-spacer>
            <span class="text-caption">{{item.createdAt}}</span>
          </div>
          <div>
            {{item.description}}
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-btn color="success" @click="show = !show">show</v-btn>
    <div style="width: 200px;">
      <span>AIndex : {{this.Aindex}}</span>
      <v-spacer></v-spacer>
      <span>BIndex : {{this.Bindex}}</span>
      <v-spacer></v-spacer>
      <span>{{this.show === false ? 'A' : 'B'}}</span>
    </div>
  </v-row>
  <v-row>
    <v-col>
      <v-card width="500">
        <video class="pa-0 ma-0" width="100%" :autoplay="!show"
        @ended="authPlayA()" v-show="!show" controls :src="`${embdClips[Aindex] === undefined ? embdClips[0].thumbnail_url.split('-preview')[0] : embdClips[Aindex].thumbnail_url.split('-preview')[0]}.mp4`"></video>
        <video class="pa-0 ma-0" v-show="show" width="100%" :autoplay="show"
        @ended="authPlayB()" controls :src="`${embdClips[Bindex] === undefined ? embdClips[1].thumbnail_url.split('-preview')[0] : embdClips[Bindex].thumbnail_url.split('-preview')[0]}.mp4`"></video>
        <div id="vid-controller" class="red pa-0 ma-0">
          <v-icon color="white">mdi-rewind-5</v-icon>
          <v-icon v-if="!this.playing" color="white" @click="playVid">mdi-play</v-icon>
          <v-icon v-else-if="this.playing" color="white" @click="pauseVid">mdi-pause</v-icon>
          <v-icon color="white">mdi-fast-forward</v-icon>
        </div>
      </v-card>
    </v-col>
  </v-row>
</v-container>
</template>
<script>
export default {
  data() {
    return {
      show: false,
      playing: false,
      Aindex:0,
      Bindex:1,
      embdClips:[{"id":"FineEncouragingGoblinPhilosoraptor-ysVq-kbysJ6VRAcQ","url":"https://clips.twitch.tv/FineEncouragingGoblinPhilosoraptor-ysVq-kbysJ6VRAcQ","embed_url":"https://clips.twitch.tv/embed?clip=FineEncouragingGoblinPhilosoraptor-ysVq-kbysJ6VRAcQ","broadcaster_id":"49045679","broadcaster_name":"우왁굳","creator_id":"206440154","creator_name":"하쿠킹","video_id":"1468280289","game_id":"509658","language":"ko","title":"숨길 수 없는 하쿠 웃음","view_count":1393,"created_at":"2022-04-27T16:15:53Z","thumbnail_url":"https://clips-media-assets2.twitch.tv/AT-cm%7C2Bnec8rFavpG8rCelUQHEA-preview-480x272.jpg","duration":19.1,"videoOffsetSeconds":8584},
      {"id":"DelightfulAnimatedAniseTBCheesePull-kmk2vbWyKB2GQAA-","url":"https://clips.twitch.tv/DelightfulAnimatedAniseTBCheesePull-kmk2vbWyKB2GQAA-","embed_url":"https://clips.twitch.tv/embed?clip=DelightfulAnimatedAniseTBCheesePull-kmk2vbWyKB2GQAA-","broadcaster_id":"49045679","broadcaster_name":"우왁굳","creator_id":"525838829","creator_name":"천조","video_id":"1468280289","game_id":"499003","language":"ko","title":"반갈죽","view_count":769,"created_at":"2022-04-27T13:56:46Z","thumbnail_url":"https://clips-media-assets2.twitch.tv/AT-cm%7CMI47ppJpNr21sigdhkAAPg-preview-480x272.jpg","duration":37.4,"videoOffsetSeconds":8504},
      {"id":"CarefulOpenDolphinFrankerZ-Qo47ULsi_5RXRZmJ","url":"https://clips.twitch.tv/CarefulOpenDolphinFrankerZ-Qo47ULsi_5RXRZmJ","embed_url":"https://clips.twitch.tv/embed?clip=CarefulOpenDolphinFrankerZ-Qo47ULsi_5RXRZmJ","broadcaster_id":"203667951","broadcaster_name":"주르르","creator_id":"407011214","creator_name":"팡퐁__","video_id":"1468253054","game_id":"509658","language":"ko","title":"🎀 : 아! 주지라뇨! 이상한 별명 붙이지 마세요~","view_count":689,"created_at":"2022-04-27T11:09:43Z","thumbnail_url":"https://clips-media-assets2.twitch.tv/AT-cm%7C9x2lXUKOO1C7Iv-UV0WZiQ-preview-480x272.jpg","duration":16.7,"videoOffsetSeconds":2781},{'broadcaster_id':"169700336",'broadcaster_name':"릴파_",'created_at':"2022-01-15T13:18:34Z",'creator_id':"405666405",'creator_name':"후니111",'duration':50.5,'embed_url':"https://clips.twitch.tv/embed?clip=ComfortableTolerantHerringOSfrog-mpYbwVlYRhCwmk6U",'game_id':"509658",'id':"ComfortableTolerantHerringOSfrog-mpYbwVlYRhCwmk6U",'language':"ko",'thumbnail_url':"https://clips-media-assets2.twitch.tv/AT-cm%7CCERxZZqWG8FZWEYQsJpOlA-preview-480x272.jpg",'title':"염라",'url':"https://clips.twitch.tv/ComfortableTolerantHerringOSfrog-mpYbwVlYRhCwmk6U",'video_id':"",'view_count':759}],



      cliplist:[
        {
          id: '5dDoaCOoTUrhCy5MnK9s',
          authorId: "twitch:116727016",
          authorName: "혹한의빙룡",
          cliplist: [],
          color :"#5E35B1FF",
          createdAt : this.$moment().add(1,'day').format('ll'),
          description :"13개는 체워야지",
          isPublic: false,
          title: "ㅋㅋㅋ13개는 해야지",
        }
      ],
    }
  },
  methods: {
    authPlayA(){
      this.Aindex += 2;
      if( this.Aindex >= this.embdClips.length ){
        this.Aindex = 0;
      }
      this.show = !this.show;
      if( this.Aindex + this. Bindex === 1) {return this.show = false}
    },
    authPlayB(){
      this.Bindex += 2;
      if( this.Bindex >= this.embdClips.length ){
        this.Bindex = 1;
      }
      this.show = !this.show;
      if( this.Aindex + this. Bindex === 1) {return this.show = false}
    },
    playVid(){
      const vid = document.querySelector('video');
      vid.play();
      this.playing = true;
    },
    pauseVid(){
      const vid = document.querySelector('video');
      vid.pause();
      this.playing = false;
    },
  },
  created() {
  },
}

</script>
<style lang="scss" scoped>
#vid-controller{
  position: absolute;
  bottom: 0%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
