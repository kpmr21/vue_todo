<template lang="html">
  <app-wrapper>
    <app-navi />
    <app-register v-if="todoFilter !== 'completedTodos'" />
    <app-error-message
      v-if="errorMessage"
      :error-message="errorMessage"
    />
    <template v-slot:todos>
      <app-list v-if="todos.length" :todos="todos" />
      <app-empty-message
      v-else
      :empty-message="emptyMessage"
      />
    </template>
  </app-wrapper>
</template>

<script>
import Wrapper from 'TodoVuexDir/components/Wrapper';
import Navi from 'TodoVuexDir/components/Navi';
import { ErrorMessage, EmptyMessage } from 'TodoVuexDir/components/Message';
import Register from 'TodoVuexDir/components/Register';
import List from 'TodoVuexDir/components/List';

export default {
  components: {
    appWrapper: Wrapper,
    appNavi: Navi,
    appErrorMessage: ErrorMessage,
    appEmptyMessage: EmptyMessage,
    appList: List,
    appRegister: Register,
  },
  computed: {
    todoFilter() {
      return this.$store.state.todoFilter;
    },
    todos() {
      if (this.todoFilter === 'allTodos') {
        return this.$store.state.todos;
      }
      return this.$store.getters[this.todoFilter];
    },
    errorMessage() {
      return this.$store.state.errorMessage;
    },
    emptyMessage() {
      return this.$store.state.emptyMessage;
    },
  },
  watch: {
    todos(todos) {
      if (!todos.length) this.$store.dispatch('setEmptyMessage', this.todoFilter);
    },
    $route(to) {
      this.$store.dispatch('setTodoFilter', to.name);
    },
  },
  created() {
    this.$store.dispatch('getTodos');
    this.$store.dispatch('setTodoFilter', this.$route.name);
  },
};
</script>
