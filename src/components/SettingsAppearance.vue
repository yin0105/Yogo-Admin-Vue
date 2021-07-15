<template>
  <div>

    <SettingsSubMenu></SettingsSubMenu>
    <div class="wrapper__submenu--content">

      <h2>{{ $t('global.Appearance') }}</h2>

      <div class="space4"></div>

      <loading-animation v-if="loading"></loading-animation>


      <div v-else class="flex--row">

        <div class="flex--50">

          <md-field>
            <label>{{ $t('global.Theme') }}</label>
            <md-select v-model="form.theme">
              <md-option value="minimalistic">{{ $t('global.Minmalistic') }}</md-option>
              <md-option value="framed">{{ $t('global.Framed') }}</md-option>
            </md-select>
          </md-field>


          <div class="space4"></div>

          <colorpickerfield
            :color.sync="form.theme_primary_color"
            :label="$t('global.PrimaryColor')"
          >
          </colorpickerfield>

          <colorpickerfield
            :color.sync="form.theme_background_color"
            :label="$t('global.BackgroundColor')"
          >
          </colorpickerfield>


          <div class="space4"></div>


          <md-field>
            <label>{{ $t('global.FontCategory') }}</label>
            <md-select v-model="form.theme_font_type">
              <md-option value="google_web_font">{{ $t('global.FreeWebfont') }}</md-option>
              <md-option value="custom">{{ $t('global.OwnFont') }}</md-option>
            </md-select>
          </md-field>


          <md-field v-if="form.theme_font_type === 'google_web_font'">
            <label>{{ $t('global.Font') }}</label>
            <md-select v-model="form.theme_google_web_font">
              <md-option
                v-for="fontFamily in googleWebFontFamilies"
                :key="'google_web_font_' + fontFamily"
                :value="fontFamily">
                {{ fontFamily }}
              </md-option>
            </md-select>
          </md-field>


          <md-field v-if="form.theme_font_type === 'custom'">
            <label>{{ $t('global.CustomFontStylesheetUrl') }}</label>
            <md-input v-model="form.theme_custom_font_stylesheet_url"></md-input>
          </md-field>


          <md-field v-if="form.theme_font_type === 'custom'">
            <label>{{ $t('global.FontFamily') }}</label>
            <md-input v-model="form.theme_font_family"></md-input>
          </md-field>

          <!--<md-field>
            <label>{{ fontSizeLabel }}</label>
            <md-select name="classType" id="classType" v-model="form.theme_font_size">
              <md-option value="auto">Automatisk</md-option>
              <md-option
                v-for="fontSize in ['10px','11px','12px','13px','14px','15px','16px','17px','18px','19px','20px']"
                :value="fontSize"
                :key="fontSize"
              >
                {{ fontSize }}
              </md-option>
            </md-select>
          </md-field>-->

          <md-field>
            <label>{{ $t('global.OverlaySize') }}</label>
            <md-select name="classType" id="classType" v-model="form.frontend_overlay_size">
              <md-option value="full_screen" key="overlay_size_full_screen">{{ $t('global.FullScreen') }}</md-option>
              <md-option value="popup" key="overlay_size_popup">{{ $t('global.Popup') }}</md-option>
            </md-select>
          </md-field>

          <md-button class="md-raised md-primary" @click="submit">{{ $t('global.Save') }}</md-button>

        </div>


        <div class="flex--50">
          <label>{{ $t('global.Preview') }}</label>
          <iframe ref="iframe" style="width:100%; height:400px; box-sizing: border-box; border: none;"></iframe>
        </div>


      </div>
    </div>
  </div>

</template>

