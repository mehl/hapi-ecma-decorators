import { AuthSettings, RouteOptionsPayload, RouteOptionsValidate, ServerRoute } from "@hapi/hapi";
import { createRoutes, getOrCreateClassMetaData, getOrCreateMethodMetaData } from "./util";

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
 * @param options - An object containing configuration options for the controller OR just the path as string. If it is an object: path is the base path that will prefix all routes defined in the controller. Please be aware that this will be a pure string concatenation, no fancy path joining
 *
 * @returns A class decorator that returns an extended version of the original class with added metadata.
 */
export const Controller = (options: { path: string; } | string) => {
    return <T extends Constructor>(target: T, context: any): T & Constructor<RouteProvider> => {
        const metaData = getOrCreateClassMetaData(context);
        metaData.setBasePath(typeof options == "string" ? options : options.path);
        return class extends target implements RouteProvider {
            // Symbol.meta is not supported (yet?) in all environments, so we use a custom property
            __metadata = metaData;
            routes(): ServerRoute[] {
                return createRoutes(this);
            }
        };
    };
};

const Route = (method: string, path: string, additionalConfig?: Partial<ServerRoute>) => {
    return (originalMethod: any, context: ClassMethodDecoratorContext) => {
        const metaData = getOrCreateMethodMetaData(context, originalMethod.name);
        metaData.addRoute(method, path, additionalConfig);
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
export const Get = (path: string, additionalConfig?: Partial<ServerRoute>) => Route("get", path, additionalConfig);
export const Delete = (path: string, additionalConfig?: Partial<ServerRoute>) => Route("delete", path, additionalConfig);
export const Patch = (path: string, additionalConfig?: Partial<ServerRoute>) => Route("patch", path, additionalConfig);
export const Post = (path: string, additionalConfig?: Partial<ServerRoute>) => Route("post", path, additionalConfig);
export const Options = (path: string, additionalConfig?: Partial<ServerRoute>) => Route("options", path, additionalConfig);
export const Put = (path: string, additionalConfig?: Partial<ServerRoute>) => Route("put", path, additionalConfig);
export const All = (path: string, additionalConfig?: Partial<ServerRoute>) => Route("*", path, additionalConfig);

export const Auth = (strategy: string | boolean | AuthSettings) => {
    return (originalMethod: any, context: ClassMethodDecoratorContext) => {
        const metaData = getOrCreateMethodMetaData(context, originalMethod.name);
        metaData.setAuthStrategy(strategy);
    };
};

export const Payload = (payload: "multipart" | RouteOptionsPayload) => {
    return (originalMethod: any, context: ClassMethodDecoratorContext) => {
        const metaData = getOrCreateMethodMetaData(context, originalMethod.name);
        metaData.setPayload(payload);
    };
};

export const Validate = (validate: RouteOptionsValidate) => {
    return (originalMethod: any, context: ClassMethodDecoratorContext) => {
        const metaData = getOrCreateMethodMetaData(context, originalMethod.name);
        metaData.setValidate(validate);
    };
};
