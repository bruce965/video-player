// SPDX-FileCopyrightText: Copyright 2023 Fabio Iotti
// SPDX-License-Identifier: MIT

import { useRef } from 'react';

/**
 * Equivalent to {@link useMemo}, but backed by a {@link Ref}.
 *
 * According to React's documentation, {@link useMemo} may throw away cached
 * values in the future. If such behavior is undesired, this hook is a safe
 * drop-in replacement.
 */
export const useRefMemo = <T,>(factory: () => T) => {
    const ref = useRef<T>();
    const memoized = ref.current ??= factory();
    return memoized;
};
