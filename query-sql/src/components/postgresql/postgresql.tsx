import { useEffect } from "react";
import { usePost } from "../../hooks/use-post";

function PostgreSQL({ url, query, onResult }: { url: string, query: string, onResult: Function }) {

    const { result, isLoading, error } = usePost<any>({ url, query });

    useEffect(() => {
        onResult(result);
    }, [result, onResult]);

    return (
        <div>
            {isLoading && "Is loading..."}
            {!isLoading && error && JSON.stringify(error)}
        </div>
    );
}

export default PostgreSQL;
