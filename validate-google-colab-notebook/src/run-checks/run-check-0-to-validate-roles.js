import { ERROR, SUCCESS, WARNING } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

const roleOrdering = {
    "metadata": ["system"],
    "system": ["tools", "tool"],
    "tools": ["user"],
    "user": ["assistant", "tool_use"],
    "assistant": ["user"],
    "tool_use": ["tool_output"],
    "tool_output": ["assistant", "tool_use"]
};

function areRolesWellOrdered(tags) {
    for (let i = 0; i < tags.length - 1; i++) {
        const currentRole = tags[i].replace(/-/g, '_').toLowerCase();
        const nextRole = tags[i + 1].replace(/-/g, '_').toLowerCase();
        if (!roleOrdering[currentRole.toLowerCase()].includes(nextRole)) {
            return returnMessageWrapper(`Roles are not ordered well: ${i} ${currentRole} -> ${i + 1} ${nextRole}`, ERROR);
        }
    }

    const lastRole = tags[tags.length - 1].replace(/-/g, '_').toLowerCase();

    if (lastRole != 'assistant' && lastRole != 'tool_use') {
        return returnMessageWrapper(`Last role is not assistant or tool_use; but it's ${lastRole}`, ERROR);
    }
}

function areCellNumsWellOrdered(tagsList) {

    const roles = tagsList.slice(2).map(tags => tags[0]).map(role => role.replace(/-/g, '_').toLowerCase());

    const strangeRoles = roles.filter(role => role != 'system' && role != 'tools' && role != 'user' && role != 'assistant' && role != 'tool_use' && role != 'tool_output');

    if (strangeRoles.length > 0) {
        return returnMessageWrapper(`No such roles are supported: ${strangeRoles.join(', ')}`, ERROR);
    }
}

export default function runCheck0ToValidateRoles(content) {
    try {
        const allTags = [];
        let cell_tags = 0;
        for (let cell of content.cells) {
            cell_tags = cell.metadata.tags;

            const metadata = cell.metadata;
            if (cell.source.length > 0) {
                if (metadata.tags && metadata.tags.length) {
                    allTags.push(metadata.tags);
                }
                else {
                    return returnMessageWrapper(`Tags are missing for cell ${cell_tags} with id ${metadata.id}`, ERROR);
                }
            }
            else {
                return returnMessageWrapper(`An empty cell is detected.`, ERROR);
            }
        }

        const tagsParsed = content.cells.map(cell => cell.source[0].replace('**[', '').replace(']**', '').split(',').map(tag => tag.trim()));

        const tagsParsedStr = tagsParsed.join(',');
        const tagsMetadataStr = allTags.map(t => t[0]).join(',');

        if (tagsParsedStr !== tagsMetadataStr) {
            return returnMessageWrapper(`Tags included in cell "${tagsParsedStr}" and metadata "${tagsMetadataStr}" are not the same.`, ERROR);
        }

        const error1 = areCellNumsWellOrdered(allTags);
        const error2 = areRolesWellOrdered(allTags.map(tag => tag[0]));

        if (error1 || error2) {
            if (error1 && error2) {
                return [...error1, ...error2]
            }

            return [...(error1 || error2)]
        }
        else {
            return returnMessageWrapper('Roles are ordered well.', SUCCESS);
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper('Roles are well ordered.', SUCCESS);
}