import { createRoutes, MethodMetaData } from "./util";

export interface RouteProvider {
    routes(): any[];
}

/**
 * Controller decorator to define a controller with a specific base path.
 *
 * @remarks
 * This decorator augments a class with route metadata. The class will have an additional
 * "metadata" property that contains the base path for the controller and a "routes" method that
 * returns all routes created using the decorator.
 *
 * @param options - An object containing configuration options for the controller.
 * @param options.path - The base path that will prefix all routes defined in the controller. Please be aware that this will be a pure string concatenation, no fancy path joining
 *
 * @returns A class decorator that returns an extended version of the original class with added metadata.
 */
export const Controller = (options: { path: string; }) => {
    return <T extends { new(...args: any[]); }>(target: T): T & { new(...args: any[]): RouteProvider; } => {
        return class extends target implements RouteProvider {
            __metadata = {
                path: options.path,
            };

            routes() {
                return createRoutes(this);
            }
        };
    };
};

const Route = (method: string, path: string, options?: any, multipartFormData?: boolean) => {
    return (originalMethod: any, context: any) => {
        if (!originalMethod.__metadata) {
            originalMethod.__metadata = new MethodMetaData();
        }
        originalMethod.__metadata.addRoute(method, path, options);
        if (multipartFormData) {
            originalMethod.__metadata.setMultipartFormData();
        }
    };
};

/**
 * Route decorators for HTTP GET/DELETE/PATCH/POST/PUT or all requests.
 *
 * @remarks
 * These decorators register a HTTP GET/DELETE/PATCH/POST/PUT or all methods (*) route with the specified path and optional options.
 * It automatically marks the POST/PUT/PATCH to handle multipart form data.
 *
 * @param path - The path for the HTTP GET/DELETE/PATCH/POST/PUT or all methods route.
 * @param options - Additional configuration options for the route - see hapi documentation for more details.
 *
 */
export const Get = (path: string, options?: any) => Route("get", path, options);
export const Delete = (path: string, options?: any) => Route("delete", path, options);
export const Patch = (path: string, options?: any) => Route("patch", path, options, true);
export const Post = (path: string, options?: any) => Route("post", path, options, true);
export const Put = (path: string, options?: any) => Route("put", path, options, true);

export const All = (path: string, options?: any) => Route("*", path, options);
