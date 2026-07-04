import { Component, input, output, signal } from '@angular/core';
import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { NgTemplateOutlet } from '@angular/common';
import {
  LucideCheck,
  LucideChevronRight,
  LucideFile,
  LucideFolder,
} from '@lucide/angular';

export interface TreeNode<T> {
  label: string;
  value: T;
  children?: TreeNode<T>[];
  disabled?: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'tree',
  imports: [
    Tree,
    TreeItem,
    TreeItemGroup,
    NgTemplateOutlet,
    LucideFile,
    LucideFolder,
    LucideChevronRight,
    LucideCheck,
  ],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.css',
})
export class TreeComponent<T> {
  public readonly nodes = input.required<TreeNode<T>[]>();
  public readonly selectedNodes = signal<T[]>([]);
  public readonly nodeSelect = output<TreeNode<T>[]>();

  public nodeIsSelected(node: TreeNode<T>): boolean {
    const selected = this.selectedNodes();
    return selected.includes(node.value);
  }

  public toggleNodeSelection(event: Event, node: TreeNode<T>): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedNodes.update((current) => {
      const index = current.indexOf(node.value);
      if (index === -1) {
        current.push(node.value);
      } else {
        current.splice(index, 1);
      }
      return [...current];
    });
  }
}
