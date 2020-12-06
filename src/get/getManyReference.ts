import { DataProvider, fetchUtils } from "ra-core";

import getList from "./getList";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["getManyReference"] => async (resource, params) => {
    const handle = getList(apiUrl, httpClient);

    return handle(resource, {
        filter: { ...params.filter, [params.target]: params.id },
        sort: params.sort,
        pagination: params.pagination,
    });
};
