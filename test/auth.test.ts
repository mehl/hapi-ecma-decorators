import { describe, it, expect } from 'vitest';
import { Auth, Controller, Get, Options, Patch, Post, Put, RouteProvider } from '../src/index';


@Controller('/authBasePath')
class AuthTestController {

    @Get('/test')
    @Auth(false)
    testMethod() {
        return 'test';
    }

    @Get('/test2')
    @Auth('getstrategy')
    @Post('/test2')
    @Auth('poststrategy')
    testMethod2() {
        return 'test';
    }
}

describe('hapi-ecma-decorators', () => {
    it('should register configured auth routes', async () => {
        const c = new AuthTestController();
        const routes = (c as AuthTestController & RouteProvider).routes();
        expect(routes).toMatchObject(
            [
                {
                    method: 'GET',
                    path: '/authBasePath/test',
                    handler: expect.any(Function),
                    options: {
                        auth: false
                    }
                },
                {
                    method: 'POST',
                    path: '/authBasePath/test2',
                    handler: expect.any(Function),
                    options: {
                        auth: "poststrategy"
                    }
                },
                {
                    method: 'GET',
                    path: '/authBasePath/test2',
                    handler: expect.any(Function),
                    options: {
                        auth: "getstrategy"
                    }
                }
            ]
        );
    });
});