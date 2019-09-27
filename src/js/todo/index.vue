<template lang="html">
  <div class="todo__wrapper">
    <div class="todo__inner">
      <header class="header">
        <h1 class="header__title">やることリスト</h1>
      </header>

      <main class="main">
        <form class="register">
          <div class="register__input">
            <p class="register__input__title">やることのタイトル</p>
            <input
              v-model="targetTodo.title"
              type="text"
              name="title"
              placeholder="ここにTODOのタイトルを記入してください"
              required
            >
          </div>
          <div class="register__input">
            <p class="register__input__title">やることの内容</p>
            <textarea
              v-model="targetTodo.detail"
              name="detail"
              rows="3"
              placeholder="ここにTODOの内容を記入してください。改行は半角スペースに変換されます。"
              required
            />
          </div>
          <div class="register__submit">
            <button
              class="register__submit__btn"
              type="button"
              name="button"
              @click="(targetTodo.id === null) ? addTodo() : editTodo()"
            >
              <template v-if="targetTodo.id === null">
                <span>登録する</span>
              </template>
              <template v-else>
                <span>変更する</span>
              </template>
            </button>
          </div>
        </form>
        <!--errorMessage表示部分-->
        <div v-if="errorMessage" class="error">
          <p class="error__text">{{ errorMessage }}</p>
        </div>

        <div class="todos">
          <template v-if="todos.length">
          <ul class="todos__list">
            <li v-for="todo in todos"
            :key="todo.id"
            :class="todo.completed ? 'is-completed' : ''"
            >
              <div class="todos__inner">
                <div class="todos__completed">
                  <button
                  class="todos__completed__btn"
                  type="button"
                  @click="changeCompleted(todo)"
                  >
                  <template v-if="todo.completed">
                    <span>完了</span>
                  </template>
                  <template v-else>
                    <span>未完了</span>
                  </template>
                  </button>
                </div>
                <div class="todos__desc">
                  <h2 class="todos__desc__title">{{ todo.title }}</h2>
                  <p class="todos__desc__detail">{{ todo.detail }}</p>
                </div>
                <div class="todos__btn">
                  <button
                  class="todos__btn__edit"
                  type="button"
                  @click="showEditor(todo)"
                  >編集</button>
                  <button
                  class="todos__btn__delete"
                  type="button"
                  @click="deleteTodo(todo.id)"
                  >削除</button>
                </div>
              </div>
            </li>
          </ul>
          </template>

           <template v-else>
            <p class="todos__empty">やることリストには何も登録されていません。</p>
          </template>
        </div>
      </main>

      <footer class="footer">
        <p>全項目数: {{ todos.length }}</p> <!--配列todos内の全ての要素数を表示-->
        <p>完了済: {{ todos.filter(todo => todo.completed).length }}</p> <!--配列todos内のtrueの要素数を表示-->
        <p>未完了: {{ todos.filter(todo => !todo.completed).length }}</p> <!--配列todos内のfalseの要素数を表示-->
      </footer>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      todos: [],
        targetTodo: {
        id: null,
        title: '',
        detail: '',
        completed: false,
      },
      errorMessage: '',
    };
  },
  created() {
    axios.get('http://localhost:3000/api/todos/')
    // axios:通信成功時
    .then(({ data }) => {
      this.todos = data.todos.reverse();
      console.log(data);
    })
    // axios:エラー発生時
    .catch((err) => {
      // axios:通信成功時 :エラー発生時
      if (err.response) {
        this.errorMessage = err.response.data.message;
      }
      // axios:通信失敗時 :エラー発生時
      else {
        this.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    });
  },
  methods: {
    // input , textareaを空白にする処理
    initTargetTodo() {
      return Object.assign({}, {
        id: null,
        title: '',
        detail: '',
        completed: false,
      });
    },
    // errorMessageを削除する処理
    hideError() {
    this.errorMessage = '';
    },
    // axios:エラー発生時の処理
    showError(err) {
      if (err.response) {
        this.errorMessage = err.response.data.message;
      } else {
        this.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    },
    // form : submit時
    addTodo() {
      const postTodo = Object.assign({}, {
        title: this.targetTodo.title,
        detail: this.targetTodo.detail,
      });
      axios.post('http://localhost:3000/api/todos/', postTodo)
      // axios:通信成功時
      .then(({ data }) => {
        this.todos.unshift(data);
        this.targetTodo = this.initTargetTodo();
        this.hideError(); // errorMessageが表示されてる場合 : errorMessageを削除する処理
      })
      // axios:エラー発生時
      .catch((err) => {
        this.showError(err);
      });
    },
    // 完了、未完了ボタンをクリック時
    changeCompleted(todo) {
      // input , textareaを空白にする処理
      this.targetTodo = this.initTargetTodo();

      console.log(todo); // todo => // 完了、未完了ボタンをクリック時のイベント情報(オブジェクト型)
      const targetTodo = Object.assign({}, todo); // todoを変数targetTodoに代入
      axios.patch(`http://localhost:3000/api/todos/${targetTodo.id}`, {
        completed: !targetTodo.completed,
      })
      // axios:通信成功時
      .then(({ data }) => {
        console.log(data); // 対象のtargetTodoのcompletedを反転させたデータ(オブジェクト / !targetTodo.completed)
        this.todos = this.todos.map((todoItem) => {
          console.log(this.todos); // this.todos => todoItemを格納してる配列
          console.log(todoItem); // todoItem ・・・ 完了、未完了ボタンをクリック時のイベントの情報(this.todosに格納されてる) <=> changeCompletedメソッドの引数と同じ
          console.log(targetTodo); // 配列todos内の選択したtargetTodo
          if (todoItem.id === targetTodo.id) return data; // 再レンダリングを行い !targetTodo.completedを表示
          return todoItem;
        });
        this.hideError();
      })
      // axios:エラー発生時
      .catch((err) => {
        this.showError(err);
      });
    },
    // 編集ボタンクリック時
    showEditor(todo) {
      this.targetTodo = Object.assign({}, todo);
    },
    // 変更ボタンクリック時
    editTodo() {
      // 変更ボタンクリック時 : 入力値を変更してない場合
      const targetTodo = this.todos.find(todo => todo.id === this.targetTodo.id); // todo.id => 変更前の配列が格納されてる変数のid / targetTodo.id => 編集ボタンをクリックし選択したtodos配列内のtargetTodoのid
        if (
          targetTodo.title === this.targetTodo.title // 変更前のtitle === 編集中のtitle
          && targetTodo.detail === this.targetTodo.detail // 変更前のdetail === 編集中のdetail
        ) {
          this.targetTodo = Object.assign({}, {
            id: null,
            title: '',
            detail: '',
            completed: false,
          });
          return;
        }
      // 変更ボタンクリック時 : 入力値を変更してる場合
      axios.patch(`http://localhost:3000/api/todos/${this.targetTodo.id}`, {
        title: this.targetTodo.title,
        detail: this.targetTodo.detail,
      })
      // axios:通信成功時
      .then(({ data }) => {
        this.todos = this.todos.map((todo) => {
          console.log(todo);
          console.log(this.targetTodo.id);
          if (todo.id === this.targetTodo.id) return data;
          return todo;
        });
        this.targetTodo = Object.assign({}, {
          id: null,
          title: '',
          detail: '',
          completed: false,
        });
      })
      // axios:エラー発生時
      .catch((err) => {
        // axios:通信成功時 :エラー発生時
        this.showError(err);
      });
    },
    // 削除ボタン : クリック時
    deleteTodo(id) {
      // input , textareaを空白にする処理
      this.targetTodo = this.initTargetTodo();

      axios.delete(`http://localhost:3000/api/todos/${id}`)
      // axios:通信成功時
      .then(({ data }) => {
        this.todos = data.todos.reverse();
        this.hideError();
      })
      // axios:エラー発生時
      .catch((err) => {
        // axios:通信成功時 :エラー発生時
        this.showError(err);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.todo {
  &__wrapper {
    margin: 0 auto;
    padding: 20px 0;
    width: 700px;
    max-height: 100vh;
  }
  &__inner {
    position: relative;
    max-height: calc(100vh - 40px);
    border-radius: 10px;
    box-shadow: #aaa 0 0 20px 1px;
  }
}

.header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px 0;
  color: #fff;
  font-size: 16px;
  line-height: 1.2;
  text-align: center;
  border-radius: 10px 10px 0 0;
  background-color: #54b363;
}

.main {
  padding: 78px 0 56px;
  max-height: calc(100vh - 40px);
  overflow: scroll;
  border-radius: 10px;
  background-color: #fff;
}

.register {
  padding: 10px 20px;
  padding-bottom: 0;
  &__inner {
    width: 80%;
  }
  &__input {
    & + & {
      margin-top: 10px;
    }
    &__title {
      font-weight: bold;
      font-size: 14px;
    }
    input, textarea {
      padding: 10px;
      width: 100%;
      font-size: 14px;
      border: 1px solid #ddd;
    }
  }
  &__submit {
    margin-top: 10px;
    text-align: right;
    &__btn {
      padding: 10px 25px;
      color: #fff;
      font-size: 12px;
      border-radius: 7px;
      background-color: #54b363;
    }
  }
}

.error {
  padding: 0 20px;
  text-align: center;
  &__text {
    margin-top: 10px;
    padding: 5px;
    color: #f00;
    font-size: 14px;
    background-color: #efefef;
  }
}

.todos {
  margin-top: 20px;
  padding: 10px;
  &__empty {
    font-size: 14px;
    text-align: center;
  }
  &__list {
    & > li {
      padding: 15px 10px;
      border-top: 1px solid #ddd;
      transition: all .3s;
      &:first-child {
        border-top: none;
      }
      &.is-completed {
        color: #ccc;
        background-color: #f3f3f3;
        .todos__completed__btn {
          text-decoration: line-through;
          color: #ccc;
          border: 2px solid #eaeaea;
          background-color: #eaeaea;
        }
        .todos__desc__title,
        .todos__desc__detail {
          color: #ccc;
        }
      }
    }
  }
  &__inner {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  &__completed {
    width: 15%;
    min-width: 100px;
    &__btn {
      padding: 5px 10px;
      color: #ff1919;
      font-weight: bold;
      font-size: 12px;
      border-radius: 7px;
      border: 2px solid #ff1919;
      background-color: #fff;
      transition: all .3s;
    }
  }
  &__desc {
    width: 70%;
    min-width: 450px;
    &__title {
      color: #000;
      font-weight: bold;
      font-size: 16px;
      line-height: 1.2;
      transition: all .3s;
      input {
        padding: 5px 10px;
        width: 100%;
        color: #000;
        font-size: 16px;
        border: 1px solid #ddd;
        transition: all .3s;
      }
    }
    &__detail {
      margin-top: 5px;
      color: #777;
      font-size: 14px;
      line-height: 1.2;
      transition: all .3s;
      textarea {
        padding: 5px 10px;
        width: 100%;
        color: #000;
        font-size: 14px;
        border: 1px solid #ddd;
        transition: all .3s;
      }
    }
  }
  &__btn {
    width: 10%;
    min-width: 70px;
    text-align: center;
    &__edit,
    &__delete {
      padding: 5px 10px;
      border-radius: 7px;
      color: #fff;
      font-size: 12px;
    }
    &__edit {
      background-color: #07C4D7;
    }
    &__delete {
      margin-top: 5px;
      background-color: #ff1919;
    }
  }
}

.footer {
  display: flex;
  justify-content: space-around;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  font-size: 14px;
  line-height: 1.2;
  color: #555;
  border-radius: 0 0 10px 10px;
  background-color: #ddd;
}
</style>
