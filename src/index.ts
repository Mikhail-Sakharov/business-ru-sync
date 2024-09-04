import http from 'http';
import {createHash} from 'crypto';
// установить rimraf для очистки папки проекта перед сборкой

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

  // в отдельный класс
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const md5GoodsCountQueryString = createHash('md5').update(`${bruToken}${bruSecret}app_id=${appId}&count_only=1`).digest('hex');
    const goodsCountFetch = await fetch(`https://a81455.business.ru/api/rest/goods.json?app_id=485783&count_only=1&app_psw=${md5GoodsCountQueryString}`);
    const goodsCountResponse = await goodsCountFetch.json() as {result: {count: number}};
    const goodsCount = goodsCountResponse.result.count;

    const pagesCount = Math.ceil(goodsCount / 250);

    for(let page = 1; page <= pagesCount; page++) {
      const md5GoodsQueryString = createHash('md5').update(`${bruToken}${bruSecret}app_id=${appId}&limit=250&page=${page}`).digest('hex');
      const goodsFetch = await fetch(`https://${bruAccount}.business.ru/api/rest/goods.json?app_id=${appId}&limit=250&page=${page}&app_psw=${md5GoodsQueryString}`);
      // перенести в тип
      const goodsResponse = await goodsFetch.json() as {result: {
        id: string;
        name: string;
        full_name: string;
        group_id: string;
        measure_id: string;
      }[]};
      const goods = goodsResponse.result;

      goods.forEach(async (good) => {
        // Проверка наличия текущего элемента в БД по good.id
        const [results, fields] = await connection.query(
          `SELECT count(id) FROM goods WHERE EXISTS (SELECT * FROM goods WHERE bru_id=${good.id})`
        );
        const result = results as {'count(id)': number}[];
        const goodAlreadyExists = result[0]['count(id)'] === 0;
  
        if (goodAlreadyExists) {
          // Имя менять нельзя! Сделать запрос с плейсхолдерами.
          const goodName = good.name.replace(/\"/g, '\'');
          const goodFullName = good.full_name.replace(/\"/g, '\'');

          await connection.query(
            `INSERT INTO goods VALUES (NULL, "${goodName}", "${goodFullName}", ${good.id}, ${good.group_id}, ${good.measure_id})`
          );
        }
      });
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    // res.end(JSON.stringify(results));
    res.end(JSON.stringify([]));
  } catch (err) {
    console.log(err);
  } finally {
    connection.end();
  }
});

server.listen(port, host, () => {
  console.log(`Server started on ${host}:${port}`);
});
