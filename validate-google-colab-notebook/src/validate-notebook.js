import fs from 'fs';

import { runChecks, runCheckKeys } from './utils/run-checks.js';
import key from '../cred/function-calling-drive-id.json' with {"type": "json"}
import { ERROR, WARNING, INFO, SUCCESS, LOG } from './utils/return-message-types.js';
import returnMessageWrapper from './utils/return-message-wrapper.js';

function validateNotebook(fileDest, checks = []) {
    // Check if the file exists
    if (!fs.existsSync(fileDest)) {
        return {
            errors: { 'runCheckXToValidateCellTags': [`File doesn't exist or file couldn't be downloaded. Please ensure files exists and ask your lead to arrange permissions for ${key.client_email} to access the file.`] },
        }
    }

    let checksToRun = runChecks;
    let checkKeysToRun = runCheckKeys;

    if (checks.length > 0) {
        checksToRun = checks.map(check => runChecks[check]);
        checkKeysToRun = checks.map(check => runCheckKeys[check]);
    }

    // Read the file
    const file = fs.readFileSync(fileDest, 'utf8');

    const fileJSON = JSON.parse(file);

    // Delete metadata
    if (fileJSON.cells?.[0]?.metadata?.tags?.[0] != 'system') {
        fileJSON.cells.shift();
    }

    // convert all hypens to underscore in tags

    for (let i = 0; i < fileJSON.cells.length; i++) {
        const cell = fileJSON.cells[i];

        if (cell.metadata.tags) {
            cell.metadata.tags = cell.metadata.tags.map(t => t.replaceAll('-', '_'))
            cell.metadata.tags[1] = Math.max(0, i - 1).toString()
        }
        else {

            if (fileJSON.cells[i].source.length == 0) {
                return {
                    "errors": returnMessageWrapper(`An empty cell was found at index ${i}`, ERROR),
                }
            }

            // Extract actor from **[actor]**
            const actor = fileJSON.cells[i].source.join('').match(/\*\*\[(.*?)\]\*\*/)?.[1]?.toLowerCase();

            if (['system', 'tools', 'user', 'assistant', 'tool_use', 'tool_output'].includes(actor)) {
                cell.metadata.tags = [actor, Math.max(0, i - 1).toString()];
            }
        }
    }

    const errors = {};
    const warnings = {};
    const infos = {};
    const logs = {};
    const successes = {};

    for (let i = 0; i < checksToRun.length; i++) {
        const messageN = checksToRun[i](fileJSON, fileDest);

        const infosInMessage = messageN?.filter(msg => msg && msg?.startsWith(`${INFO}::`));
        const warningsInMessage = messageN?.filter(msg => msg && msg?.startsWith(`${WARNING}::`));
        const errorsInMessage = messageN?.filter(msg => msg && msg?.startsWith(`${ERROR}::`));
        const logsInMessage = messageN?.filter(msg => msg && msg?.startsWith(`${LOG}::`));
        const successInMessage = messageN?.filter(msg => msg && msg?.startsWith(`${SUCCESS}::`));

        if (infosInMessage?.length > 0) {
            infos[checkKeysToRun[i]] = infosInMessage.map(msg => msg.replace(`${INFO}::`, ''));
        }

        if (warningsInMessage?.length > 0) {
            warnings[checkKeysToRun[i]] = warningsInMessage.map(msg => msg.replace(`${WARNING}::`, ''));
        }

        if (errorsInMessage?.length > 0) {
            errors[checkKeysToRun[i]] = errorsInMessage.map(msg => msg.replace(`${ERROR}::`, ''));
        }

        if (logsInMessage?.length > 0) {
            logs[checkKeysToRun[i]] = logsInMessage.map(msg => msg.replace(`${LOG}::`, ''));
        }

        if (successInMessage?.length > 0) {
            successes[checkKeysToRun[i]] = successInMessage.map(msg => msg.replace(`${SUCCESS}::`, ''));
        }
    }

    return { errors, warnings, infos, logs, successes };
}

export default validateNotebook;