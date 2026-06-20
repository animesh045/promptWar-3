import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import Button from "./Button";
import ProgressBar from "./ProgressBar";
import Card from "./Card";
import Badge from "./Badge";

describe("UI Components: Button", () => {
  it("renders with default primary variant", () => {
    const html = ReactDOMServer.renderToString(<Button>Click me</Button>);
    expect(html).toContain("btn");
    expect(html).toContain("btn-primary");
    expect(html).toContain("Click me");
  });

  it("renders with secondary variant and custom class", () => {
    const html = ReactDOMServer.renderToString(
      <Button variant="secondary" className="extra-class">
        Submit
      </Button>
    );
    expect(html).toContain("btn-secondary");
    expect(html).toContain("extra-class");
  });
});

describe("UI Components: ProgressBar", () => {
  it("carries ARIA role and correct progress values", () => {
    const html = ReactDOMServer.renderToString(
      <ProgressBar value={45} ariaLabel="Carbon Saving Status" />
    );
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="45"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-label="Carbon Saving Status"');
    expect(html).toContain('style="width:45%"');
  });

  it("bounds percentage values between 0 and 100", () => {
    const htmlOverflow = ReactDOMServer.renderToString(<ProgressBar value={120} />);
    expect(htmlOverflow).toContain('style="width:100%"');

    const htmlUnderflow = ReactDOMServer.renderToString(<ProgressBar value={-15} />);
    expect(htmlUnderflow).toContain('style="width:0%"');
  });
});

describe("UI Components: Card", () => {
  it("renders standard glass card container", () => {
    const html = ReactDOMServer.renderToString(<Card>Card content</Card>);
    expect(html).toContain("glass-card");
    expect(html).toContain("Card content");
    expect(html).not.toContain('role="button"');
    expect(html).not.toContain("tabIndex");
  });

  it("appends button roles and focus attributes when interactive is active", () => {
    const html = ReactDOMServer.renderToString(
      <Card interactive={true}>Interactive Content</Card>
    );
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
  });
});

describe("UI Components: Badge", () => {
  it("renders success and warning statuses correctly", () => {
    const successHtml = ReactDOMServer.renderToString(
      <Badge variant="success">Eco</Badge>
    );
    expect(successHtml).toContain("badge-eco-success");

    const warningHtml = ReactDOMServer.renderToString(
      <Badge variant="warning">Alert</Badge>
    );
    expect(warningHtml).toContain("badge-eco-warning");
  });
});
