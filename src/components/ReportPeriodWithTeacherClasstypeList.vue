<template>

    <div class="flex flex-wrap">

        <div class="flex--20 mr10-md min-h-14">
            <label>{{ $t('global.FromDate') }}</label>
            <datepicker v-model="fromDate" :monday-first="true"></datepicker>
        </div>

        <div class="flex--20 mr10-md min-h-14">
            <label>{{ $t('global.EndDate') }}</label>
            <datepicker v-model="endDate" :monday-first="true"></datepicker>
            <label v-bind:style="{ fontSize: '12px', color: 'red'  }">{{ $t('global.MaxTimePeriodIsOneYear') }}</label>
        </div>

        <div class="flex--25 mr10-md min-h-14">
            <label>{{ $t('global.Teacher') }}</label>
            <YogoTreeselectTeacher v-bind.sync="selectedTeachers"></YogoTreeselectTeacher>      
        </div>

        <div class="flex--25">
            <label>{{ $t('global.ClassType') }}</label>
            <YogoTreeselectClassTypes2 v-bind.sync="selectedClassTypes"></YogoTreeselectClassTypes2>      
        </div>
        <div class="flex--25 mr10-md min-h-14">
            <md-checkbox v-model="onlyPhysicalAttendance">{{ $t('global.OnlyPhysicalAttendance') }}</md-checkbox>
        </div>
        <div class="flex--25 mr10-md min-h-14">
            <md-checkbox v-model="onlyLivestream">{{ $t('global.OnlyLivestream') }}</md-checkbox>
        </div>
        <div class="flex--25 mr10-md min-h-14">
            <md-checkbox v-model="onlyClassPassEnabled">{{ $t('global.OnlyClassPassEnabled') }}</md-checkbox>
        </div>
    </div>


</template>

<script>
    import Datepicker from 'vuejs-datepicker'
    import moment from 'moment'
    import YogoTreeselectTeacher from '@/components/ui/YogoTreeselectTeacher';
    import YogoTreeselectClassTypes2 from '@/components/ui/YogoTreeselectClassTypes2';


    export default {
        components: {
            Datepicker,
            YogoTreeselectTeacher,
            YogoTreeselectClassTypes2
        },
        name: 'reportperiodwithteacherclasstypelist',
        data() {
            return {
                selectedTeachers: {
                    teachers: []
                },
                selectedClassTypes: {
                    classTypes: []
                },
                onlyPhysicalAttendance: false,
                onlyLivestream: false,
                onlyClassPassEnabled: false,
            }
        },
        watch: {
            selectedTeachers: {
                handler: function (newTeachers) {
                    console.log("update teachers");
                    this.$emit('update:teachers', newTeachers);
                    this.$emit('update:dataUpdated', true);
                },
                deep: true,
            },
            selectedClassTypes: {
                handler: function (newClassTypes) {
                    console.log("update classTypes");
                    this.$emit('update:classTypes', newClassTypes);
                    this.$emit('update:dataUpdated', true);
                },
                deep: true,
            },
            onlyPhysicalAttendance(newOnlyPhysicalAttendance, oldOnlyPhysicalAttendance) {
                if (newOnlyPhysicalAttendance !== oldOnlyPhysicalAttendance) {
                    this.$emit('update:onlyPhysicalAttendance', newOnlyPhysicalAttendance);
                    this.$emit('update:dataUpdated', true);
                }
            },
            onlyLivestream(newOnlyLivestream, oldOnlyLivestream) {
                if (newOnlyLivestream !== oldOnlyLivestream) {
                    this.$emit('update:onlyLivestream', newOnlyLivestream);
                    this.$emit('update:dataUpdated', true);
                }
            },
            onlyClassPassEnabled(newOnlyClassPassEnabled, oldOnlyClassPassEnabled) {
                if (newOnlyClassPassEnabled !== oldOnlyClassPassEnabled) {
                    this.$emit('update:onlyClassPassEnabled', newOnlyClassPassEnabled);
                    this.$emit('update:dataUpdated', true);
                }
            },
        // endDate(newEndDate) {
        //   this.$emit('update:endDate', newEndDate)
        // },
        },
        props: {
        },
        computed: {
            years() {
                const currentYear = moment().year()
                const firstYear = Math.max(2018, currentYear - 9)
                return _.range(currentYear, firstYear - 1)
            },
            months() {
                const months = []
                for (var i = 0; i <= 11; i++) {
                    months.push(
                        _.upperFirst(
                        moment().month(i).format('MMMM'),
                        ),
                    )
                }
                return months
            }, 
            fromDate: {
                get: function() {
                    const today = new Date();
                    let yy = today.getFullYear();
                    let mm = today.getMonth() - 1;

                    if (mm < 0) {
                        mm += 12;
                        yy -= 1;
                    }

                    return new Date(yy, mm, 1);
                    sendDateTime = moment.tz(sendDate + ' ' + this.form.sendTime, 'Europe/Copenhagen')
                }, 
                set: function(date) {
                    this.$emit('update:fromDate', date);                    
                    this.validateDuration(date, this.endDate);
                }
            },
            endDate: {
                get: function() {
                    const today = new Date();
                    let yy = today.getFullYear();
                    let mm = today.getMonth();

                    return new Date(yy, mm, 0);
                },
                set: function(date) {
                    this.$emit('update:endDate', date);
                    this.validateDuration(this.fromDate, date);
                }
            }
        },    
        mounted() {
            this.$emit('update:fromDate', this.fromDate);
            this.$emit('update:endDate', this.endDate);
            // this.$emit('update:dataUpdated', true);
        },

        methods: {
            validateDuration(f, e) {
                const limitDate = moment(f, 'YYYY-MM-DD').add(1, 'years');
                if (limitDate < e) {
                    this.invalidDuration = true;
                } else {
                    this.invalidDuration = false;
                    console.log("==", f, limitDate, e);
                }
                this.$emit('update:invalidDuration', this.invalidDuration);
                this.$emit('update:dateUpdated', true);
                this.$emit('update:dataUpdated', true);
            },
        },
    }

</script>
