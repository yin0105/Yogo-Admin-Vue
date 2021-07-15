<template>

  <eventgroupform formType="edit"></eventgroupform>

</template>

<script>
    import EventGroupForm from './EventGroupForm'

    export default {
        name: 'eventgroupedit',
        components: {
            eventgroupform: EventGroupForm,
        },
    }
</script>