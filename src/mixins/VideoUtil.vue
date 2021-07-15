<template>
  <div></div>
</template>

<script>

  export default {

    methods: {
      getVideoThumbnailSrc(video, width) {
        if (video.video_provider_data.pictures.type === 'custom') {
          width = width || 150;
          const thumbnailUri = video.video_provider_data.pictures.sizes[0].link
          const pictureId = /\d{7,}/.exec(thumbnailUri)[0]
          return `https://i.vimeocdn.com/video/${pictureId}_${width}.jpg`
        } else {
          return 'https://i.vimeocdn.com/video/default_150x84.png'
        }
      },
    }
  }

</script>
