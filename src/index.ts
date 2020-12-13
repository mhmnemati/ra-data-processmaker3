import { DataProvider, fetchUtils } from "ra-core";

import getList from "./get/getList";
import getOne from "./get/getOne";
import getMany from "./get/getMany";
import getManyReference from "./get/getManyReference";
import createOne from "./create/createOne";
import updateOne from "./update/updateOne";
import updateMany from "./update/updateMany";
import deleteOne from "./delete/deleteOne";
import deleteMany from "./delete/deleteMany";

interface PM3DataProvider extends DataProvider {
    routeCase: (id: string) => Promise<void>;
    uploadDocument: (
        id: string,
        file: File,
        taskId: string,
        documentId: string
    ) => Promise<string>;
}

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): PM3DataProvider => ({
    getList: getList(apiUrl, httpClient),
    getOne: getOne(apiUrl, httpClient),
    getMany: getMany(apiUrl, httpClient),
    getManyReference: getManyReference(apiUrl, httpClient),
    create: createOne(apiUrl, httpClient),
    update: updateOne(apiUrl, httpClient),
    updateMany: updateMany(apiUrl, httpClient),
    delete: deleteOne(apiUrl, httpClient),
    deleteMany: deleteMany(apiUrl, httpClient),

    routeCase: async (id: string) => {
        await httpClient(`${apiUrl}/cases/${id}/route-case`, {
            method: "PUT",
            body: JSON.stringify({
                executeTriggersBeforeAssignment: true,
            }),
            headers: new Headers({}),
        });
    },
    uploadDocument: async (
        id: string,
        file: File,
        taskId: string,
        documentId: string
    ) => {
        let data = new FormData();
        data.append("form", file, file.name);
        data.append("tas_uid", taskId);
        data.append("inp_doc_uid", documentId);
        data.append("app_doc_comment", " ");

        const result = await httpClient(
            `${apiUrl}/cases/${id}/input-document`,
            {
                method: "POST",
                body: data,
                headers: new Headers({}),
            }
        );

        return `cases/${id}/input-document/${result.json.app_doc_uid}/file?v=${result.json.app_doc_version}`;
    },
});
