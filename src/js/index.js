import Vue from 'vue'; // npm vue のパッケーじをインストール
// import VueRouter from 'vue-router';

// import routes from 'TodoRouterDir/routes';
// import routes from 'TodoVuexDir/routes';
// import store from 'TodoVuexDir/store';
// import routes from 'VuexSample/routes';
// import store from 'VuexSample/store';

import '../scss/global.scss';

// import myApp from './first';
import myApp from 'TodoDir'; // TodoDir: `${src}/js/todo` / const src = path.resolve(__dirname, './src');
// import myApp from 'TodoRouterDir';
// import myApp from 'TodoVuexDir';
// import myApp from 'VuexSample';

// Vue.use(VueRouter);
// const router = new VueRouter({
//   routes,
//   mode: 'history',
// });

new Vue({
  el: '#app', //index.html id = app レンダリング先 バンドルでまとめてhtmlに反映させてる
  // router,
  // store,
  render: h => h(myApp), // templateタグ内のレンダリングを実行 参考 => https://qiita.com/teinen_qiita/items/ed1bb1909a17f9ca9daa
  // render: h => h(myApp), は↓の書き方を短くしたもの
  // render: function (createElement) {
  //   return createElement(myApp)
  // }
});
