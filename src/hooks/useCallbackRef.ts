// SPDX-FileCopyrightText: Copyright 2023 Fabio Iotti
// SPDX-License-Identifier: MIT

import { DependencyList, EffectCallback, RefCallback, useMemo } from 'react';

/**
 * Equivalent to {@link useRef}, but builds a {@link RefCallback} instead of a
 * {@link MutableRefObject}.
 *
 * The callback function may return a destructor like {@link useEffect}.
 */
export const useCallbackRef = <T,>(
    callback: (instance: T) => ReturnType<EffectCallback>,
    deps?: DependencyList
) => {
    const ref = useMemo<RefCallback<T>>(() => {
        let destructor: ReturnType<EffectCallback>;

        return el => {
            destructor?.();
            destructor = el == null ? undefined : callback(el);
        };
    }, deps ?? [callback]);

    return ref;
};
