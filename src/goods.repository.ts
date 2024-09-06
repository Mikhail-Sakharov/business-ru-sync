import {DatabaseService} from './database.service.js';
import {LoggerService} from './logger.service.js';

import {Good} from './good.model.js';

import {GoodType} from './types/good.type.js';

export class GoodsRepository {

  constructor(
    private readonly databaseService = new DatabaseService(),
    private readonly loggerService = new LoggerService()
  ) {}

  public syncGoodTable = async () => {
    await Good.sync({alter: true});
  };

  public find = async (goodId: number) => {
    const good = await Good.findOne({where: {bru_id: goodId}});
    return good;
  };

  public add = async (good: GoodType) => {
    const goodEntry = await Good.create({
      name: good.name,
      full_name: good.full_name,
      description: good.description,
      cost: good.cost,
      archive: good.archive,
      bru_id: good.id,
      bru_group_id: good.group_id,
      bru_measure_id: good.measure_id,
      bru_partner_id: good.partner_id,
      bru_responsible_employee_id: good.responsible_employee_id
    });

    return goodEntry;
  };
}
