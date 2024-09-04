import mysql from 'mysql2/promise';

import {DatabaseService} from './database.service.js';
import {LoggerService} from './logger.service.js';

import {Good} from './types/good.type.js';

export class GoodsRepository {
  private connection: mysql.Connection | null = null;

  constructor(
    private readonly databaseService = new DatabaseService(),
    private readonly loggerService = new LoggerService()
  ) {}

  public createConnection = async () => {
    const connection = await this.databaseService.createConnection();
    this.connection = connection;
    return connection;
  };

  public destroyConnection = async () => {
    this.connection?.end();
    this.connection = null;
  };

  public add = async (good: Good) => {
    const goodName = good.name.replace(/\"/g, '\'');
    const goodFullName = good.full_name.replace(/\"/g, '\'');

    if (this.connection) {
      const query = await this.connection.query(
        `INSERT INTO goods VALUES (NULL, "${goodName}", "${goodFullName}", ${good.id}, ${good.group_id}, ${good.measure_id})`
      );

      return query;
    }

    return null;
  };

  public find = async (goodId: string) => {
    if (this.connection) {
      const [results] = await this.connection.query(
        `SELECT * FROM goods WHERE bru_id = ${goodId}`
      );

      return results;
    } else {
      return null;
    }
  };
}
