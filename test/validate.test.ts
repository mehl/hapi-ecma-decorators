import { describe, it, expect } from 'vitest';
import { Auth, Controller, Get, Options, Patch, Post, Put, RouteProvider, Validate } from '../src/index';


@Controller('/validateBasePath')
class ValidateTestController {

    @Get('/test')
    @Validate({
        payload: true
    })
    @Validate({
        headers: false
    })
    testMethod() {
        return 'test';
    }

}

describe('hapi-ecma-decorators', () => {
    it('should register configured auth routes', async () => {
        const c = new ValidateTestController();
        const routes = (c as ValidateTestController & RouteProvider).routes();
        expect(routes).toMatchObject(
            [
                {
                    method: 'GET',
                    path: '/validateBasePath/test',
                    handler: expect.any(Function),
                    options: {
                        validate: {
                            payload: true,
                            headers: false
                        }
                    }
                }
            ]
        );
    });
});