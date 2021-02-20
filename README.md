# ra-data-processmaker3

![Travis (.org) branch](https://img.shields.io/travis/ckoliber/ra-data-processmaker3/master)
![npm](https://img.shields.io/npm/v/ra-data-processmaker3)
![npm bundle size](https://img.shields.io/bundlephobia/min/ra-data-processmaker3)
![GitHub](https://img.shields.io/github/license/ckoliber/ra-data-processmaker3)

React Admin ProcessMaker3 DataProvider

## Installation

```bash
npm i --save query-string ra-data-processmaker3
```

## Usage

```tsx
// in src/App.tsx
import React from "react";
import { Admin, Resource } from "react-admin";
import pmProvider from "ra-data-processmaker3";

import { PostList } from "./posts";

const App = () => (
    <Admin dataProvider={pmProvider("http://path.to.my.api/")}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

---

## Customizing Http Client

```tsx
// in src/App.tsx
import { fetchUtils, Admin, Resource } from "react-admin";
import pmProvider from "ra-data-processmaker3";

const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: "application/json" });
    }
    // add your own headers here
    options.headers.set("X-Custom-Header", "foobar");
    return fetchUtils.fetchJson(url, options);
};

const provider = pmProvider("http://path.to.my.api/", httpClient);
```

---

## Contributors

-   [KoLiBer](https://www.linkedin.com/in/mohammad-hosein-nemati-665b1813b/)

## License

This project is licensed under the [MIT license](LICENSE.md).  
Copyright (c) KoLiBer (koliberr136a1@gmail.com)
