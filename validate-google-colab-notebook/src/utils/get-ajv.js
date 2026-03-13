import Ajv2019 from "ajv/dist/2019.js";
import Ajv2020 from "ajv/dist/2020.js";
import Ajv from "ajv";
import addFormats from "ajv-formats"

function getAjv(file) {
    if (file?.includes('2019')) {
        return new Ajv2019();
    }

    if (file?.includes('2020')) {
        return new Ajv2020();
    }

    const ajv = new Ajv({ strict: true });
    addFormats(ajv);

    return ajv;
}

export default getAjv;
