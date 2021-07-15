<template>
  <div class="flex--row">
    <md-field class="flex--25" :class="getValidationClass('name')">
      <label>{{ $t('global.CampaignName') }}</label>
      <md-input type="text" v-model="value.name"></md-input>
      <span class="md-error"
            v-if="!$v.name.required">{{ $t('global.MustBe') }}</span>
    </md-field>

    <md-field class="flex--25"
              :class="getValidationClass('number_of_months_at_reduced_price')">
      <label>{{ $t('global.MonthsReducedPrice') }}</label>
      <md-input type="number" min="0"
                v-model="value.number_of_months_at_reduced_price"></md-input>
      <span class="md-error"
            v-if="!$v.number_of_months_at_reduced_price.required">{{ $t('global.MustBe') }}</span>
    </md-field>

    <md-field class="flex--25" :class="getValidationClass('reduced_price')">
      <label>{{ $t('global.ReducedPrice') }}</label>
      <md-input type="number" min="0" v-model="value.reduced_price"></md-input>
      <span class="md-error"
            v-if="!$v.reduced_price.required">{{ $t('global.MustBe') }}</span>
    </md-field>

    <md-field class="flex--25"
              :class="getValidationClass('min_number_of_months_since_customer_last_had_membership_type')">
      <label>{{ $t('global.RebuyNotPossibleMonth') }}</label>
      <md-input type="number" min="0"
                v-model="value.min_number_of_months_since_customer_last_had_membership_type"></md-input>
      <span class="md-error"
            v-if="!$v.min_number_of_months_since_customer_last_had_membership_type.required">{{ $t('global.MustBe') }}</span>
    </md-field>
  </div>
</template>

<script>

  export default {
    props: {
      value: {
        type: Object,
        required: true,
      },
      $v: {
        type: Object,
        required: true,
      },
    },
    methods: {
      getValidationClass(fieldPath) {

        const field = _.get(this.$v, fieldPath)

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty,
          }
        }
      },
    },
    watch: {
      value() {
        this.$emit('input', this.value)
      },
    },
  }
</script>
