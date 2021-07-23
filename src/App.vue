<template>
  <div id="app" :key="locale">

    <!-- mobile menu -->

    <md-app v-if="!fullBleedPage">

      <md-app-toolbar :class="{ 'header-bar--hidden': !showHeaderbar }" class="md-primary header-bar">
        <Header></Header>
        <md-button class="md-icon-button icon--big desktop__up--hidden" @click="toggleMenu" v-if="!menuVisible">
          <md-icon>menu</md-icon>
        </md-button>
      </md-app-toolbar>

      <md-app-drawer :md-active.sync="menuVisible" md-fixed>
        <md-toolbar class="md-transparent" md-elevation="0">
          <img :src="Imgix(client.logo.filename)"
               v-if="client && client.logo && client.logo.filename.slice(-4) === '.svg'"
               class="logo-svg">
          <div v-else-if="client && client.logo"
               :style="{'background-image' : 'url(' + Imgix(client.logo.filename, {w:480, h:160}) + ')'}"
               class="logo-bitmap"></div>
          <div v-else-if="client">{{ client.name }}</div>
          <div class="md-toolbar-section-end">
            <md-button class="md-icon-button md-dense" @click="toggleMenu">
              <md-icon>keyboard_arrow_left</md-icon>
            </md-button>
          </div>
        </md-toolbar>

        <md-list>
          <md-list-item>
            <md-icon>dashboard</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Dashboard' }">{{ $t('global.Overview') }}</router-link>
            </span>
          </md-list-item>

          <md-list-item>
            <md-icon>group</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Customers' }">{{ $t('global.Customers') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>schedule</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Classes' }">{{ $t('global.Schedule') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>supervisor_account</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Teachers' }">{{ $t('global.Teachers') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>place</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Rooms' }">{{ $t('global.Rooms') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>fitness_center</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'ClassTypes' }">{{ $t('global.ClassTypes') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>event</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Events' }">{{ $t('global.Events') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>group_work</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'EventGroups' }">{{ $t('global.EventGroups') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>tv</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Video' }">{{ $t('global.Video') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>video_library</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'VideoGroups' }">{{ $t('global.VideoGroups') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>card_membership</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Prices' }">{{ $t('global.Prices') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>library_books</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'PriceGroups' }">{{ $t('global.PriceGroups') }}</router-link></span>
          </md-list-item>

          <md-list-item v-if="client.settings.no_show_fees_enabled">
            <md-icon>assignment_late</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'NoShowFees' }">{{ $t('global.NoShowFees') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>monetization_on</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'DiscountCodes' }">{{ $t('global.PromotionCodes') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>card_giftcard</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'GiftCards' }">{{ $t('global.GiftCards') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>shopping_cart</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Products' }">{{ $t('global.Products') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>person</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'Users' }">{{ $t('global.Users') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>content_copy</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'ReportTurnover' }">{{ $t('global.Reports') }}</router-link></span>
          </md-list-item>

          <md-list-item>
            <md-icon>settings</md-icon>
            <span class="md-list-item-text" @click="toggleMenu"><router-link
                :to="{ name: 'SettingsCompany' }">{{ $t('global.Settings') }}</router-link></span>
          </md-list-item>

        </md-list>
      </md-app-drawer>

      <md-app-content>

        <!-- end mobile menu -->

        <!-- desktop menu -->

        <div
            class="sidebar__nav--container"
            v-show="!fullBleedPage"
            :class="{'sidebar-slim': slimMenu}"

        >

          <ul class="sidebar__nav--inner">

            <router-link
                class="hidden flex-lg animate-logo client-logo"
                :to="{ name: 'Dashboard' }"
                :class="{'slim-logo': slimMenu}"
            >
              <img :src="Imgix(client.logo.filename)"
                   v-if="client && client.logo && client.logo.filename.slice(-4) === '.svg'" class="logo-svg">

              <div v-else-if="client && client.logo"
                   :style="{'background-image' : 'url(' + Imgix(client.logo.filename, {w:480, h:160}) + ')'}"
                   class="logo-bitmap"></div>
              <div v-else class="space8">

              </div>
            </router-link>

            <li class="justify-end pl-4 pr-4 cursor-pointer menu-toggle" @click="toggleSlimMenu">
              <md-icon
                  class="mr-2 -ml-2"
                  :class="slimMenu ? 'flip' : 'flip-back'"
              >
                menu_open
                <md-tooltip
                    v-if="slimMenu"
                    md-direction="right"
                >
                  {{ $t('global.ExpandMenu') }}
                </md-tooltip>
                <md-tooltip
                    v-else
                    md-direction="right"
                >
                  {{ $t('global.CollapseMenu') }}
                </md-tooltip>
              </md-icon>

            </li>

            <li>
              <router-link :to="{ name: 'Dashboard' }">
                <md-icon>
                  dashboard
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Overview') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Overview') }}
            </span>

              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'Customers' }">
                <md-icon>
                  group
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Customers') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Customers') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'Classes' }">
                <md-icon>
                  schedule
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Schedule') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Schedule') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'Teachers' }">
                <md-icon>
                  supervisor_account
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Teachers') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Teachers') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'Rooms' }">
                <md-icon>
                  place
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Rooms') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Rooms') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'ClassTypes' }">
                <md-icon>
                  fitness_center
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.ClassTypes') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.ClassTypes') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'Events' }">
                <md-icon>
                  event
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Events') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Events') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'EventGroups' }">
                <md-icon>
                  group_work
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.EventGroups') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.EventGroups') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'Video' }">
                <md-icon>
                  tv
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Video') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Video') }}
            </span>
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'VideoGroups' }">
                <md-icon>
                  video_library
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.VideoGroups') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.VideoGroups') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'Prices' }">
                <md-icon>
                  card_membership
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Prices') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Prices') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'PriceGroups' }">
                <md-icon>
                  library_books
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.PriceGroups') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.PriceGroups') }}
            </span>
              </router-link>
            </li>

            <li v-if="client.settings.no_show_fees_enabled">
              <router-link :to="{ name: 'NoShowFees' }">
                <md-icon>
                  assignment_late
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.NoShowFees') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.NoShowFees') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'DiscountCodes' }">
                <md-icon>
                  monetization_on
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.PromotionCodes') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.PromotionCodes') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'GiftCards' }">
                <md-icon>
                  card_giftcard
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.GiftCards') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.GiftCards') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'Products' }">
                <md-icon>
                  shopping_cart
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Products') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Products') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'Users' }">
                <md-icon>
                  person
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Users') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Users') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'ReportTurnover' }">
                <md-icon>
                  content_copy
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Reports') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Reports') }}
            </span>
              </router-link>
            </li>

            <li>
              <router-link :to="{ name: 'SettingsCompany' }">
                <md-icon>
                  settings
                  <md-tooltip
                      md-direction="right"
                      :class="{'hidden': !slimMenu}"
                  >
                    {{ $t('global.Settings') }}
                  </md-tooltip>
                </md-icon>
                <span class="md-list-item-text">
              {{ $t('global.Settings') }}
            </span>
              </router-link>
            </li>

          </ul>
        </div>

        <div
            class="wrapper"
            v-show="!fullBleedPage"
            :class="{ 'slim-menu' : slimMenu }"
        >
          <div class="wrapper--inner">
            <router-view></router-view>
          </div>
        </div>
      </md-app-content>
    </md-app>

    <router-view v-if="fullBleedPage"></router-view>


    <md-snackbar md-position="center" :md-active.sync="showFlashMessageSnackbar" md-persistent
                 :md-duration="snackbarDuration">
      <span>{{ flashMessageSnackbarText }}</span>
      <md-button
          class="md-primary md-raised bg--transparent"
          @click="showFlashMessageSnackbar = false"
      >
        {{ $t('global.Close') }}
      </md-button>
    </md-snackbar>

    <md-dialog-alert :md-active.sync="showAlert" :md-title="alertDialogTitle"
                     :md-content="alertDialogContent"></md-dialog-alert>

  </div>
