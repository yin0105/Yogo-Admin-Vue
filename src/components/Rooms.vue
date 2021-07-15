<template>
  <div class="customers">
    <h2>{{ $t('global.Rooms') }}</h2>

    <router-link :to="{ name: 'RoomAdd' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreateRoom') }}</md-tooltip>
      </md-button>
    </router-link>

    <div class="space4"></div>

    <loading-animation v-if="loading"></loading-animation>
    <md-table
      v-model="rooms"
      md-card v-else-if="rooms.length"
      md-sort="name"
      md-sort-order="asc"
      class="padding--svg"
      @md-selected="onSelectRoom"
    >
      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
        <md-table-cell :md-label="$t('global.Rooms')" md-sort-by="name">{{ item.name }}</md-table-cell>
        <md-table-cell :md-label="$t('global.Branch')" md-sort-by="branch" v-if="client.branches && client.branches.length > 1">{{
          item.branch ? item.branch.name : '--' }}
        </md-table-cell>
      </md-table-row>
    </md-table>

    <p v-else>

      <md-empty-state
        md-icon="room"
        md-label="Opret et lokale"
        md-description="Ingen lokaler oprettet endnu.">
        <router-link :to="{name:'RoomAdd'}">
          <md-button class="md-primary md-raised">{{ $t('global.CreateRoom') }}</md-button>
        </router-link>
      </md-empty-state>

    <div class="space8"></div>
  </div>

</template>

<script>

  import YogoApi from '@/gateways/YogoApi'
  import LoadingAnimation from "./LoadingAnimation.vue"
  import {mapGetters} from 'vuex'

  export default {
    components: {LoadingAnimation},
    name: 'rooms',
    data() {
      return {
        rooms: [],
        loading: true,
      }
    },
    computed: {
      ...mapGetters([
        'stateReady',
        'client',
      ]),
    },
    created() {
      if (this.stateReady) this.fetchRooms()
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) this.fetchRooms()
      },
    },
    methods: {
      async fetchRooms() {
        this.rooms = await YogoApi.get('/rooms?populate[]=branch')
        this.loading = false
      },
      onSelectRoom(room) {
        this.$router.push({name: 'RoomEdit', params: {id: room.id}})
      },
    },
  }
</script>

<style lang="stylus" scoped>

  td
    img
      width 40px
      height 40px

</style>
