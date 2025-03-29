import debugFn from "debug";

const debug = debugFn("decorators");
export class MethodMetaData {
    routes: { method: string, path: string, options?: any; }[] = [];
    multipartFormData: boolean;

    addRoute(method: string, path: string, options = undefined) {
        this.routes.push({ method, path, options });
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

export const createRoutes = (routeObject: any) => {
    const resultRoutes: any[] = [];
    const basePath = routeObject.__metadata?.path || "";
    const methods = Object.entries(getAllPropertyDescriptors(routeObject));
    methods.forEach(([key, descriptor]: [key: string, descriptor: PropertyDescriptor]) => {
        if (key === "constructor") return;
        if (!descriptor.value?.__metadata) return;
        const { routes, multipartFormData } = descriptor.value.__metadata;
        if (!routes) return;
        const defaultOptions = multipartFormData ? { payload: { multipart: true } } : {};
        for (const { method, path, options } of routes) {
            const routePath = basePath + path;
            debug(`Creating route ${method.toUpperCase()} ${routePath} ${multipartFormData ? "[multipart]" : ""}`);
            const handler = descriptor.value.bind(routeObject);
            const routeConfiguration = {
                method: method.toUpperCase(),
                path: routePath,
                handler: handler,
                options: defaultOptions,
                ...(options || {})
            };
            resultRoutes.push(routeConfiguration);
        }
    });
    return resultRoutes;
};

