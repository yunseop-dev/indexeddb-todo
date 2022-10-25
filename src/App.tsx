import React, { useCallback, useMemo, useState } from "react";
import { databaseInstance } from './db/index';
import { useLiveQuery } from 'dexie-react-hooks';
import { useVirtualizer } from '@tanstack/react-virtual'

function App() {
  const [text, setText] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);
  const db = useMemo(() => databaseInstance, []);
  const todos = useLiveQuery(() => {
    return isOrdered ? db.todos.orderBy('created').reverse().toArray() : db.todos.toArray();
  }, [isOrdered]);

  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: todos?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => 22 + index,
  })

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
      <button onClick={() => rowVirtualizer.scrollToIndex(500)}>
        Scroll to index 500
      </button>
      <div
        ref={parentRef}
        className="List"
        style={{
          height: `100vh`,
          width: `400px`,
          overflow: 'auto',
        }}
      >
        <ul
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const todo = todos?.[virtualItem.index];
            return (
              <li
                key={virtualItem.key}
                ref={virtualItem.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                  height: virtualItem.index + 22
                }}
              >
                <input
                  id={todo?.id?.toString()}
                  type="checkbox"
                  onChange={() => onToggleDone(todo?.id as any)}
                  checked={todo?.done}
                />
                <label htmlFor={todo?.id?.toString()}>
                  <span style={{ textDecoration: todo?.done ? 'line-through' : '' }}>
                    {todo?.text} / {todo?.created}
                  </span>
                </label>
                <button type="button" onClick={() => onClickDeleteItem(todo?.id as any)}>X</button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
