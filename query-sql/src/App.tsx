import { useCallback, useEffect, useState } from 'react';
import BasicMenu from './components/basic-menu/basic-menu';
import PostgreSQL from './components/postgresql/postgresql';
import { Button, FormControlLabel, Stack, Switch, TextField } from '@mui/material';
import { provideURL } from './utils/provide-url';
import MySQL from './components/mysql/mysql';
import SQLServer from './components/sqlserver/sqlserver';

function App() {
  const [currentSql, setCurrentSQL] = useState('mysql');
  const [query, setQuery] = useState('select version();');
  const [dbName, setDbName] = useState('');
  const [result, setResult] = useState({});
  const [pandas, setPandas] = useState(true);
  const [sqlApiURL, setSqlApiURL] = useState('');

  const handleSQLChange = useCallback((e: string) => {
    setCurrentSQL(e);
  }, [setCurrentSQL]);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setQuery(e.target.value);
  }, [setQuery]);

  const handleDbNameChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setDbName(e.target.value);
  }, [setDbName]);

  const handleOutputDoubleClick = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(result, undefined, 2));
  }, [result]);

  useEffect(() => {
    const URL = provideURL({ dbName, sql: currentSql, pandas });
    setSqlApiURL(URL);
  }, [currentSql, dbName, pandas, setSqlApiURL]);

  useEffect(() => {
    if (currentSql == 'sqlserver') {
      setQuery('Select @@version;')
    }
    else {
      setQuery('Select version();')
    }
  }, [currentSql]);

  return (
    <Stack direction={"column"}>
      <FormControlLabel
        control={<Switch checked={pandas} onChange={() => setPandas(x => !x)} />}
        label="Only data"
      />

      <BasicMenu onChange={handleSQLChange}></BasicMenu>
      <Stack direction={'row'} padding={3} spacing={10}>
        <TextField value={currentSql.toUpperCase()} disabled />
        <TextField placeholder='Database name' onBlur={handleDbNameChange}></TextField>
        <TextField variant='outlined' multiline fullWidth placeholder={query} onBlur={handleQueryChange}></TextField>
      </Stack>

      {
        currentSql == 'postgresql' && <PostgreSQL url={sqlApiURL} query={query} onResult={setResult}></PostgreSQL>
      }

      {
        currentSql == 'mysql' && <MySQL url={sqlApiURL} query={query} onResult={setResult}></MySQL>
      }

      {
        currentSql == 'sqlserver' && <SQLServer url={sqlApiURL} query={query} onResult={setResult}></SQLServer>
      }

      <Button startIcon={<span style={{ margin: 10 }}>&#128203;</span>} onClick={handleOutputDoubleClick}>Copy to clipboard</Button>
      <TextField multiline fullWidth value={JSON.stringify(result, undefined, 2)} disabled></TextField>
    </Stack >
  );
}

export default App;
