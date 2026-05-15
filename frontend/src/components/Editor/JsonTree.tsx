'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronDown, Copy } from 'lucide-react';
import { cn, buildTreeNodes, getTypeColor, copyToClipboard } from '@/lib/utils';
import { TreeNode } from '@/types';
import { toast } from 'sonner';

interface TreeNodeProps {
  node: TreeNode;
  depth?: number;
}

function TreeNodeRow({ node, depth = 0 }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(node.isExpanded ?? depth < 2);
  const [hovering, setHovering] = useState(false);

  const isExpandable = node.type === 'object' || node.type === 'array';
  const childCount = node.children?.length ?? 0;

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text =
        typeof node.value === 'string'
          ? node.value
          : JSON.stringify(node.value, null, 2);
      copyToClipboard(text).then(() => toast.success('Copied!', { duration: 1500 }));
    },
    [node.value]
  );

  const renderValue = () => {
    if (isExpandable) {
      const bracket = node.type === 'array' ? ['[', ']'] : ['{', '}'];
      if (!expanded) {
        return (
          <span className="text-muted-foreground text-xs">
            {bracket[0]}
            <span className="text-muted-foreground/60 mx-0.5">{childCount}</span>
            {bracket[1]}
          </span>
        );
      }
      return <span className="text-muted-foreground">{bracket[0]}</span>;
    }

    const color = getTypeColor(node.type);
    if (node.type === 'string') {
      return <span className={cn('font-mono text-xs', color)}>"{String(node.value)}"</span>;
    }
    if (node.type === 'null') {
      return <span className={cn('font-mono text-xs', color)}>null</span>;
    }
    return (
      <span className={cn('font-mono text-xs', color)}>{String(node.value)}</span>
    );
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-start gap-1 py-0.5 px-2 rounded-sm cursor-pointer group',
          'hover:bg-accent/50 transition-colors text-xs',
          depth > 0 && 'ml-4'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isExpandable && setExpanded(!expanded)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Expand icon */}
        <span className="w-4 shrink-0 flex items-center justify-center mt-0.5">
          {isExpandable ? (
            expanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )
          ) : (
            <span className="w-3" />
          )}
        </span>

        {/* Key */}
        {node.key !== 'root' && (
          <>
            <span className="text-blue-400 font-mono shrink-0">"{node.key}"</span>
            <span className="text-muted-foreground mx-1 shrink-0">:</span>
          </>
        )}

        {/* Value */}
        <span className="flex-1 min-w-0 truncate">{renderValue()}</span>

        {/* Copy button */}
        <button
          className={cn(
            'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
            'p-0.5 rounded hover:bg-accent'
          )}
          onClick={handleCopy}
        >
          <Copy className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* Children */}
      {isExpandable && expanded && node.children && (
        <div>
          {node.children.map((child, i) => (
            <TreeNodeRow key={`${child.key}-${i}`} node={child} depth={depth + 1} />
          ))}
          <div
            className="text-xs text-muted-foreground font-mono py-0.5"
            style={{ paddingLeft: `${depth * 16 + 24}px` }}
          >
            {node.type === 'array' ? ']' : '}'}
          </div>
        </div>
      )}
    </div>
  );
}

interface JsonTreeProps {
  value: string;
}

export function JsonTree({ value }: JsonTreeProps) {
  const tree = useMemo(() => {
    if (!value.trim()) return null;
    try {
      const parsed = JSON.parse(value);
      return buildTreeNodes(parsed);
    } catch {
      return null;
    }
  }, [value]);

  if (!value.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Start typing JSON to see the tree view
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-full text-destructive text-sm">
        Invalid JSON — fix errors to see tree
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto py-2">
      <TreeNodeRow node={tree} depth={0} />
    </div>
  );
}
