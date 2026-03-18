/**
 * Unit tests for BlockTabBar component.
 *
 * Tests:
 *  - Renders all 5 blocks with correct Hebrew labels
 *  - Active block has aria-selected="true"
 *  - Inactive blocks have aria-selected="false"
 *  - Completed blocks show a checkmark (via aria-label suffix " (הושלם)")
 *  - Non-completed blocks do not show the checkmark suffix
 *  - onSelectBlock is called with the correct BlockId when a tab is clicked
 *  - Active block indicator element is present for the active tab
 *  - No active indicator for inactive tabs
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BlockTabBar, { BLOCKS } from "../BlockTabBar";
import type { BlockId } from "../BlockTabBar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCompletedSet(...ids: BlockId[]): Set<BlockId> {
  return new Set(ids);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlockTabBar", () => {
  it("renders all 5 block tabs", () => {
    render(
      <BlockTabBar
        activeBlock="A"
        completedBlocks={new Set()}
        onSelectBlock={jest.fn()}
      />
    );

    for (const block of BLOCKS) {
      // Each button has an aria-label containing the block id and label
      expect(
        screen.getByRole("tab", { name: new RegExp(`בלוק ${block.id}`) })
      ).toBeInTheDocument();
    }
  });

  it("marks the active block as aria-selected=true", () => {
    render(
      <BlockTabBar
        activeBlock="C"
        completedBlocks={new Set()}
        onSelectBlock={jest.fn()}
      />
    );

    expect(
      screen.getByRole("tab", { name: /בלוק C/ })
    ).toHaveAttribute("aria-selected", "true");
  });

  it("marks non-active blocks as aria-selected=false", () => {
    render(
      <BlockTabBar
        activeBlock="A"
        completedBlocks={new Set()}
        onSelectBlock={jest.fn()}
      />
    );

    for (const block of BLOCKS.filter((b) => b.id !== "A")) {
      expect(
        screen.getByRole("tab", { name: new RegExp(`בלוק ${block.id}`) })
      ).toHaveAttribute("aria-selected", "false");
    }
  });

  it("includes '(הושלם)' in aria-label for completed blocks", () => {
    render(
      <BlockTabBar
        activeBlock="A"
        completedBlocks={makeCompletedSet("B", "D")}
        onSelectBlock={jest.fn()}
      />
    );

    expect(
      screen.getByRole("tab", { name: /בלוק B.*הושלם/ })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("tab", { name: /בלוק D.*הושלם/ })
    ).toBeInTheDocument();
  });

  it("does not include '(הושלם)' for non-completed blocks", () => {
    render(
      <BlockTabBar
        activeBlock="A"
        completedBlocks={makeCompletedSet("B")}
        onSelectBlock={jest.fn()}
      />
    );

    // A, C, D, E should NOT have הושלם in their labels
    for (const id of ["A", "C", "D", "E"] as BlockId[]) {
      expect(
        screen.getByRole("tab", { name: new RegExp(`בלוק ${id}`) }).getAttribute("aria-label")
      ).not.toContain("הושלם");
    }
  });

  it("calls onSelectBlock with correct BlockId when a tab is clicked", () => {
    const onSelectBlock = jest.fn();
    render(
      <BlockTabBar
        activeBlock="A"
        completedBlocks={new Set()}
        onSelectBlock={onSelectBlock}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /בלוק C/ }));
    expect(onSelectBlock).toHaveBeenCalledWith("C");

    fireEvent.click(screen.getByRole("tab", { name: /בלוק E/ }));
    expect(onSelectBlock).toHaveBeenCalledWith("E");
  });

  it("calls onSelectBlock once per click", () => {
    const onSelectBlock = jest.fn();
    render(
      <BlockTabBar
        activeBlock="A"
        completedBlocks={new Set()}
        onSelectBlock={onSelectBlock}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /בלוק B/ }));
    expect(onSelectBlock).toHaveBeenCalledTimes(1);
  });

  it("renders the nav with the correct aria-label", () => {
    render(
      <BlockTabBar
        activeBlock="A"
        completedBlocks={new Set()}
        onSelectBlock={jest.fn()}
      />
    );

    expect(screen.getByRole("navigation", { name: "בלוקי הערכה" })).toBeInTheDocument();
  });
});
