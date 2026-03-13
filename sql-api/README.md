## Server
1. Create `.env` file
2. `pip install -r requirements.txt`
3. `python main.py` or `flask run`
4. Port is `8080` or `5000`

## Client
1. Default `db_name` is from `.env`:
```sh
curl -X POST -d \
'{
    "query": "Select * from orders order by ord_no desc;"
}' \
-H "Content-Type: application/json" \
'http://127.0.0.1:8080/postgresql/execute_sql'
```

2. Or specify the `db_name`:
```sh
curl -X POST -d \
'{
    "query": "Select * from orders order by ord_no desc;"
}' \
-H "Content-Type: application/json" \
'http://127.0.0.1:8080/postgresql/execute_sql?db_name=test'
```

2. Or query with pandas:
```sh
curl -X POST -d \
'{
    "query": "Select * from orders order by ord_no desc;"
}' \
-H "Content-Type: application/json" \
'http://127.0.0.1:8080/pandas/postgresql/execute_sql?db_name=test'
```

3. Request on live
```sh
curl -X POST -d \
'{
    "query": "Select version();"
}' \
-H "Content-Type: application/json" \
'https://sql-api-j2jrnhonua-lz.a.run.app/postgresql/execute_sql?db_name=together-ai'
```

# MySQL
```sh
curl -X POST -d \
'{
    "query": "Select version();"
}' \
-H "Content-Type: application/json" \
'http://127.0.0.1:8080/mysql/execute_sql?db_name=together-ai'
```

# SQL Server
```sh
curl -X POST -d \
'{
    "query": "SELECT @@version;"
}' \
-H "Content-Type: application/json" \
'http://127.0.0.1:8080/sqlserver/execute_sql?db_name=together-ai'
```
