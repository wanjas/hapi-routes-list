import Hapi, { RequestRoute, Server } from '@hapi/hapi';
import chalk from 'chalk';
import Table from 'easy-table';

import { Color, defaultTheme, Theme } from './colors';
import pkg from '../package.json';

export type RoutesListOptions = {
  columns?: (keyof typeof columns)[];
  out?: (line: string) => void;
};

export interface RoutesListColumn {
  header: string;
  value: (server: Server, route: RequestRoute) => string | string[];
  getSortValue: (
    server: Server,
    route: RequestRoute,
    value: RoutesListColumn['value'],
  ) => string | number;
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

function stringify(value: string | string[]): string {
  if (typeof value === 'string') {
    return value;
  }
  return value.join(', ');
}

const columns: Record<string, RoutesListColumn> = {
  method: {
    header: 'Method',
    value: (server, route) => route.method.toUpperCase(),
    getSortValue: (server, route) => route.method.toUpperCase(),
    coloredText: (server, route, value, theme) =>
      painter(theme.method)(stringify(value(server, route))),
  },
  path: {
    header: 'Path',
    value: (server, route) => route.path,
    getSortValue: (server, route) => route.path,
    coloredText: (server, route, value, theme) =>
      painter(theme.path)(stringify(value(server, route))),
  },
  strategy: {
    header: 'Strategy',
    value: (server, route) => route.settings.auth?.strategies || '',
    getSortValue: (server, route) =>
      stringify(route.settings.auth?.strategies || ''),
    coloredText: (server, route, value, theme) =>
      painter(theme.path)(stringify(value(server, route))),
  },
  mode: {
    header: 'Mode',
    value: (server, route) => route.settings.auth?.mode || '',
    getSortValue: (server, route) => stringify(route.settings.auth?.mode || ''),
    coloredText: (server, route, value, theme) =>
      painter(theme.path)(stringify(value(server, route))),
  },
  scopes: {
    header: 'Scopes',
    value: (server, route) => {
      const scopes = route.settings.auth?.access?.map?.((access) => {
        const scopesList: string[] = [];
        const pushScope = (value: string, prefix: '+' | '!' | '') =>
          scopesList.push(`${prefix}${value}`);
        if (access.scope) {
          access.scope?.forbidden?.forEach?.((sc) => pushScope(sc, '!'));
          access.scope?.required?.forEach?.((sc) => pushScope(sc, '+'));
          access.scope?.selection?.forEach?.((sc) => pushScope(sc, ''));
        }
        return scopesList;
      });
      if (!scopes) {
        return '';
      }
      // if (scopes.length === 1) {
      //   return stringify(scopes[0]);
      // }
      return scopes.map((sc) => stringify(sc));
    },
    getSortValue: (server, route, value) => stringify(value(server, route)),
    coloredText: (server, route, value, theme) => {
      let scopes = value(server, route);
      if (!scopes) {
        return '';
      }
      if (typeof scopes === 'string') {
        scopes = [scopes];
      }

      scopes = scopes.map((group) =>
        stringify(
          group.split(', ').map((scope) => {
            if (scope.startsWith('+')) {
              return painter(theme.scopes.required)(scope);
            }
            if (scope.startsWith('!')) {
              painter(theme.scopes.forbidden)(scope);
            }
            return painter(theme.scopes.selection)(scope);
          }),
        ),
      );

      if (scopes.length === 1) {
        return stringify(scopes[0]);
      }

      return stringify(scopes.map((group) => `[${group}]`));
    },
  },
  // description: '',
  // tags: '',
  // timeout: '',
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
      const t = new Table();

      routingTable.forEach((route) => {
        Object.values(columns).forEach((column) => {
          // out(column.coloredText(server, route, column.value, defaultTheme));

          t.cell(
            column.header,
            column.coloredText(server, route, column.value, defaultTheme),
          );
        });
        t.newRow();
      });

      out(t.toString());
    };

    server.expose('listRoutes', listRoutes);

    server.events.on('start', () => {
      listRoutes();
    });
  },
  // eslint-disable-next-line global-require
  pkg,
  multiple: false,
};
