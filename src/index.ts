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

export default (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson
): DataProvider => ({
    getList: getList(apiUrl, httpClient),
    getOne: getOne(apiUrl, httpClient),
    getMany: getMany(apiUrl, httpClient),
    getManyReference: getManyReference(apiUrl, httpClient),
    create: createOne(apiUrl, httpClient),
    update: updateOne(apiUrl, httpClient),
    updateMany: updateMany(apiUrl, httpClient),
    delete: deleteOne(apiUrl, httpClient),
    deleteMany: deleteMany(apiUrl, httpClient),
});
