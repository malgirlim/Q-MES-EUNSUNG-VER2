import { ref, Ref } from "@vue/reactivity";
import axios from "axios";

import { usePagination } from "../components/Pagination/useClientSidePagination";

// const URL = "https://jsonplaceholder.typicode.com/todos/";
const URL = "/api/memos";

export interface Todo {
  // id: number;
  // title: string;
  content: string;
  name: string;
  number: number;
}

export function useTodosApi(
  currentPage: Ref<number>,
  rowsPerPage?: Ref<number>
) {
  const todos: Ref<Todo[]> = ref([]);

  const todosAreLoading = ref(false);

  const { paginatedArray, numberOfPages } = usePagination<Todo>({
    rowsPerPage,
    arrayToPaginate: todos,
    currentPage,
  });

  const loadTodos = async () => {
    todosAreLoading.value = true;
    try {
      // const result = await axios.get(URL);
      // todos.value = result.data;
      axios.get("/api/memos").then((res) => {
        todos.value = res.data;
      });
    } catch (err) {
      console.log(err);
    } finally {
      todosAreLoading.value = false;
    }
  };

  return {
    todos: paginatedArray,
    loadTodos,
    todosAreLoading,
    numberOfPages,
  };
}
