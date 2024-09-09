import http from 'http';

import {Router} from './router.js';

import {GoodsController} from './goods.controller.js';

import {LoggerService} from './logger.service.js';

import {Route} from './types/route.type.js';

export class App {
  private routes: Route[] = [
    {
      url: '/goods/sync',
      handler: this.goodsController.synchronizeGoods
    }
  ];

  constructor(
    private readonly host = process.env.HOST,
    private readonly port = Number(process.env.PORT),

    private readonly router = new Router(),
    private readonly goodsController = new GoodsController(),
    private readonly loggerService = new LoggerService()
  ) {}

  private startServer = () => {
    const server = http.createServer(async (req, res) => {
      const allowedOrigin = process.env.ALLOWED_ORIGIN;
      const allowedHeaders = process.env.ALLOWED_HEADERS;
      const allowedMethods = process.env.ALLOWED_METHODS;
      const origin = req.headers.origin;

      if (origin !== allowedOrigin) {
        this.loggerService.warn(`[App.CORS]: origin is ${origin}`);

        res.statusCode = 403;

        if (!!allowedOrigin && !!allowedHeaders && !!allowedMethods) {
          res.setHeader('Access-Control-Allow-Headers', allowedHeaders);
          res.setHeader('Access-Control-Allow-Methods', allowedMethods);
          res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        }

        res.end();
      } else {
        this.router.handleRoute(req, res);
      }
    });

    server.listen(this.port, this.host, () => {
      this.loggerService.info(`[App]: Server started on ${this.host}:${this.port}`);
    });
  };

  public init = () => {
    this.router.registerRoutes(this.routes);
    this.startServer();
  };
}
