import { ERROR, SUCCESS, WARNING } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

function runCheck5ToDo(content, fileDest) {
    for (let cell of content.cells) {
        const cellStr = cell.source.join('');

        if (cellStr.match(/TO[-_]?DO\s/i)) {
            if (cellStr.match(/TODO/i) && !fileDest.includes('allow-todo')) {
                return returnMessageWrapper(`TODO found in cell ${cell.metadata.id}`, ERROR);
            }
            else {
                return returnMessageWrapper(`TODO found in cell ${cell.metadata.id}`, WARNING);
            }
        }
    }
    return returnMessageWrapper(`No TODO found`, SUCCESS);
}

export default runCheck5ToDo;