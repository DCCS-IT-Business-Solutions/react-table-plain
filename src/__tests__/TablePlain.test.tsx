import * as React from "react";
import { shallow } from "enzyme";
import { TablePlain } from "../TablePlain";

it("should render", () => {
  shallow(<TablePlain data={[]} desc={false} />);
});
