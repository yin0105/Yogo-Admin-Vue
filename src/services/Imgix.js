import qs from 'qs';
import avatar from '../graphics/avatar';
import avatarWhite from '../graphics/avatar-white';


import envConfig from '../../env_config';

const buildURL = (filename, options) => {
  if (!filename) {
    return '';
  }
  const query = qs.stringify(options);
  return `https://${envConfig.imageServerImgix}/${filename}?${query}`;
};

const profileImageSrc = (image, opt, white = false) => {
  if (!image) {
    return white ? avatarWhite : avatar;
  }
  const options = _.assign(
    {
      w: 120,
      h: 120,
      fit: 'crop',
    },
    opt,
  );
  return buildURL(image.filename, options);
};

export default {
  methods: {
    Imgix: buildURL,
    profileImageSrc,
  },
};


