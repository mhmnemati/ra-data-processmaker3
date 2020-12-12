import { DataProvider, fetchUtils } from "ra-core";

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider["getOne"] => async (resource, params) => {
    if (resource === "users") {
        const result = await httpClient(`${apiUrl}/users/${params.id}`, {
            method: "GET",
            headers: new Headers({}),
        });

        return {
            data: {
                ...result.json,
                id: params.id,
            },
        };
    }

    if (resource === "groups") {
        const result = await httpClient(`${apiUrl}/groups/${params.id}`, {
            method: "GET",
            headers: new Headers({}),
        });

        const members = await httpClient(
            `${apiUrl}/groups/${result.json.grp_uid}/users`,
            {
                method: "GET",
                headers: new Headers({}),
            }
        );

        return {
            data: {
                ...result.json,
                members: members.json,
                id: params.id,
            },
        };
    }

    if (resource === "activities") {
        const [pro_uid, tas_uid] = params.id.toString().split("-");

        const result = await httpClient(
            `${apiUrl}/project/${pro_uid}/activity/${tas_uid}`,
            {
                method: "GET",
                headers: new Headers({}),
            }
        );

        let steps = await httpClient(
            `${apiUrl}/project/${pro_uid}/activity/${tas_uid}/steps`,
            {
                method: "GET",
                headers: new Headers({}),
            }
        );

        steps.json = await Promise.all(
            steps.json.map(async (item: any) => {
                if (item.step_type_obj === "DYNAFORM") {
                    const dynaform = await httpClient(
                        `${apiUrl}/project/${pro_uid}/dynaform/${item.step_uid_obj}`,
                        {
                            method: "GET",
                            headers: new Headers({}),
                        }
                    );

                    return {
                        ...item,
                        dynaform: dynaform.json,
                    };
                }

                return item;
            })
        );

        return {
            data: {
                ...result.json,
                steps: steps.json,
                id: params.id,
            },
        };
    }

    if (
        resource === "cases" ||
        resource === "cases-participated" ||
        resource === "cases-unassigned" ||
        resource === "cases-paused"
    ) {
        const result = await httpClient(`${apiUrl}/cases/${params.id}`, {
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

        return {
            data: {
                ...result.json,
                variables: variables.json,
                act_uid: `${result.json.pro_uid}-${result.json.current_task[0].tas_uid}`,
                id: params.id,
            },
        };
    }

    throw new Error(`Endpoint '${resource}' not found!`);
};
