import { DataProvider, fetchUtils } from "ra-core";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["delete"] => async (resource, params) => {
    if (resource === "users") {
        await httpClient(`${apiUrl}/users/${params.id}`, {
            method: "DELETE",
            headers: new Headers({}),
        });

        return {
            data: params.previousData as any,
        };
    }

    if (resource === "cases") {
        await httpClient(`${apiUrl}/cases/${params.id}`, {
            method: "DELETE",
            headers: new Headers({}),
        });

        return {
            data: params.previousData as any,
        };
    }

    throw new Error(`Endpoint '${resource}' not found!`);
};
