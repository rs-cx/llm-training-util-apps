import runCheck0ToValidateRoles from '../run-checks/run-check-0-to-validate-roles.js';
import runCheck1ToValidateFilenames from '../run-checks/run-check-1-to-validate-file-name.js';
import runCheck2ToValidateSchemaAndPayloadConsistency from '../run-checks/run-check-2-to-validate-schema.js';
import runCheck3ToValidateOutputs from '../run-checks/run-check-3-to-validate-outputs.js';
import runCheck4ToValidatePayload from '../run-checks/run-check-4-to-validate-payloads.js';
import runCheck5ToDo from '../run-checks/run-check-5-to-do.js';
import runCheck6ToValidateNoPreceingText from '../run-checks/run-check-6-to-validate-no-preceding-text.js';
import runCheck7ToValidateToolsCount from '../run-checks/run-check-7-to-validate-tools-count.js';
import runCheck8ValidateRequiredParams from '../run-checks/run-check-8-to-validate-required-params.js';
import runCheck9ValidateNoGenericValuesUsed from '../run-checks/run-check-9-to-validate-no-generic-values-used.js';
import runCheck10IfExtraFieldsAreIncludedInFunction from '../run-checks/run-check-10-if-extra-fields-are-included-in-function.js';
import runCheck11ToValidateIfRoleIsIncludedProperly from '../run-checks/run-check-11-to-validate-if-role-is-included-properly.js';
import runcheck12ToValidateCitation from '../run-checks/run-check-12-to-validate-citation.js';
import runCheck13ToValidateToolOutputSource from '../run-checks/run-check-13-to-validate-tool-output-source.js';
import runCheck14ToValidateNoHyperLinksInAssistant from '../run-checks/run-check-14-to-validate-no-hyperlinks-in-assistant.js';
import runCheck16ToValidateNoPlagiarism from '../run-checks/run-check-16-to-validate-no-plagiarism.js';
import runCheck17ToValidateCitationStructure from '../run-checks/run-check-17-to-validate-citation-structure.js';
import runCheck18ToValidateFunctionName from '../run-checks/run-check-18-to-validate-function-name.js';

const runChecks = [
    runCheck0ToValidateRoles,
    runCheck1ToValidateFilenames,
    runCheck2ToValidateSchemaAndPayloadConsistency,
    runCheck3ToValidateOutputs,
    runCheck4ToValidatePayload,
    runCheck5ToDo,
    runCheck6ToValidateNoPreceingText,
    runCheck7ToValidateToolsCount,
    runCheck8ValidateRequiredParams,
    runCheck9ValidateNoGenericValuesUsed,
    runCheck10IfExtraFieldsAreIncludedInFunction,
    runCheck11ToValidateIfRoleIsIncludedProperly,
    runcheck12ToValidateCitation,
    runCheck13ToValidateToolOutputSource,
    runCheck14ToValidateNoHyperLinksInAssistant,
    runCheck16ToValidateNoPlagiarism,
    runCheck17ToValidateCitationStructure,
    runCheck18ToValidateFunctionName
];

let runCheckKeys = runChecks.map(fn => fn.name.replace('runCheck', 'validation_'));

export { runChecks, runCheckKeys };
