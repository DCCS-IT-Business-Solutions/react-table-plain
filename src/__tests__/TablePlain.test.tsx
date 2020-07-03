import * as React from "react";
import { shallow, mount } from "enzyme";
import { TablePlain } from "../TablePlain";
import { IColDef } from "..";

it("should render", () => {
  const sut = shallow(<TablePlain data={[]} />);
  expect(sut).toMatchSnapshot();
});

it("should call onRowClick if row is clicked", () => {
  const handleRowClick = jest.fn();
  const sut = shallow(
    <TablePlain data={[{ a: 1, b: 2 }]} onRowClick={handleRowClick} />
  );

  sut.find("tbody tr").at(0).simulate("click");

  expect(handleRowClick).toBeCalled();
});

it("should set row props", () => {
  const sut = shallow(
    <TablePlain
      data={[{ a: 1, b: 2 }]}
      rowProps={() => ({
        style: { background: "yellow" },
        className: "catchMeIfYouCan",
      })}
    />
  );

  const row = sut.find(".catchMeIfYouCan").at(0);

  expect(row.props()).toHaveProperty("style.background");
});

it("should call renderRoot if provided", () => {
  const sut = shallow(
    <TablePlain
      data={[]}
      renderRoot={(children) => <div className="table">{children}</div>}
    />
  );

  expect(sut.find(".table").length).toBe(1);
});

describe("subComponent", () => {
  it("should not call onRowClick when clicked", () => {
    const handleRowClick = jest.fn();
    const sut = mount(
      <TablePlain
        data={[{ a: 1, b: 2 }]}
        subComponent={() => <h1>Dummy</h1>}
        onRowClick={handleRowClick}
      />
    );

    sut
      .find(".expander") // Click on Expander
      .first()
      .simulate("click");

    expect(handleRowClick).not.toBeCalled();
  });
});

describe("column width", () => {
  it("should fix column width", () => {
    const sut = mount(
      <TablePlain
        data={[{ a: 1, b: 2 }]}
        colDef={[
          {
            prop: "a",
            header: "A",
            width: 1,
          },
          {
            prop: "b",
            header: "B",
            width: 3,
          },
        ]}
      />
    );

    const headerCells = sut.find("th");

    expect(headerCells.first().prop("width")).toBe("25%");
    expect(headerCells.last().prop("width")).toBe("75%");
  });
});

