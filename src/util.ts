import { AuthSettings, RouteOptions, RouteOptionsPayload, RouteOptionsValidate, ServerRoute } from "@hapi/hapi";
import debugFn from "debug";

const debug = debugFn("decorators");

export const routingMetaData = Symbol("routingMetaData");

export const getOrCreateClassMetaData = (context: ClassMethodDecoratorContext) => {
    if (context.metadata && !context.metadata?.[routingMetaData]) {
        context.metadata[routingMetaData] = new ClassRouteMetaData();
    }
    return context.metadata?.[routingMetaData] as ClassRouteMetaData;
};

export const getOrCreateMethodMetaData = (context: ClassMethodDecoratorContext, methodName: string) => {
    if (context.metadata && !context.metadata?.[routingMetaData]) {
        context.metadata[routingMetaData] = new ClassRouteMetaData();
    }
    const classRouteMeta = context.metadata?.[routingMetaData] as ClassRouteMetaData;

    if (!classRouteMeta.methods[methodName]) {
        classRouteMeta.addMethod(methodName, new MethodMetaData());
    }

    return classRouteMeta.methods[methodName];
};
export class ClassRouteMetaData {

    basePath: string = "";
    methods: { [name: string]: MethodMetaData; } = {};

    setBasePath(path: string) {
        this.basePath = path;
    }

    addMethod(name: string, methodMetaData: MethodMetaData) {
        this.methods[name] = methodMetaData;
    }
}
export class MethodMetaData {

    currentConfig: any = { options: {} };
    routes: { method: string, path: string, additionalConfig?: Partial<ServerRoute>; }[] = [];

    addRoute(method: string, path: string, additionalConfig: Partial<ServerRoute> | undefined = undefined) {
        const config = {
            ...this.currentConfig,
            ...(additionalConfig || {}),
            options: {
                ...(this.currentConfig.options || {}),
                ...(additionalConfig?.options || {}),
            }
        };
        this.routes.push({ method, path, additionalConfig: config });
        return this;
    }

    setAuthStrategy(strategy: string | boolean | AuthSettings) {
        if (!this.currentConfig.options) {
            this.currentConfig.options = {};
        }
        this.currentConfig.options.auth = strategy;
        return this;
    }

    setValidate(validate: RouteOptionsValidate) {
        if (!this.currentConfig.options) {
            this.currentConfig.options = {};
        }
        this.currentConfig.options.validate = {
            ...(this.currentConfig.options.validate || {}),
            ...validate
        };
        return this;
    }

    setPayload(payload: "multipart" | RouteOptionsPayload) {
        if (!this.currentConfig.options) {
            this.currentConfig.options = {};
        }
        if (typeof payload === "string" && payload === "multipart") {
            this.currentConfig.options.payload = {
                multipart: true
            };
        } else if (typeof payload === "object") {
            this.currentConfig.options.payload = {
                ...this.currentConfig.options.payload,
                ...payload
            };
        }
        return this;
    }

}

function getAllPropertyDescriptors(obj: Object): { [key: string]: PropertyDescriptor; } {
    const descriptors = {};
    let current = obj;
    while (current && current !== Object.prototype) {
        const currentDescriptors = Object.getOwnPropertyDescriptors(current);
        // Merge: Untergeordnete Klassen überschreiben ggf. obere
        Object.assign(descriptors, currentDescriptors);
        current = Object.getPrototypeOf(current);
    }
    return descriptors;
}

export const createRoutes = (routeObject: any): ServerRoute[] => {
    const resultRoutes: ServerRoute[] = [];
    const routeMetaData = routeObject.__metadata as ClassRouteMetaData;
    const basePath = routeMetaData.basePath || "";

    const methods = Object.entries(getAllPropertyDescriptors(routeObject));
    methods.forEach(([key, descriptor]: [key: string, descriptor: PropertyDescriptor]) => {
        // Do not allow constructor to be a route
        if (key === "constructor") return;
        const methodMetaData = routeMetaData.methods[key];
        if (!methodMetaData) return;
        const { routes } = methodMetaData;
        if (!routes) return;
        const defaultOptions = {};
        for (const { method, path, additionalConfig } of routes) {
            const routePath = basePath + path;
            const multipartFormData = (additionalConfig?.options as RouteOptions)?.payload?.multipart;
            debug(`Creating route ${method.toUpperCase()} ${routePath} ${multipartFormData ? "[multipart]" : ""}`);
            const handler = descriptor.value.bind(routeObject);
            const routeConfiguration = {
                method: method.toUpperCase(),
                path: routePath,
                handler: handler,
                ...(additionalConfig || {}),
                options: {
                    ...defaultOptions,
                    ...additionalConfig?.options,
                }
            } as ServerRoute;
            // console.log(`Route: ${routeConfiguration.method} ${routeConfiguration.path}`); //, routeConfiguration
            resultRoutes.push(routeConfiguration);
        }
    });
    return resultRoutes;
};

