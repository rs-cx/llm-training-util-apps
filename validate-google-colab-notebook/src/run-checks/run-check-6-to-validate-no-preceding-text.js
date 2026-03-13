// Check conversation if they is any preceding text message
import { ERROR, SUCCESS } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck6ToValidateNoPreceingText(content) {
    try {
        const tags = content.cells.map(cell => cell.metadata?.tags?.[0]).slice(2)
        for (let i = 1; i < tags.length; i++) {
            if (tags[i - 1] == 'assistant' && tags[i] == 'tool_use') {
                return returnMessageWrapper(`There is a preceding text message at cell idx ${i}. No assistant -> tool_use is allowed!`, ERROR);
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(`${error.message}`, ERROR);
    }

    return returnMessageWrapper(`No preceding text message found`, SUCCESS);
}
