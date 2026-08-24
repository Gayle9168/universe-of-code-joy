/**
 * Marshalling between a problem's flat JSON test data and the object shapes its
 * starter code declares.
 *
 * Ten catalog problems hand the user a `TreeNode | null` or `ListNode | null`
 * signature, but a test's `input` is plain JSON — `[[3, 9, 20, null, null, 15, 7]]`.
 * With no codec the user's `root.left` reads a property off an Array, so every
 * one of those problems failed for anyone who wrote the solution the starter
 * code and hints describe.
 *
 * The runtime half is `IO_PREAMBLE_SOURCE`, a string injected into the sandbox
 * worker rather than imported: the classes must exist *inside* the worker for
 * user code to construct them, and a cyclic list cannot cross `postMessage` at
 * all. Tests evaluate that same string, so there is one implementation and not a
 * copy that can drift.
 */

/**
 * How one argument is built from the test's `input` array, or how the return
 * value is turned back into comparable JSON. The codec vocabulary itself lives
 * in the content layer, beside the records that declare it.
 */
import type { IoCodec, ProblemIo } from "@/content/types";

export type { IoCodec, ProblemIo };

/** Input slots consumed by one argument codec. */
export function slotsFor(codec: IoCodec): number {
  return codec === "list-cycle" ? 2 : 1;
}

/** Total input slots a descriptor expects, for validating catalog data. */
export function expectedSlots(io: ProblemIo): number {
  return io.args.reduce<number>((sum, codec) => sum + slotsFor(codec), 0);
}

/**
 * Injected ahead of user code. Deliberately ES5 (`var`, function constructors)
 * to match the rest of the sandbox source.
 *
 * The classes are attached to the global object rather than declared: a bare
 * `var ListNode = ...` would collide with a user's own top-level
 * `class ListNode` and throw a SyntaxError before any test ran. As a global
 * property it stays resolvable as a bare `ListNode` for everyone who does not
 * declare one, and is harmlessly shadowed by everyone who does. `globalThis`
 * and `self` are the same object inside a Worker; the fallback only matters
 * where the source is evaluated with a mock `self`.
 */
export const IO_PREAMBLE_SOURCE = `
var __LN = function (val, next) {
  this.val = val === undefined ? 0 : val;
  this.next = next === undefined ? null : next;
};
var __TN = function (val, left, right) {
  this.val = val === undefined ? 0 : val;
  this.left = left === undefined ? null : left;
  this.right = right === undefined ? null : right;
};
var __global = typeof globalThis !== 'undefined' ? globalThis : self;
__global.ListNode = __LN;
__global.TreeNode = __TN;

function __listFrom(values) {
  var head = null;
  var list = values || [];
  for (var i = list.length - 1; i >= 0; i -= 1) head = new __LN(list[i], head);
  return head;
}

function __listCycleFrom(values, pos) {
  var head = __listFrom(values);
  if (head === null || pos === null || pos === undefined || pos < 0) return head;
  var tail = head;
  while (tail.next !== null) tail = tail.next;
  var entry = head;
  for (var i = 0; i < pos && entry.next !== null; i += 1) entry = entry.next;
  tail.next = entry;
  return head;
}

function __listTo(node) {
  var out = [];
  var guard = 0;
  while (node !== null && node !== undefined && guard < 10000) {
    out.push(node.val);
    node = node.next;
    guard += 1;
  }
  return out;
}

function __treeFrom(values) {
  var list = values || [];
  if (list.length === 0 || list[0] === null || list[0] === undefined) return null;
  var root = new __TN(list[0]);
  var queue = [root];
  var i = 1;
  var head = 0;
  while (i < list.length && head < queue.length) {
    var node = queue[head];
    head += 1;
    if (i < list.length) {
      var lv = list[i];
      i += 1;
      if (lv !== null && lv !== undefined) {
        node.left = new __TN(lv);
        queue.push(node.left);
      }
    }
    if (i < list.length) {
      var rv = list[i];
      i += 1;
      if (rv !== null && rv !== undefined) {
        node.right = new __TN(rv);
        queue.push(node.right);
      }
    }
  }
  return root;
}

function __treeTo(root) {
  if (root === null || root === undefined) return [];
  var out = [];
  var queue = [root];
  var head = 0;
  var guard = 0;
  while (head < queue.length && guard < 10000) {
    var node = queue[head];
    head += 1;
    guard += 1;
    if (node === null || node === undefined) {
      out.push(null);
      continue;
    }
    out.push(node.val);
    queue.push(node.left === undefined ? null : node.left);
    queue.push(node.right === undefined ? null : node.right);
  }
  while (out.length > 0 && out[out.length - 1] === null) out.pop();
  return out;
}

function __treeFind(root, value) {
  var queue = [root];
  var head = 0;
  var guard = 0;
  while (head < queue.length && guard < 10000) {
    var node = queue[head];
    head += 1;
    guard += 1;
    if (node === null || node === undefined) continue;
    if (node.val === value) return node;
    queue.push(node.left);
    queue.push(node.right);
  }
  return null;
}

function __marshalArgs(input, codecs) {
  if (!codecs) return input;
  var args = [];
  var slot = 0;
  var lastTree = null;
  for (var c = 0; c < codecs.length; c += 1) {
    var codec = codecs[c];
    if (codec === 'list') {
      args.push(__listFrom(input[slot]));
      slot += 1;
    } else if (codec === 'list-cycle') {
      args.push(__listCycleFrom(input[slot], input[slot + 1]));
      slot += 2;
    } else if (codec === 'tree') {
      lastTree = __treeFrom(input[slot]);
      args.push(lastTree);
      slot += 1;
    } else if (codec === 'tree-node') {
      args.push(__treeFind(lastTree, input[slot]));
      slot += 1;
    } else {
      args.push(input[slot]);
      slot += 1;
    }
  }
  return args;
}

function __marshalReturn(value, codec) {
  if (codec === 'list') return __listTo(value);
  if (codec === 'tree') return __treeTo(value);
  if (codec === 'tree-val') {
    return value === null || value === undefined ? null : value.val;
  }
  return value;
}
`;
