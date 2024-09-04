import http from 'http';

import {LoggerService} from './logger.service.js';
import {BusinessRUService} from './business-ru.service.js';

import {Source} from './types/source.enum.js';
import {Good} from './types/good.type.js';
import {GoodsRepository} from './goods.repository.js';

const host = process.env.HOST;
const port = Number(process.env.PORT);

const logger = new LoggerService();
const businessRUService = new BusinessRUService();
const goodsRepository = new GoodsRepository();

const server = http.createServer(async (req, res) => {
  try {
    const goodsCount = await businessRUService.getItemsCount(Source.Goods);
    const pagesCount = goodsCount ? Math.ceil(goodsCount / 250)+1 : 0;

    if (pagesCount) {
      await goodsRepository.createConnection();

      for(let page = 1; page <= pagesCount; page++) {
        const goods = await businessRUService.getItems<Good>(Source.Goods, page);

        if (goods && goods.length) {
          for(let i = 0; i < goods.length; i++) {
            const goodFromDB = await goodsRepository.find(goods[i].id);
            const goodExists = goodFromDB && (goodFromDB as any).length;

            if (!goodExists) {
              logger.info(JSON.stringify(goods[i]));
              await goodsRepository.add(goods[i]);
            } else {
              logger.warn('[App]: Insert aborted! Such item already exists in DB!');
            }
          }
        }
      }

      goodsRepository.destroyConnection();

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({result: {goodsCount}}));
    }
  } catch(error) {
    logger.error(`[App]: ${String(error)}`);
  }
});

server.listen(port, host, () => {
  logger.info(`[App]: Server started on ${host}:${port}`);
});
