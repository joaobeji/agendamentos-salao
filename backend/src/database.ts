/**
 * @file database.ts
 * @description Configuração da conexão com o banco de dados SQLite.
 */

import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

/**
 * Abre a conexão com o arquivo SQLite local.
 */
export async function openDatabase(): Promise<
  Database<sqlite3.Database, sqlite3.Statement>
> {
  return open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
}