describe("filter", () => {
  it("should render a simple filter", () => {
    const sut = mount(
      <TablePlain
        data={[{ a: 1, b: 2 }]}
        colDef={[
          {
            prop: "a",
            header: "A",
            filterable: true,
          },
        ]}
      />
    );

    const inputs = sut.find("input[type='text']");

    expect(inputs.length).toBe(1);
  });

  it("should render a onblur filter", () => {
    const sut = mount(
      <TablePlain
        data={[{ a: 1, b: 2 }]}
        colDef={[
          {
            prop: "a",
            header: "A",
            filterable: true
          }
        ]}
        filterBlur={true}
      />
    );

    const inputs = sut.find("input[type='text']");
    expect(inputs.length).toBe(1);
    expect(inputs.prop("onChange")).toBe(undefined);
    expect(inputs.prop("onBlur")).toBeDefined();
  });

  it("should render a custom filter component", () => {
    const sut = mount(
      <TablePlain
        data={[{ a: 1, b: 2 }]}
        colDef={[
          {
            prop: "a",
            header: "A",
            filterable: true,
            renderFilter: () => <hr className="catchMeIfYouCan" />,
          },
        ]}
      />
    );

    const inputs = sut.find(".catchMeIfYouCan");

    expect(inputs.length).toBe(1);
  });

  it("should collect input from custom filter component", () => {
    const handleChangeFilter = jest.fn();
    const optionToSelect = "2";
    const sut = mount(
      <TablePlain
        data={[{ a: 1, b: 2 }]}
        colDef={[
          {
            prop: "a",
            header: "A",
            filterable: true,
            renderFilter: (v, handleChange) => (
              <select value={v} onChange={(e) => handleChange(e.target.value)}>
                <option>1</option>
                <option>{optionToSelect}</option>
              </select>
            ),
          },
        ]}
        onChangeFilter={handleChangeFilter}
      />
    );

    const select = sut.find("select");
    select.simulate("change", { target: { value: optionToSelect } });

    expect(handleChangeFilter).toBeCalled();
    expect(handleChangeFilter.mock.calls[0][1]).toEqual(optionToSelect);
  });

  it("should move filter one column if subComponent is enabled", () => {
    const sut = mount(
      <TablePlain
        data={[{ a: 1, b: 2 }]}
        colDef={[
          {
            prop: "a",
            header: "A",
            filterable: true,
          },
        ]}
        subComponent={() => <span>Dummy</span>}
      />
    );

    const rows = sut.find("thead > tr");
    const filterCells = rows.last().find("th");

    expect(rows.length).toBe(2);
    expect(filterCells.length).toBe(2);
    expect(filterCells.last().find("input[type='text']").length).toBe(1);
  });

  describe("filter property", () => {
    it("should init filter input with provided value", () => {
      const filter = { a: "test" };
      const sut = mount(
        <TablePlain
          data={[{ a: 1, b: 2 }]}
          filter={filter}
          colDef={[
            {
              prop: "a",
              header: "A",
              filterable: true,
            },
          ]}
        />
      );

      const inputs = sut.find("input[name='a']");

      expect(inputs.length).toBe(1);
      expect(inputs.first().props().value).toBe(filter.a);
    });

    it("should call onChangeFilter if any filter changed", () => {
      const filter = { a: "test" };
      const handleChangeFilter = jest.fn();
      const sut = mount(
        <TablePlain
          data={[{ a: 1, b: 2 }]}
          filter={filter}
          onChangeFilter={handleChangeFilter}
          colDef={[
            {
              prop: "a",
              header: "A",
              filterable: true,
            },
          ]}
        />
      );

      const input = sut.find("input[name='a']");
      input.simulate("change", { target: { value: "changed" } });

      expect(handleChangeFilter).toBeCalled();
    });

    it("should should reflect changes to filter", () => {
      const filter = { a: "test" };
      const handleChangeFilter = (orderBy: string, v: any) =>
        (filter[orderBy] = v);
      const sut = mount(
        <TablePlain
          data={[{ a: 1, b: 2 }]}
          filter={filter}
          onChangeFilter={handleChangeFilter}
          colDef={[
            {
              prop: "a",
              header: "A",
              filterable: true,
            },
          ]}
        />
      );

      let input = sut.find("input[name='a']");
      expect(input.props().value).toBe(filter.a);

      // Simulte prop change
      sut.setProps({ filter: { a: "changed" } });
      input = sut.find("input[name='a']");

      expect(input.props().value).toBe("changed");
    });
  });
});

