import Vue from 'vue'
import Router from 'vue-router'

import store from '@/store'

import Init from '@/components/Init'
import Dashboard from '@/components/Dashboard'
import Customers from '@/components/Customers'
import CustomerInfo from '@/components/CustomerInfo'
import CustomerAdd from '@/components/CustomerAdd'
import CustomerEdit from '@/components/CustomerEdit'
import CustomerHistory from '@/components/CustomerHistory'
import Classes from '@/components/Classes'
import ClassEdit from '@/components/ClassEdit'
import ClassAdd from '@/components/ClassAdd'
import ClassesEditMultiple from '@/components/ClassesEditMultiple'
import Teachers from '@/components/Teachers'
import TeacherForm from '@/components/TeacherForm'
import Events from '@/components/Events'
import EventEdit from '@/components/EventEdit'
import EventAdd from '@/components/EventAdd'
import Rooms from '@/components/Rooms'
import RoomForm from '@/components/RoomForm'
import ClassTypes from '@/components/ClassTypes'
import ClassTypeForm from '@/components/ClassTypeForm'
import EventGroups from '@/components/EventGroups'
import EventGroupAdd from '@/components/EventGroupAdd'
import EventGroupEdit from '@/components/EventGroupEdit'
import Membership from '@/components/Membership'
import Prices from '../components/Prices'
import ClassPassEdit from '@/components/ClassPassEdit'
import ClassPassTypeForm from '@/components/ClassPassTypeForm'
import MembershipTypeAdd from '@/components/MembershipTypeAdd'
import MembershipTypeEdit from '@/components/MembershipTypeEdit'
import PriceGroups from '@/components/PriceGroups'
import PriceGroupForm from '@/components/PriceGroupForm'
import Products from '@/components/Products'
import ProductForm from '@/components/ProductForm'
import Login from '@/components/Login'
import ProfileEdit from '@/components/ProfileEdit'
import PasswordReset from '@/components/PasswordReset'
import PasswordNew from '@/components/PasswordNew'
import ReportTurnover from '@/components/ReportTurnover'
import SettingsAppearance from '@/components/SettingsAppearance'
import SettingsCheckin from '@/components/SettingsCheckin'
import SettingsSignup from '@/components/SettingsSignup'
import SettingsFrontendMenu from '@/components/SettingsFrontendMenu'
import SettingsBranches from '@/components/SettingsBranches'
import SettingsCalendar from '@/components/SettingsCalendar'
import SettingsNoShowFees from '@/components/SettingsNoShowFees';
import SettingsMyProfile from '@/components/SettingsMyProfile'
import SettingsBranchForm from '@/components/SettingsBranchForm'
import SettingsImportMBO from '@/components/SettingsImportMBO'
import SettingsImportSportSolution from '../components/SettingsImportSportSolution'
import SettingsImportGeckoBooking from '../components/SettingsImportGeckoBooking'
import SettingsExport from '@/components/SettingsExport'
import SettingsTerms from '@/components/SettingsTerms'
import Users from '@/components/Users'
import UserForm from '@/components/UserForm'
import DiscountCodes from '../components/DiscountCodes'
import DiscountCodeForm from '../components/DiscountCodeForm'
import SettingsWaitingList from '../components/SettingsWaitingList'
import SettingsVideo from '../components/SettingsVideo'
import SettingsEmail from '../components/SettingsEmail'
import SettingsSms from '@/components/SettingsSms'
import Video from '../components/Video'
import VideoGroups from '../components/VideoGroups'
import VideoGroupForm from '../components/VideoGroupForm'
import VideoFilterForm from '../components/VideoFilterForm'
import ReportOrders from '../components/ReportOrders'
import SettingsLivestream from '../components/SettingsLivestream'
import ReportLivestream from '../components/ReportLivestream'
import ReportCustomers from '@/components/ReportCustomers';
import ReportSalary from '../components/ReportSalary'
import ClassEmailForm from '../components/ClassEmailForm'
import SettingsImportConventus from '@/components/SettingsImportConventus';
import ClassTypeEmailForm from '@/components/ClassTypeEmailForm';
import NoShowFees from '@/components/NoShowFees';
import GiftCards from '@/components/GiftCards';
import GiftCardForm from '@/components/GiftCardForm';
import SettingsImportSenses from '@/components/SettingsImportSenses';
import SettingsGiftCards from '@/components/SettingsGiftCards';
import SettingsPayment from '@/components/SettingsPayment';
import SettingsImportGeneric from '@/components/SettingsImportGeneric';
import SettingsMemberships from '@/components/SettingsMemberships';
import SettingsImportMomoyoga from '@/components/SettingsImportMomoyoga';

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Init',
      component: Init,
      meta: {
        requireAuth: false,
        fullBleedPage: true,
      },
    },
    {
      path: '/log-ind',
      name: 'Login',
      component: Login,
      meta: {
        requireAuth: false,
        fullBleedPage: true,
      },
    },
    {
      path: '/overblik',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/profil-rediger',
      name: 'ProfileEdit',
      component: ProfileEdit,
    },
    {
      path: '/kunder',
      name: 'Customers',
      component: Customers,
    },
    {
      path: '/kunder/:id/info',
      name: 'CustomerInfo',
      component: CustomerInfo,
    },
    {
      path: '/kunder/opret',
      name: 'CustomerAdd',
      component: CustomerAdd,
    },
    {
      path: '/kunder/:id/rediger',
      name: 'CustomerEdit',
      component: CustomerEdit,
    },
    {
      path: '/kunder/:id/historik',
      name: 'CustomerHistory',
      component: CustomerHistory,
    },
    {
      path: '/adgangskort/:id/rediger',
      name: 'ClassPassEdit',
      component: ClassPassEdit,
    },
    {
      path: '/medlemskab/:id',
      name: 'Membership',
      component: Membership,
    },
    {
      path: '/skema/:date?',
      name: 'Classes',
      component: Classes,
    },
    {
      path: '/klasser/:id/rediger',
      name: 'ClassEdit',
      component: ClassEdit,
    },
    {
      path: '/klasser/opret',
      name: 'ClassAdd',
      component: ClassAdd,
    },
    {
      path: '/classes/edit-multiple',
      name: 'ClassesEditMultiple',
      component: ClassesEditMultiple
    },
    {
      path: '/undervisere',
      name: 'Teachers',
      component: Teachers,
    },
    {
      path: '/underviser/opret',
      name: 'TeacherAdd',
      component: TeacherForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/underviser/:id/rediger',
      name: 'TeacherEdit',
      component: TeacherForm,
      meta: {
        formType: 'edit',
      },
    },
    {
      path: '/kurser',
      name: 'Events',
      component: Events,
    },
    {
      path: '/kurser/:id/rediger',
      name: 'EventEdit',
      component: EventEdit,
    },
    {
      path: '/kurser/opret',
      name: 'EventAdd',
      component: EventAdd,
    },
    {
      path: '/kursusgrupper',
      name: 'EventGroups',
      component: EventGroups,
    },
    {
      path: '/kursusgrupper/opret',
      name: 'EventGroupAdd',
      component: EventGroupAdd,
    },
    {
      path: '/kursusgrupper/:id/rediger',
      name: 'EventGroupEdit',
      component: EventGroupEdit,
    },
    {
      path: '/lokaler',
      name: 'Rooms',
      component: Rooms,
    },
    {
      path: '/lokaler/opret',
      name: 'RoomAdd',
      component: RoomForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/lokaler/:id/rediger',
      name: 'RoomEdit',
      component: RoomForm,
      meta: {
        formType: 'edit',
      },
    },
    {
      path: '/class-types',
      name: 'ClassTypes',
      component: ClassTypes,
    },
    {
      path: '/class-types/create',
      name: 'ClassTypeCreate',
      component: ClassTypeForm,
    },
    {
      path: '/class-types/:id/edit',
      name: 'ClassTypeEdit',
      component: ClassTypeForm,
    },
    {
      path: '/prices',
      name: 'Prices',
      component: Prices,
    },
    {
      path: '/klippekorttyper/opret',
      name: 'ClassPassTypeFixedCountAdd',
      component: ClassPassTypeForm,
      meta: {
        formType: 'add',
        classPassTypeType: 'fixed_count'
      }
    },
    {
      path: '/klippekorttyper/:id/rediger',
      name: 'ClassPassTypeFixedCountEdit',
      component: ClassPassTypeForm,
      meta: {
        formType: 'edit',
        classPassTypeType: 'fixed_count'
      }
    },
    {
      path: '/periodekorttyper/opret',
      name: 'ClassPassTypeTimeBasedAdd',
      component: ClassPassTypeForm,
      meta: {
        formType: 'add',
        classPassTypeType: 'unlimited'
      }
    },
    {
      path: '/periodekorttyper/:id/rediger',
      name: 'ClassPassTypeTimeBasedEdit',
      component: ClassPassTypeForm,
      meta: {
        formType: 'edit',
        classPassTypeType: 'unlimited'
      }
    },
    {
      path: '/medlemskabstyper/opret',
      name: 'MembershipTypeAdd',
      component: MembershipTypeAdd,
    },
    {
      path: '/medlemskabstyper/:id/rediger',
      name: 'MembershipTypeEdit',
      component: MembershipTypeEdit,
    },
    {
      path: '/prisgrupper',
      name: 'PriceGroups',
      component: PriceGroups,
    },
    {
      path: '/prisgrupper/opret',
      name: 'PriceGroupAdd',
      component: PriceGroupForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/prisgrupper/:id/rediger',
      name: 'PriceGroupEdit',
      component: PriceGroupForm,
      meta: {
        formType: 'edit',
      },
    },
    {
      path: '/no-show-fees',
      name: 'NoShowFees',
      component: NoShowFees,
    },
    {
      path: '/video',
      name: 'Video',
      component: Video,
    },
    {
      path: '/videogrupper',
      name: 'VideoGroups',
      component: VideoGroups,
    },
    {
      path: '/videogrupper/opret',
      name: 'VideoGroupAdd',
      component: VideoGroupForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/videogrupper/:id/rediger',
      name: 'VideoGroupEdit',
      component: VideoGroupForm,
      meta: {
        formType: 'edit',
      },
    },
    {
      path: '/video-filters/add',
      name: 'VideoFilterAdd',
      component: VideoFilterForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/video-filters/:id/edit',
      name: 'VideoFilterEdit',
      component: VideoFilterForm,
      meta: {
        formType: 'edit',
      },
    },
    {
      path: '/rabatkoder',
      name: 'DiscountCodes',
      component: DiscountCodes,
    },
    {
      path: '/rabatkoder/opret',
      name: 'DiscountCodeAdd',
      component: DiscountCodeForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/rabatkoder/:id/rediger',
      name: 'DiscountCodeEdit',
      component: DiscountCodeForm,
      meta: {
        formType: 'edit',
      },
    },
    {
      path: '/gift-cards',
      name: 'GiftCards',
      component: GiftCards,
    },
    {
      path: '/gift-cards/create',
      name: 'GiftCardAdd',
      component: GiftCardForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/gift-cards/:id/edit',
      name: 'GiftCardEdit',
      component: GiftCardForm,
      meta: {
        formType: 'edit',
      },
    },
    {
      path: '/varer',
      name: 'Products',
      component: Products,
    },
    {
      path: '/varer/opret',
      name: 'ProductAdd',
      component: ProductForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/varer/:id/rediger',
      name: 'ProductEdit',
      component: ProductForm,
      meta: {
        formType: 'edit',
      },
    },
    {
      path: '/glemt-adgangskode',
      name: 'PasswordReset',
      component: PasswordReset,
      meta: {
        requireAuth: false,
        fullBleedPage: true,
      },
    },
    {
      path: '/ny-adgangskode/:email/:token',
      name: 'PasswordNew',
      component: PasswordNew,
      meta: {
        requireAuth: false,
        fullBleedPage: true,
      },
    },
    {
      path: '/rapporter/omsaetning',
      name: 'ReportTurnover',
      component: ReportTurnover,
    },
    {
      path: '/rapporter/ordrer',
      name: 'ReportOrders',
      component: ReportOrders,
    },
    {
      path: '/report/livestream',
      name: 'ReportLivestream',
      component: ReportLivestream,
    },
    {
      path: '/report/customers',
      name: 'ReportCustomers',
      component: ReportCustomers,
    },
    {
      path: '/report/salary',
      name: 'ReportSalary',
      component: ReportSalary,
    },
    {
      path: '/settings/appearance',
      name: 'SettingsAppearance',
      component: SettingsAppearance,
    },
    {
      path: '/indstillinger-checkin',
      name: 'SettingsCheckin',
      component: SettingsCheckin,
    },
    {
      path: '/indstillinger-opret-profil',
      name: 'SettingsSignup',
      component: SettingsSignup,
    },
    {
      path: '/indstillinger-frontend-menu',
      name: 'SettingsFrontendMenu',
      component: SettingsFrontendMenu,
    },
    {
      path: '/afdelinger',
      name: 'SettingsBranches',
      component: SettingsBranches,
    },
    {
      path: '/indstillinger-kalender',
      name: 'SettingsCalendar',
      component: SettingsCalendar,
    },
    {
      path: '/settings-memberships',
      name: 'SettingsMemberships',
      component: SettingsMemberships,
    },
    {
      path: '/settings-no-show-fees',
      name: 'SettingsNoShowFees',
      component: SettingsNoShowFees,
    },
    {
      path: '/indstillinger-venteliste',
      name: 'SettingsWaitingList',
      component: SettingsWaitingList,
    },
    {
      path: '/indstillinger-video',
      name: 'SettingsVideo',
      component: SettingsVideo,
    },
    {
      path: '/indstillinger-livestream',
      name: 'SettingsLivestream',
      component: SettingsLivestream,
    },
    {
      path: '/settings-gift-cards',
      name: 'SettingsGiftCards',
      component: SettingsGiftCards,
    },
    {
      path: '/indstillinger-kundeprofil',
      name: 'SettingsMyProfile',
      component: SettingsMyProfile,
    },
    {
      path: '/indstillinger-forretningsbetingelser',
      name: 'SettingsTerms',
      component: SettingsTerms,
    },
    {
      path: '/indstillinger-email',
      name: 'SettingsEmail',
      component: SettingsEmail,
    },
    {
      path: '/class-type-emails/create',
      name: 'ClassTypeEmailAdd',
      component: ClassTypeEmailForm,
    },
    {
      path: '/class-type-emails/:id/edit',
      name: 'ClassTypeEmailEdit',
      component: ClassTypeEmailForm,
    },
    {
      path: '/indstillinger-sms',
      name: 'SettingsSms',
      component: SettingsSms,
    },
    {
      path: '/afdelinger/opret',
      name: 'SettingsBranchAdd',
      component: SettingsBranchForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/afdelinger/:id/rediger',
      name: 'SettingsBranchEdit',
      component: SettingsBranchForm,
      meta: {
        formType: 'edit',
      },
    },
    {
      path: '/settings-payment',
      name: 'SettingsPayment',
      component: SettingsPayment,
    },
    {
      path: '/settings-import',
      name: 'SettingsImportMBO',
      component: SettingsImportMBO,
    },
    {
      path: '/settings-import-sport-solution',
      name: 'SettingsImportSportSolution',
      component: SettingsImportSportSolution,
    },
    {
      path: '/settings-import-gecko-booking',
      name: 'SettingsImportGeckoBooking',
      component: SettingsImportGeckoBooking,
    },
    {
      path: '/settings-import-conventus',
      name: 'SettingsImportConventus',
      component: SettingsImportConventus,
    },
    {
      path: '/settings-import-senses',
      name: 'SettingsImportSenses',
      component: SettingsImportSenses,
    },
    {
      path: '/settings-import-momoyoga',
      name: 'SettingsImportMomoyoga',
      component: SettingsImportMomoyoga,
    },
    {
      path: '/settings-import-generic',
      name: 'SettingsImportGeneric',
      component: SettingsImportGeneric,
    },
    {
      path: '/settings-eksport',
      name: 'SettingsExport',
      component: SettingsExport,
    },
    {
      path:'/class/:classId/create-class-email',
      name: 'CreateClassEmail',
      component: ClassEmailForm
    },
    {
      path:'/class-email/:emailId/edit',
      name: 'EditClassEmail',
      component: ClassEmailForm
    },
    {
      path: '/brugere',
      name: 'Users',
      component: Users,
    },
    {
      path: '/brugere/opret',
      name: 'UserAdd',
      component: UserForm,
      meta: {
        formType: 'add',
      },
    },
    {
      path: '/brugere/:id/rediger',
      name: 'UserEdit',
      component: UserForm,
      meta: {
        formType: 'edit',
      },
    },
  ],
})

router.beforeEach((to, from, next) => {

  // If state not ready and page is closed, redirect to Init
  if (!store.state.ready && to.meta.requireAuth !== false) {
    store.commit('setRequestedRoute', to)
    return next({name: 'Init'})
  }

  // Logged in?
  if (store.getters.userIsLoggedIn) {
    return next()
  }

  // Not logged in

  // Some routes are open
  if (to.meta.requireAuth === false) return next()

  // Closed route and not logged in
  // Redirect to Login
  store.commit('setRequestedRoute', to)
  next({name: 'Login'})
})

export default router
