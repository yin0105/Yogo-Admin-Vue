<template>
  <div>
    <md-table v-model="customerClassPasses" md-sort="valid_until" md-sort-order="asc" md-card
              @md-selected="onSelectClassPass">
      <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
        <md-table-cell :md-label="$t('global.ClassPassType')">{{ item.class_pass_type.name }}</md-table-cell>
        <md-table-cell :md-label="$t('global.InitialNumberOfClasses')" md-sort-by="classes_initially" md-numeric>
          {{ item.class_pass_type.pass_type === 'fixed_count' ? item.class_pass_type.number_of_classes : '---' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.NumberOfClassesLeft')" md-sort-by="classes_left" md-numeric>
          {{ item.class_pass_type.pass_type === 'fixed_count' ? item.classes_left : '---' }}
        </md-table-cell>
        <md-table-cell :md-label="$t('global.ValidUntil')" md-sort-by="valid_until">
          {{ item.valid_until | moment('D. MMMM YYYY') }}
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
export default {
  name: 'CustomerClassPasses',
  props: ['customerClassPasses'],
  methods: {
    onSelectClassPass(classPass) {
      this.$router.push({
        name: 'ClassPassEdit',
        params: { id: classPass.id },
      });
    },
  },
};
</script>
