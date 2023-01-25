import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

//list todos
//add todos
//toggle todos
//delete todos

const GET_TODOS = gql `
  query getTodos {
    todos{
      done
      id
      text
    }
  }
`;

const TOGGLE_TODO = gql `
  mutation toggleTodo($id: uuid!, $done: Boolean!) {
    update_todos(where: {id: {_eq: $id}}, _set: {done: $done}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODO = gql `
  mutation addTodos($text: String!) {
    insert_todos(objects: {text: $text}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const DELETE_TODO = gql `
  mutation deleteTodo($id: uuid!) {
    delete_todos(where: {id: {_eq: $id}}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

function App() {
  const [todoText, setTodoText] = useState("");
  const { data, loading, error } = useQuery(GET_TODOS);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => setTodoText("")
  });
  const [deleteTodo] = useMutation(DELETE_TODO);

  const handleToggleTodo = async ({ id, done }) => {
    const data = await toggleTodo({ variables: { id: id, done: !done } });

    console.log("toggled todo", data);
  }

  const handleAddTodo = async e => {
    e.preventDefault();

    if (!todoText.trim()) return;

    const data = await addTodo({ 
      variables: { text: todoText },
      refetchQueries : [
        { query: GET_TODOS }
      ]
    });

    console.log("added todo", data);
  }

  const handleDeleteTodo = async ({ id }) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this todo?");

    if (isConfirmed) {
      const data = await deleteTodo({
        variables: { id: id },
        update: cache => {
          const prevData = cache.readQuery({ query: GET_TODOS });

          const newTodos = prevData.todos.filter(todo => todo.id !== id);

          cache.writeQuery({ query: GET_TODOS, data: { todos: newTodos } });
        }
      })

      console.log("delete todo", data);
    }
  }


  if (loading) return <h1 className="vh-100 code flex flex-column items-center bg-grey black pa3 fl-1">Loading todos...</h1>;
  if (error) return <div>Error fetching todos</div>;


  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa3 fl-1">
      <h1 className="f2-l">GraphQL Checklist <span role="img" aria-label="Checkmark">✔️</span></h1>
      <form className="mb3" onSubmit={handleAddTodo}>
        <input 
          className="pa2 f4 b--dashed"
          type="text"
          placeholder="Write your todo"
          onChange={e => setTodoText(e.target.value)}
          value={todoText}
        />
        <button className="pa2 f4 bg-green pointer" type="submit">Create</button>
      </form>
      {/* Todo list */}
      <div className="flex items-center justify-center flex-column">
      {data.todos.map(todo => (
        <p onDoubleClick={() => handleToggleTodo(todo)} key={todo.id}>
          <span className={`pointer list pa1 f3 ${todo.done && "strike"}`}>{todo.text}</span>
          <button className="bg-transparent nt bn f4" onClick={() => handleDeleteTodo(todo)}><span className="red">&times;</span></button>
        </p>
        ))}
      </div>
    </div>
  );
}

export default App;
