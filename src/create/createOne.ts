import { DataProvider, fetchUtils } from "ra-core";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["create"] => async (resource, params) => {
    if (resource === "users") {
        const result = await httpClient(`${apiUrl}/users`, {
            method: "POST",
            body: JSON.stringify(params.data),
            headers: new Headers({}),
        });

        return {
            data: {
                ...result.json,
                id: result.json.usr_uid,
            },
        };
    }

    if (resource === "cases") {
        params.data.variables = [params.data.variables];

        const result = await httpClient(`${apiUrl}/cases`, {
            method: "POST",
            body: JSON.stringify(params.data),
            headers: new Headers({}),
        });

        return {
            data: {
                ...params.data,
                app_uid: result.json.app_uid,
                app_number: result.json.app_number,
                id: result.json.app_uid,
            },
        };
    }

    throw new Error(`Endpoint '${resource}' not found!`);
};
