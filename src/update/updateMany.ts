import { DataProvider, fetchUtils } from "ra-core";

import updateOne from "./updateOne";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["updateMany"] => async (resource, params) => {
    const handle = updateOne(apiUrl, httpClient);

    for (const id of params.ids) {
        await handle(resource, {
            previousData: { id: id },
            data: params.data,
            id: id,
        });
    }

    return {
        data: params.ids,
    };
};
