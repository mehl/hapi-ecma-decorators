# Hapi Routing Decorators using ECMA Proposal Stage 3

This package offers a seamless way to define routes in [hapi.dev](https://hapi.dev) using the new **ECMAScript decorators**, implementing the most current [Proposal Stage 3](https://github.com/tc39/proposal-decorators), using the also Stage 3 [metadata on decorators](https://github.com/tc39/proposal-decorator-metadata)

It is currently tested and known to work with esbuild 0.25+.

## Features

- Define routes using class methods and decorators.
- Cleaner and more maintainable route definitions.

Be aware that not all hapi route configuration options are supported currently.

## Status

Although this package is in early stage, I already use it in productive environments. It is known to work with esbuild 0.25+. Testing against other implementations of ECMA Decorators (babel, tsc) still to be done.

## Usage

### Installation

```shell
# Use the package manager of your choice
npm add hapi-ecma-decorators
yarn add hapi-ecma-decorators
```

### Example

```typescript
import Hapi from '@hapi/hapi';
import { Controller, Get, RouteProvider } from 'hapi-ecma-decorators';

// 1)
@Controller({path: '/api'})
class ApiController {

    // 2)
    @Get('/hello')
    async getHello(request, h) {
        return { message: 'Hello, world!' };
    }

    // 2)
    @Post('/data')
    async postData(request, h) {
        const { payload } = request;
        return { received: payload };
    }
}

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    });

    // 3)
    server.route((new ApiController() as ApiController & RouteProvider).routes());

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

init();
```

### Explanation

1. **Controller Decorator**: Use `@Controller` to define a base path for all routes in the class.
2. **Get and Post Decorators**: Use `@Get` and `@Post` to define HTTP methods and paths for individual methods.
3. **Registering Controllers**: Get all routes from your new controller object and give them to the server. 

## In Detail

### @Controller(options: {path: string})

This decorator is used to define a controller with a specific base path. It augments the decorated class with additional route metadata and a `routes` method that returns all the routes created using this decorator.

**Remarks:**  
- Enhances the class with a `__metadata` property containing routing information.
- Adds a `routes` method that aggregates all routes defined with the decorator.

**Parameters:**  
- `options`: An object with configuration options for the controller.
    - `options.path`: A string representing the base path that will prefix all routes. Note that this is a **simple string concatenation** without any advanced path joining.

**Returns:**  
A class decorator that extends the original class with added metadata.

### @Get(path: string, options: object)
### @Delete(path: string, options: object)
### @Options(path: string, options: object)
### @Post(path: string, options: object)
### @Put(path: string, options: object)
### @Patch(path: string, options: object)
### @All(path: string, options: object)

Route decorators are available for HTTP methods such as GET, DELETE, PATCH, POST, and PUT, as well as a decorator to handle all requests. These decorators allow you to define a route with the specified path and additional options, as outlined below.

**Parameters:**  
- The `path` parameter specifies the route's path.
- The `options` parameter accepts additional configuration options for the route. Refer to the hapi.js documentation for further details.

**Multipart Payload Support**:  

Automatic multipart payload support was removed (didn't work anyway) and is replaced now by `@Payload('multipart')`

### @Auth(authStrategy: string | boolean | object)

Defines the auth strategy for the current route. Can be either a string (name of a registered strategoy), boolean (true: do auth, false: don't), or c a complete auth configuration object like it is used in hapi route definitions.

The `@Auth` always applies to all routes of the current method that are defined **above** the `@Auth` decorator, so order matters. Example:

```javascript
class Example {
    ...
    @Options(...)
    @Post(...)
    @Auth(true) // Applies to Options and Post
    @Get(...)
    @Auth(false) // Applies to Get
    method() {
        ...
    }
    ...
}
```

### @Payload(payload: "multipart" | object)

Defines a payload for the current route. Either a complete payload definition object, or just the string `multipart`, which simply sets `options.payload.multipart = true`

Rules for more then one route decorator are the same as for `@Auth`.

## Requirements

- esbuild 0.21+ (or similar transpiling) for ECMA decorator support
- Hapi.js

## Changes

### v0.2.0

#### Remove "magic" multipart for POST/PUT/PATCH and added new @Payload decorator instead

Similar to @Auth the new @Payload decorator can define a payload object for routes. This replaces the magic "multipart: true" for POST/PATCH/PUT, which normally would be a **breaking change**. But it didn't work in the last version anyway, so I decided to go for 0.2.0

#### Added tests using vitest

Decorators are now tested with vitest.

### v0.1.0

Initial release


## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## See also

https://www.npmjs.com/package/hapi-ecma-decorators  
https://hapi-decorators.bastian-frank.de/

