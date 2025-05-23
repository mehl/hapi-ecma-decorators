import { describe, it, expect } from 'vitest';
import { Controller, Get, Options, Patch, Payload, Post, Put, RouteProvider } from '../src/index';


@Controller('/basePath')
class SimpleTestController {
    @Get('/test')
    testMethod() {
        return 'test';
    }
    @Post('/test2')
    @Payload('multipart')
    postTestMethod() {
        return 'test';
    }

    @Options('/test3')
    @Payload('multipart')
    @Patch('/test3')
    @Payload({ maxBytes: 500 })
    @Put('/test3')
    @Payload({ maxBytes: 1000000 })
    someTestMethod() {
        return 'test';
    }
}

describe('hapi-ecma-decorators', () => {
    it('should register simple routes', async () => {
        const c = new SimpleTestController();
        const routes = (c as SimpleTestController & RouteProvider).routes();
        expect(routes).toMatchObject(
            [
                {
                    method: 'GET',
                    path: '/basePath/test',
                    handler: expect.any(Function),
                    options: {}
                },
                {
                    method: 'POST',
                    path: '/basePath/test2',
                    handler: expect.any(Function),
                    options: { payload: expect.objectContaining({ multipart: true }) }
                },
                // From top to down on last method: defined order of decorators!
                {
                    method: 'PUT',
                    path: '/basePath/test3',
                    handler: expect.any(Function),
                    options: {
                        payload: expect.objectContaining({ maxBytes: 1000000 })
                    }
                },
                {
                    method: 'PATCH',
                    path: '/basePath/test3',
                    handler: expect.any(Function),
                    options: { payload: expect.objectContaining({ maxBytes: 500 }) }
                },
                {
                    method: 'OPTIONS',
                    path: '/basePath/test3',
                    handler: expect.any(Function),
                    options: { payload: expect.objectContaining({ multipart: true }) }
                }
            ]
        );
        // We expact that Payload does not bubble up if there was another payload decorator
        expect(routes?.[4]?.options?.payload).not.toHaveProperty("maxBytes");
    });
});