import "@testing-library/jest-dom";

// jsdom does not implement scrollIntoView. Provide a no-op mock so that
// components that call scrollIntoView (e.g. for iPad Safari keyboard
// avoidance) do not throw in the test environment.
//
// Guard the assignment with a typeof check because API route tests run in the
// "node" test environment where `window` is not defined.
if (typeof window !== "undefined") {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
}
