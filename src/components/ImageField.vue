<template>
  <md-field v-bind:class="{'md-invalid': showImageDimensionsError, 'image-upload-field':true}"
            :data-image-format="imageFormat">

    <div :class="imageFormat + '__image--edit'">
      <img :src="imagePreviewSrc" v-images-loaded="imageDidLoad">
      <div class="overlay--edit">
        <span class="icon-camera_alt"></span>
        <input @change="uploadImage" type="file" accept="image/*" tabindex="100">
      </div>

      <md-progress-spinner
          v-if="imageFormat === 'profile' && imageIsLoading"
          md-mode="determinate"
          :md-value="imageUploadProgress"
          class="image-upload-progress"
          :md-diameter="imageUploaderSize"
      ></md-progress-spinner>

      <md-progress-spinner
          v-if="imageFormat === 'profile' && imageIsWaiting"
          md-mode="indeterminate"
          class="image-upload-progress"
          :md-diameter="imageUploaderSize"
      ></md-progress-spinner>

      <md-progress-bar
          v-if="imageFormat !== 'profile' && imageIsLoading"
          md-mode="determinate"
          :md-value="imageUploadProgress"
          class="image-upload-progress"
      ></md-progress-bar>

      <md-progress-bar
          v-if="imageFormat !== 'profile' && imageIsWaiting"
          md-mode="indeterminate"
          class="image-upload-progress"
      ></md-progress-bar>
      <div type="button" class="remove-image-button" v-if="imageId && !imageIsWaiting && !imageIsLoading"
           @click.stop="removeImage"><span class="icon-close"></span></div>
    </div>
    <span class="md-error"
          v-if="showImageDimensionsError">Billedet skal mindst være {{
        imageFormatMinSizes[imageFormat].width + 'x' + imageFormatMinSizes[imageFormat].height
      }} px og enten jpg, png eller svg
    </span>

  </md-field>
</template>

<script>

import YogoApi from '@/gateways/YogoApi'
import imagePlaceholders from '@/graphics/imagePlaceholders'
import { mapGetters } from 'vuex'
import imagesLoaded from 'vue-images-loaded'
import Imgix from '../services/Imgix'

export default {
  name: 'imagefield',
  props: ['imageFormat', 'imageId'],
  directives: {
    imagesLoaded,
  },
  mixins: [Imgix],
  data() {
    return {
      fileInputValue: '',
      imagePreviewSrc: imagePlaceholders[this.imageFormat],
      showImageDimensionsError: false,
      imageIsLoading: false,
      imageIsWaiting: false,
      imageUploadProgress: 0,

      imageFormatMinSizes: {
        profile: {
          width: 400,
          height: 400,
        },
        landscape: {
          width: 790,
          height: 200,
        },
        square: {
          width: 640,
          height: 640,
        },
      },

      windowWidth: 0,

      internalImageId: 0,
    }
  },
  computed: {
    imageUploaderSize() {
      switch (this.imageFormat) {
        case 'profile':
          return 100
          break
        case 'landscape':
          return 100
          break
        case 'square':
          return 100
          break
      }

    },
  },
  mounted() {
    if (this.imageId) {
      this.internalImageId = this.imageId
      this.fetchInitialImage()
    }
    this.$nextTick(function () {
      window.addEventListener('resize', this.getWindowWidth)
      this.getWindowWidth()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getWindowWidth)
  },
  watch: {
    imageId(newImageId) {
      if (newImageId && newImageId !== this.internalImageId) {
        this.internalImageId = newImageId
        this.fetchInitialImage()
      }
    },
  },
  methods: {
    async fetchInitialImage() {
      const image = await YogoApi.get('/images/' + this.internalImageId)

      const { width: w, height: h } = this.imageFormatMinSizes[this.imageFormat]
      this.imagePreviewSrc = this.Imgix(image.filename, {
        w,
        h,
        fit: 'crop',
      })

    },
    uploadImage: async function (e) {
      this.showImageDimensionsError = false

      let files = e.target.files
      if (!files[0]) {
        return
      }

      try {

        this.imageIsWaiting = true

        let readerResult = await this.getFileReaderResult(files[0])

        let imageSize = await this.getImageSizeFromReaderResult(readerResult)

        if (imageSize.width < this.imageFormatMinSizes[this.imageFormat].width || imageSize.height < this.imageFormatMinSizes[this.imageFormat].height) {
          this.showImageDimensionsError = true
          this.imageIsWaiting = false
          return
        }


        let data = new FormData()
        data.append('image', files[0])

        this.imageIsWaiting = false
        this.imageIsLoading = true
        this.imageUploadProgress = 0


        const image = await YogoApi.request({
          url: `/images/${imageSize.width}/${imageSize.height}`,
          method: 'post',
          data: data,
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            this.imageUploadProgress = Math.round(progressEvent.loaded / progressEvent.total * 100)
            if (this.imageUploadProgress === 100) {
              this.imageIsLoading = false
              this.imageIsWaiting = true
            }
          },
        })

        this.imagePreviewSrc = this.Imgix(
            image.filename,
            {
              w: this.imageFormatMinSizes[this.imageFormat].width,
              h: this.imageFormatMinSizes[this.imageFormat].height,
              fit: 'crop'
            },
        )
        this.internalImageId = image.id
        this.$emit('update:imageId', image.id)

        this.imageIsLoading = false
        this.imageIsWaiting = true

      } catch (err) {

        console.log(err.message)

      }

    },
    async getFileReaderResult(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.readAsDataURL(file)
      })
    },
    async getImageSizeFromReaderResult(readerResult) {
      return new Promise((resolve, reject) => {
        let i = new Image()
        i.onload = () => {
          resolve({
            width: i.width,
            height: i.height,
          })
        }
        i.src = readerResult
      })
    },
    getWindowWidth(event) {
      this.windowWidth = document.documentElement.clientWidth
    },
    imageDidLoad(instance) {
      if (this.imageIsWaiting) {
        this.imageIsWaiting = false
      }
    },
    removeImage() {
      this.imagePreviewSrc = imagePlaceholders[this.imageFormat]
      this.internalImageId = null
      this.$emit('update:imageId', null)
    },
  },


}

</script>

<style lang="scss" scoped>
.remove-image-button {
  position: absolute;
  right: -5px;
  top: -5px;
  background: white;
  padding: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  border-radius: 50%;
  cursor: pointer;
}
</style>
