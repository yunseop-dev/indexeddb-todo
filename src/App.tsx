import React, { useCallback, useEffect, useState } from 'react';
import * as Database from './Database';
import { useQuery } from '@tanstack/react-query';
import { TodoRxDocument } from './Schema';
import { v4 as uuid } from 'uuid';

const App = () => {
  const [todos, setTodos] = useState<TodoRxDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: db } = useQuery(['db'], () => Database.get())

  const [text, setText] = useState('');
  const deleteTodo = useCallback(async (todo: TodoRxDocument) => {
    console.log('delete todo:');
    console.dir(todo);
    await todo.remove();
  }, [])

  const toggleTodo = useCallback(async (todo: TodoRxDocument) => {
    console.log('toggle todo:');
    console.dir(todo);
    await todo.atomicPatch({
      done: !todo.done
    })
  }, [])

  const addTodo = useCallback(async (event: any) => {
    event.preventDefault();
    const db = await Database.get();
    const addData = {
      id: uuid(), text,
    };
    await db.todos.insert(addData);
    setText('');
  }, [text])

  const handleTextChange = useCallback((event: any) => {
    setText(event.target.value);
  }, [])

  useEffect(() => {
    try {
      const sub = db?.todos.find().$.subscribe((todos: TodoRxDocument[]) => {
        if (!todos) {
          return;
        }
        console.log('reload todos-list ');
        console.dir(todos);
        setTodos(todos);
        setLoading(false)
      });

      return () => sub?.unsubscribe();
    } catch (error) {
      console.log(error);
    }
  }, [db])

  return (
    <div>
      <h1>RxDB Example - React</h1>
      <div>
        <h3>Todos</h3>
        {loading && <span>Loading...</span>}
        {!loading && todos.length === 0 && <span>No todos</span>}
        {!loading &&
          <ul>
            {todos.map((todo) => {
              return (
                <li key={todo.id}>
                  <input type="checkbox" name={todo.id} aria-label={todo.id} onChange={() => toggleTodo(todo)} checked={todo.done} />
                  <label htmlFor={todo.id}>
                    {todo.text}
                  </label>
                  <button type="button" onClick={() => deleteTodo(todo)}>DELETE</button>
                </li>
              );
            })}
          </ul>
        }
      </div>
      <div>
        <h3>Add Todo</h3>
        <form onSubmit={addTodo}>
          <input type="text" name="text" placeholder="Name" value={text} onChange={handleTextChange} />
          <button type="submit">Insert a Todo</button>
        </form>
      </div>
    </div>
  );
};

export default App;
