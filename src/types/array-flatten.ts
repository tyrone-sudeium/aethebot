/**
 * Type definition for array-flatten.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 01/01/19.
 * Copyright (c) 2019 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */
declare module "array-flatten" {
    export = arrayFlatten
    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth.
     *
     * @param depth The maximum recursion depth
     */
    function arrayFlatten<U>(array: U[][][][][][][][], depth: 7): U[]

    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth.
     *
     * @param depth The maximum recursion depth
     */
    function arrayFlatten<U>(array: U[][][][][][][], depth: 6): U[]

    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth.
     *
     * @param depth The maximum recursion depth
     */
    function arrayFlatten<U>(array: U[][][][][][], depth: 5): U[]

    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth.
     *
     * @param depth The maximum recursion depth
     */
    function arrayFlatten<U>(array: U[][][][][], depth: 4): U[]

    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth.
     *
     * @param depth The maximum recursion depth
     */
    function arrayFlatten<U>(array: U[][][][], depth: 3): U[]

    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth.
     *
     * @param depth The maximum recursion depth
     */
    function arrayFlatten<U>(array: U[][][], depth: 2): U[]

    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth.
     *
     * @param depth The maximum recursion depth
     */
    function arrayFlatten<U>(array: U[][], depth?: 1): U[]

    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth.
     *
     * @param depth The maximum recursion depth
     */
    function arrayFlatten<U>(array: U[], depth: 0): U[]

    /**
     * Returns a new array with all sub-array elements concatenated into it recursively up to the
     * specified depth. If no depth is provided, flat method defaults to the depth of 1.
     *
     * @param depth The maximum recursion depth
     */
    function arrayFlatten<U>(depth?: number): any[]

    // ¯\_(ツ)_/¯
    namespace arrayFlatten {}
}
