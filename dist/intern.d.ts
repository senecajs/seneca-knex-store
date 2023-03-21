declare const intern: {
    findKnex(knex: any, ent: any, q: any): Promise<any>;
    firstKnex(knex: any, ent: any, q: any): Promise<any>;
    insertKnex(knex: any, ent: any, q: any): Promise<any>;
    updateKnex(knex: any, ent: any): Promise<any>;
    removeKnex(knex: any, ent: any, q: any): Promise<any>;
    upsertKnex(knex: any, ent: any, data: any, q: any): Promise<any>;
    tablenameUtil(ent: any): string;
    makeentp(ent: any): any;
    isObject(x: any): boolean;
    isObjectEmpty(object: any): boolean;
    isDate(x: any): boolean;
    getConfig(spec: any): any;
    makeent(ent: any, row: any): any;
    isUpdate(knex: any, ent: any, q: any): Promise<boolean>;
};
export default intern;
