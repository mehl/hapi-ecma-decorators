# Hapi ECMA Decorators for Routing

I love decorators, and with esbuild supporting modern ECMAScript syntax starting from version 0.21, I am eager to embrace them in my projects. This package offers a seamless way to define routes in [hapi.dev](https://hapi.dev) using the new ECMAScript decorators.

## Features

- Define routes using class methods and decorators.
- Cleaner and more maintainable route definitions.

Be aware that not all hapi route configuration options are supported currently.

## Usage

### Example

```typescript
import Hapi from '@hapi/hapi';
import { Controller, Get } from 'hapi-ecma-decorators';

@Controller({path: '/api'})
class ApiController {
    @Get('/hello')
    async getHello(request, h) {
        return { message: 'Hello, world!' };
    }

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

    // Yes, I know, I'm using any here.
    server.route((new ApiController() as any).routes());

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
- Enhances the class with a `metadata` property containing the base path.
- Adds a `routes` method that aggregates all routes defined with the decorator.

**Parameters:**  
- `options`: An object with configuration options for the controller.
    - `options.path`: A string representing the base path that will prefix all routes. Note that this is a simple string concatenation without any advanced path joining.

**Returns:**  
A class decorator that extends the original class with added metadata.

### @GET(path: string, options: object)
### @DELETE(path: string, options: object)
### @POST(path: string, options: object)
### @PUT(path: string, options: object)
### @PATCH(path: string, options: object)
### @ALL(path: string, options: object)

Route decorators are available for HTTP methods such as GET, DELETE, PATCH, POST, and PUT, as well as a decorator to handle all requests. These decorators allow you to define a route with the specified path and additional options, as outlined below.

**Parameters:**  
- The `path` parameter specifies the route's path.
- The `options` parameter accepts additional configuration options for the route. Refer to the hapi.js documentation for further details.

**Automatic Multipart Support**:  
    For POST, PUT, and PATCH routes, multipart form data handling is enabled automatically.

These decorators streamline the process of registering routes by marking methods with the appropriate HTTP verb and ensuring necessary configurations are in place.

## Requirements

- esbuild 0.21+ (or similar transpiling) for ECMA decorator support
- Hapi.js

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.
