import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from 'TodoVuexDir/routes';
import store from 'TodoVuexDir/store';
import '../scss/global.scss';
import myApp from 'TodoVuexDir';

Vue.use(VueRouter);
const router = new VueRouter({
  routes,
  mode: 'history',
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(myApp),
});
