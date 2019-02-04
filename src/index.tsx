import * as React from "react";

export interface ITablePlugin {
  init: (colDef: IColDef[]) => void;
}

type Fn = (colDef: IColDef, data: any) => React.ReactNode;
type ElementContent = string | Fn;
export type ChangeFilterHandler = (colDef: IColDef, value: any) => void;

interface ITableElements {
  rootElement?: React.ReactNode;
  rowElement?: React.ReactNode;
  cellElement?: React.ReactNode;
  headerCellElement?: React.ReactNode;
  headerElement?: React.ReactNode;
  bodyElement?: React.ReactNode;
  footerElement?: React.ReactNode;
  renderSortLabel?: (colDef: IColDef, desc: boolean) => React.ReactNode;
}

export interface IProps {
  data: any[];
  colDef?: IColDef[];
  orderedBy?: IColDef;
  desc: boolean;
  plugins?: ITablePlugin[];
  onChangeOrderBy?: (colDef: IColDef) => void;
  onChangeFilter?: ChangeFilterHandler;
  onRowClick?: (data: any) => void;
  renderHeaderCell?: (col: IColDef, idx: number) => React.ReactNode;
  renderFooterCell?: (
    col: IColDef,
    data: any[],
    idx: number
  ) => React.ReactNode;
  renderFilter?: (col: IColDef, idx: number) => React.ReactNode;
  renderExpansionIndicator?: (expanded: boolean) => React.ReactNode;
  subComponent?: (data: any) => React.ReactNode;
  rowProps?: (data: any) => object;
  filter?: object;
}

export type TableProps = IProps & ITableElements;

export interface IColDef {
  prop: string;
  header: string | ElementContent;
  accessor?: (data: any) => string;
  width?: number;
  render?: (data: any) => React.ReactNode;
  renderFilter?: (
    value: any,
    handleChange: (v: any) => void
  ) => React.ReactNode;
  props?: (data: any) => object;
  headerProps?: object;
  footerProps?: object;
  sortable?: boolean;
  filterable?: boolean;
  align?: "left" | "center" | "right";
  footer?: string | ElementContent;
}

export * from "./TablePlain";
