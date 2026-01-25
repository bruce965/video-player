// SPDX-FileCopyrightText: Copyright 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { VideoPlayerContent } from '@components/video-player';
import { FC } from 'react';
import classes from './TrackGroup.module.css';

export interface TrackGroupProps {
    title: string;
    tracks: VideoPlayerContent[];
    selectedTrack: VideoPlayerContent | null | undefined;
    onTrackChange?(track: VideoPlayerContent | null): void;
}

export const TrackGroup: FC<TrackGroupProps> = ({
    title,
    tracks,
    selectedTrack,
    onTrackChange,
}) => {
    return (
        <div className={classes['group']}>
            <div className={classes['group-title']}>{title}</div>
            <button
                className={
                    classes['track'] +
                    ' ' + classes['track-none'] +
                    (selectedTrack == null ? ' ' + classes['track-selected'] : '')
                }
                onClick={() => onTrackChange?.(null)}
            >
                None
            </button>
            {tracks.map(track => (
                <button
                    key={track.url}
                    className={
                        classes['track'] +
                        (track === selectedTrack ? ' ' + classes['track-selected'] : '')
                    }
                    onClick={() => onTrackChange?.(track)}
                    title={track.type}
                >
                    {track.name}
                </button>
            ))}
        </div>
    );
};