<script>

  import Colorpickerfield from './ColorPickerField.vue'
  import LoadingAnimation from './LoadingAnimation'
  import SettingsSubMenu from './SettingsSubMenu'

  import { mapGetters } from 'vuex'
  import YogoApi from '@/gateways/YogoApi'

  import axios from 'axios'

  import _map from 'lodash/map'
  import _sortBy from 'lodash/sortBy'
  import _pick from 'lodash/pick'

  export default {
    name: 'SettingsAppearance',
    components: {
      LoadingAnimation,
      Colorpickerfield,
      SettingsSubMenu,
    },
    data() {
      return {
        loading: true,
        googleWebFontsRaw: [],
        googleWebFontFamilies: [],

        form: null,

        saveLabel: 'Gem',

      }
    },

    watch: {
      form: {
        handler: async function (newForm) {
          if (newForm) {
            await this.updatePreviewIframe()
          }

        },
        deep: true,
      },

    },

    computed: {
      ...mapGetters([
        'client',
        'googleWebFontsApiKey',
      ]),
    },

    async created() {
      await this.getGoogleWebFonts()
      this.form = await YogoApi.get(
        '/clients/' + this.client.id + '/settings' +
        '?keys[]=theme' +
        '&keys[]=theme_primary_color' +
        '&keys[]=theme_background_color' +
        '&keys[]=theme_font_type' +
        '&keys[]=theme_google_web_font' +
        '&keys[]=theme_primary_color' +
        '&keys[]=theme_custom_font_stylesheet_url' +
        '&keys[]=theme_font_family' +
        //'&keys[]=theme_font_size',
        '&keys[]=frontend_overlay_size',
      )
      if (!this.form.theme_google_web_font) {
        this.form.theme_google_web_font = this.googleWebFontFamilies[0]
      }
      this.loading = false

      this.updatePreviewIframe()
    },

    mounted() {
      this.updatePreviewIframe()
    },

    methods: {
      async getGoogleWebFonts() {
        const result = await axios.get('https://www.googleapis.com/webfonts/v1/webfonts?key=' + this.googleWebFontsApiKey + '&sort=popularity')
        this.googleWebFontsRaw = result.data.items.slice(0, 500)
        this.googleWebFontsRaw = _sortBy(this.googleWebFontsRaw, 'family')
        this.googleWebFontFamilies = _map(this.googleWebFontsRaw, 'family')
      },
      async updatePreviewIframe() {
        this.$nextTick(async () => {
          if (this.loading) return
          if (!this.$refs.iframe) return

          let customFontCss,
            previewCustomFontHeadTags = '',
            bodyFontFamily,
            fontInfoText

          switch (this.form.theme_font_type) {
            case 'google_web_font':
              customFontCss = (await axios.get(
                'https://fonts.googleapis.com/css' +
                '?family=' + this.form.theme_google_web_font.replace(/ /g, '+') +
                ':regular',
              )).data
              bodyFontFamily = this.form.theme_google_web_font
              fontInfoText = 'Skrifttype: ' + this.form.theme_google_web_font
              break
            case 'custom':
              customFontCss = ''
              previewCustomFontHeadTags = '<link rel="stylesheet" type="text/css" href="' + this.form.theme_custom_font_stylesheet_url + '">'
              bodyFontFamily = this.form.theme_font_family
              fontInfoText = 'CSS font-family: ' + this.form.theme_font_family
              break
          }

          var boxShadow = this.form.theme === 'framed' ? '1px 2px 10px -2px #979797' : 'none'

          var iframe = this.$refs.iframe
          var html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf8">
            ${previewCustomFontHeadTags}
            <style>

              ${customFontCss}

              body {
                font-family: ${bodyFontFamily};
                background: ${this.form.theme_background_color};
              }
              .menu {
                display: flex;
              }
              .card {
                background: #fff;
                padding: 30px;
                box-shadow: ${boxShadow};
              }
              .wrapper {
                margin:20px;
              }
              h2 {
                font-weight: normal;
                font-size: 1.8em;
                line-height: 1.2;
                margin-top: 0;

              }
              .btn {
                display: flex;
                justify-content: center;
                align-items: center;
                line-height: 1;
                text-transform: uppercase;
                color: ${this.form.theme_primary_color};
                min-width: 88px;
                height: 36px;
                border: 1px solid;
                width: 100px;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                border-radius: 2px;
              }
            </style>
          </head>
          <body>
          <div class="modal">
            <div class="wrapper">
              <div class="card">
                <h2>Mit medlemskab</h2>
               Træning alle hverdage
                <br>
                <br /><br />
                <div class="btn">
                  Knap
                </div>
              </div>
            </div>
            </div>
          </body>
        </html>

        `
          iframe.contentWindow.document.open()
          iframe.contentWindow.document.write(html)
          iframe.contentWindow.document.close()
        })

      },
      async submit() {
        this.loading = true
        const submitData = _pick(
          this.form,
          [
            'theme',
            'theme_primary_color',
            'theme_background_color',
            'theme_font_type',
            'theme_google_web_font',
            'theme_font_family',
            'theme_custom_font_stylesheet_url',
            'theme_font_size',
            'frontend_overlay_size',
          ],
        )
        await YogoApi.put('/clients/' + this.client.id + '/settings', submitData)
        this.loading = false
        this.updatePreviewIframe()

        this.$store.commit('postFlashMessage', {
          type: 'MESSAGE_TYPE_INFO',
          text: this.$t('global.SettingsHasBeenUpdated'),
        })

      },

    },
  }

</script>
