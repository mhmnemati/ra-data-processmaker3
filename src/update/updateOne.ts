import { DataProvider, fetchUtils } from "ra-core";
import { stringify } from "query-string";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["update"] => async (resource, params) => {
    throw new Error(`Endpoint '${resource}' not found!`);
};
