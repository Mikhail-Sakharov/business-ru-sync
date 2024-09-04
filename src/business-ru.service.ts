import {createHash} from 'crypto';

import {LoggerService} from './logger.service.js';

import {BruToken} from './types/bru-token.type.js';
import {Query} from './types/query.type.js';
import {Source} from './types/source.enum.js';
import {ItemsCount} from './types/items-count.type.js';
import {Result} from './types/result.type.js';

export class BusinessRUService {
  private token: string | null = null;

  constructor(
    private readonly bruAccount = process.env.BRU_ACCOUNT,
    private readonly appId = process.env.APP_ID,
    private readonly bruSecret = process.env.SECRET,
    private readonly loggerService = new LoggerService()
  ) {}

  private getMD5String = (args: string[]) => {
    const md5QueryString = createHash('md5').update(args.join('')).digest('hex');
    return md5QueryString;
  };

  public query = async ({
    source,
    queryString,
    appPsw
  }: Query) => {
    const getDataQuery = await fetch(`https://${this.bruAccount}.business.ru/api/rest/${source}.json?${queryString}&app_psw=${appPsw}`);
    const getDataResponse = await getDataQuery.json();

    return getDataResponse;
  };

  public getToken = async () => {
    if (this.bruSecret) {
      const source = Source.Repair;
      const queryString = `app_id=${this.appId}`;
      const appPsw = this.getMD5String([this.bruSecret, queryString]);

      const bruTokenResponse = await this.query({
        source,
        queryString,
        appPsw
      }) as BruToken;
      const bruToken = bruTokenResponse.token;

      this.loggerService.info('[BusinessRUService]: Token has been successfully received');
      this.loggerService.info(`[BusinessRUService]: Token: ${bruToken}`);

      return bruToken;
    } else {
      this.loggerService.error('[BusinessRUService]: Token has not been received');

      return null;
    }
  };

  public getItemsCount = async (source: Source) => {
    if (!this.token) {
      const token = await this.getToken();
      this.token = token;
    }

    if (this.bruSecret && this.token) {
      this.loggerService.info(`[BusinessRUService]: ${source} count has been requested`);

      const queryString = `app_id=${this.appId}&count_only=1`;
      const appPsw = this.getMD5String([this.token, this.bruSecret, queryString]);

      const itemsCountResponse = await this.query({
        source,
        queryString,
        appPsw
      }) as ItemsCount;
      const itemsCount = itemsCountResponse.result.count;

      this.loggerService.info(`[BusinessRUService]: ${source} count is: ${itemsCount}`);

      return itemsCount;
    } else {
      this.loggerService.error(`[BusinessRUService]: ${source} count has not been received`);

      return null;
    }
  };

  public getItems = async <T>(source: Source, page = 1, limit = 250) => {
    if (!this.token) {
      const token = await this.getToken();
      this.token = token;
    }

    if (this.bruSecret && this.token) {
      // this.loggerService.info(`[BusinessRUService.getItems]: ${source} have been requested`);

      const queryString = `app_id=${this.appId}&limit=${limit}&page=${page}`;
      const appPsw = this.getMD5String([this.token, this.bruSecret, queryString]);

      const itemsResponse = await this.query({
        source,
        queryString,
        appPsw
      }) as Result<T>;
      const items = itemsResponse.result;

      // this.loggerService.info(`[BusinessRUService.getItems]: ${source} have been received`);

      return items;
    } else {
      this.loggerService.error(`[BusinessRUService.getItems]: ${source} have not been received`);

      return null;
    }
  };
}
