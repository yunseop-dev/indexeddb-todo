import React, { useCallback, useMemo, useState } from "react";
import { databaseInstance } from './db/index';
import { useLiveQuery } from 'dexie-react-hooks';

function App() {
  const [text, setText] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);
  const db = useMemo(() => databaseInstance, []);
  const todos = useLiveQuery(() => {
    return isOrdered ? db.todos.orderBy('created').reverse().toArray() : db.todos.toArray();
  }, [isOrdered]);

  const onSubmitAdd = useCallback(async () => {
    await db.todos.add({
      text: text, done: false, created: Date.now()
    })
  }, [db.todos, text]);

  const onToggleDone = useCallback(async (id: number) => {
    const item = await db.todos.get(id);
    if (item) {
      await db.todos.update(id, { done: !item.done })
    } else {
      alert('item not found!');
    }
  }, [db])

  const onClickDeleteItem = useCallback(async (id: number) => {
    await db.todos.delete(id);
  }, [db]);

  const onClickOrder = useCallback(() => {
    setIsOrdered(val => !val);
  }, []);

  return (
    <div>
      <h1>Hello IndexedDB!</h1>
      <form onSubmit={onSubmitAdd}>
        <h2>dexie with hooks</h2>
        <label htmlFor="todo-input">할 일 입력</label>
        <input id="todo-input" type="text" onChange={(e) => setText(e.target.value)} value={text} />
        <button type="submit">
          Add
        </button>
      </form>
      <button type="button" onClick={onClickOrder}>정렬</button>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            <input id={todo.id?.toString()} type="checkbox" onChange={() => onToggleDone(todo.id as any)} checked={todo.done} />
            <label htmlFor={todo.id?.toString()}>
              <span style={{ textDecoration: todo.done ? 'line-through' : '' }}>
                {todo.text} / {todo.created}
              </span>
            </label>
            <button type="button" onClick={() => onClickDeleteItem(todo.id as any)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
