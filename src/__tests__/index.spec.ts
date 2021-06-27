import Hapi, { Server } from '@hapi/hapi';
import chalk from 'chalk';
import { RoutesList } from '../index';
import fn = jest.fn;

// get exposed by plugin listing function
function exposedListing(server: Server) {
  return (server.plugins as { 'hapi-routes-list': { listRoutes: () => void } })[
    'hapi-routes-list'
  ].listRoutes;
}

describe('Listing', () => {
  it('List', async () => {
    const server = Hapi.server({});

    server.auth.scheme('custom', () => ({ authenticate: () => true }));
    server.auth.strategy('session', 'custom');

    server.route({
      method: 'POST',
      path: '/first/path/{id}',
      handler: () => {},
    });

    server.route({
      method: 'PATCH',
      path: '/second',
      handler: () => {},
      options: {
        auth: {
          strategy: 'session',
          mode: 'required',
          scope: ['admin'],
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/third/path',
      handler: () => {},
      options: {
        auth: {
          strategy: 'session',
          mode: 'optional',
          scope: ['admin', '+req', '!not'],
        },
      },
    });

    const mockFn = fn();
    const out = (line: string) => {
      console.log(line);
      mockFn(line);
    };

    await server.register({
      plugin: RoutesList,
      options: {
        out,
      },
    });

    await server.initialize();

    exposedListing(server)();

    expect(mockFn.mock.calls).toEqual([
      [chalk.blue('POST')],
      ['/first/path/{id}'],
    ]);
  });
});
