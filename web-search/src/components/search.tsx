import { Alert, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

const dummyOptions = {
    "engine": "google",
    "q": "Coffee",
    "location": "Austin, Texas, United States",
    "google_domain": "google.com",
    "gl": "us",
    "hl": "en",
    "start": 0,
    "num": 5
}

function Search(props: any) {
    const [engine, setEngine] = useState('google');
    const [query, setQuery] = useState('google');
    const [options, setOptions] = useState({} as any);

    const [jsonResult, setJsonResult] = useState({ 'json': 'placeholder' });
    const [htmlResult, setHtmlResult] = useState('<span>HTML<span/>');
    const [error, setError] = useState('');

    const handleQueryChange = useCallback((e: any) => {
        setQuery(e.target.value);
    }, []);

    const handleEngineChange = useCallback((e: any) => {
        setEngine(e.target.value);
    }, []);

    const handleCopyToClipBoard = useCallback(() => {
        navigator.clipboard.writeText(JSON.stringify(jsonResult, undefined, 2)).then(() => console.log('Copied to clipboard'));;
    }, [jsonResult]);

    const handleOptionsChange = useCallback((e: any) => {
        let opt = {};
        try {
            console.log(e.target.value)
            opt = JSON.parse(e.target.value || '{}')
        }
        catch (e) {
            setError("Not parsed");
        }

        setOptions((opts: any) => ({ ...opts, ...opt }));
    }, [setOptions]);

    const buildUrl = useCallback(() => {
        // Base URL of the API endpoint
        const baseUrl = `https://serpapi.com/search.json`;

        // Transform the options object into a query string
        const queryString = Object.keys(options)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options[key] as string)}`)
            .join('&');

        // Return the full URL
        return `${baseUrl}?${queryString}`;
    }, [options])

    const handleSearch = useCallback(() => {
        fetch(buildUrl())
            .then(response => response.json())
            .then(setJsonResult)
            .catch(error => console.error('Error:', error));

        fetch(buildUrl().replace('search.json', 'search.html'))
            .then(response => response.text())
            .then(setHtmlResult)
            .catch(error => console.error('Error:', error));
    }, [options]);

    useEffect(() => {
        setOptions((opt: any) => ({ ...options, q: query, engine } as any))
    }, [engine, query]);

    useEffect(() => {
        setOptions((opt: any) => ({ ...opt, api_key: process.env.REACT_APP_API_KEY } as any))
    }, []);

    return (
        <Stack direction={"column"} gap={5} marginTop={5} >
            {
                error &&
                <Alert severity="error" onClose={() => setError('')}> {error} </Alert>
            }
            <Stack direction={"row"}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Engine</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={engine}
                        label="Engine"
                        onChange={handleEngineChange}
                    >
                        <MenuItem value={"google"}>Google</MenuItem>
                        <MenuItem value={"duckduckgo"}>DuckDuckGo</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
            <Stack direction={"row"} gap={20}>
                <TextField id="outlined-basic" label="Query" onChange={handleQueryChange} variant="outlined" />
                <TextField id="outlined-basic" fullWidth placeholder={JSON.stringify(dummyOptions, undefined, 2)} multiline label="Options" onBlur={handleOptionsChange} variant="outlined" />
            </Stack>
            <Stack direction={"row"} gap={20}>
                <Button variant="contained" onClick={handleSearch}>Search</Button>
                <Button variant="contained" onClick={handleCopyToClipBoard}>Copy JSON to clipboard</Button>
            </Stack>
            <Stack direction={"row"} gap={20}>
                <span style={{ width: '100vw', border: '1px dashed black' }} dangerouslySetInnerHTML={{ __html: htmlResult.toString() }}></span>
            </Stack>
        </Stack>

    );
}

export default Search;
