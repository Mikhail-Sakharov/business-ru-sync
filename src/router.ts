import {IncomingMessage, ServerResponse} from 'http';

import {LoggerService} from './logger.service.js';

import {Route} from './types/route.type.js';

export class Router {
  private routes: Route[] = [];

  constructor(
    private readonly loggerService = new LoggerService()
  ) {}

  public registerRoutes = (routes: Route[]) => {
    this.routes = routes;
  };

  public handleRoute = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    const url = String(req.url);
    const handler = this.routes.find((route) => route.url === url)?.handler;

    if (handler) {
      handler(req, res);
    } else {
      this.loggerService.error('[App]: Route not found!');

      res.statusCode = 400;
      res.end();
    }
  };
}
