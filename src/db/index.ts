import Dexie, { Table } from 'dexie';

const DB_NAME = 'my-db';

export interface Todo {
  id?: number;
  text: string;
  done: boolean;
  created: number;
}

export class MySubClassedDexie extends Dexie {
  todos!: Table<Todo>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      todos: '++id, created'
    });
  }
}

export const databaseInstance = new MySubClassedDexie();