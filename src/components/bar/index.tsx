import { CSSProperties, FC, MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classes from './style.module.css';

export interface BarProps {
    value: number
    clampValue?: boolean
    onChangeInteracting?(interacting: boolean): void
    onValueChange?(value: number): void
    renderHint?(position: number): ReactNode
    className?: string
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

    const filledStyle = useMemo<CSSProperties>(() => ({
        width: `${value * 100}%`,
    }), [value]);

    const [hintPosition, setHintPosition] = useState(0);
    const [hintVisible, setHintVisible] = useState(false);

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
        <div
            ref={barRef}
            className={classes['bar'] + (className == null ? '' : (' ' + className))}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseUpdate}
            onMouseUp={handleMouseUpdate}
            onMouseLeave={() => {
                setHintPosition(hintPosition);
                setHintVisible(false);
            }}
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
    );
};
