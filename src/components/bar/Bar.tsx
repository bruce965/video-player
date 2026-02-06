// SPDX-FileCopyrightText: Copyright 2023-2024, 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { CSSProperties, FC, MouseEventHandler, ReactNode, TouchEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classes from './Bar.module.css';

export interface BarProps {
    value: number
    className?: string
    renderHint?(position: number): ReactNode
    onChangeInteracting?(interacting: boolean): void
    onValueChange?(value: number): void
}

export const Bar: FC<BarProps> = ({
    value,
    className,
    renderHint,
    onChangeInteracting,
    onValueChange,
}) => {
    const barRef = useRef<HTMLDivElement>(null);

    const [dragging, setDragging] = useState(false);
    const [hintPosition, setHintPosition] = useState(0);
    const [hintVisible, setHintVisible] = useState(false);

    useEffect(() => {
        onChangeInteracting?.(dragging);
    }, [onChangeInteracting, dragging]);

    const handleMouseDown = useCallback<MouseEventHandler>(e => {
        const handleMove = (e: MouseEvent) => {
            const rect = barRef.current!.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const clampedPos = Math.max(0, Math.min(1, pos));
            setHintPosition(clampedPos);
            onValueChange?.(clampedPos);
        };

        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            setDragging(false);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);

        setDragging(true);
        handleMove(e.nativeEvent);
    }, [onValueChange]);

    const handleTouchStart = useCallback<TouchEventHandler>(e => {
        e.preventDefault();

        const handleMove = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            const touch = e.touches[0]!;
            const rect = barRef.current!.getBoundingClientRect();
            const pos = (touch.clientX - rect.left) / rect.width;
            const clampedPos = Math.max(0, Math.min(1, pos));
            setHintPosition(clampedPos);
            onValueChange?.(clampedPos);
        };

        const handleEnd = () => {
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
            window.removeEventListener('touchcancel', handleEnd);
            setDragging(false);
            setHintVisible(false);
        };

        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
        window.addEventListener('touchcancel', handleEnd);

        setDragging(true);
        setHintVisible(true);

        // Handle initial touch position
        if (e.touches.length > 0) {
            const touch = e.touches[0]!;
            const rect = barRef.current!.getBoundingClientRect();
            const pos = (touch.clientX - rect.left) / rect.width;
            const clampedPos = Math.max(0, Math.min(1, pos));
            setHintPosition(clampedPos);
            onValueChange?.(clampedPos);
        }
    }, [onValueChange]);

    const filledStyle = useMemo<CSSProperties>(() => ({
        width: `${value * 100}%`,
    }), [value]);

    const handleMouseUpdate = useCallback<MouseEventHandler>(e => {
        const rect = barRef.current!.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const clampedPos = Math.max(0, Math.min(1, pos));
        setHintPosition(clampedPos);
        setHintVisible(true);
    }, []);

    const hintStyle = useMemo<CSSProperties>(() => ({
        left: `${hintPosition * 100}%`,
    }), [hintPosition]);

    return (
        <div className={classes['bar-container'] + (className == null ? '' : (' ' + className))}>
            <div
                ref={barRef}
                className={classes['bar']}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseUpdate}
                onMouseUp={handleMouseUpdate}
                onMouseLeave={() => {
                    setHintPosition(hintPosition);
                    setHintVisible(false);
                }}
                onTouchStart={handleTouchStart}
            >
                {renderHint && <div
                    className={classes['hint'] + ((dragging || hintVisible) ? '' : (' ' + classes['hint-hide']))}
                    style={hintStyle}
                >
                    {renderHint(hintPosition)}
                </div>}
                <div className={classes['filled']} style={filledStyle}>
                    <div className={classes['handle']} />
                </div>
            </div>
        </div>
    );
};
