// SPDX-FileCopyrightText: Copyright 2023-2024, 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { Message } from '@components/message';
import { VideoPlayerTrack } from '@components/video-player';
import { VideoPlayerTrackKind } from '@components/video-player/VideoPlayer';
import { useDragListener, useDropArea } from '@hooks/dragAndDrop';
import { FC, useCallback, useState } from 'react';
import classes from './VideoDrop.module.css';

export type ContentKind = 'video' | 'audio' | 'subtitles';

export interface VideoDropProps {
    onTrackAdded(content: VideoPlayerTrack): void
}

export const VideoDrop: FC<VideoDropProps> = ({
    onTrackAdded,
}) => {
    const [unrecognizedItem, setUnrecognizedItem] = useState(false);

    const { dragInProgress } = useDragListener();

    const dropHandler = useCallback((items: DataTransferItemList, dropped: boolean) => {
        if (!dropped)
            return items.length > 0; // accept anything

        const promises: Promise<boolean>[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i]!;

            if (item.kind === 'string') {
                promises.push(new Promise(resolve => {
                    item.getAsString(str => {
                        //console.log('STRING:', str);

                        const track = trackFromString(str);
                        if (!track) {
                            resolve(false);
                            return;
                        }

                        onTrackAdded(track);
                        resolve(true);
                    });
                }));
            }
            else if (item.kind === 'file') {
                const file = item.getAsFile()!;
                //console.log('FILE:', file);

                promises.push((async () => {
                    const track = await trackFromFile(file);
                    if (!track)
                        return false;

                    onTrackAdded(track);
                    return true;
                })());
            }
        }

        Promise.all(promises).then(results => {
            // if none of the files is recognized, open error message
            if (results.every(r => !r))
                setUnrecognizedItem(true);
        });

        return true;
    }, [onTrackAdded]);

    const { ref, isDroppable } = useDropArea({ onDrop: dropHandler });

    return <>
        <div ref={ref} className={classes['video-drop'] + (dragInProgress ? ' ' + classes['video-drop-active'] : '')}>
            <div style={isDroppable ? { background: 'green' } : {}}>
                Drop...
            </div>
        </div>

        {unrecognizedItem && <div className={classes['error']}>
            <Message onDismiss={() => setUnrecognizedItem(false)}>
                Unrecognized item!
            </Message>
        </div>}
    </>;
};

export const trackFromFile = async (file: File): Promise<VideoPlayerTrack | null> => {
    const contentKind = await guessFileKind(file);
    if (contentKind === 'video') {
        const url = URL.createObjectURL(file);
        return { kind: 'video', url, name: file.name, type: file.type };
    }

    if (contentKind === 'audio') {
        const url = URL.createObjectURL(file);
        return { kind: 'audio', url, name: file.name, type: file.type };
    }

    if (contentKind === 'subtitles') {
        const start = await file.slice(0, Math.min(file.size, 50)).text();
        if (isSubRip(start)) {
            const srt = await file.text();
            const vtt = convertSubRipToWebVTT(srt);

            const blob = new Blob([vtt]);
            const url = URL.createObjectURL(blob);
            return { kind: 'subtitles', url, name: file.name + ".vtt", type: 'text/vtt' };
        }

        const url = URL.createObjectURL(file);
        return { kind: 'subtitles', url, name: file.name, type: file.type };
    }

    return null;
};

const trackFromString = (str: string): VideoPlayerTrack | null => {
    const contentKind = guessContentKind(str);
    if (contentKind === 'subtitles') {
        const isSrt = isSubRip(str);
        if (isSrt)
            str = convertSubRipToWebVTT(str);

        const blob = new Blob([str]);
        const url = URL.createObjectURL(blob);
        return { kind: 'subtitles', url, name: `subtitles_${str.length}.${isSrt ? "srt" : ""}.vtt`, type: 'text/vtt' };
    }

    return null;
};

const guessFileKind = async (file: File): Promise<VideoPlayerTrackKind | null> => {
    if (file.type.indexOf('video/') === 0)
        return 'video';

    if (file.type.indexOf('audio/') === 0)
        return 'audio';

    const start = await file.slice(0, Math.min(file.size, 50)).text();
    const guessedByContent = guessContentKind(start);
    if (guessedByContent != null)
        return guessedByContent;

    return null;
};

const guessContentKind = (content: string): ContentKind | null => {
    if (content.substring(0, 20).indexOf('WEBVTT') !== -1)
        return 'subtitles'; // WebVTT

    if (isSubRip(content))
        return 'subtitles'; // SubRip

    return null;
};

const isSubRip = (content: string): boolean => {
    const start = content.substring(0, 50);
    return /(^|\n)1[\r\n]/.test(start) && /[0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3} --> [0-9]{2}:[0-9]{2}:[0-9]{2},[0-9]{3}/.test(start);
};

const convertSubRipToWebVTT = (srtContent: string): string => {
    const vttContent = srtContent
        .replace(/\r\n/g, '\n')
        .replace(/([0-9 ]+\n[0-9:]{8}),([0-9]{3}) --> ([0-9:]{8}),([0-9]{3}[ \r\n])/g, '$1.$2 --> $3.$4');

    return `WEBVTT\r\n\r\n${vttContent}\r\n\r\n`;
};
