import { useEffect, useState } from "react";
import { postData } from "src/utils/post-data";

export const usePost = <T>({ url, query }: { url: string, query: string }) => {

    const [result, setResult] = useState<T | null>(null);
    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState({});

    const fetchData = async () => {
        setIsLoading(true);

        try {
            const res = await postData(url, { query });
            setResult(res);
        } catch (error) {
            setError(error);
            console.log(error)
            setResult([] as any);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        if (url && query) {
            fetchData();
        }
    }, [url, query])

    // to return status to component, you can use bellow.
    return { result, isLoading, error }
}