describe("cell styling", () => {
  describe("align", () => {
    let sut = null;
    const alignment = "center";
    beforeEach(() => {
      sut = mount(
        <TablePlain
          data={[{ a: 1, b: 2 }]}
          colDef={[{ prop: "a", header: "A", align: alignment, footer: "" }]}
        />
      );
    });

    it("should align cell content", () => {
      const style = sut.find("tbody > tr > td").props().style;
      expect(style.textAlign).toBe(alignment);
    });

    it("should align header content", () => {
      const style = sut.find("thead > tr > th").props().style;
      expect(style.textAlign).toBe(alignment);
    });

    it("should align footer content", () => {
      const style = sut.find("tfoot > tr > td").props().style;
      expect(style.textAlign).toBe(alignment);
    });

  describe("header", () => {
    it("should render header from strings", () => {
      sut = mount(
        <TablePlain
          data={[{ a: 1, b: 2 }]}
          colDef={[{ prop: "a", header: "A" }]}
        />);
      const text = sut.find("thead > tr > th").first().text();
      expect(text).toEqual("A");

    });

    it("should render header from components", () => {
      sut = mount(
        <TablePlain
          data={[{ a: 1, b: 2 }]}
          colDef={[{ prop: "a", header: <strong>B</strong> }]}
        />);
      const text = sut.find("thead > tr > th").first().childAt(0).html();
      expect(text).toEqual("<strong>B</strong>");
    });
  });

  describe("ellipsis", () => {
    it("should apply to all body cells", () => {
      const sut = mount(
        <TablePlain
          data={[{ a: 1, b: 2 }]}
          colDef={[{ prop: "a", header: "A" }]}
          ellipsis={true}
        />
      );

      expect(sut.find("tbody > tr > td").props()).toMatchSnapshot();
    });
  });

  describe("cellProps", () => {
    it("should apply properties to all tbody cells", () => {
      const sut = mount(
        <TablePlain
          cellProps={(data) => ({ "data-test": data.a })}
          data={[{ a: 1, b: 2 }]}
          colDef={[{ prop: "a", header: "A" }]}
        />
      );

      expect(sut.find("tbody > tr > td").props()).toHaveProperty("data-test");
    });
  });
});

describe("single row selection", () => {
  it("should call onChangeSelectedRow with {a: 1, b: 2}", () => {
    function selectedRowProps() {
      return { background: "red" };
    }
    const data = [
      { a: 1, b: 2 },
      { a: 2, b: 2 },
      { a: 3, b: 2 }
    ];
    const onSelect = jest.fn();

    const sut = mount(
      <TablePlain
        data={data}
        colDef={[
          { prop: "a", header: "A" },
          { prop: "b", header: "Test" }
        ]}
        selectedRow={null}
        selectedRowProps={selectedRowProps}
        onChangeSelectedRow={onSelect}
        rowSelectionColumnName="a"
      />
    );

    // Click first row
    sut.find("tbody tr").at(0).simulate("click");

    expect(onSelect).toBeCalledWith(data[0]);
  });

  it("should highlite the second row in red", () => {
    const selectedRowProp = { background: "red" };

    function selectedRowProps() {
      return { style: selectedRowProp };
    }

    const data = [
      { a: 1, b: 2 },
      { a: 2, b: 2 },
      { a: 3, b: 2 }
    ];
    const onSelect = jest.fn();

    const sut = mount(
      <TablePlain
        data={data}
        colDef={[
          { prop: "a", header: "A" },
          { prop: "b", header: "Test" }
        ]}
        selectedRow={data[1].a}
        selectedRowProps={selectedRowProps}
        onChangeSelectedRow={onSelect}
        rowSelectionColumnName="a"
      />
    );

    expect(sut.find("tbody tr").at(1).props().style).toBe(selectedRowProp);

    expect(sut.find("tbody tr").at(0).props().style).not.toBe(selectedRowProp);
  });

  it("should highlite the second row in grey because no selectedRowProps are provided", () => {
    // const selectedRowProp = { background: "grey" };

    // function selectedRowProps(data: any) {
    //   return { style: selectedRowProp };
    // }

    const data = [
      { a: 1, b: 2 },
      { a: 2, b: 2 },
      { a: 3, b: 2 }
    ];
    const onSelect = jest.fn();

    const sut = mount(
      <TablePlain
        data={data}
        colDef={[
          { prop: "a", header: "A" },
          { prop: "b", header: "Test" }
        ]}
        selectedRow={data[1].a}
        // selectedRowProps={selectedRowProps}
        onChangeSelectedRow={onSelect}
        rowSelectionColumnName="a"
      />
    );

    expect(sut.find("tbody tr").at(1).props().style).toEqual({
      background: "grey",
      cursor: "default",
    });

    expect(sut.find("tbody tr").at(0).props().style).not.toEqual({
      background: "grey",
      cursor: "default",
    });
  });

  it("should compare the whole object because no ColumName is provided", () => {
    const selectedRowProp = { background: "red" };

    function selectedRowProps() {
      return { style: selectedRowProp };
    }

    const data = [
      { a: 1, b: 2 },
      { a: 2, b: 2 },
      { a: 3, b: 2 }
    ];
    const onSelect = jest.fn();

    const sut = mount(
      <TablePlain
        data={data}
        colDef={[
          { prop: "a", header: "A" },
          { prop: "b", header: "Test" }
        ]}
        selectedRow={data[1]}
        selectedRowProps={selectedRowProps}
        onChangeSelectedRow={onSelect}
        // rowSelectionColumnName="a"
      />
    );

    expect(sut.find("tbody tr").at(1).props().style).toBe(selectedRowProp);

    expect(sut.find("tbody tr").at(0).props().style).not.toBe(selectedRowProp);
  });
});

describe("multi row selection", () => {
  it("should call onChangeSelectedRow with {a: 1, b: 2} and {a:2,b:2}", () => {
    function selectedRowProps() {
      return { background: "red" };
    }
    const data = [
      { a: 1, b: 2 },
      { a: 2, b: 2 },
      { a: 3, b: 2 }
    ];
    const onSelect = jest.fn();

    const sut = mount(
      <TablePlain
        data={data}
        colDef={[
          { prop: "a", header: "A" },
          { prop: "b", header: "Test" }
        ]}
        selectedRow={null}
        selectedRowProps={selectedRowProps}
        onChangeSelectedRow={onSelect}
        rowSelectionColumnName="a"
      />
    );

    // Click first row
    sut.find("tbody tr").at(0).simulate("click");

    expect(onSelect).toBeCalledWith(data[0]);

    // Click second row
    sut.find("tbody tr").at(1).simulate("click");

    expect(onSelect).toBeCalledWith(data[1]);

    expect(onSelect).toBeCalledTimes(2);
  });

  it("should highlite the first and second row in red but not the third", () => {
    const selectedRowProp = { background: "red" };

    function selectedRowProps() {
      return { style: selectedRowProp };
    }

    const data = [
      { a: 1, b: 2 },
      { a: 2, b: 2 },
      { a: 3, b: 2 }
    ];
    const onSelect = jest.fn();

    const sut = mount(
      <TablePlain
        data={data}
        colDef={[
          { prop: "a", header: "A" },
          { prop: "b", header: "Test" }
        ]}
        selectedRow={[data[1].a, data[0].a]}
        selectedRowProps={selectedRowProps}
        onChangeSelectedRow={onSelect}
        rowSelectionColumnName="a"
      />
    );

    expect(sut.find("tbody tr").at(1).props().style).toBe(selectedRowProp);

    expect(sut.find("tbody tr").at(0).props().style).toBe(selectedRowProp);

    expect(sut.find("tbody tr").at(2).props().style).not.toBe(selectedRowProp);
  });

  it("should not highlite any row", () => {
    const selectedRowProp = { background: "red" };

    function selectedRowProps() {
      return { style: selectedRowProp };
    }

    const data = [
      { a: 1, b: 2 },
      { a: 2, b: 2 },
      { a: 3, b: 2 }
    ];
    const onSelect = jest.fn();

    const sut = mount(
      <TablePlain
        data={data}
        colDef={[
          { prop: "a", header: "A" },
          { prop: "b", header: "Test" }
        ]}
        selectedRowProps={selectedRowProps}
        onChangeSelectedRow={onSelect}
        rowSelectionColumnName="a"
      />
    );

    expect(sut.find("tbody tr").at(0).props().style).not.toEqual(
      selectedRowProp
    );

    expect(sut.find("tbody tr").at(1).props().style).not.toEqual(
      selectedRowProp
    );

    expect(sut.find("tbody tr").at(2).props().style).not.toEqual(
      selectedRowProp
    );
  });

  it("should highlite the first and second row in grey but not the third becuase no selectedRowProps is provided", () => {
    // const selectedRowProp = { background: "red" };

    // function selectedRowProps(data: any) {
    //   return { style: selectedRowProp };
    // }

    const data = [
      { a: 1, b: 2 },
      { a: 2, b: 2 },
      { a: 3, b: 2 }
    ];
    const onSelect = jest.fn();

    const sut = mount(
      <TablePlain
        data={data}
        colDef={[
          { prop: "a", header: "A" },
          { prop: "b", header: "Test" }
        ]}
        selectedRow={[data[1].a, data[0].a]}
        // selectedRowProps={selectedRowProps}
        onChangeSelectedRow={onSelect}
        rowSelectionColumnName="a"
      />
    );

    expect(sut.find("tbody tr").at(1).props().style).toEqual({
      background: "grey",
      cursor: "default",
    });

    expect(sut.find("tbody tr").at(0).props().style).toEqual({
      background: "grey",
      cursor: "default",
    });

    expect(sut.find("tbody tr").at(2).props().style).not.toEqual({
      background: "grey",
      cursor: "default",
    });
  });

  it("should compare the whole object because no ColumName is provided", () => {
    const selectedRowProp = { background: "red" };

    function selectedRowProps() {
      return { style: selectedRowProp };
    }

    const data = [
      { a: 1, b: 2 },
      { a: 2, b: 2 },
      { a: 3, b: 2 }
    ];
    const onSelect = jest.fn();

    const sut = mount(
      <TablePlain
        data={data}
        colDef={[
          { prop: "a", header: "A" },
          { prop: "b", header: "Test" }
        ]}
        selectedRow={[data[1], data[0]]}
        selectedRowProps={selectedRowProps}
        onChangeSelectedRow={onSelect}
        // rowSelectionColumnName="a"
      />
    );

    expect(sut.find("tbody tr").at(1).props().style).toBe(selectedRowProp);

    expect(sut.find("tbody tr").at(0).props().style).toBe(selectedRowProp);

    expect(sut.find("tbody tr").at(2).props().style).not.toBe(selectedRowProp);
  });
});