</template>

<script>

import Imgix from '@/services/Imgix';
import Header from '@/components/Header';
import { mapGetters } from 'vuex';
import store from '@/store'

export default {
  data() {
    return {
      menuVisible: false,
      showFeedbackModal: false,
      feedbackTooltip: 'Feedback eller rapporter et problem',
      emailLabel: 'E-mail',
      subjectLabel: 'Emne',
      feedbackTextarea: 'Send din feedback eller beskriv et evt. problem',
      showFlashMessageSnackbar: false,
      flashMessageSnackbarText: '',
      snackbarDuration: 4000,
      showHeaderbar: true,
      lastScrollPosition: 0,
      scrollValue: 0,

      showAlert: false,
    };
  },
  mounted() {
    this.lastScrollPosition = window.pageYOffset;
    window.addEventListener('scroll', this.onScroll);
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1';
    document.head.appendChild(viewportMeta);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  },
  methods: {
    toggleSlimMenu() {
      this.$store.commit('setSlimMenu', !this.slimMenu);
    },

    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    onScroll() {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollPosition < 0) {
        return;
      }

      if (Math.abs(currentScrollPosition - this.lastScrollPosition) < 60) {
        return;
      }
      this.showHeaderbar = currentScrollPosition < this.lastScrollPosition;
      this.lastScrollPosition = currentScrollPosition;
    },
  },

  mixins: [Imgix],
  computed: {
    fullBleedPage() {
      return this.$route.meta.fullBleedPage;
    },
    ...mapGetters([
      'flashMessages',
      'client',
      'slimMenu',
    ]),
    ...mapGetters('appSettings', [
      'locale',
    ]),
    ...mapGetters('alert', {
      alertDialogTitle: 'title',
      alertDialogContent: 'message',
      dismissAlertCallback: 'callback'
    }),
  },
  components: {
    Header,
  },
  created() {
    this.$store.dispatch('init');
  },
  watch: {
    flashMessages(updatedFlashMessages) {
      const lastFlashMessage = updatedFlashMessages[updatedFlashMessages.length - 1];
      this.flashMessageSnackbarText = lastFlashMessage.text;
      this.showFlashMessageSnackbar = true;
    },
    alertDialogTitle(newTitle) {
      console.log(newTitle);
      if (newTitle) {
        this.showAlert = true;
      }
    },
    showAlert(newShowAlert) {
      console.log('newShowAlert:', newShowAlert);
      if (newShowAlert === false) {
        if (this.dismissAlertCallback) {
          this.dismissAlertCallback();
        }
        this.$store.dispatch('alert/reset');
      }
    }
  },

};
</script>

