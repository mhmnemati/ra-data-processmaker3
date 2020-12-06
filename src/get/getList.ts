import {
    fetchUtils,
    DataProvider,
    PaginationPayload,
    SortPayload,
} from "ra-core";
import lodash from "lodash";

const filter = (
    data: any[],
    filter: object,
    sort: SortPayload,
    pagination: PaginationPayload
) => {
    return data
        .filter((item) =>
            Object.entries(filter).reduce<boolean>(
                (acc, [key, value]) => acc && lodash.get(item, key) === value,
                true
            )
        )
        .sort((first, second) => {
            const firstField = lodash.get(first, sort.field);
            const secondField = lodash.get(second, sort.field);

            if (sort.order === "ASC") {
                if (firstField < secondField) {
                    return -1;
                }
                if (firstField > secondField) {
                    return 1;
                }
            } else {
                if (firstField < secondField) {
                    return 1;
                }
                if (firstField > secondField) {
                    return -1;
                }
            }

            return 0;
        })
        .slice(
            (pagination.page - 1) * pagination.perPage,
            (pagination.page - 1) * pagination.perPage + pagination.perPage
        );
};

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["getList"] => async (resource, params) => {
    if (resource === "users") {
        const result = await httpClient(`${apiUrl}/users`, {
            method: "GET",
            headers: new Headers({}),
        });

        let data = filter(
            (result.json.data as any[]).map((item) => ({
                ...item,
                id: item.usr_uid,
            })),
            params.filter,
            params.sort,
            params.pagination
        );

        return {
            data: data,
            total: result.json.length,
        };
    }

    if (resource === "cases") {
        const resultTodo = await httpClient(`${apiUrl}/cases`, {
            method: "GET",
            headers: new Headers({}),
        });
        const resultDraft = await httpClient(`${apiUrl}/cases/draft`, {
            method: "GET",
            headers: new Headers({}),
        });
        const result = { json: [...resultTodo.json, ...resultDraft.json] };

        let data = filter(
            result.json.map((item) => ({
                ...item,
                id: item.app_uid,
            })),
            params.filter,
            params.sort,
            params.pagination
        );

        for (let caseObject of data) {
            const variables = await httpClient(
                `${apiUrl}/cases/${caseObject.app_uid}/variables`,
                {
                    method: "GET",
                    headers: new Headers({}),
                }
            );
            const task = await httpClient(
                `${apiUrl}/project/${caseObject.pro_uid}/activity/${caseObject.tas_uid}`,
                {
                    method: "GET",
                    headers: new Headers({}),
                }
            );

            caseObject.variables = variables.json;
            caseObject.task = task.json;
        }

        return {
            data: data,
            total: result.json.length,
        };
    }

    if (
        resource === "cases-participated" ||
        resource === "cases-unassigned" ||
        resource === "cases-paused"
    ) {
        const result = await httpClient(
            `${apiUrl}/${resource.split("-").join("/")}`,
            {
                method: "GET",
                headers: new Headers({}),
            }
        );

        let data = filter(
            result.json.map((item: any) => ({
                ...item,
                id: item.app_uid,
            })),
            params.filter,
            params.sort,
            params.pagination
        );

        for (let caseObject of data) {
            const variables = await httpClient(
                `${apiUrl}/cases/${caseObject.app_uid}/variables`,
                {
                    method: "GET",
                    headers: new Headers({}),
                }
            );
            const task = await httpClient(
                `${apiUrl}/project/${caseObject.pro_uid}/activity/${caseObject.tas_uid}`,
                {
                    method: "GET",
                    headers: new Headers({}),
                }
            );

            caseObject.variables = variables.json;
            caseObject.task = task.json;
        }

        return {
            data: data,
            total: result.json.length,
        };
    }

    throw new Error(`Endpoint '${resource}' not found!`);
};
