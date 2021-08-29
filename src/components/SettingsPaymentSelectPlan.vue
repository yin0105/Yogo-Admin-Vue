<template>
    <div>
        <h1 class="mb-8">{{ $t('payment.PleaseSelectYogoPlan') }}</h1>
        {{ $t('payment.SelectPlanPleaseChoose') }}

        <div class="flex flex-wrap mb-4">
            <div class="yogo-plan-card flex--25 m-4">
                <div class="plan-first-row">{{ $t('payment.PayAsYouGrow') }}</div>
                <div class="plan-second-row">5%</div>
                <div class="plan-third-row">{{$t('payment.SelectPlanOfYourSales') }}</div>
            </div>

            <div class="yogo-plan-card flex--25 m-4">
                <div class="plan-first-row">{{ $t('payment.StudioLight') }}</div>
                <div class="plan-second-row">499,-</div>
                <div class="plan-third-row">DKK / {{$t('payment.Month') }}</div>
            </div>

            <div class="yogo-plan-card flex--25 m-4">
                <div class="plan-first-row">{{ $t('payment.Studio') }}</div>
                <div class="plan-second-row">999,-</div>
                <div class="plan-third-row">DKK / {{$t('payment.Month') }}</div>
            </div>

            <div class="yogo-plan-card flex--25 m-4">
                <div class="plan-first-row">{{ $t('payment.StudioApp') }}</div>
                <div class="plan-second-row">1999,-</div>
                <div class="plan-third-row">DKK / {{$t('payment.Month') }}</div>
            </div>

        </div>
    </div>
</template>

<script>

export default {
    name: 'SettingsPaymentSelectPlan',

    data() {
        return {
            
        };
    }
};

</script>

<style lang="scss" scoped>
    // .yogo-plan-card:hover {
    //     cursor: pointer;
    // }

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

// .pagination-top-container {
//   padding-bottom: 5px;
//   background: rgb(236, 239, 241);
// }

// .pagination-bottom-container {
//   padding-top: 5px;
//   background: rgb(236, 239, 241);
// }

// .yogo-table-content {
//   overflow-x:scroll;
// }

// table {
//   width: 100%;
//   border-spacing: 0;
//   border-collapse: collapse;
//   overflow: hidden;

//   th {
//     text-align: left;
//     padding: 0;
//     position: relative;
//     font-size: 12px;
//     line-height: 16px;
//     color: rgba(0, 0, 0, 0.54);

//     &.numeric {
//       text-align: right;
//     }

//     .table-sort-arrow {
//       opacity: 0;
//       width: 16px;
//       height: 16px;
//       transition: .3s cubic-bezier(.4, 0, .2, 1);
//     }

//     &.sortable {
//       cursor: pointer;
//     }

//     &.sortable:hover .table-sort-arrow,
//     &.sorted .table-sort-arrow {
//       opacity: 1;
//     }

//     &.sorted-desc .table-sort-arrow {
//       transform: rotate(180deg);
//     }
//   }


//   td {
//     height: 48px;
//     position: relative;
//     transition: .3s cubic-bezier(.4, 0, .2, 1);
//     font-size: 13px;
//     line-height: 18px;
//   }

//   tr.md-has-selection:hover {

//     td {
//       background: rgba(0, 0, 0, 0.08);
//     }

//   }

// }

</style>
