import { ERROR } from "./return-message-types.js";
import returnMessageWrapper from "./return-message-wrapper.js";

function parseJson(cell) {
    try {

        const output = JSON.parse(cell.source.join('').replace(/[\w\W]*```json([\w\W]*?)```[\w\W]*/, '$1'));

        return output
    }
    catch (error) {
        return returnMessageWrapper(`Error parsing json: ${error.message}`, ERROR);
    }
}

export default parseJson;