import { ServerRoute } from "@hapi/hapi";
import { createRoutes, MethodMetaData } from "./util";

export interface RouteProvider {
    routes(): ServerRoute[];
}

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Controller decorator to define a controller with a specific base path.
 *
 * @remarks
 * This decorator augments a class with route metadata. The class will have an additional
 * "metadata" property that contains the base path for the controller and a "routes" method that
 * returns all routes created using the decorator.
 *
 * @param options - An object containing configuration options for the controller OR just the path as string.
 * @param options.path - The base path that will prefix all routes defined in the controller. Please be aware that this will be a pure string concatenation, no fancy path joining
 *
 * @returns A class decorator that returns an extended version of the original class with added metadata.
 */
export const Controller = (options: { path: string; } | string) => {
    return <T extends Constructor>(target: T): T & Constructor<RouteProvider> => {
        return class extends target implements RouteProvider {
            __metadata = {
                path: typeof options == "string" ? options : options.path,
            };

            routes(): ServerRoute[] {
                return createRoutes(this);
            }
        };
    };
};

const Route = (method: string, path: string, additionalConfig?: any, multipartFormData?: boolean) => {
    return (originalMethod: any, context: any) => {
        if (!originalMethod.__metadata) {
            originalMethod.__metadata = new MethodMetaData();
        }
        originalMethod.__metadata.addRoute(method, path, additionalConfig);
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
 * @param additionalConfig - Additional configuration options for the route - see hapi documentation for more details.
 *
 */
export const Get = (path: string, additionalConfig?: any) => Route("get", path, additionalConfig);
export const Delete = (path: string, additionalConfig?: any) => Route("delete", path, additionalConfig);
export const Patch = (path: string, additionalConfig?: any) => Route("patch", path, additionalConfig, true);
export const Post = (path: string, additionalConfig?: any) => Route("post", path, additionalConfig, true);
export const Options = (path: string, additionalConfig?: any) => Route("options", path, additionalConfig, true);
export const Put = (path: string, additionalConfig?: any) => Route("put", path, additionalConfig, true);
export const All = (path: string, additionalConfig?: any) => Route("*", path, additionalConfig);

export const Auth = (strategy: string | boolean | object) => {
    return (target: any) => {
        if (!target.__metadata) {
            target.__metadata = new MethodMetaData();
        }
        target.__metadata.setAuthStrategy(strategy);
    };
};
