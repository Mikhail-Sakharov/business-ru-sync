import http from 'http';
import {createHash} from 'crypto';

import mysql from 'mysql2/promise'; // написать свой драйвер

type BruToken = { // добавить в настройки линтера обработку TS
  token: string;
  request_count: string;
  app_psw: string;
};

const host = process.env.HOST;
const port = Number(process.env.PORT);

const bruAccount = process.env.BRU_ACCOUNT;
const appId = process.env.APP_ID;
const bruSecret = process.env.SECRET;

const server = http.createServer(async (req, res) => {
  // вынести в отдельную функцию md5
  const md5QueryString = createHash('md5').update(`${bruSecret}app_id=${appId}`).digest('hex');
  const bruTokenFetch = await fetch(`https://${bruAccount}.business.ru/api/rest/repair.json?app_id=${appId}&app_psw=${md5QueryString}`);
  const bruTokenResponse = await bruTokenFetch.json() as BruToken;
  const bruToken = bruTokenResponse.token;

  // вынести в отдельную функцию md5
  const md5GoodsQueryString = createHash('md5').update(`${bruToken}${bruSecret}app_id=${appId}`).digest('hex');
  const goodsFetch = await fetch(`https://${bruAccount}.business.ru/api/rest/goods.json?app_id=${appId}&app_psw=${md5GoodsQueryString}`);
  // перенести в тип
  const goodsResponse = await goodsFetch.json() as {result: {
    id: string;
    name: string;
    full_name: string;
    group_id: string;
    measure_id: string;
  }[]};
  const goods = goodsResponse.result;

  // в отдельный класс
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Сделать запрос общего количества товаров
    // Рассчитать кол-во страниц, исходя из лимита в 250 шт. за один запрос
    // Выполнить цикл запросов и сложить данные в БД
    goods.forEach(async (good) => {
      // Сделать запрос к БД: проверка наличия текущего элемента в БД по good.id

      await connection.query(
        `INSERT INTO goods VALUES (NULL, "${good.name}", "${good.full_name}", ${good.id}, ${good.group_id}, ${good.measure_id})`
      );
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    // res.end(JSON.stringify(results));
    res.end(JSON.stringify(goods));
  } catch (err) {
    console.log(err);
  } finally {
    connection.end();
  }
});

server.listen(port, host, () => {
  console.log(`Server started on ${host}:${port}`);
});
