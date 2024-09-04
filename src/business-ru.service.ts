import {createHash} from 'crypto';

import {LoggerService} from './logger.service.js';

import {BruToken} from './types/bru-token.type.js';
import {Query} from './types/query.type.js';

export class BusinessRUService {

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
    appPsw
  }: Query) => {
    const getDataQuery = await fetch(`https://${this.bruAccount}.business.ru/api/rest/${source}.json?app_id=${this.appId}&app_psw=${appPsw}`);
    const getDataResponse = await getDataQuery.json();

    return getDataResponse;
  };

  public getToken = async () => {
    if (this.bruSecret) {
      const source = 'repair';
      const appPsw = this.getMD5String([this.bruSecret, `app_id=${this.appId}`]);

      const bruTokenResponse = await this.query({
        source,
        appPsw
      }) as BruToken;
      const bruToken = bruTokenResponse.token;

      this.loggerService.info('Token has been successfully received');
      this.loggerService.info(`Token: ${bruToken}`);

      return bruToken;
    } else {
      this.loggerService.error('Token has not been received');

      return null;
    }
  };
}
