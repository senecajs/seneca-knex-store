import type { Knex } from 'knex';
declare function QBuilder(knex: Knex): {
    upsert(args: {
        table_name: string;
        data: any;
        id: string;
    }): Knex.QueryBuilder<any, {
        _base: any;
        _hasSelection: true;
        _keys: string;
        _aliases: {};
        _single: false;
        _intersectProps: {};
        _unionProps: never;
    }[]>;
    update(args: {
        table_name: string;
        data: any;
        id: string;
    }): Knex.QueryBuilder<any, {
        _base: any;
        _hasSelection: false;
        _keys: never;
        _aliases: {};
        _single: false;
        _intersectProps: {};
        _unionProps: never;
    }[]>;
    insert(args: {
        table_name: string;
        data: any;
        upsert?: any;
    }): Knex.QueryBuilder<any, {
        _base: any;
        _hasSelection: false;
        _keys: never;
        _aliases: {};
        _single: false;
        _intersectProps: {};
        _unionProps: never;
    }[]>;
    delete(args: {
        table_name: string;
        filter: readonly string[];
        isLoad: boolean;
        skip?: number | null;
        isArray?: boolean;
    }): Knex.QueryBuilder<any, {
        _base: any;
        _hasSelection: false;
        _keys: never;
        _aliases: {};
        _single: false;
        _intersectProps: {};
        _unionProps: never;
    }[]> | Knex.QueryBuilder<any, number>;
    truncate(args: {
        table_name: string;
    }): Knex.QueryBuilder<any, void>;
    select(args: {
        table_name: string;
        data: any;
        isArray?: boolean;
        sort: {
            field: string;
            order: string;
        } | null;
        skip?: number | null;
        limit?: number | null;
    }): Knex.QueryBuilder<any, {
        _base: any;
        _hasSelection: false;
        _keys: never;
        _aliases: {};
        _single: false;
        _intersectProps: {};
        _unionProps: never;
    }[]>;
    first(args: {
        table_name: string;
        filter: any;
        sort: {
            field: string;
            order: string;
        } | null;
        skip?: number | null;
    }): Knex.QueryBuilder<any, {
        _base: any;
        _hasSelection: false;
        _keys: never;
        _aliases: {};
        _single: false;
        _intersectProps: {};
        _unionProps: undefined;
    }>;
    raw(args: {
        query: string;
        data?: any;
    }): Knex.Raw<any>;
};
export default QBuilder;
