import { DataProvider, fetchUtils } from "ra-core";

import getOne from "./getOne";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["getMany"] => async (resource, params) => {
    const handle = getOne(apiUrl, httpClient);

    let result: any = [];
    for (const id in params.ids) {
        const item = await handle(resource, { id: id });

        result.push(item.data);
    }

    return {
        data: result,
    };
};
