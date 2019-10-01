import Vue from 'vue'; // npm内 => vueのpackegeをインストール
import VueRouter from 'vue-router'; // SPA(シングルページアプリケーション)をルーティングする為のVue.js公式のパッケージ

import routes from 'TodoRouterDir/routes'; // routes.jsでルーティングの定義を行う配列を呼び出す
// import routes from 'TodoVuexDir/routes';
// import store from 'TodoVuexDir/store'; // store/index.jsをimport
// import routes from 'VuexSample/routes';
// import store from 'VuexSample/store';

import '../scss/global.scss'; // style-loaderでglobal.scssを反映させてる

// import myApp from './first';
// import myApp from 'TodoDir'; // TodoDir: `${src}/js/todo` / const src = path.resolve(__dirname, './src');
import myApp from 'TodoRouterDir';// todorouter/index.vueをインポート(ファイルの直下のindexとながついてるものをインポート)
// import myApp from 'TodoVuexDir';
// import myApp from 'VuexSample';

// ルーティング用のインスタンス
Vue.use(VueRouter); // Vue.use(プラグイン); => Vue.js用のプラグインを使用時の記述
const router = new VueRouter({
  routes,
  mode: 'history',
});

new Vue({
  el: '#app', //index.html id = app レンダリング先 バンドルでまとめてhtmlに反映させてる
    router,
    // store,
  render: h => h(myApp), // templateタグ内のレンダリングを実行 参考 => https://qiita.com/teinen_qiita/items/ed1bb1909a17f9ca9daa
  // render: h => h(myApp), は↓の書き方を短くしたもの
  // render: function (createElement) {
  //   return createElement(myApp)
  // }
});
