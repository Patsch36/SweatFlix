// store.ts
import { defineStore } from 'pinia';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

export const useDatabaseStore = defineStore('database', {
  state: () => ({
    database: null as SQLiteDBConnection | null, // Initialer Wert für die Datenbank
  }),
  actions: {
    setDatabase(db: SQLiteDBConnection) {
      this.database = db;
    },
    getDatabase() {
        return this.database;
    },
  },
});
