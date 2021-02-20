import {
    fetchUtils,
    DataProvider,
    PaginationPayload,
    SortPayload,
} from "ra-core";
import lodash from "lodash";

const filter = (data: any[], filter: object) => {
    return data.filter((item) =>
        Object.entries(filter).reduce<boolean>((acc, [key, value]) => {
            if (typeof value === "object") {
                if ("neq" in value) {
                    return acc && lodash.get(item, key) !== value.neq;
                }

                if ("geq" in value) {
                    return acc && lodash.get(item, key) >= value.geq;
                }

                if ("gt" in value) {
                    return acc && lodash.get(item, key) > value.gt;
                }

                if ("leq" in value) {
                    return acc && lodash.get(item, key) <= value.leq;
                }

                if ("lt" in value) {
                    return acc && lodash.get(item, key) < value.lt;
                }

                if ("between" in value) {
                    return (
                        acc &&
                        lodash.get(item, key) >= value.between[0] &&
                        lodash.get(item, key) <= value.between[1]
                    );
                }

                if ("match" in value) {
                    return (
                        acc &&
                        new RegExp(value.match).test(lodash.get(item, key))
                    );
                }

                if ("in" in value) {
                    return acc && value.in.includes(lodash.get(item, key));
                }

                if ("nin" in value) {
                    return acc && !value.in.includes(lodash.get(item, key));
                }
            }

            return acc && lodash.get(item, key) === value;
        }, true)
    );
};

const sort = (data: any[], sort: SortPayload) => {
    return data.sort((first, second) => {
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
    });
};

const paginate = (data: any[], pagination: PaginationPayload) => {
    return data.slice(
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

        const filteredData = filter(
            (result.json as any[]).map((item) => ({
                ...item,
                id: item.usr_uid,
            })),
            params.filter
        );

        const data = paginate(
            sort(filteredData, params.sort),
            params.pagination
        );

        return {
            data: data,
            total: filteredData.length,
        };
    }

    if (resource === "groups") {
        const result = await httpClient(`${apiUrl}/groups`, {
            method: "GET",
            headers: new Headers({}),
        });

        const filteredData = filter(
            (result.json as any[]).map((item) => ({
                ...item,
                id: item.grp_uid,
            })),
            params.filter
        );

        const data = paginate(
            sort(filteredData, params.sort),
            params.pagination
        );

        for (let groupObject of data) {
            const members = await httpClient(
                `${apiUrl}/groups/${groupObject.grp_uid}/users`,
                {
                    method: "GET",
                    headers: new Headers({}),
                }
            );

            groupObject.members = members.json;
        }

        return {
            data: data,
            total: filteredData.length,
        };
    }

    if (
        resource === "cases" ||
        resource === "cases-participated" ||
        resource === "cases-unassigned" ||
        resource === "cases-paused"
    ) {
        let result = { json: [] as any[] };
        if (resource === "cases") {
            const resultTodo = await httpClient(`${apiUrl}/cases`, {
                method: "GET",
                headers: new Headers({}),
            });
            const resultDraft = await httpClient(`${apiUrl}/cases/draft`, {
                method: "GET",
                headers: new Headers({}),
            });

            result = { json: [...resultTodo.json, ...resultDraft.json] };
        } else {
            result = await httpClient(
                `${apiUrl}/${resource.split("-").join("/")}`,
                {
                    method: "GET",
                    headers: new Headers({}),
                }
            );
        }

        const filteredData = filter(
            result.json.map((item) => ({
                ...item,
                act_uid: `${item.pro_uid}-${item.tas_uid}`,
                id: item.app_uid,
            })),
            params.filter
        );

        const data = paginate(
            sort(filteredData, params.sort),
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

            caseObject.variables = variables.json;
        }

        return {
            data: data,
            total: filteredData.length,
        };
    }

    if (resource === "histories") {
        const { app_uid, ...restFilter } = params.filter;

        const result = await httpClient(
            `${apiUrl}/extrarest/cases/${app_uid}`,
            {
                method: "GET",
                headers: new Headers({}),
            }
        );

        const filteredData = filter(
            (result.json as any[]).map((item, index) => ({
                app_uid: item.APP_UID,
                del_index: item.DEL_INDEX,
                pro_uid: item.PRO_UID,
                tas_uid: item.TAS_UID,
                dyn_uid: item.DYN_UID,
                obj_type: item.OBJ_TYPE,
                usr_uid: item.USR_UID,
                app_status: item.APP_STATUS,
                history_date: item.HISTORY_DATE,
                history_data: item.HISTORY_DATA,
                act_uid: `${item.PRO_UID}-${item.TAS_UID}`,
                id: `${item.APP_UID}-${index}`,
            })),
            restFilter
        );

        const data = paginate(
            sort(filteredData, params.sort),
            params.pagination
        );

        return {
            data: data,
            total: filteredData.length,
        };
    }

    throw new Error(`Endpoint '${resource}' not found!`);
};
