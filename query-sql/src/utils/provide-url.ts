export function provideURL({ dbName, sql, pandas }: { dbName: string, sql: string, pandas: boolean }) {

    const { REACT_APP_SQL_API_URL, REACT_APP_SQL_TYPE, REACT_APP_SQL_DB_NAME } = process.env;

    const url = `${REACT_APP_SQL_API_URL}/${pandas ? 'pandas/' : ''}${sql || REACT_APP_SQL_TYPE}/execute_sql?db_name=${dbName || REACT_APP_SQL_DB_NAME}`;

    console.log({ url });

    return url
}