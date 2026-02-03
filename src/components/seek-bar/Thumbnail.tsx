// SPDX-FileCopyrightText: Copyright 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { FC, useEffect, useRef } from 'react';
import classes from './Thumbnail.module.css';

export interface ThumbnailProps {
    videoSrc: string | undefined
    time: number
}

export const Thumbnail: FC<ThumbnailProps> = ({
    videoSrc,
    time,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Seek to the specified time
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !isFinite(time))
            return;

        video.currentTime = time;
    }, [time]);

    if (!videoSrc)
        return null;

    return (
        <video
            ref={videoRef}
            src={videoSrc}
            className={classes['thumbnail']}
            muted
            preload='metadata'
            playsInline
        />
    );
};
