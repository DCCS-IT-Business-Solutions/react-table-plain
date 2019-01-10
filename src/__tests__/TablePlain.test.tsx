import * as React from "react";
import { shallow, mount } from "enzyme";
import { TablePlain } from "../TablePlain";

it("should render", () => {
  const sut = shallow(<TablePlain data={[]} desc={false} />);
  expect(sut).toMatchSnapshot();
});

it("should call onRowClick if row is clicked", () => {
  const handleRowClick = jest.fn();
  const sut = shallow(
    <TablePlain
      data={[{ a: 1, b: 2 }]}
      desc={false}
      onRowClick={handleRowClick}
    />
  );

  sut
    .find("tbody tr")
    .at(0)
    .simulate("click");

  expect(handleRowClick).toBeCalled();
});

it("should set row props", () => {
  const sut = shallow(
    <TablePlain
      data={[{ a: 1, b: 2 }]}
      desc={false}
      rowProps={() => ({
        style: { background: "yellow" },
        className: "catchMeIfYouCan"
      })}
    />
  );

  const row = sut.find(".catchMeIfYouCan").at(0);

  expect(row.props()).toHaveProperty("style.background");
});

describe("subComponent", () => {
  it("should not call onRowClick when clicked", () => {
    const handleRowClick = jest.fn();
    const sut = mount(
      <TablePlain
        data={[{ a: 1, b: 2 }]}
        desc={false}
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
        desc={false}
        colDef={[
          {
            prop: "a",
            header: "A",
            width: 1
          },
          {
            prop: "b",
            header: "B",
            width: 3
          }
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
        desc={false}
        colDef={[
          {
            prop: "a",
            header: "A",
            filterable: true
          }
        ]}
      />
    );

    const inputs = sut.find("input[type='text']");

    expect(inputs.length).toBe(1);
  });

  it("should render a custom filter component", () => {
    const sut = mount(
      <TablePlain
        data={[{ a: 1, b: 2 }]}
        desc={false}
        colDef={[
          {
            prop: "a",
            header: "A",
            filterable: true,
            renderFilter: () => <hr className="catchMeIfYouCan" />
          }
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
        desc={false}
        colDef={[
          {
            prop: "a",
            header: "A",
            filterable: true,
            renderFilter: (v, handleChange) => (
              <select value={v} onChange={e => handleChange(e.target.value)}>
                <option>1</option>
                <option>{optionToSelect}</option>
              </select>
            )
          }
        ]}
        onChangeFilter={handleChangeFilter}
      />
    );

    const select = sut.find("select");
    select.simulate("change", { target: { value: optionToSelect } });

    expect(handleChangeFilter).toBeCalled();
    expect(handleChangeFilter.mock.calls[0][1]).toEqual(optionToSelect);
  });
});
