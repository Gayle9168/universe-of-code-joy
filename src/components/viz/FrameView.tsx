import * as React from "react";
import type { Frame } from "@/engine/types";
import { ArrayView } from "@/components/viz/ArrayView";
import { TreeView } from "@/components/viz/TreeView";
import { GraphView } from "@/components/viz/GraphView";
import { GridView } from "@/components/viz/GridView";
import { TableView } from "@/components/viz/TableView";

export interface FrameViewProps {
  frame: Frame;
  className?: string;
}

export function FrameView({ frame, className }: FrameViewProps): React.ReactElement {
  switch (frame.kind) {
    case "array":
      return <ArrayView frame={frame} className={className} />;
    case "tree":
      return <TreeView frame={frame} className={className} />;
    case "graph":
      return <GraphView frame={frame} className={className} />;
    case "grid":
      return <GridView frame={frame} className={className} />;
    case "table":
      return <TableView frame={frame} className={className} />;
  }
}

export default FrameView;
