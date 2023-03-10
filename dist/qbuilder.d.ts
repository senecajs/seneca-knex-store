declare const Q: {
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
        id: string;
    }): any;
    truncate(args: {
        table_name: string;
    }): any;
    select(args: {
        table_name: string;
    }): any;
    first(args: {
        table_name: string;
        id: string;
    }): any;
};
export default Q;
