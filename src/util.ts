import { ServerRoute } from "@hapi/hapi";
import debugFn from "debug";

const debug = debugFn("decorators");
export class MethodMetaData {

    currentConfig: any = { options: {} };
    routes: { method: string, path: string, additionalConfig?: any; }[] = [];
    multipartFormData: boolean;

    addRoute(method: string, path: string, additionalConfig = undefined) {
        const config = {
            ...this.currentConfig,
            ...additionalConfig,
            options: {
                ...this.currentConfig.options,
                ...additionalConfig?.options,
            }
        };
        this.routes.push({ method, path, additionalConfig: config });
        return this;
    }

    setAuthStrategy(strategy: string | boolean | object) {
        if (!this.currentConfig.options) {
            this.currentConfig.options = {};
        }
        this.currentConfig.options.auth = strategy;
        return this;
    }

    setMultipartFormData() {
        this.multipartFormData = true;
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
    const basePath = routeObject.__metadata?.path || "";
    const methods = Object.entries(getAllPropertyDescriptors(routeObject));
    methods.forEach(([key, descriptor]: [key: string, descriptor: PropertyDescriptor]) => {
        if (key === "constructor") return;
        if (!descriptor.value?.__metadata) return;
        const { routes, multipartFormData } = descriptor.value.__metadata;
        if (!routes) return;
        const defaultOptions = multipartFormData ? { payload: { multipart: true } } : {};
        for (const { method, path, additionalConfig } of routes) {
            const routePath = basePath + path;
            debug(`Creating route ${method.toUpperCase()} ${routePath} ${multipartFormData ? "[multipart]" : ""}`);
            const handler = descriptor.value.bind(routeObject);
            const routeConfiguration = {
                method: method.toUpperCase(),
                path: routePath,
                handler: handler,
                options: defaultOptions,
                ...(additionalConfig || {})
            };
            // console.log(`Route: ${routeConfiguration.method} ${routeConfiguration.path}`, routeConfiguration);
            resultRoutes.push(routeConfiguration);
        }
    });
    return resultRoutes;
};

