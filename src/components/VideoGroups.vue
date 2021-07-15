<template>
  <div class="video-groups">
    <h2>{{ $t('global.VideoGroups') }}</h2>

    <router-link :to="{ name: 'VideoGroupAdd' }">
      <md-button class="md-fab turkis md-fixed md-fab-top-right">
        <md-icon>add</md-icon>
        <md-tooltip md-direction="left">{{ $t('global.CreateVideoGroup') }}</md-tooltip>
      </md-button>
    </router-link>

    <div class="space4"></div>

    <loading-animation v-if="loading"></loading-animation>

    <md-table v-else v-model="videoGroups" md-card @md-selected="onSelectVideoGroup">

      <md-empty-state
        md-icon="video_library"
        :md-label="$t('global.CreateVideoGroup')"
        :md-description="$t('global.NoVideoGroupsCreatedYet')">
        <router-link :to="{name:'VideoGroupAdd'}">
          <md-button class="md-primary md-raised">{{ $t('global.CreateVideoGroup') }}</md-button>
        </router-link>
      </md-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
        <md-table-cell :md-label="$t('global.Name')">
          {{ item.name }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.NumberOfVideos')">
          {{ item.video_count }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.CanBeSeenWithMemberships')">
          <TableCellMultiLine :items="item.membership_types.map(mt => mt.name)"></TableCellMultiLine>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.CanBeSeenWithClassPasses')">
          <TableCellMultiLine :items="item.class_pass_types.map(cpt => cpt.name)"></TableCellMultiLine>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.CanBeSeenWithEvents')">
          <TableCellMultiLine :items="item.events.map(cpt => cpt.name)"></TableCellMultiLine>
        </md-table-cell>
        <md-table-cell :md-label="$t('global.Display')">
          {{ $t('global.SortBy') }} {{ sortVideosText(item) }}<br>
          {{ item.show_video_descriptions ? $t('global.ShowDescriptions') : $t('global.DontShowDescriptions') }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.CodeForWebsite')">
          <md-button @click.stop.prevent="getCodeForWebsite(item)">{{ $t('global.GetCode') }}</md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>

    <div class="space8"></div>

    <GetCodeForWebsiteDialog ref="GetCodeForWebsiteDialog"></GetCodeForWebsiteDialog>
  </div>

</template>

<script>


  import draggable from 'vuedraggable'
  import LoadingAnimation from "./LoadingAnimation.vue"
  import YogoApi from '@/gateways/YogoApi'
  import router from '@/router/'
  import {mapGetters} from 'vuex'
  import GetCodeForWebsiteDialog from './GetCodeForWebsiteDialog'
  import TableCellMultiLine from './TableCellMultiLine'

  export default {
    components: {
      TableCellMultiLine,
      LoadingAnimation,
      GetCodeForWebsiteDialog
    },
    data() {
      return {

        videoGroups: [],

        loading: true,
      }
    },
    computed: {
      ...mapGetters([
        'user',
        'stateReady',
        'client'
      ]),
    },
    created() {
      if (this.stateReady) this.fetchVideoGroups()
    },
    watch: {
      stateReady(newReadyState) {
        if (newReadyState) this.fetchVideoGroups()
      },
    },
    methods: {
      async fetchVideoGroups() {
        this.videoGroups = await YogoApi.get('/video-groups' +
          '?populate[]=membership_types' +
          '&populate[]=class_pass_types' +
          '&populate[]=events' +
          '&populate[]=video_count'
        )
        this.videoGroups = _.sortBy(this.videoGroups, 'name')
        this.loading = false
      },
      onSelectVideoGroup(videoGroup) {
        this.$router.push({name: 'VideoGroupEdit', params: {id: videoGroup.id}})
      },
      getCodeForWebsite(videoGroup) {
        let code
        switch (this.client.settings.website_cms) {
          case 'wordpress':
            code = `[yogo-video-group video-group=${videoGroup.id}]`
            break
          default:
            code = `<div class="yogo-video-group" data-video-group="${videoGroup.id}"></div>`
            break
        }
        this.$refs.GetCodeForWebsiteDialog.open(code)
      },
      sortVideosText(videoGroup) {
        switch (videoGroup.sort_videos_by) {
          case 'created':
            return this.$t('global.pointInTime') + ', ' + (videoGroup.sort_videos_direction === 'asc' ? this.$t('global.oldestFirst') : this.$t('global.newestFirst'))
          case 'name':
            return 'titel, ' + (videoGroup.sort_videos_direction === 'asc' ? 'A-Å' : 'Å-A')
        }
      }
    },
  }
</script>
