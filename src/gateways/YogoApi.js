import axios from 'axios';
import router from '../router';
import { MdDialogAlert } from 'vue-material/dist/components';
import Vue from 'vue';
import store from '@/store';

import envConfig from '../../env_config';

if (envConfig) {
  console.info('%cUsing api root: ' + envConfig.apiRoot, 'color:darkgreen;');
} else {
  alert('You need to select which API to use. Please specify an apiRoot in the file api_config.js in the root dir.\nAlso, for local development, you need to specify clientId in the same file.');
}


let yogoApi = axios.create({
  baseURL: envConfig.apiRoot,
});

yogoApi.interceptors.response.use(function (response) {
  const responseData = response.data;
  if (responseData.error) {
    store.dispatch('alert/show', {
      title: responseData.error.localized_title,
      message: responseData.error.localized_message
    });
    return responseData;
  }
  return response.data;
}, function (error) {
  console.log('Intercepted response error');
  if (error.response.status === 401 || error.response.status === 403) {

    window.localStorage.removeItem('accessToken');
    window.sessionStorage.removeItem('accessToken');

    console.log('Error code ' + error.response.status + '. Clearing access token and redirecting to login');

    router.push({ name: 'Login' });
  }
  return Promise.reject(error);
});

yogoApi.interceptors.request.use(function (config) {
  let headers = config.headers || {};

  if (config.url.indexOf('/login') > -1) {
    // Don't send access token to login
    if (headers.Authorization) delete headers.Authorization;
  } else {
    // Send access- token to all other routes, if available
    let accessToken = window.localStorage.getItem('accessToken') || window.sessionStorage.getItem('accessToken');

    if (accessToken) {
      headers.Authorization = 'Bearer ' + accessToken;
    }
  }

  headers['X-Yogo-Request-Context'] = 'admin';

    if (envConfig.clientId) {
    headers['X-Yogo-Client-ID'] = envConfig.clientId;
    }
  config.headers = headers;

  return config;

}, function (error) {
  console.log(error.message);
});

export default yogoApi;
