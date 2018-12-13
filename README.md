# react-table-plain &middot; ![travis build](https://img.shields.io/travis/DCCS-IT-Business-Solutions/react-table-plain.svg) ![npm version](https://img.shields.io/npm/v/@dccs/react-table-plain.svg)

A NPM package that helps creating HTML tables in a React-way. It was partly inspired by [react-table](https://react-table.js.org).

@dccs/react-table-plain is written in [Typescript](https://www.typescriptlang.org/) and comes with its own type definitions.

## Installation

You should install [react-table-plain with npm or yarn](https://www.npmjs.com/package/@dccs/react-table-plain):

    npm install @dccs/react-table-plain
    or
    yarn add @dccs/react-table-plain

This command will download and install react-table-plain and all required dependencies.

## Features

### Minimal version

```javascript
import React from "react";
import { TablePlain } from "@dccs/react-table-plain";

function App() {
  return (
    <TablePlain
      data={[
        { id: 1, name: "Alexa" },
        { id: 2, name: "Google Home" },
        { id: 3, name: "Cortana" }
      ]}
      colDef={[
        {
          prop: "id",
          header: "ID"
        },
        {
          prop: "name",
          header: "User name",
          sortable: true
        }
      ]}
    />
  );
}
```

[![Edit react-table-plain mini](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/1o5m67xz5j)

### Sorting

react-table-plain supports sorting by a single column.

```javascript
class App extends React.Component {
  state = {
    orderby: "",
    desc: false,
    data: [
      { id: 1, name: "Alexa" },
      { id: 2, name: "Google Home" },
      { id: 3, name: "Cortana" }
    ]
  };
  render() {
    return (
      <TablePlain
        data={this.state.data}
        colDef={[
          {
            prop: "id",
            header: "ID"
          },
          {
            prop: "name",
            header: "User name",
            sortable: true
          }
        ]}
        orderedBy={this.state.orderby}
        desc={this.state.desc}
        onChangeOrderBy={this.handleChangeOrderBy}
      />
    );
  }

  handleChangeOrderBy = col => {
    let desc = false;
    if (this.state.orderby === col.prop) {
      desc = !this.state.desc;
    }
    this.setState(prev => ({
      orderby: col.prop,
      desc,
      data: sortData(prev.data, col.prop, desc)
    }));
  };
}

function sortData(data, prop, desc) {
  let result = data.sort((a, b) => a[prop] > b[prop]);
  return desc ? result.reverse() : result;
}
```

[![Edit react-table-plain sort](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/305v98omy5)

**IMPORTANT:** react-table-plain doesn't do the sorting. It just displays the data.
The caller is responsible for sorting the data.

### Render custom cells

TODO

### Set row props

You can set the props of each row, depending on the data for each row. For example to highlight a single row.

```javascript
import React from "react";
import { TablePlain } from "@dccs/react-table-plain";

function App() {
  return (
    <TablePlain
      data={[
        { id: 1, name: "Alexa" },
        { id: 2, name: "Google Home" },
        { id: 3, name: "Cortana" }
      ]}
      colDef={[
        {
          prop: "id",
          header: "ID"
        },
        {
          prop: "name",
          header: "User name",
          sortable: true
        }
      ]}
      rowProps={data => ({
        style: { background: data.id === 1 ? "yellow" : null }
      })}
    />
  );
}
```

[![Edit react-table-plain rowProps](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/18vv15mo84)

### Subcomponent

TODO

### Theming

TODO

## Contributing

### License

@dccs/react-table-plain is [MIT licensed](https://github.com/facebook/react/blob/master/LICENSE)
