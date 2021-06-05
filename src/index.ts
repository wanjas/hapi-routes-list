import Hapi, { RequestRoute, Server } from '@hapi/hapi';
import chalk from 'chalk';
import { Color, defaultTheme, Theme } from './colors';

export type RoutesListOptions = {
  out?: (line: string) => void;
};

export interface RoutesListColumn {
  header: string;
  value: (server: Server, route: RequestRoute) => string | string[];
  getSortValue: (server: Server, route: RequestRoute) => string | number;
  coloredText: (
    server: Server,
    route: RequestRoute,
    value: RoutesListColumn['value'],
    theme: Theme,
  ) => string;
}

const painter = (color: Color): ((str: string) => string) => {
  if (color === 'default') {
    return (str: string) => str;
  }
  if (typeof color === 'string') {
    if (color.startsWith('#')) {
      return chalk.hex(color);
    }
    return chalk.keyword(color);
  }

  return color;
};

const columns: Record<string, RoutesListColumn> = {
  method: {
    header: 'Method',
    value: (server, route) => route.method.toUpperCase(),
    getSortValue: (server, route) => route.method.toUpperCase(),
    coloredText: (server, route, value, theme) =>
      painter(theme.method)(value(server, route).toString()),
  },
  path: {
    header: 'Path',
    value: (server, route) => route.path,
    getSortValue: (server, route) => route.path,
    coloredText: (server, route, value, theme) =>
      painter(theme.path)(value(server, route).toString()),
  },
  // path: {
  //   header: 'Path',
  //   getValue: (server: Server, route: RequestRoute) => route.path.split('/'),
  // },
  // strategy: '',
  // scopes: '',
  // description: '',
  // mode: '',
  // tags: '',
};

export const RoutesList: Hapi.Plugin<RoutesListOptions> = {
  register: async (server, options = {}) => {
    // eslint-disable-next-line no-param-reassign
    const { out } = {
      out: (line: string) => console.log(line),
      ...options,
    };

    const listRoutes = () => {
      const routingTable = server.table();

      routingTable.forEach((route) => {
        Object.values(columns).forEach((column) => {
          out(column.coloredText(server, route, column.value, defaultTheme));
        });
      });
    };

    server.expose('listRoutes', listRoutes);

    server.events.on('start', () => {
      listRoutes();
    });
  },
  // eslint-disable-next-line global-require
  pkg: require('../package.json'),
  multiple: false,
};
