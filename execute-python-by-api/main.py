#!/usr/bin/env python
import os
import subprocess
from flask import Flask, request
import uuid

app = Flask(__name__)


@app.route("/")
def hello_world():
    """Example Hello World route."""
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"


@app.route("/run", methods=['POST'])
def run():
    """To run a python stringified code."""

    payload = request.json  # a multidict containing POST data

    file = f'./session-scripts/{uuid.uuid4()}.py'
    code = payload["code"]

    # blah blah lots of code ...
    with open(file, 'w+') as f:
        f.write(code)

    proc = subprocess.Popen(['python', file], stdout=subprocess.PIPE)

    #  subprocess.Popen('ls', stdout=subprocess.PIPE)
    output = proc.stdout.read()

    os.remove(file)

    return output


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
