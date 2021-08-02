<template>
  <div>

    <h2>{{ $t('global.Video') }}</h2>

    <LoadingDotsOverlay v-if="loading"/>

    <div>
      <div v-if="vimeoStatus.status === 'connected'">

        <div class="flex align__items--center flex-wrap">
          {{ $t('global.ConnectedAs') }} {{ vimeoStatus.user.name }}
          <md-button class="md-raised"
                     @click="connectToVimeo">
            {{ $t('global.ConnectAsOtherUser') }}
          </md-button>
        </div>
        <p><a href="#" @click.prevent="openRestrictToYogoExplanation">{{ $t('global.WhatDoesLimitedMeanDesc') }}</a></p>

        <yogo-table
            :cols="videoTableCols"
            :rows="videos"
            :pageSize="100"
            selectable="single"
            @selected="onSelectVideo">

          <template v-slot:default="slotProps">
            <YogoTd>
              <img class="thumbnail" :src="getVideoThumbnailSrc(slotProps.item)">
            </YogoTd>
            <YogoTd>{{ slotProps.item.video_provider_data.name }}</YogoTd>
            <YogoTd>{{ slotProps.item.video_provider_data.stats.plays }}</YogoTd>
            <YogoTd>{{ iso8601ToHumanDateTime(slotProps.item.video_provider_data.created_time) }}</YogoTd>

            <YogoTd v-if="client.extended_video_enabled">{{
                slotProps.item.video_main_categories.map(c => c.name)
                    .join(', ')
              }}
            </YogoTd>
            <YogoTd v-if="client.extended_video_enabled">{{
                slotProps.item.teachers.map(t => `${t.first_name} ${t.last_name}`.trim())
                    .join(', ')
              }}
            </YogoTd>
            <YogoTd v-if="client.extended_video_enabled">{{
                slotProps.item.video_filter_values.map(v => v.name)
                    .join(', ')
              }}
            </YogoTd>
            <YogoTd v-if="client.extended_video_enabled">{{
                slotProps.item.video_tags.map(t => t.name)
                    .join(', ')
              }}
            </YogoTd>


            <YogoTd>{{
                slotProps.item.video_groups.map(vg =>
                    vg.name)
                    .join(', ') || '--'
              }}
            </YogoTd>
            <YogoTd>
              <span v-if="slotProps.item.is_restricted_to_yogo">
                <md-icon class="lock">lock</md-icon><md-icon class="lock">done</md-icon>
              </span>
              <md-button class="md-raised green" v-else @click.stop="restrictVideoToYogo(slotProps.item)">
                <md-icon class="warning">warning</md-icon>
                {{ $t('global.LimitToYOGO') }}
              </md-button>
            </YogoTd>
          </template>
        </yogo-table>

      </div>
      <div v-else-if="!loading">
        <md-button class="md-raised md-primary" @click="showEditDomainDlg = true">
          {{ $t('global.ConnectToVimeo') }}
        </md-button>
        <p>
          {{ $t('global.IfYouDontHaveVimeoThen') }} <a href="https://vimeo.com/upgrade"
                                                       target="_blank">{{ $t('global.createAnAccountHere') }}</a>
          {{ $t('global.SmallestVimeoDesc') }}
        </p>
      </div>
    </div>

    <md-dialog :md-active.sync="showEditVideoDialog" v-if="editingVideo" class="edit-video-dialog md-min-width-40">
      <md-dialog-title>
        <h1>{{ $t('global.EditVideo') }}</h1>
      </md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{ $t('global.Title') }}</label>
          <md-input v-model="editingVideo.name"></md-input>
        </md-field>
        <img class="thumbnail" :src="getVideoThumbnailSrc(editingVideo, 500)">
        <div class="space4"></div>

        <md-field>
          <label>{{ $t('global.Description') }}</label>
          <md-textarea v-model="editingVideo.description"></md-textarea>
        </md-field>

        <div v-if="client.extended_video_enabled">

          <md-field>
            <label>{{ $t('global.MainCategory') }}</label>
            <md-select multiple v-model="editingVideo.video_main_categories">
              <md-option v-for="videoMainCategory in videoMainCategories" :value="videoMainCategory.id">
                {{ videoMainCategory.name }}
              </md-option>
            </md-select>
          </md-field>

          <md-field>
            <label>{{ $t('global.Teacher') }}</label>
            <md-select multiple v-model="editingVideo.teachers">
              <md-option
                  v-for="teacher in teachers"
                  :key="'teacher_' + teacher.id"
                  :value="teacher.id"
              >
                {{ `${teacher.first_name} ${teacher.last_name}`.trim() }}
              </md-option>
            </md-select>
          </md-field>


          <h5>
            {{ $t('global.VideoFilters') }}
          </h5>
          <Treeselect
              v-model="editingVideo.video_filter_values"
              :multiple="true"
              :options="videoFilterTreeOptions"
              :clearable="false"
              :disable-branch-nodes="true"
          />

          <h5 style="margin-bottom: 0;">
            {{ $t('global.Tags') }}
          </h5>
          <md-chips v-model="editingVideo.video_tags" :md-placeholder="$t('global.AddTags')">
            <template slot="md-chip" slot-scope="{ chip }">
              {{ chip }}
            </template>

            <div class="md-helper-text">{{ $t('global.PressEnterToAddTag') }}</div>
          </md-chips>

          <md-field>
            <label>{{ $t('global.RelatedVideos') }}</label>
            <md-select v-model="editingVideo.related_videos" multiple>
              <md-option
                  v-for="video in videosForRelatedVideosDropdown"
                  :value="video.id"
              >
                {{ video.name }}
              </md-option>
            </md-select>
          </md-field>

        </div>

        <div class="space2"></div>

        <md-field>
          <label>{{ $t('global.VideoGroups') }}</label>
          <md-select v-model="editingVideo.video_groups" multiple>
            <md-option v-for="videoGroup in videoGroups"
                       :value="videoGroup.id"
                       :key="'videoGroup_' + videoGroup.id">
              {{ videoGroup.name }}
            </md-option>
          </md-select>
        </md-field>
        <span v-if="!this.editingVideo.is_restricted_to_yogo">{{ $t('global.NoteWhenYouSave') }} <a
            href="#"
            @click.prevent="openRestrictToYogoExplanation">{{ $t('global.limitedToYOGO') }}</a></span>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-raised" @click="showEditVideoDialog = false">{{ $t('global.Dismiss') }}</md-button>
        <md-button class="md-primary md-raised" @click="saveVideo">{{ $t('global.Save') }}</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showEditDomainDlg">
      <md-dialog-title v-bind:style="{fontWeight: 'bold'}">{{ $t('global.EditVimeoWebsiteDomainTitle') }}</md-dialog-title>
      <md-dialog-content v-bind:style="{paddingBottom: '10px !important'}">
        <div v-bind:style="{ width: '380px', padding: '0px 10px 0px 10px' }">
          {{ $t('global.EditVimeoWebsiteDomainText1') }} {{ $t('global.EditVimeoWebsiteDomainText1') }}
          <div v-bind:style="{marginTop: '20px'}">
            {{ $t('global.EditVimeoWebsiteDomainText3') }}
          </div>
          <div v-bind:style="{marginTop: '20px', marginBottom: '10px'}">
            {{ $t('global.EditVimeoWebsiteDomainText4') }}
          </div>
          <md-input v-model="domainName" class="md-layout-item md-large-size-100 mt-10"></md-input>
        </div>
      </md-dialog-content>
      

      <md-dialog-actions>
        <md-button class="md-primary" @click="showEditDomainDlg = false">Cancel</md-button>
        <md-button class="md-primary" @click="showEditDomainDlg = false">OK</md-button>
      </md-dialog-actions>
    </md-dialog>

    <RestrictToYogoExplanationDialog ref="RestrictToYogoExplanationDialog"></RestrictToYogoExplanationDialog>

  </div>

