import * as React from "react";
import { TableProps, IColDef, ChangeFilterHandler } from ".";
import { some, sumBy } from "lodash";

interface IState {
  filter: any;
  showSubComponent: object;
}

export class TablePlain extends React.Component<TableProps, IState> {
  state = {
    filter: this.props.defaultFilter || {},
    showSubComponent: {}
  };

  get rootElement() {
    return this.props.rootElement || "table";
  }
  get rowElement() {
    return this.props.rowElement || "tr";
  }
  get cellElement() {
    return this.props.cellElement || "td";
  }
  get headerCellElement() {
    return this.props.headerCellElement || "th";
  }
  get headerElement() {
    return this.props.headerElement || "thead";
  }
  get bodyElement() {
    return this.props.bodyElement || "tbody";
  }
  get footerElement() {
    return this.props.footerElement || "tfoot";
  }

  get hasFooter() {
    return some(this.props.colDef, def => def.footer != null);
  }

  get isFilterable() {
    return some(this.props.colDef, def => def.filterable === true);
  }

  get filter() {
    return this.props.filter ? this.props.filter : this.state.filter;
  }

  render() {
    const { data } = this.props;
    const colDef = this.props.colDef || this.generateColDef(data);

    if (data != null) {
      const renderRoot = this.props.renderRoot || this.renderRoot;
      return renderRoot(
        <React.Fragment>
          {this.renderHeader(colDef)}
          {this.renderData(colDef, data)}
          {this.hasFooter && this.renderFooter(colDef, data)}
        </React.Fragment>
      );
    }
    return null;
  }

  renderRoot = (children: React.ReactNode) => {
    const Root: any = this.rootElement;
    return <Root style={{ tableLayout: "auto" }}>{children}</Root>;
  };

  renderData(colDef: IColDef[], data: any[]) {
    const Body: any = this.bodyElement;
    return (
      <Body>
        {data && data.map((d, idx) => this.renderRow(colDef, d, idx))}
      </Body>
    );
  }

  getSelectedRowProps(data: any) {
    if (this.props.selectedRow == null) {
      // No Row is selected
      return false;
    }
    if (this.props.rowSelectionColumnName != null) {
      // The user has provided a ColumnName to compare a single Column with the SelectedRow Value
      if (Array.isArray(this.props.selectedRow)) {
        // This is a multi-line selectable table
        if (
          this.props.selectedRow.includes(
            data[this.props.rowSelectionColumnName]
          )
        ) {
          // This row is in scope of the selectedRow Array
          if (this.props.selectedRowProps != null) {
            // The user has provided a function that provides a object for the row
            return this.props.selectedRowProps(data);
          } else {
            // The user has not provided a function that provides a object for the row,
            // so default the background is set to grey
            return { style: { background: "grey", cursor: this.props.onRowClick ? "pointer" : "default" } };
          }
        } else {
          // This row is not in scope of the selectedRow Array
          return false;
        }
      } else {
        // This is a single-line selectable table
        if (
          this.props.selectedRow === data[this.props.rowSelectionColumnName]
        ) {
          // This row is the selectedRow
          if (this.props.selectedRowProps != null) {
            // The user has provided a function that provides a object for the row
            return this.props.selectedRowProps(data);
          } else {
            // The user has not provided a function that provides a object for the row,
            // so default the background is set to grey
            return { style: { background: "grey", cursor: this.props.onRowClick ? "pointer" : "default" } };
          }
        } else {
          // This row is not the selected Row
          return false;
        }
      }
    } else {
      // The user has not provided a ColumnName to compare a single Column with the SelectedRow Value
      // so default the selectedRow is compared with the whole data object
      if (Array.isArray(this.props.selectedRow)) {
        // This is a multi-line selectable table
        if (this.props.selectedRow.includes(data)) {
          // This row is in scope of the selectedRow Array
          if (this.props.selectedRowProps != null) {
            // The user has provided a function that provides a object for the row
            return this.props.selectedRowProps(data);
          } else {
            // The user has not provided a function that provides a object for the row,
            // so default the background is set to grey
            return { style: { background: "grey", cursor: this.props.onRowClick ? "pointer" : "default" } };
          }
        } else {
          // This row is not in scope of the selectedRow Array
          return false;
        }
      } else {
        // This is a single-line selectable table
        if (this.props.selectedRow === data) {
          // This row is the selectedRow
          if (this.props.selectedRowProps != null) {
            // The user has provided a function that provides a object for the row
            return this.props.selectedRowProps(data);
          } else {
            // The user has not provided a function that provides a object for the row,
            // so default the background is set to grey
            return { style: { background: "grey", cursor: this.props.onRowClick ? "pointer" : "default" } };
          }
        } else {
          // This row is not the selected Row
          return false;
        }
      }
    }
  }

