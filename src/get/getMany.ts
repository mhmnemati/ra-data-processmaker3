import { DataProvider, fetchUtils } from "ra-core";

import getOne from "./getOne";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["getMany"] => async (resource, params) => {
    const handle = getOne(apiUrl, httpClient);

    let result: any = [];
    for (const id in params.ids) {
        result.push((await handle(resource, { id: id })).data);
    }

    return {
        data: result,
    };
};
