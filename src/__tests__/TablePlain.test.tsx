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
