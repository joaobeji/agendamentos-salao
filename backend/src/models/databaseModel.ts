/**
 * @file databaseModel.ts
 * @description Inicialização das tabelas do banco de dados e dados padrão do sistema.
 */

import sqlite3 from "sqlite3";
import { Database } from "sqlite";
import { openDatabase } from "../database";

/**
 * Inicializa o banco de dados criando as tabelas necessárias
 * e populando dados iniciais caso estejam vazios.
 */
export async function initDatabase(): Promise<
  Database<sqlite3.Database, sqlite3.Statement>
> {
  const db = await openDatabase();

  // Garante a integridade referencial das chaves estrangeiras no SQLite
  await db.exec(`PRAGMA foreign_keys = ON;`);

  // Tabela de Serviços oferecidos pelo salão
  await db.exec(`
    CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      preco REAL NOT NULL,
      duracao_minutos INTEGER NOT NULL
    );
  `);

  // Tabela principal de Agendamentos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS agendamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_cliente TEXT NOT NULL,
      telefone_cliente TEXT NOT NULL,
      data_agendamento TEXT NOT NULL,
      status TEXT DEFAULT 'Pendente', -- Valores: Pendente, Confirmado, Concluído, Cancelado
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabela relacional para suportar um ou mais serviços por agendamento
  await db.exec(`
    CREATE TABLE IF NOT EXISTS agendamento_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agendamento_id INTEGER NOT NULL,
      servico_id INTEGER NOT NULL,
      FOREIGN KEY (agendamento_id) REFERENCES agendamentos (id) ON DELETE CASCADE,
      FOREIGN KEY (servico_id) REFERENCES servicos (id)
    );
  `);

  // Tabela de usuários para a área restrita (suporta login por usuário ou e-mail)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_usuario TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL
    );
  `);

  // Cadastro de serviços padrão iniciais do salão da Leila
  const servicoCount = await db.get(`SELECT COUNT(*) as count FROM servicos`);
  if (servicoCount.count === 0) {
    await db.run(
      `INSERT INTO servicos (nome, preco, duracao_minutos) VALUES ('Corte de Cabelo', 50.00, 45)`,
    );
    await db.run(
      `INSERT INTO servicos (nome, preco, duracao_minutos) VALUES ('Escova Modelada', 40.00, 30)`,
    );
    await db.run(
      `INSERT INTO servicos (nome, preco, duracao_minutos) VALUES ('Manicure e Pedicure', 60.00, 60)`,
    );
    await db.run(
      `INSERT INTO servicos (nome, preco, duracao_minutos) VALUES ('Hidratação Profunda', 90.00, 50)`,
    );
    await db.exec(`
      INSERT OR IGNORE INTO usuarios (id, nome_usuario, email, senha) 
    VALUES (1, 'leila', 'leila@salao.com', '1234');
    `);
    console.log("Serviços padrão do Salão da Leila cadastrados com sucesso!");
  }

  console.log("Banco de dados SQLite estruturado e inicializado com sucesso.");
  return db;
}
