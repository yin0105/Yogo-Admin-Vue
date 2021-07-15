<template>
  <div>
    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Terms') }}</h2>

      <loading-animation v-if="loading"/>

      <div v-else>

        <h3>
          {{ $t('global.GeneralTerms') }}
        </h3>
        <ckeditor
            :editor="editor"
            v-model="terms"
            :config="editor1Config"
        >
        </ckeditor>

        <h3>
          {{ $t('global.RecurringMembershipTerms') }}
        </h3>

        <div class="flex items-center">
          <md-checkbox v-model="show_recurring_terms">{{ $t('global.ShowSeparateRecurringMembershipTerms') }}</md-checkbox>
          <TooltipInfo :tooltipText="$t('global.ShowRecurringMembershipTermsText')"></TooltipInfo>
        </div>

        <ckeditor
            :editor="editor"
            v-model="recurring_terms"
            :config="editor2Config"
            v-if="show_recurring_terms"
        >
        </ckeditor>

        <md-button class="md-raised md-primary mt-4" @click="saveTerms">
          {{ $t('global.SaveTerms') }}
        </md-button>

      </div>

    </div>

  </div>


</template>

<script>

import qs from 'qs';

import SettingsSubMenu from './SettingsSubMenu';
import LoadingAnimation from './LoadingAnimation';

import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '@ckeditor/ckeditor5-build-classic/build/translations/da';
import TooltipInfo from './TooltipInfo';

export default {
  components: {
    LoadingAnimation,
    SettingsSubMenu,
    TooltipInfo,
  },
  data() {
    return {
      loading: true,

      editor: ClassicEditor,
      terms: '',
      recurring_terms: '',
      show_recurring_terms: '',
      editorBaseConfig: {
        toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
        heading: {
          options: [
            {
              model: 'paragraph',
              title: this.$t('global.BodyText'),
              class: 'yogo-heading_paragraph',
            },
            {
              model: 'heading2',
              view: 'h2',
              title: this.$t('global.Headline'),
              class: 'ck-heading_heading2',
            },
          ],
        },
        language: 'da',
      },
    };
  },
  computed: {
    ...mapGetters([
      'client',
      'stateReady',
    ]),
    editor1Config() {
      return _.assign(
          _.cloneDeep(this.editorBaseConfig),
          {
            name: 'editor1'
          }
      )
    },
    editor2Config() {
      return _.assign(
          _.cloneDeep(this.editorBaseConfig),
          {
            name: 'editor2'
          }
      )
    }
  },
  created() {
    if (this.stateReady) this.fetchTerms();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchTerms();
    },
  },
  methods: {
    async fetchTerms() {
      this.loading = true;
      const query = {
        keys: [
          'terms',
          'recurring_terms',
          'show_recurring_terms',
        ],
      };
      const queryString = qs.stringify(query);
      const settings = await YogoApi.get(`/clients/${this.client.id}/settings?${queryString}`);
      this.terms = settings.terms;
      this.recurring_terms = settings.recurring_terms;
      this.show_recurring_terms = settings.show_recurring_terms;
      this.loading = false;
    },
    async saveTerms() {
      this.loading = true;
      await YogoApi.put(`/clients/${this.client.id}/settings`, {
        terms: this.terms,
        recurring_terms: this.recurring_terms,
        show_recurring_terms: this.show_recurring_terms,
      });
      this.loading = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.TermsUpdated'),
      });

    },
  },
};

</script>

<style lang="scss">

.ck-editor h2, .yogo-heading_heading2 {
  font-size: 1.5em;
  margin: 1.5em 0 1em 0;
  padding: 0;
}

.ck-editor p {
  margin: 1em 0;
}

.ck-editor ul {
  list-style: disc outside;
}

.ck-editor ol {
  list-style: decimal outside;
  padding: 0;
}

.ck-editor li {
  margin: 1em 0 1em 2em;
}

.ck-editor__editable_inline {
  min-height: 400px;
}

</style>
