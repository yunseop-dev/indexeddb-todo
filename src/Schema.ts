import {
    toTypedRxJsonSchema,
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxJsonSchema,
    RxCollection,
    RxDatabase,
    RxDocument
} from 'rxdb';

export const todoSchemaLiteral = {
    title: 'todo schema',
    description: 'describes a simple todo',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        text: {
            type: 'string'
        },
        done: {
            type: 'boolean',
            default: false
        }
    },
    required: [
        'id', 'text'
    ]
} as const;

const schemaTyped = toTypedRxJsonSchema(todoSchemaLiteral);

export type TodoDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof schemaTyped>;

type TodoDocMethods = {
    scream: (v: string) => string;
};

type TodoCollectionMethods = {
    countAllDocuments: () => Promise<number>;
}

export type TodoCollection = RxCollection<TodoDocType, TodoDocMethods, TodoCollectionMethods>;

export type MyDatabaseCollections = {
    todos: TodoCollection
}

export type TodoRxDocument = RxDocument<TodoDocType, TodoDocMethods>

export type MyDatabase = RxDatabase<MyDatabaseCollections>;

// create the typed RxJsonSchema from the literal typed object.
export const todoSchema: RxJsonSchema<TodoDocType> = todoSchemaLiteral;
