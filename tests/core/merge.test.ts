import { describe, expect, test } from 'vitest'
import { mergeDelta } from '../../src/core/merge';
import { DeepDelta } from '../../src/types/types';

type W = { r: string };
type Q = {
  a: number;
  b: number;
  c: {
    d: number;
    e: {
      f: Array<W>;
      k: boolean;
    };
  };
  list?: number[];
};

describe('mergeDelta', () => {
  // 1. تست به‌روزرسانی مقادیر Primitive در سطح اول
  test('should update top-level primitive fields and leave others intact', () => {
    const src: { a: number; b: number } = { a: 1, b: 2 };
    const patch: DeepDelta<{ a: number; b: number }> = { a: 10 };
    mergeDelta(src as any, patch as any);
    expect(src.a).toBe(10);
    expect(src.b).toBe(2); // باید بدون تغییر باقی بماند
  });

  // 2. تست به‌روزرسانی آبجکت‌های Nested
  test('should update nested object fields and not overwrite siblings', () => {
    const src: { c: { d: number; e: number } } = { c: { d: 3, e: 4 } };
    const patch: DeepDelta<{ c: { d: number } }> = { c: { d: 7 } };
    mergeDelta(src, patch as any);
    expect(src.c.d).toBe(7);
    expect(src.c.e).toBe(4); // فیلد e بدون تغییر باقی بماند
  });

  // 3. تست به‌روزرسانی اعضای داخل آرایه‌های Primitive
  test('should update elements of a primitive array in place', () => {
    const src: { list: number[] } = { list: [1, 2, 3] };
    const patch: DeepDelta<{ list: Array<number | undefined> }> = {
      list: [undefined, 20, undefined],
    };
    mergeDelta(src as any, patch as any);
    expect(src.list).toEqual([1, 20, 3]);
  });

  // 4. تست به‌روزرسانی اعضای داخل آرایه‌های Object
  test('should update nested object properties inside an array', () => {
    const src: { items: Array<{ v: number }> } = {
      items: [
        { v: 1 },
        { v: 2 },
        { v: 3 },
      ],
    };
    const patch: DeepDelta<{ items: Array<{ v: number } | undefined> }> = {
      items: [
        { v: 10 },
        undefined,
        { v: 30 },
      ],
    };
    mergeDelta(src as any, patch as any);
    expect(src.items[0].v).toBe(10);
    expect(src.items[1].v).toBe(2);  // بدون تغییر
    expect(src.items[2].v).toBe(30);
  });

  // 5. تست به‌روزرسانی آبجکت‌های Nested پیچیده (مانند مثال Q)
  test('should merge a nested Q structure including array of W correctly', () => {
    const src: Q = {
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: {
          f: [
            { r: 'hello1' },
            { r: 'hello2' },
            { r: 'hello3' },
          ],
          k: true,
        },
      },
    };
    const patch: DeepDelta<Q> = {
      a: 1000,
      c: {
        e: {
          f: [
            { r: 'bye1' },
            undefined,
            { r: 'bye3' },
          ],
        },
      },
    };
    mergeDelta(src, patch as any);
    expect(src.a).toBe(1000);
    // b بدون تغییر باقی بماند
    expect(src.b).toBe(2);

    // اعضای f: 
    expect(src.c.e.f[0].r).toBe('bye1');
    expect(src.c.e.f[1].r).toBe('hello2'); // undefined در patch → بدون تغییر
    expect(src.c.e.f[2].r).toBe('bye3');

    // سایر مسیرها بدون تغییر
    expect(src.c.d).toBe(3);
    expect(src.c.e.k).toBe(true);
  });

  // 6. تست حذف یک فیلد (Deletion) زمانی که patch تعیین شده برابر undefined باشد
  test('should delete a top-level field when patch value is explicitly undefined', () => {
    const src: { a?: number; b?: number } = { a: 5, b: 6 };
    const patch: DeepDelta<{ a: number | undefined; b: number }> = { a: undefined };
    mergeDelta(src as any, patch as any);
    expect(src.a).toBeUndefined();
    expect('a' in src).toBe(false); // کلید a حذف شده باشد
    expect(src.b).toBe(6);
  });

  // 7. تست حذف یک فیلد Nested
  test('should delete a nested field when patch value is undefined', () => {
    const src: { x: { y?: number; z: number } } = { x: { y: 10, z: 20 } };
    const patch: DeepDelta<{ x: { y: number | undefined } }> = { x: { y: undefined } };
    mergeDelta(src as any, patch as any);
    expect(src.x.y).toBeUndefined();
    expect('y' in src.x).toBe(false); // کلید y حذف شده باشد
    expect(src.x.z).toBe(20);
  });
});
