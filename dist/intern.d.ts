export declare class intern {
    static asyncMethod(f: any): (this: any, msg: any, done: any, meta: any) => any;
    static findKnex(ent: any): Promise<any>;
    static firstKnex(ent: any, id: string): Promise<any>;
    static insertKnex(ent: any, data: any): Promise<any>;
    static updateKnex(ent: any, data: any): Promise<any>;
    static removeKnex(ent: any, q: any): Promise<any>;
    static upsertKnex(ent: any, data: any, q: any): Promise<any>;
    static tablenameUtil(ent: any): string;
    static makeentp(ent: any): any;
    static isObject(x: any): boolean;
    static isDate(x: any): boolean;
    static isNew(ent: any): Promise<boolean>;
    static getConfig(spec: any): any;
    static buildCtx(seneca: any, msg: any, meta: any): {};
    static msgForGenerateId(args: any): {
        role: any;
        target: any;
        hook: string;
    };
    static generateId(): any;
    static withDbClient(dbPool: any, ctx: any, f: any): Promise<any>;
    static makeent(ent: any, row: any): any;
    static isUpdate(msg: any): boolean;
    static execQuery(query: any, ctx: any): Promise<any>;
    static identity(x: any): any;
}
