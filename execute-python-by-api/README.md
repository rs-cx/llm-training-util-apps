# Set up

1. `conda create --name python-api python`
2. `conda activate python-api`
3. `python -m pip install requirements.txt`
4. `python main.py`

# Run a code

- [Live](https://python-api-j2jrnhonua-lz.a.run.app)

- Local

```sh
curl -X POST -d \
'{
    "code": "x=4\ny=5\nprint(x+y)"
}' \
-H "Content-Type: application/json" \
'http://127.0.0.1:8080/run'
```