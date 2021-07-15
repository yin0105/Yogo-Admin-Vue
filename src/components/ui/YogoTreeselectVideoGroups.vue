<template>
  <Treeselect
      :value="value"
      @input="updateValue"
      :multiple="true"
      :options="treeSelectVideoGroupOptions"
      :clearable="false"
      :defaultExpandLevel="1"
      value-consists-of="LEAF_PRIORITY"
      :no-options-text="$t('global.NoVideoGroupsCreatedYet')"
  />
</template>

<script>

import Treeselect from '@riophae/vue-treeselect';
import YogoApi from '@/gateways/YogoApi';

export default {
  name: 'YogoTreeselectVideoGroups',
  components: { Treeselect },
  data() {
    return {
      videoGroups: [],
    };
  },
  props: ['value'],
  computed: {
    treeSelectVideoGroupOptions() {
      return this.videoGroups.length
          ? [
            {
              id: 'all_videoGroups',
              label: this.$t('global.AllVideoGroups'),
              children: _.sortBy(
                  _.map(this.videoGroups, videoGroup => {
                    return {
                      id: videoGroup.id,
                      label: videoGroup.name,
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
    this.videoGroups = await YogoApi.get('/video-groups');
    this.videoGroups = _.sortBy(this.videoGroups, 'name');
  },
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue);
    },
  },
};

</script>
