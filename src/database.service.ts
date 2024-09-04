import mysql from 'mysql2/promise';

import {LoggerService} from './logger.service.js';

export class DatabaseService {
  constructor(
    private readonly host = process.env.DB_HOST,
    private readonly port = Number(process.env.DB_PORT),
    private readonly user = process.env.DB_USER,
    private readonly password = process.env.DB_PASSWORD,
    private readonly database = process.env.DB_NAME,
    private readonly loggerService = new LoggerService()
  ) {}

  public createConnection = async () => {
    const connection = await mysql.createConnection({
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password,
      database: this.database
    });

    this.loggerService.info('Database connection established');

    return connection;
  };
}
