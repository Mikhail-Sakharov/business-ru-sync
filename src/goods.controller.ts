import {IncomingMessage, ServerResponse} from 'http';

import {BusinessRUService} from './business-ru.service.js';
import {GoodsRepository} from './goods.repository.js';
import {LoggerService} from './logger.service.js';

import {GoodType} from './types/good.type.js';
import {Source} from './types/source.enum.js';

export class GoodsController {

  constructor(
    private readonly businessRUService = new BusinessRUService(),
    private readonly goodsRepository = new GoodsRepository(),
    private readonly loggerService = new LoggerService()
  ) {}

  public synchronizeGoods = async (_req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    try {
      const goodsCount = await this.businessRUService.getItemsCount(Source.Goods);
      const pagesCount = goodsCount ? Math.ceil(goodsCount / 250)+1 : 0;

      if (pagesCount) {
        await this.goodsRepository.syncGoodTable();

        for(let page = 1; page <= pagesCount; page++) {
          const goods = await this.businessRUService.getItems<GoodType>(Source.Goods, page);

          if (goods && goods.length) {
            for(let i = 0; i < goods.length; i++) {
              const goodFromDB = await this.goodsRepository.find(goods[i].id);
              const isNotServiceType = Number(goods[i].type) === 1; // В Бизнес.ру 1 - это Товар, 2 - Услуга

              // Если в БД пока что такого товара нет, то добавляем его
              if (goodFromDB === null && isNotServiceType) {
                const createdGood = await this.goodsRepository.add(goods[i]);
                this.loggerService.info(JSON.stringify(createdGood));
              } else {
                this.loggerService.warn('[App]: Insert aborted! Such item already exists in DB!');
              }
            }
          }
        }

        this. loggerService.info('[App]: Inserting complete');

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({result: {goodsCount}}));
      }
    } catch(error) {
      this.loggerService.error(`[App]: ${String(error)}`);
    }
  };
}
