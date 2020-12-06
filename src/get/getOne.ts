import { DataProvider, fetchUtils } from "ra-core";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["getOne"] => async (resource, params) => {
    if (resource === "users") {
        /**
         * 1. get user
         */
        const result = await httpClient(`${apiUrl}/users/${params.id}`, {
            method: "GET",
            headers: new Headers({}),
        });

        return {
            data: {
                ...result.json,
                id: result.json.usr_uid,
            },
        };
    }

    if (
        resource === "cases" ||
        resource === "cases-draft" ||
        resource === "cases-participated" ||
        resource === "cases-unassigned" ||
        resource === "cases-paused"
    ) {
        /**
         * 1. get case
         * 2. get variables
         * 3. get task
         */
        let result = await httpClient(`${apiUrl}/cases/${params.id}`, {
            method: "GET",
            headers: new Headers({}),
        });

        const variables = await httpClient(
            `${apiUrl}/cases/${result.json.app_uid}/variables`,
            {
                method: "GET",
                headers: new Headers({}),
            }
        );
        const task = await httpClient(
            `${apiUrl}/project/${result.json.pro_uid}/activity/${result.json.tas_uid}`,
            {
                method: "GET",
                headers: new Headers({}),
            }
        );

        result.json.variables = variables.json;
        result.json.task = task.json;

        return {
            data: {
                ...result.json,
                id: result.json.app_uid,
            },
        };
    }

    throw new Error(`Endpoint '${resource}' not found!`);
};
