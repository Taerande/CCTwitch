<template>
<v-container>
  <v-row class="pb-5">
    <v-col>Trending Page</v-col>
  </v-row>
  <v-row>
    <v-btn color="success" @click="loadData">Load Data</v-btn>
    <AddNewCliplistDialog></AddNewCliplistDialog>
  </v-row>
  <v-row class="pt-15">
    <v-col cols="3" class="pa-3" v-for="item in items" :key="item.id">
      <v-card :style="{background:item.color}">
        <v-card-title primary-title class="d-flex">
          <div>
            {{item.title}}
          </div>
          <div>
            <span>
              {{item.displayName}}
            </span>
            <span class="text-caption error--text">
              {{setDate(item.createdAt)}}
            </span>
          </div>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="clip in item.clip" :key="clip.id">
              <v-card light>
                <v-card-title primary-title>
                  {{clip.title}}
                </v-card-title>
                <v-card-text>
                  <span>
                    {{clip.desc}}
                  </span>
                  <span class="error--text">
                    {{clip.offset}}
                  </span>
                </v-card-text>
              </v-card>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</v-container>
</template>

<script>
import axios from 'axios';
import AddNewCliplistDialog from '../components/dialog/AddNewCliplistDialogFirebase';
export default {
  components:{
    AddNewCliplistDialog,
  },
  data() {
    return {
      tempUserInfo: null,
      items:[
        {
          id:'',
          title:'',
          color:'',
          clip:[
            {
              id:'',
              desc:'',
            }
          ],
        }
      ],
    };
  },
  methods: {
    setDate(el){
      return this.$moment(el).format('ll');
    },
    async loadData(){
      const sn = await this.$firestore.collection('cliplist').get();
      this.items = await sn.docs.map( v => {
        const item = v.data()
        const userInfo = axios.get('https://api.twitch.tv/helix/users',{
          headers: this.$store.state.headerConfig,
          params:{
            id: item.authorId.split('twitch:')[1],
          }
        })
        return {
          id: v.id,
          title: item.title,
          description: item.description,
          createdAt: item.createdAt,
          userInfo: userInfo,
          color: item.color
        }
      })
    }
  },
}
</script>
<style lang="scss">

</style>
