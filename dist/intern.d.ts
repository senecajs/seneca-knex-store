export declare class intern {
    static asyncMethod(f: any): (this: any, msg: any, done: any, meta: any) => any;
    static findKnex(ent: any, q: any, knex: any): Promise<any>;
    static firstKnex(ent: any, q: any, knex: any): Promise<any>;
    static insertKnex(ent: any, knex: any): Promise<any>;
    static updateKnex(ent: any, knex: any): Promise<any>;
    static removeKnex(ent: any, q: any, knex: any): Promise<any>;
    static upsertKnex(ent: any, data: any, q: any, knex: any): Promise<any>;
    static tablenameUtil(ent: any): string;
    static makeentp(ent: any): any;
    static isObject(x: any): boolean;
    static isObjectEmpty(object: any): boolean;
    static isDate(x: any): boolean;
    static getConfig(spec: any): any;
    static msgForGenerateId(args: any): {
        role: any;
        target: any;
        hook: string;
    };
    static generateId(): any;
    static makeent(ent: any, row: any): any;
    static isUpdate(ent: any, knex: any): Promise<boolean>;
    static execQuery(query: any, ctx: any): Promise<any>;
    static deepXformKeys(f: any, x: any): any;
}
