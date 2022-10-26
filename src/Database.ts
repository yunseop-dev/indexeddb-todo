import {
    createRxDatabase,
    addRxPlugin,
} from 'rxdb';
import {
    getRxStorageDexie
} from 'rxdb/plugins/dexie';
import {
    todoSchema, MyDatabase
} from './Schema';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBLeaderElectionPlugin);

let dbPromise: Promise<MyDatabase> | null = null;

const _create = async () => {
    console.log('DatabaseService: creating database..');
    const db: MyDatabase = await createRxDatabase({
        name: 'todosreactdb',
        storage: getRxStorageDexie()
    });
    console.log('DatabaseService: created database');
    // @ts-ignore;
    window['db'] = db; // write to window for debugging

    // show leadership in title
    db.waitForLeadership().then(() => {
        console.log('isLeader now');
        document.title = '♛ ' + document.title;
    });

    // create collections
    console.log('DatabaseService: create collections');
    await db.addCollections({
        todos: {
            schema: todoSchema,
        }
    });

    return db;
};

export const get = () => {
    if (!dbPromise) {
        dbPromise = _create();
    }
    return dbPromise;
};