<style lang="scss">

@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme("default", (
    primary: md-get-palette-color(cyan, 700),
    accent: md-get-palette-color(red, 800)
));

@import "~vue-material/dist/theme/all"; // Apply the theme

#app {
  --md-theme-default-primary: #0097a7;
  --md-theme-default-accent: #0097a7;
  background: #f1f1f1
}

.md-toolbar.md-theme-default.md-primary .md-icon {
  color: #000;
}

.md-toolbar.md-theme-default.md-primary {
  height: 60px !important;
}

.header-bar {
  height: 60px;
  width: 100vw;
  background: #fff;
  position: fixed !important;
  box-shadow: 0 2px 15px rgba(71, 120, 120, 0.5);
  transform: translate3d(0, 0, 0);
  transition: 0.1s all ease-out;
  z-index: 11 !important;

  button {
    z-index: 20;
  }

  @media screen and (min-device-width: 1030px) {
    z-index: 6 !important;
  }
}

.header-bar.header-bar--hidden {
  transform: translate3d(0, -100%, 0);
}

.slim-menu {
  transition: 0.3s ease margin;
  @media screen and (min-device-width: 1030px) {
    margin-left: 60px !important;
  }
}

.sidebar-slim {
  transition: 0.3s ease width;
  width: 64px !important;
}

.slim-logo {
  img,
  .logo-bitmap {
    width: 30px !important;
    margin: 0 !important;
    transition: .3s ease all;
  }
}

.md-app {
  height: 100%;
}

</style>
