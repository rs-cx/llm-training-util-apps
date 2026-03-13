import getTaxonomy from "./get-taxonomy.js";
import parseJson from "./parse-json.js";

function suggestFileName(currentFileName, ipynbContentJson) {
    const isSingleTurn = ipynbContentJson.cells.filter(cell => cell.metadata.tags[0] == 'user').length <= 1;

    const tool_uses = ipynbContentJson.cells.filter(cell => cell.metadata.tags[0] == 'tool_use');
    const functionCallNums = tool_uses.filter(cell => parseJson(cell).tool_use?.length > 1);
    const isSingleParallel = functionCallNums.length == 1;
    const isMultipleParallel = functionCallNums.length > 1;

    const toolUseOrUserCells = ipynbContentJson.cells.map(cell => cell.metadata.tags[0]).filter(tag => tag == 'user' || tag == 'tool_use');

    const toolCallsCount = toolUseOrUserCells.filter(cell => cell == 'tool_use').length;

    const isSingleCall = toolCallsCount == 1;
    const isMultipleCalls = toolCallsCount > 1;

    let isSingleConsecutive = false;
    let isMultipleConsecutive = false;
    let previousCell = 'system';

    for (let toolUseOrUserCell of toolUseOrUserCells) {
        if (toolUseOrUserCell == previousCell && (previousCell == 'tool_use')) {

            if (isSingleConsecutive) {
                isMultipleConsecutive = true;
                isSingleConsecutive = false;
                break;
            }

            isSingleConsecutive = true;
        }

        previousCell = toolUseOrUserCell;
    }

    let fileName = currentFileName.replace(/[\s\_]/g, '-');
    const suggestedTaxonomy = getTaxonomy({ isSingleTurn, isSingleCall, isMultipleCalls, isSingleParallel, isMultipleParallel, isSingleConsecutive, isMultipleConsecutive });
    var isWin = process.platform === "win32";

    const separator = !isWin ? '/' : '\\';
    const pathAndFile = fileName.split(separator);
    const fileParts = pathAndFile[pathAndFile.length - 1].split(',');
    fileParts[0] = suggestedTaxonomy;
    pathAndFile[pathAndFile.length - 1] = fileParts.join(',')
    return pathAndFile.join(separator).toLowerCase();
}

export default suggestFileName;
