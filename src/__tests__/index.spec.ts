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

    server.route({
      method: 'POST',
      path: '/first/path/{id}',
      handler: () => {},
    });

    const out = fn();

    await server.register({
      plugin: RoutesList,
      options: {
        out,
      },
    });

    await server.initialize();

    exposedListing(server)();

    expect(out.mock.calls).toEqual([
      [chalk.blue('POST')],
      ['/first/path/{id}'],
    ]);
  });
});
