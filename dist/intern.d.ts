import type { Knex } from 'knex';
declare const intern: {
    findKnex(knex: Knex, ent: any, q: any): Promise<any>;
    firstKnex(knex: Knex, ent: any, q: any): Promise<any>;
    insertKnex(knex: Knex, ent: any): Promise<any>;
    updateKnex(knex: Knex, ent: any): Promise<any>;
    removeKnex(knex: Knex, ent: any, q: any): Promise<any>;
    upsertKnex(knex: Knex, ent: any, data: any, q: any): Promise<any>;
    tablenameUtil(ent: any): string;
    makeentp(ent: any): any;
    isObject(x: any): boolean;
    isObjectEmpty(object: any): boolean;
    isDate(x: any): boolean;
    getConfig(spec: any): any;
    makeent(ent: any, row: any): any;
    isUpdate(knex: Knex, ent: any, q: any): Promise<boolean>;
    getKnexClient(knex: Knex, seneca: any, msg: any, meta: any): Promise<any>;
};
export default intern;
