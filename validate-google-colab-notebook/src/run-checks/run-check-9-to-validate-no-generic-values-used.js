// Check if required fields are consistent with the function parameters

import { file } from "googleapis/build/src/apis/file/index.js";
import { ERROR, SUCCESS, INFO, WARNING } from "../utils/return-message-types.js";
import returnMessageWrapper from "../utils/return-message-wrapper.js";

export default function runCheck9ValidateNoGenericValuesUsed(content, fileDest) {

    try {
        const messgaes = content.cells.map(cell => cell.source.join(''));
        const tags = content.cells.map(cell => cell.metadata.tags);

        // Check if any generic value included e.g. user@example.com, user@email.com, example@email.com, John Doe, Jane Doe, 123, 234, 345, ...
        const genericNumValues = [
            '123',
            '234',
            '345',
            '456',
            '567',
            '678',
            '789',
            '890',
            '987',
            '876',
            '765',
            '654',
            '543',
            '432',
            '321',
            '210'
        ]

        // Check if any generic value included e.g. user@example.com, user@email.com, example@email.com, John Doe, Jane Doe, 123, 234, 345, ...
        const genericCharValues = [
            'user@example.com',
            'user@email.com',
            'example@email.com',
            'website.com',
            '@mail.com',
            'example.com',
            'sample.com',
            'fakesite.com',
            'abc.com',
            'hello123.com',
            'John Doe',
            'Jane Doe',
            'Alice Smith',
            'Fake',
            'Shop 1',
            'ABC',
            'BCD',
            'CDE',
            'EFG',
            'FGH',
            'CBA',
            'DCB',
            'EDC',
            'GFE',
            'HGF'
        ]

        const level = fileDest.includes('allow-generic') ? WARNING : ERROR;

        for (let i = 0; i < messgaes.length; i++) {
            let message = messgaes[i];
            const cellTags = tags[i];

            if (cellTags.includes('allow-generic')) {
                return returnMessageWrapper('Generic value check skipped for cell: [${content.cells[i].metadata.tags}]', INFO);
            }

            for (let genericValue of genericNumValues) {
                // Remove whitespaces and check pattern
                if (message.replace(/\s/g, '').match(new RegExp(`\\b${genericValue}\\b`, 'gi'))) {
                    return returnMessageWrapper(`The generic value ${genericValue} is included in the conversation cell: [${content.cells[i].metadata.tags}]`, level);
                }

                if (message.replace(/\s/g, '').match(new RegExp(genericValue, 'gi'))) {
                    return returnMessageWrapper(`The generic value ${genericValue} is included in the conversation cell: [${content.cells[i].metadata.tags}]`, level);
                }
            }

            for (let genericValue of genericCharValues) {
                // Remove whitespaces and check pattern
                if (message.match(new RegExp(`\\b${genericValue}\\b`, 'gi'))) {
                    return returnMessageWrapper(`The generic value ${genericValue} is included in the conversation cell: [${content.cells[i].metadata.tags}]`, level);
                }

                if (message.match(new RegExp(genericValue, 'gi'))) {
                    return returnMessageWrapper(`The generic value ${genericValue} is included in the conversation cell: [${content.cells[i].metadata.tags}]`, level);
                }
            }
        }
    }
    catch (error) {
        return returnMessageWrapper(error, ERROR);
    }

    return returnMessageWrapper('No generic values found in the conversation.', SUCCESS);
}
