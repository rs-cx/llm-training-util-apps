// Check if roles included properly
import { ERROR, SUCCESS } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck11ToValidateIfRoleIsIncludedProperly(content) {
    try {
        for (let cell of content.cells) {
            // if matches the pattern **[<role>]**
            if (!cell.source[0].match(/\*\*\[(system|tools|user|tool_use|tool_output|assistant)\]\*\*/)) {
                return returnMessageWrapper(`Role is not included in the cell ${cell.metadata.tags}, instead it includes ${cell.source[0]}`, ERROR);
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper(`Roles are included properly.`, SUCCESS);
}