</template>

<script>

import LoadingAnimation from './LoadingAnimation';
import LoadingDotsOverlay from './LoadingDotsOverlay';

import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';

import envConfig from '../../env_config';
import qs from 'qs';
import RestrictToYogoExplanationDialog from './RestrictToYogoExplanationDialog';

import VideoUtil from '../mixins/VideoUtil';
import dateTimeFunctions from '../mixins/dateTimeFunctions';

import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import YogoTable from '@/components/ui/YogoTable';
import YogoTd from '@/components/ui/YogoTd';

const VIMEO_AUTHORIZE_URL = 'https://api.vimeo.com/oauth/authorize';

export default {
  name: 'Video',
  components: {
    YogoTable,
    YogoTd,
    LoadingAnimation,
    RestrictToYogoExplanationDialog,
    LoadingDotsOverlay,
    Treeselect,
  },
  mixins: [VideoUtil, dateTimeFunctions],
  data() {
    return {
      loading: true,
      videoExtended: true,

      vimeoStatus: {},

      showWebsiteCodeDialog: false,
      websiteCodeDialogTextarea: '',

      videos: [],

      showEditVideoDialog: false,
      editingVideo: null,
      videoGroups: [],
      teachers: [],
      videoFilters: [],
      videoMainCategories: [],

      // showWebsiteDomainDiag: true, 
      showEditDomainDlg: false,
      domainName: '',
    };
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
    videoPopulateFields() {
      const fields = [
        'video_groups',
        'is_restricted_to_yogo',
      ];
      if (this.client.extended_video_enabled) {
        fields.push(...[
          'video_filter_values',
          'video_main_categories',
          'video_tags',
          'teachers',
          'related_videos',
        ]);
      }
      return fields;
    },
    videoTableCols() {
      const cols = [
        {
          label: 'Thumbnail',
        },
        {
          label: this.$t('global.Title'),
        },
        {
          label: this.$t('global.Plays'),
        },
        {
          label: this.$t('global.Uploaded'),
        },
        {
          label: this.$t('global.BelongsToVideoGroups'),
        },
        {
          label: this.$t('global.LimitedToYOGO'),
        },
      ];

      if (this.client && this.client.extended_video_enabled) {
        cols.splice(4, 0,
            {
              label: this.$t('global.MainCategory'),
            },
            {
              label: this.$t('global.Teacher'),
            },
            {
              label: this.$t('global.Filters'),
            },
            {
              label: this.$t('global.Tags'),
            },
        );
      }
      return cols;
    },
    videoFilterTreeOptions() {
      return _.map(
          this.videoFilters,
          videoFilter => ({
            id: 'videoFilter_' + videoFilter.id,
            label: videoFilter.name,
            children: _.map(
                videoFilter.filter_values,
                filterValue => ({
                  id: filterValue.id,
                  label: filterValue.name,
                }),
            ),
          }),
      );
    },
    videosForRelatedVideosDropdown() {
      return _.chain(this.videos)
          .map(
              video => ({
                id: video.id,
                name: video.video_provider_data.name,
              }),
          )
          .sortBy('name')
          .value();
    },
  },
  async created() {
    this.getVideos();
    this.getVideoGroups();
    if (this.client.extended_video_enabled) {
      this.getTeachers();
      this.getVideoFilters();
      this.getVideoMainCategories();
    }
  },
  watch: {},
  methods: {

    async getVideos() {

      this.vimeoStatus = await YogoApi.get('/integrations/vimeo/status');

      if (this.vimeoStatus.status === 'connected') {
        const videoQuery = {
          populate: this.videoPopulateFields,
        };
        const videoQueryString = qs.stringify(videoQuery);
        this.videos = await YogoApi.get('/videos?' + videoQueryString);
        this.videos = _.reverse(_.sortBy(this.videos, video => video.video_provider_data.created_time));
      }

      this.loading = false;
    },
    async getVideoGroups() {
      this.videoGroups = await YogoApi.get('/video-groups');
      this.videoGroups = _.sortBy(this.videoGroups, 'name');
    },
    async getTeachers() {
      this.teachers = await YogoApi.get('/users?teacher=1');
      this.teachers = _.sortBy(this.teachers, ['first_name','last_name']);
    },
    async getVideoFilters() {
      this.videoFilters = await YogoApi.get('/video-filters?populate[]=filter_values');
    },
    async getVideoMainCategories() {
      this.videoMainCategories = await YogoApi.get('/video-main-categories');
    },
    async connectToVimeo() {
      console.log("connect to vimeo");
      // const redirectUri = (envConfig.externalCallbackUrl || envConfig.apiRoot) + '/integrations/vimeo/auth/callback';

      // const queryString = qs.stringify({
      //   response_type: 'code',
      //   client_id: this.vimeoStatus.vimeoClientId,
      //   redirect_uri: redirectUri,
      //   state: this.vimeoStatus.oauthCsrfState + '_' + document.location.href,
      //   scope: 'public private create edit',
      // });

      // document.location = VIMEO_AUTHORIZE_URL + '?' + queryString;
    },


    onSelectVideo(video) {
      // When the updated video is spliced into the table, selection changes to undefined
      if (!video) return;
      this.editingVideo = _.cloneDeep(video);
      this.editingVideo.video_groups = _.map(this.editingVideo.video_groups, 'id');
      this.editingVideo.name = this.editingVideo.video_provider_data.name || '';
      this.editingVideo.description = this.editingVideo.video_provider_data.description || '';

      if (this.client.extended_video_enabled) {
        this.editingVideo.video_filter_values = _.map(this.editingVideo.video_filter_values, 'id');
        this.editingVideo.video_main_categories = _.map(this.editingVideo.video_main_categories, 'id');
        this.editingVideo.teachers = _.map(this.editingVideo.teachers, 'id');
        this.editingVideo.video_tags = _.map(this.editingVideo.video_tags, 'name');
        this.editingVideo.related_videos = _.map(this.editingVideo.related_videos, 'id');
      }

      this.showEditVideoDialog = true;
    },

    async saveVideo() {
      const videoData = _.pick(this.editingVideo, [
        'name',
        'description',
        'video_groups',
        'video_tags',
        'teachers',
        'video_filter_values',
        'video_main_categories',
        'related_videos',
      ]);

      console.log('videoData:', videoData);

      this.showEditVideoDialog = false;
      this.loading = true;
      await YogoApi.put('/videos/' + this.editingVideo.id, videoData);
      const updatedVideo = await this.getOneVideo(this.editingVideo.id);
      console.log(updatedVideo);
      const videoIdx = _.findIndex(this.videos, { id: this.editingVideo.id });
      this.videos.splice(videoIdx, 1, updatedVideo);
      this.loading = false;
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.editingVideo.video_provider_data.name + this.$t('global.hasBeenUpdated'),
      });
    },

    async getOneVideo(videoId) {
      const queryString = qs.stringify({ populate: this.videoPopulateFields });
      return await YogoApi.get(`/videos/${videoId}?${queryString}`);
    },

    async restrictVideoToYogo(video) {
      await YogoApi.post(`/videos/${video.id}/restrict-to-yogo`);
      const updatedVideo = await this.getOneVideo(video.id);
      const videoIdx = _.findIndex(this.videos, { id: video.id });
      this.videos.splice(videoIdx, 1, updatedVideo);
    },

    openRestrictToYogoExplanation() {
      this.$refs.RestrictToYogoExplanationDialog.open();
    },
  },
};

</script>

<style lang="scss" scoped>

@import '../assets/scss/style.scss';

i.md-icon.md-theme-default.warning {
  color: red !important;
}

i.md-icon.md-theme-default.lock {
  color: $green !important;
}

img.thumbnail {
  width: 110px;
  max-width: 110px;
}

.edit-video-dialog img.thumbnail {
  width: 232px;
  max-width: 232px;
}

.md-dialog-fullscreen {
  overflow: hidden !important;
}

.md-dialog-container {
  max-width: 768px !important;
}
</style>
