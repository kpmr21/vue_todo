import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    todos: [],
    todoFilter: '',
    targetTodo: {
      id: null,
      title: '',
      detail: '',
      completed: '',
    },
    // errorMessage: 'エラーが起きました。', // デフォルトの記述
    errorMessage: '', // 追記
    // emptyMessage: 'やることリストは空です。', // デフォルトの記述
    emptyMessage: '', // 追記
  },
  getters: {
    completedTodos: (state) => state.todos.filter((todo) => todo.completed),
    incompleteTodos: (state) => state.todos.filter((todo) => !todo.completed),
    completedTodosLength: (state, getters) => getters.completedTodos.length,
    incompleteTodosLength: (state, getters) => getters.incompleteTodos.length,
  },
  mutations: {
    setTodoFilter(state, routeName) {
      state.todoFilter = routeName;
    },
    setEmptyMessage(state, routeName) {
      if (routeName === 'completedTodos') {
        // let emptyMessage = '完了済みのやることリストはありません。'; // デフォルトの記述
        state.emptyMessage = '完了済みのやることリストはありません。'; // 追記
      } else if (routeName === 'incompleteTodos') {
        // let emptyMessage = '未完了のやることリストはありません。'; // デフォルトの記述
        state.emptyMessage = '未完了のやることリストはありません。'; // 追記
      } else {
        // let emptyMessage = 'やることリストには何も登録されていません。'; // デフォルトの記述
        state.emptyMessage = 'やることリストには何も登録されていません。'; // 追記
      }
    },
    initTargetTodo(state) {
      state.targetTodo = {
        id: null,
        title: '',
        detail: '',
        completed: false,
      };
    },
    hideError(state) {
      // state.errorMessage = 'エラーが起きました。';
      state.errorMessage = ''; // 追記
    },
    showError(state, payload) {
      if (payload) {
        // const errorMessage = payload.data;
        state.errorMessage = payload.data; // 追記
      } else {
        state.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    },
    updateTargetTodo(state, { name, value }) {
      state.targetTodo[name] = value;
    },
    getTodos(state, payload) {
      state.todos = payload.reverse();
    },
    addTodo(state, payload) {
      state.todos.unshift(payload);
    },
    showEditor(state, payload) {
      state.targetTodo = Object.assign({}, payload);
    },
    editTodo(state, payload) {
      state.todos = state.todos.map((todoItem) => {
        if (todoItem.id === payload.id) return payload;
        return todoItem;
      });
    },
    // 追記
    deleteTodo(state, payload) {
      state.todos = payload.todos.reverse();
    },
  },
  actions: {
    setTodoFilter({ commit }, routeName) {
      commit('setTodoFilter', routeName);
    },
    setEmptyMessage({ commit }, routeName) {
      commit('setEmptyMessage', routeName);
    },
    updateTargetTodo({ commit }, { name, value }) {
      commit('updateTargetTodo', { name, value });
    },
    getTodos({ commit }) {
      axios.get('http://localhost:3000/api/todos/').then(({ data }) => {
        commit('getTodos', data.todos);
      }).catch((err) => {
        commit('showError', err.response);
      });
    },

    // 登録ボタンクリック時の処理
    addTodo({ commit, state }) {
      // 登録ボタンクリック時 : 入力値が空白の場合
      if (!state.targetTodo.title || !state.targetTodo.detail) {
        commit({
          type: 'showError',
          data: 'タイトルと内容はどちらも必須項目です。',
        });
        return;
      };
      // 登録ボタンクリック時 : 入力した場合の処理
      const postTodo = Object.assign({}, {
        title: state.targetTodo.title,
        detail: state.targetTodo.detail,
      });
      axios.post('http://localhost:3000/api/todos/', postTodo)
      // axios通信成功時
      .then(({ data }) => {
        commit('addTodo', data); // おそらく第二引数のdataをmutation内addTodoのpayloadに渡してる
      })
      // エラー発生時
      .catch((err) => {
        commit('showError', err.response);
      });
      commit('hideError'); // 追記 addTodoメソッド実行前にエラーを表示してる場合 : エラー表示を削除する処理
      commit('initTargetTodo'); // 登録後 input , textareaを空白にする処理
    },

    // 完了、未完了ボタンクリック時
    changeCompleted({ commit }, todo) {
      const targetTodo = Object.assign({}, todo);
      axios.patch(`http://localhost:3000/api/todos/${targetTodo.id}`, {
        completed: !targetTodo.completed,
      })
      // axios通信成功時
      .then(({ data }) => {
        commit('editTodo', data);
      })
      // エラー発生時
      .catch((err) => {
        commit('showError', err.response);
      });
      commit('hideError'); // 追記 changeCompletedTodoメソッド実行前にエラーを表示してる場合 : エラー表示を削除する処理
      commit('initTargetTodo'); // 完了、未完了ボタンクリック後 input , textareaを空白にする処理
    },

    // 編集ボタンクリック時
    showEditor({ commit }, todo) {
      commit('showEditor', todo);
    },

    // 変更ボタンクリック時
    editTodo({ commit, state }) {
      const targetTodo = state.todos.find(todo => todo.id === state.targetTodo.id);
      // 入力値を変更しなかった場合の処理
      if (
        targetTodo.title === state.targetTodo.title
        && targetTodo.detail === state.targetTodo.detail
      ) {
        commit('initTargetTodo');
        return;
      }
      // 入力値を変更した場合の処理
      axios.patch(`http://localhost:3000/api/todos/${state.targetTodo.id}`, {
        title: state.targetTodo.title,
        detail: state.targetTodo.detail,
      })
      // axios通信成功時
      .then(({ data }) => {
        commit('editTodo', data);
      })
      // エラー発生時
      .catch((err) => {
        commit('showError', err.response);
      });
      commit('hideError'); // 追記 editTodoメソッド実行前にエラーを表示してる場合 : エラー表示を削除する処理
      commit('initTargetTodo');
    },

    // 削除ボタンクリック時
    deleteTodo({ commit }, todoId) {
      axios.delete(`http://localhost:3000/api/todos/${todoId}`)
      // axios通信成功時
      .then(({ data }) => {
        // 処理
        commit('deleteTodo', data); // 追記
      })
      // エラー発生時
      .catch((err) => {
        // 処理
        commit('showError', err.response); // 追記 エラー表示する処理
      });
      // 必要があれば処理
      commit('hideError'); // 追記 deleteTodoメソッド実行前にエラーを表示してる場合 : エラー表示を削除する処理
      commit('initTargetTodo'); // 追記 deleteTodoメソッド実行前にinput textareaにテキストが合った場合 : テキストを削除する処理
    },
  },
});

export default store;
