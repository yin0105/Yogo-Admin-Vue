<template>
    <div>
        <h1 class="mb-8">{{ $t('payment.PleaseSelectYogoPlan') }}</h1>
        {{ $t('payment.SelectPlanPleaseChoose') }}

        <div class="flex flex-wrap mb-4">
            <div class="yogo-plan-card flex--25 m-4" v-on:click="showCountrySelector(1)">
                <div class="plan-first-row">{{ $t('payment.PayAsYouGrow') }}</div>
                <div class="plan-second-row">5%</div>
                <div class="plan-third-row">{{$t('payment.SelectPlanOfYourSales') }}</div>
            </div>

            <div class="yogo-plan-card flex--25 m-4" v-on:click="showCountrySelector(2)">
                <div class="plan-first-row">{{ $t('payment.StudioLight') }}</div>
                <div class="plan-second-row">499,-</div>
                <div class="plan-third-row">DKK / {{$t('payment.Month') }}</div>
            </div>

            <div class="yogo-plan-card flex--25 m-4" v-on:click="showCountrySelector(3)">
                <div class="plan-first-row">{{ $t('payment.Studio') }}</div>
                <div class="plan-second-row">999,-</div>
                <div class="plan-third-row">DKK / {{$t('payment.Month') }}</div>
            </div>

            <div class="yogo-plan-card flex--25 m-4" v-on:click="showCountrySelector(4)">
                <div class="plan-first-row">{{ $t('payment.StudioApp') }}</div>
                <div class="plan-second-row">1999,-</div>
                <div class="plan-third-row">DKK / {{$t('payment.Month') }}</div>
            </div>
        </div>

        <div>
            {{ $t('payment.SelectPlanExVAT')}}
        </div>
        <div class="my-4">
            {{ $t('payment.SelectPlanFullComparision')}} 
            <a>{{ $t('payment.Here')}} </a>
        </div>
        <div>
            {{ $t('payment.SelectPlanMoreBranch')}} 
            <a>{{ $t('payment.ContactUs')}} </a>
        </div>
    </div>
</template>

<script>

export default {
    name: 'SettingsPaymentSelectPlan',

    data() {
        return {
            // planNum: 0,
        };
    },

    methods: {
        showCountrySelector(planNum) {
            this.$emit('update:planNum', planNum)
        }
    }
};

</script>

<style lang="scss" scoped>

    .yogo-plan-card {
        border: 1px solid black;
        background-color: #CFE2F3;
        max-width: 180px;

        &:hover {
            cursor: pointer;
        }
    }
    .plan-first-row {
        font-size: 16px;
        text-align: center;
        margin-top: 10px;
    }
    .plan-second-row {
        font-size: 40px;
        text-align: center;
        margin: 30px auto
    }
    .plan-third-row {
        font-size: 12px;
        text-align: center;
        margin-bottom: 30px;
    }

</style>
