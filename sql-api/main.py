import os
from flask import Flask, request, jsonify
import os
import psycopg2
from flask_cors import CORS
import mysql.connector
from sqlalchemy import create_engine
import pandas as pd
from flask_jsonpify import jsonpify
import pymssql

app = Flask(__name__)
# CORS(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/")
def hello_world():
    available_endpoints = {
        "postgresql":
        {
            "/postgresql/execute_sql": "Connects with package psycopg2",
            "/pandas/postgresql/execute_sql": "Connects with pandas engine"
        },
        "mysql": {
            "/mysql/execute_sql": "Connects with package mysql.connector",
            "/pandas/mysql/execute_sql": "Connects with pandas engine"
        },
        "sqlserver": {
            "/sqlserver/execute_sql": "Connects with package pymssql",
            "/pandas/sqlserver/execute_sql": "Connects with pandas engine"
        }
    }

    return jsonify(available_endpoints)


@app.route('/postgresql/execute_sql', methods=['POST'])
def postgres_execute_sql():
    payload = request.json  # a multidict containing POST data
    conn = None

    try:
        conn = psycopg2.connect(
            database=request.args.get(
                'db_name',
                os.environ["postgresql_db_name"]
            ),
            user=os.environ["postgresql_db_user"],
            password=os.environ["postgresql_db_password"],
            host=os.environ["postgresql_db_host"],
            port=os.environ["postgresql_db_port"]
        )

        # Creating a cursor object using the cursor() method
        cursor = conn.cursor()

        # Executing an MYSQL function using the execute() method
        cursor.execute(payload["query"])
        # Fetch a single row using fetchone() method.
        retVal = None
        try:
            data = cursor.fetchall()
            data_structured = {}

            for i, col_vals in enumerate(cursor.description):
                data_structured[col_vals[0]] = [d[i] for d in data]

            retVal = {
                "success": True,
                "data": data_structured
            }
        except Exception as e:
            retVal = {
                "query": payload["query"],
                "success": True,
                "message": "Query executed successfully, no result returned!"
            }
    except Exception as e:
        retVal = {
            "query": payload["query"],
            "success": False,
            "message": "An error occurred.", "error": repr(e)
        }
    finally:
        if conn:
            conn.commit()
            conn.close()

    return retVal


@app.route('/pandas/postgresql/execute_sql', methods=['POST'])
def pandas_postgres_execute_sql():
    db_host = os.environ["postgresql_db_host"]
    db_pass = os.environ["postgresql_db_password"]
    db_user = os.environ["postgresql_db_user"]
    db_name = request.args.get('db_name', os.environ["postgresql_db_name"])
    db_port = os.environ["postgresql_db_port"]

    try:
        payload = request.json  # a multidict containing POST data

        engine = create_engine(
            f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}")
        df = pd.read_sql_query(payload["query"], engine)
        df_list = df.values.T.tolist()
        JSONP_data = jsonpify(df_list)

        retVal = JSONP_data
    except Exception as e:
        retVal = {
            "query": payload["query"],
            "success": False,
            "message": "An error occurred.", "error": repr(e)
        }
    finally:
        pass

    return retVal


@app.route('/mysql/execute_sql', methods=['POST'])
def mysql_execute_sql():
    payload = request.json  # a multidict containing POST data
    db = None

    try:
        db = mysql.connector.connect(
            host=os.environ["mysql_db_host"],
            user=os.environ["mysql_db_user"],
            password=os.environ["mysql_db_password"],
            database=request.args.get('db_name', os.environ["mysql_db_name"])
        )

        # you must create a Cursor object. It will let
        #  you execute all the queries you need
        cur = db.cursor()

        # Use all the SQL you like
        cur.execute(payload["query"])
        retVal = None
        try:
            # print all the first cell of all the rows
            data = cur.fetchall()

            data_structured = {}

            for i, col_vals in enumerate(cur.description):
                data_structured[col_vals[0]] = [d[i] for d in data]

            retVal = {
                "success": True,
                "result": data_structured, "alias_names": [i[0] for i in cur.description]
            }

        except Exception as e:
            retVal = {
                "query": payload["query"],
                "success": True,
                "message": "Query executed successfully, no result returned!"
            }
    except Exception as e:
        retVal = {
            "query": payload["query"],
            "success": False,
            "message": "An error occurred.", "error": repr(e)
        }
    finally:
        if db:
            db.commit()
            db.close()

    return retVal


