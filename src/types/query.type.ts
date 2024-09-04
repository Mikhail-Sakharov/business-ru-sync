import {Source} from './source.enum.js';

export type Query = {
  source: Source;
  queryString: string;
  appPsw: string;
};
