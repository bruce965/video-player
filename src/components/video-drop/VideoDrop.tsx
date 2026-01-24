// SPDX-FileCopyrightText: Copyright 2023-2024 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { Message } from '@components/message';
import { VideoPlayerContent } from '@components/video-player';
import { useDragListener, useDropArea } from '@hooks/dragAndDrop';
import { FC, useCallback, useState } from 'react';
import classes from './VideoDrop.module.css';

type ContentKind = 'video' | 'audio' | 'subtitles';

export interface VideoDropProps {
    onVideoAdded(video: VideoPlayerContent): void
    onAudioAdded(audio: VideoPlayerContent): void
    onSubtitlesAdded(subtitles: VideoPlayerContent): void
}

export const VideoDrop: FC<VideoDropProps> = ({
    onVideoAdded,
    onAudioAdded,
    onSubtitlesAdded,
}) => {
    const [unrecognizedItem, setUnrecognizedItem] = useState(false);

    const { dragInProgress, items } = useDragListener();

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

                        const contentKind = guessContentKind(str);
                        if (contentKind === 'subtitles') {
                            const isSrt = isSubRip(str);
                            if (isSrt)
                                str = convertSubRipToWebVTT(str);

                            const blob = new Blob([str]);
                            const url = URL.createObjectURL(blob);
                            onSubtitlesAdded({ url, name: `subtitles_${str.length}.${isSrt ? "srt" : ""}.vtt`, type: 'text/vtt' });

                            resolve(true);
                        }
                        else {
                            resolve(false);
                        }
                    });
                }));
            }
            else if (item.kind === 'file') {
                const file = item.getAsFile()!;
                //console.log('FILE:', file);

                promises.push((async () => {
                    const contentKind = await guessFileKind(file);
                    if (contentKind === 'video') {
                        const url = URL.createObjectURL(file);
                        onVideoAdded({ url, name: file.name, type: file.type });
                        return true;
                    }
                    if (contentKind === 'audio') {
                        const url = URL.createObjectURL(file);
                        onAudioAdded({ url, name: file.name, type: file.type });
                        return true;
                    }
                    if (contentKind === 'subtitles') {
                        const start = await file.slice(0, Math.min(file.size, 50)).text();
                        if (isSubRip(start)) {
                            const srt = await file.text();
                            const vtt = convertSubRipToWebVTT(srt);

                            const blob = new Blob([vtt]);
                            const url = URL.createObjectURL(blob);
                            onSubtitlesAdded({ url, name: file.name + ".vtt", type: 'text/vtt' });
                        }
                        else {
                            const url = URL.createObjectURL(file);
                            onSubtitlesAdded({ url, name: file.name, type: file.type });
                        }
                        return true;
                    }

                    return false;
                })());
            }
        }

        Promise.all(promises).then(results => {
            // if none of the files is recognized, open error message
            if (results.every(r => !r))
                setUnrecognizedItem(true);
        });

        return true;
    }, [onVideoAdded, onAudioAdded, onSubtitlesAdded]);

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

const guessFileKind = async (file: File): Promise<ContentKind | null> => {
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