  onClickCalls(data: any) {
    if (this.props.onRowClick) { this.props.onRowClick(data); }
    if (this.props.onChangeSelectedRow) { this.props.onChangeSelectedRow(data); }
  }

  renderRow(colDef: IColDef[], data: any, key: number) {
    const Row: any = this.rowElement;
    const Cell: any = this.cellElement;
    const renderIndicator =
      this.props.renderExpansionIndicator || this.renderExpansionIndicator;
    const props = this.props.rowProps != null && this.props.rowProps(data);
    const selectedRowProps = this.getSelectedRowProps(data);
    const result = [
      <Row
        key={key}
        style={{
          background: key % 2 ? "#ebebeb" : "white",
          cursor: this.props.onRowClick ? "pointer" : "default"
        }}
        onClick={() => this.onClickCalls(data)}
        {...props}
        {...selectedRowProps}
      >
        {this.props.subComponent &&
          this.renderCell(
            {
              header: "",
              prop: "",
              props: () => ({
                onClick: (e: React.MouseEvent) =>
                  this.handleExpansionClick(e, key)
              }),
              render: () =>
                renderIndicator(this.state.showSubComponent[key] === true)
            },
            data,
            -1,
            { width: "1%", style: { paddingRight: 0 } }
          )}
        {colDef.map((def, idx) => this.renderCell(def, data, idx))}
      </Row>
    ];

    if (this.props.subComponent && this.state.showSubComponent[key]) {
      result.push(
        <Row key={-1}>
          <Cell colSpan={colDef.length + 1}>
            {this.props.subComponent(data)}
          </Cell>
        </Row>
      );
    }

    return result;
  }

  renderCell(colDef: IColDef, data: any, idx: number, props?: object) {
    const Cell: any = this.cellElement;
    const ps = {
      // IMPORTANT: The order of the following lines matters:
      ...this.ellipsisToCss(this.props.ellipsis),
      // generated style props for alignment
      ...this.alignToCss(colDef.align),
      // table-wide cell props.
      ...(this.props.cellProps != null
        ? this.props.cellProps(data)
        : undefined),
      // specific cell props
      ...(colDef.props != null ? { ...props, ...colDef.props(data) } : props)
    };
    if (colDef.render != null) {
      return (
        <Cell key={idx} {...ps}>
          {colDef.render(data)}
        </Cell>
      );
    }
    const val =
      colDef.accessor != null ? colDef.accessor(data) : data[colDef.prop];
    return (
      <Cell key={idx} {...ps}>
        {val}
      </Cell>
    );
  }

  renderHeader(colDef: IColDef[]) {
    const Header: any = this.headerElement;
    const Row: any = this.rowElement;
    const Cell: any = this.headerCellElement;
    const totalWidth = sumBy(colDef, x => x.width || 0);

    const render =
      this.props.renderHeaderCell != null
        ? this.props.renderHeaderCell.bind(this)
        : this.renderHeaderCell.bind(this);

    function renderSubComponentSpacer(subComponent?: React.ReactNode) {
      return subComponent != null
        ? render(
          { prop: "", header: "" },
          -1,
          {
            width: "1%",
            style: { paddingRight: 0 }
          },
          totalWidth
        )
        : null;
    }

    return (
      <Header>
        <Row>
          {renderSubComponentSpacer(this.props.subComponent)}
          {colDef.map((col: IColDef, idx) =>
            render(col, idx, undefined, totalWidth)
          )}
        </Row>
        {this.isFilterable && (
          <Row>
            {renderSubComponentSpacer(this.props.subComponent)}
            {colDef.map((def, idx) => (
              <Cell key={idx}>
                {def.filterable
                  ? this.props.renderFilter != null
                    ? this.props.renderFilter(def, idx)
                    : this.renderFilter(def, idx)
                  : null}
              </Cell>
            ))}
          </Row>
        )}
      </Header>
    );
  }

