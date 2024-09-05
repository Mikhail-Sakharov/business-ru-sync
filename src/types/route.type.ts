import {IncomingMessage, ServerResponse} from 'http';

export type Route = {
  url: string;
  handler: (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void;
}
