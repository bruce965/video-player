import { createElement, DragEventHandler, EffectCallback, Ref, RefCallback, useCallback, useEffect, useMemo, useRef } from 'react';
import { useCallbackRef, useDragListener } from '../../utility';

export type DropAreaProps<T extends keyof JSX.IntrinsicElements> = {
    elementType?: T
    onDropping(items: DataTransferItemList): boolean
    onDropped(items: DataTransferItemList): boolean
} & JSX.IntrinsicElements[T]

export const DropArea = <T extends keyof JSX.IntrinsicElements>({
    elementType,
    onDropping,
    onDropped,
    ...props
}: DropAreaProps<T>) => {
    const { dragInProgress, items } = useDragListener();

    const isDroppable = useMemo(() => {
        return items != null && onDropping(items);
    }, [onDropping, items]);

    const wrappedOnDragOver = props.onDragOver;
    const onDragOver = useCallback<DragEventHandler>(function(this: any, e) {
        if (onDropping(e.dataTransfer.items))
            e.preventDefault();

        (wrappedOnDragOver as any)?.call(this, arguments);
    }, [wrappedOnDragOver, onDropping]);

    const wrappedOnDrop = props.onDrop;
    const onDrop = useCallback<DragEventHandler>(function(this: any, e) {
        if (onDropped(e.dataTransfer.items))
            e.preventDefault();
        (wrappedOnDrop as any)?.call(this, arguments);
    }, [wrappedOnDrop]);

    return createElement(elementType ?? 'div', {
        ...props as any,
        onDragOver: onDragOver,
        onDrop: onDrop,
    });
};
