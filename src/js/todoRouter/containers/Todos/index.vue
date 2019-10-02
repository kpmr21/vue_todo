<template lang="html">
  <app-wrapper :todos="todos">
    <app-navi />
    <app-register
      v-if="todoFilter !== 'completedTodos'"
      :todo-id="targetTodo.id"
      :todo-title.sync="targetTodo.title"
      :todo-detail.sync="targetTodo.detail"
      :todo-rows="rows"
      @addTodo="addTodo"
      @editTodo="editTodo"
    />
    <!--
      :todo-title.sync = "targetTodo.title" => v-bind:todo-title="targetTodo.title" v-on:update:todoTitle="targetTodo.title = $event"

      :todo-detail="targetTodo.detail"
      @update:todoDetail="targetTodo.detail = $event"

      :props名="dataの値" => 子へ渡すprops
      @update:props名="dataの値 = 上の「propsに指定したい値」" => 子のイベント購読
    -->
    <app-error-message
      v-if="errorMessage"
      :error-message="errorMessage"
    />
    <template v-slot:todos>
      <app-list
        v-if="filteredTodos.length"
        :todos="filteredTodos"
        @changeCompleted="changeCompleted"
        @showEditor="showEditor"
        @deleteTodo="deleteTodo"
      />
      <app-empty-message
        v-else
        :empty-message="emptyMessage"
      />
    </template>
  </app-wrapper>
</template>

<script>
import axios from 'axios';

import Wrapper from 'TodoRouterDir/components/Wrapper';
import Navi from 'TodoRouterDir/components/Navi';
import { ErrorMessage, EmptyMessage } from 'TodoRouterDir/components/Message'; //{ ErrorMessage, EmptyMessage } => Messageディレクトリ内 Error.vue , Empty.vueからそれぞれ exportしてるErrorMessage, EmptyMessageをimport
import Register from 'TodoRouterDir/components/Register';
import List from 'TodoRouterDir/components/List';

export default {
  components: {
    appWrapper: Wrapper,
    appNavi: Navi,
    appErrorMessage: ErrorMessage,
    appEmptyMessage: EmptyMessage,
    appList: List,
    appRegister: Register,
  },
  data() {
    return {
      todos: [],
      todoFilter: '',
      filteredTodos: [],
      targetTodo: {
        id: null,
        title: '',
        detail: '',
        completed: '',
      },
      errorMessage: '',
      emptyMessage: '',
    };
  },
  computed: {
    rows() {
      const num = this.targetTodo.detail.split('\n').length;
      return (num > 3) ? num : 3;
    },
  },
  watch: {
    $route() {
      this.setFilter();
    },
    todos() {
      this.setFilter();
    },
  },
  created() {
    axios.get('http://localhost:3000/api/todos/').then(({ data }) => {
      this.todos = data.todos.reverse();
      this.setFilter(); // setFilterメソッドを実行 / setFilterメソッドは methods内に定義してる
    }).catch((err) => {
      this.showError(err);
      this.setFilter();
    });
  },
  methods: {
    // 「全て表示」「未完了のみ表示」「完了済みのみ表示」 : 切り替え時
    setFilter() {
      const routeName = this.$route.name; // 変数 routeName = 選択したroute.nameを代入(今表示してるname)
      // console.log(routeName); // route.name ・・・ src/js/todoRorter/routes.js内の 変数 routesに格納してる配列内のオブジェクト内のkey(name)のvalueを取得
      this.todoFilter = routeName; // this.todoFilter(文字列 : リアクティブプロパティ)にrouterNameを代入
      if (routeName === 'completedTodos') {
        // this.filteredTodos(リアクティブプロパティ : 配列)
        // filterメソッドで this.todos(リアクティブプロパティ : 配列)内のtodo.completed = true の要素を取り出し新たな配列に格納
        // this.filteredTodos(リアクティブプロパティ : 配列)に filterメソッドで作成した配列を代入
        // マークアップ部分 <app-list v-if="filteredTodos.length"> で表示
        this.filteredTodos = this.todos.filter(todo => todo.completed);
      } else if (routeName === 'incompleteTodos') {
        this.filteredTodos = this.todos.filter(todo => !todo.completed);
      } else {
        this.filteredTodos = this.todos;
      }
      // !this.filteredTodos.length => this.filteredTodos(リアクティブプロパティ : 配列)の要素数が 0
      // setEmptyMessageメソッドを実行
      if (!this.filteredTodos.length) this.setEmptyMessage();
    },
    setEmptyMessage() {
      if (this.todoFilter === 'completedTodo') {
        this.emptyMessage = '完了済みのやることリストはありません。';
      } else if (this.todoFilter === 'incompleteTodo') {
        this.emptyMessage = '未完了のやることリストはありません。';
      } else {
        this.emptyMessage = 'やることリストには何も登録されていません。';
      }
    },
    initTargetTodo() {
      return {
        id: null,
        title: '',
        detail: '',
        completed: false,
      };
    },
    hideError() {
      this.errorMessage = '';
    },
    showError(err) {
      if (err.response) {
        this.errorMessage = err.response.data.message;
      } else {
        this.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    },
    addTodo() {
      if (!this.targetTodo.title || !this.targetTodo.detail) {
        this.errorMessage = 'タイトルと内容はどちらも必須項目です。';
        return;
      }
      const postTodo = Object.assign({}, {
        title: this.targetTodo.title,
        detail: this.targetTodo.detail,
      });
      axios.post('http://localhost:3000/api/todos/', postTodo).then(({ data }) => {
        this.todos.unshift(data);
        this.targetTodo = this.initTargetTodo(); // this.targetTodo(リアクティブプロパティ)にinitTargetTodoメソッドを実行
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
    changeCompleted(todo) {
      this.targetTodo = this.initTargetTodo(); // input , textarea を空白にする
      const targetTodo = Object.assign({}, todo);
      axios.patch(`http://localhost:3000/api/todos/${targetTodo.id}`, {
        completed: !targetTodo.completed,
      }).then(({ data }) => {
        this.todos = this.todos.map((todoItem) => {
          if (todoItem.id === targetTodo.id) return data;
          return todoItem;
        });
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
    showEditor(todo) {
      this.targetTodo = Object.assign({}, todo);
    },
    editTodo() {
      const targetTodo = this.todos.find(todo => todo.id === this.targetTodo.id);
      if (
        targetTodo.title === this.targetTodo.title
        && targetTodo.detail === this.targetTodo.detail
      ) {
        this.targetTodo = this.initTargetTodo();
        return; // editTodoメソッドの処理を終了させる
      }
      axios.patch(`http://localhost:3000/api/todos/${this.targetTodo.id}`, {
        title: this.targetTodo.title,
        detail: this.targetTodo.detail,
      }).then(({ data }) => {
        this.todos = this.todos.map((todo) => {
          if (todo.id === this.targetTodo.id) return data;
          return todo;
        });
        this.targetTodo = this.initTargetTodo();
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
    deleteTodo(id) {
      this.targetTodo = this.initTargetTodo();
      axios.delete(`http://localhost:3000/api/todos/${id}`).then(({ data }) => {
        this.todos = data.todos.reverse();
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
  },
};
</script>
