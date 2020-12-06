import { DataProvider, fetchUtils } from "ra-core";

import deleteOne from "./deleteOne";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["deleteMany"] => async (resource, params) => {
    const handle = deleteOne(apiUrl, httpClient);

    for (const id in params.ids) {
        await handle(resource, {
            previousData: { id: id },
            id: id,
        });
    }

    return {
        data: params.ids,
    };
};
