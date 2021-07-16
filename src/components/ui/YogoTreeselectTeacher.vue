<template>
  <Treeselect
      :value="value"
      @input="updateValue"
      :multiple="true"
      :options="treeSelectClassTypesOptions"
      :clearable="false"
      :defaultExpandLevel="1"
      value-consists-of="LEAF_PRIORITY"
      :no-options-text="$t('global.NoTeacherCreatedYet')"
  />
</template>

<script>

import Treeselect from '@riophae/vue-treeselect';
import YogoApi from '@/gateways/YogoApi';

export default {
  name: 'YogoTreeselectTeacher',
  components: { Treeselect },
  data() {
    return {
      classTypes: [],
    };
  },
  props: ['value'],
  computed: {
    treeSelectClassTypesOptions() {
      return this.classTypes.length
          ? [
            {
              id: 'all_classTypes',
              label: this.$t('global.AllClassTypes'),
              children: _.sortBy(
                  _.map(this.classTypes, classType => {
                    return {
                      id: classType.id,
                      label: classType.name,
                    };
                  }),
                  'label',
              ),
            },
          ]
          : [];
    },
  },
  async created() {
    this.classTypes = await YogoApi.get('/class-types');
    this.classTypes = _.sortBy(this.classTypes, 'name');
  },
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue);
    },
  },
};

</script>
