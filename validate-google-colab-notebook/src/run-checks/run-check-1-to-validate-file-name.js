// Check If the file name is correct

import { ERROR, SUCCESS, WARNING } from '../utils/return-message-types.js';
import returnMessageWrapper from '../utils/return-message-wrapper.js';
import suggestFileName from '../utils/suggest-file-name.js';

export default function runCheck1ToValidateFilenames(content, fileDest) {
    try {
        const file = fileDest.split('/').pop();
        let newFilename = file;
        let newFilenameValues = newFilename.split(',');

        if (newFilenameValues.length < 6 || newFilenameValues.length > 7) {
            return returnMessageWrapper(`Filename should be in following format: <taxonomy>,<username>,<numbering>,<domain>,<subdomain>,<misc>.ipynb`, ERROR);
        }

        if (newFilenameValues[3].match(/planning/) || newFilenameValues[3].match(/tool[-_]use/)) {
            return returnMessageWrapper(`4th place should not include planning or tool-use`, WARNING);
        }

        if (newFilenameValues.length == 6) {
            const misc = newFilenameValues[5].replace('.ipynb', '');

            if (misc == "misc" || misc == '-' || misc == 'behavior') {
                return returnMessageWrapper(`misc field should be filled appropriately, currently it's a placeholder -> "${misc}". Please fill it with a meaningful value`, ERROR);
            }

            if (misc.split('+').length == 1) {
                return returnMessageWrapper(`misc field should be filled with '+' separated values, currently it's a single value -> "${misc}". Please fill more values separated by '+'`, WARNING);
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper(`Filename is correct!`, SUCCESS);
}