@app.route('/pandas/mysql/execute_sql', methods=['POST'])
def pandas_mysql_execute_sql():
    db_host = os.environ["mysql_db_host"]
    db_pass = os.environ["mysql_db_password"]
    db_user = os.environ["mysql_db_user"]
    db_name = request.args.get('db_name', os.environ["mysql_db_name"])
    db_port = os.environ["mysql_db_port"]

    try:
        payload = request.json  # a multidict containing POST data
        db_connection_str = f'mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'

        engine = create_engine(db_connection_str)
        df = pd.read_sql_query(payload["query"], engine)
        df_list = df.values.T.tolist()
        JSONP_data = jsonpify(df_list)

        retVal = JSONP_data
    except Exception as e:
        retVal = {
            "query": payload["query"],
            "success": False,
            "message": "An error occurred.", "error": repr(e)
        }
    finally:
        pass

    return retVal


@app.route('/sqlserver/execute_sql', methods=['POST'])
def sqlserver_execute_sql():
    payload = request.json  # a multidict containing POST data
    conn = None

    try:
        # for row in cursor:
        #     print('row = %r' % (row,))
        #     payload = request.json  # a multidict containing POST data
        #     conn = None
        conn = pymssql.connect(
            server=os.environ["sqlserver_db_host"],
            user=os.environ["sqlserver_db_user"],
            password=os.environ["sqlserver_db_password"],
            database=request.args.get(
                'db_name', os.environ["sqlserver_db_name"])
            # , as_dict=True
        )

        # Creating a cursor object using the cursor() method
        cursor = conn.cursor()
        # Executing an MYSQL function using the execute() method
        cursor.execute(payload["query"])

        retVal = {}
        try:
            print(payload["query"])
            data = cursor.fetchall()
            print(data)
            data_structured = {}

            for i, col_vals in enumerate(cursor.description):
                data_structured[col_vals[0]] = [
                    format(d[i], 'x') if type(d[i]) == bytes else d[i] for d in data]

            retVal = {
                "success": True,
                "data": data
            }
        except Exception as e:
            retVal = {
                "query": payload["query"],
                "success": True,
                "message": "Query executed successfully, no result returned!",
                "error": repr(e)
            }
    except Exception as e:
        retVal = {
            "query": payload["query"],
            "success": False,
            "message": "An error occurred.", "error": repr(e)
        }
    finally:
        if conn:
            conn.commit()
            conn.close()

    return retVal


@app.route('/pandas/sqlserver/execute_sql', methods=['POST'])
def pandas_sqlserver_execute_sql():
    db_host = os.environ["sqlserver_db_host"]
    db_pass = os.environ["sqlserver_db_password"]
    db_user = os.environ["sqlserver_db_user"]
    db_name = request.args.get('db_name', os.environ["sqlserver_db_name"])
    db_port = os.environ["sqlserver_db_port"]

    try:
        payload = request.json  # a multidict containing POST data
        db_connection_str = f'mssql+pymssql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'

        engine = create_engine(db_connection_str)

        df = pd.read_sql_query(payload["query"], engine)
        df_list = df.values.T.tolist()
        JSONP_data = jsonpify(df_list)

        retVal = JSONP_data

    except Exception as e:
        retVal = {
            "query": payload["query"],
            "success": False,
            "message": "An error occurred.", "error": repr(e)
        }
    finally:
        pass

    return retVal


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
