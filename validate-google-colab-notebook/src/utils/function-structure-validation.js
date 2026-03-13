function functionStructureValidation(functionSchema) {
    if (!functionSchema?.function?.parameters || !functionSchema?.function?.parameters.properties) {
        throw new Error(' Schema should include fields in hiearachy schema -> function -> parameters -> properties');
    }

    if (!functionSchema?.function?.name) {
        throw new Error(' Schema should include fields in hiearachy schema -> function -> name');
    }

    if (functionSchema?.description) {
        throw new Error('Schema should include fields in hiearachy schema -> function -> description');
    }

    if (functionSchema?.function?.required) {
        throw new Error(' Schema should include fields in hiearachy schema -> function -> parameters -> required');
    }
}

export default functionStructureValidation;