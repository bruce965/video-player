// SPDX-FileCopyrightText: Copyright 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { Bar } from '@components/bar';
import { FC, useCallback, useState } from 'react';
import classes from './VolumeBar.module.css';

export interface VolumeBarProps {
    volume: number
    onChangeInteracting?(interacting: boolean): void
    onVolumeChange?(volume: number): void
}

export const VolumeBar: FC<VolumeBarProps> = ({
    volume,
    onChangeInteracting,
    onVolumeChange,
}) => {
    const [previousVolume, setPreviousVolume] = useState(1);

    const toggleMute = useCallback(() => {
        if (volume > 0) {
            setPreviousVolume(volume);
            onVolumeChange?.(0);
        } else {
            onVolumeChange?.(previousVolume);
        }
    }, [volume, previousVolume, onVolumeChange]);

    return <>
        <button
            className={classes['mute-button']}
            onClick={toggleMute}
        >
            {getVolumeIcon(volume)}
        </button>
        <Bar
            value={volume}
            className={classes['volume-bar']}
            renderHint={pos => `${Math.round(pos * 100)}%`}
            onChangeInteracting={onChangeInteracting}
            onValueChange={onVolumeChange}
        />
    </>;
};

const getVolumeIcon = (volume: number) => {
    if (volume <= 0)
        return "🔇";

    if (volume <= 1/3)
        return "🔈";

    if (volume <= 2/3)
        return "🔉";

    return "🔊";
};
