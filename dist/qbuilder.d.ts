declare function qBuilder(knex: any): {
    upsert(args: {
        table_name: string;
        data: any;
        id: string;
    }): any;
    update(args: {
        table_name: string;
        data: any;
        id: string;
    }): any;
    insert(args: {
        table_name: string;
        data: any;
    }): any;
    delete(args: {
        table_name: string;
        filter: string;
        isLoad: boolean;
        skip?: number | null;
    }): any;
    truncate(args: {
        table_name: string;
    }): any;
    select(args: {
        table_name: string;
        data: any;
        isArray: boolean;
        sort: {
            field: string;
            order: string;
        } | null;
        skip?: number | null;
        limit?: number | null;
    }): any;
    first(args: {
        table_name: string;
        filter: any;
        sort: {
            field: string;
            order: string;
        } | null;
        skip?: number | null;
    }): any;
};
export default qBuilder;