  renderHeaderCell(
    colDef: IColDef,
    idx: number,
    props?: object,
    totalWidth?: number
  ) {
    const HeaderCell: any = this.headerCellElement;
    const ps = { ...props, ...this.alignToCss(colDef.align) };
    return (
      <HeaderCell
        key={idx}
        {...colDef.headerProps}
        onClick={() => colDef.sortable && this.handleChangeSort(colDef)}
        {...ps}
        width={
          colDef.width ? `${(colDef.width! / totalWidth!) * 100}%` : undefined
        }
      >
        {colDef.header}
        {this.props.orderedBy &&
          this.props.orderedBy.prop === colDef.prop &&
          this.props.renderSortLabel &&
          this.props.renderSortLabel(colDef, this.props.desc)}
      </HeaderCell>
    );
  }

  renderFilter(colDef: IColDef, idx: number) {
    return colDef.renderFilter ? (
      colDef.renderFilter(this.filter[colDef.prop], (v: any) =>
        this.handleFilterChange(colDef, v)
      )
    ) : (
        <input
          type="text"
          name={colDef.prop}
          value={this.filter[colDef.prop] || ""}
          onChange={e => this.handleFilterChange(colDef, e.target.value)}
        />
      );
  }

  renderFooter(colDef: IColDef[], data: any[]) {
    const Footer: any = this.footerElement;
    const Row: any = this.rowElement;
    return (
      <Footer>
        <Row>
          {colDef.map((def, idx) =>
            this.props.renderFooterCell != null
              ? this.props.renderFooterCell(def, data, idx)
              : this.renderFooterCell(def, data, idx)
          )}
        </Row>
      </Footer>
    );
  }

  renderFooterCell(colDef: IColDef, data: any[], idx: number) {
    const FooterCell: any = this.cellElement;
    const ps = this.alignToCss(colDef.align);
    return (
      <FooterCell key={idx} {...colDef.footerProps} {...ps}>
        {colDef.footer != null
          ? typeof colDef.footer === "string"
            ? colDef.footer
            : colDef.footer!(colDef, data)
          : null}
      </FooterCell>
    );
  }

  renderExpansionIndicator(expanded: boolean) {
    const rot = expanded ? -90 : 90;
    return (
      <div
        className="expander"
        style={{
          transform: `rotate(${rot}deg)`,
          display: "flex",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        &gt;
      </div>
    );
  }

  generateColDef(data: any[]): IColDef[] {
    return [];
  }

  handleChangeSort = (colDef: IColDef) => {
    if (this.props.onChangeOrderBy) {
      this.props.onChangeOrderBy(colDef);
    }
  };

  handleFilterChange = (colDef: IColDef, value: any) => {
    const name = colDef.prop;
    function callHandler(fn?: ChangeFilterHandler) {
      if (fn != null) {
        fn(colDef, value);
      }
    }
    if (this.props.filter != null) {
      callHandler(this.props.onChangeFilter);
    } else {
      this.setState(
        p => ({
          filter: {
            ...p.filter,
            [name]: value
          }
        }),
        () => callHandler(this.props.onChangeFilter)
      );
    }
  };

  handleExpansionClick = (e: React.MouseEvent, key: number) => {
    e.stopPropagation();
    this.toggleSubmenu(key);
  };

  private toggleSubmenu = (key: number) => {
    this.setState(prev => ({
      showSubComponent: {
        ...prev.showSubComponent,
        [key]: prev.showSubComponent[key] ? false : true
      }
    }));
  };

  private alignToCss(align?: "left" | "center" | "right") {
    return align != null ? { style: { textAlign: align } } : undefined;
  }

  private ellipsisToCss(ellipsis?: boolean) {
    return ellipsis === true
      ? {
        style: {
          whiteSpace: "nowrap",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "auto"
        }
      }
      : undefined;
  }
}
