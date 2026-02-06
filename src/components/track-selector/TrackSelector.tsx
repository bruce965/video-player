// SPDX-FileCopyrightText: Copyright 2026 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { convertSubRipToWebVTT, guessFileKind, isSubRip } from '@components/video-drop';
import { VideoPlayerContent } from '@components/video-player';
import { FC, useCallback, useRef } from 'react';
import { TrackGroup } from './TrackGroup';
import classes from './TrackSelector.module.css';

export interface TrackSelectorProps {
    videoTracks: VideoPlayerContent[];
    audioTracks: VideoPlayerContent[];
    subtitleTracks: VideoPlayerContent[];
    selectedVideo?: VideoPlayerContent | null;
    selectedAudio?: VideoPlayerContent | null;
    selectedSubtitles?: VideoPlayerContent | null;
    onVideoChange?(video: VideoPlayerContent | null): void;
    onAudioChange?(audio: VideoPlayerContent | null): void;
    onSubtitlesChange?(subtitles: VideoPlayerContent | null): void;
    onVideoAdded?(video: VideoPlayerContent): void;
    onAudioAdded?(audio: VideoPlayerContent): void;
    onSubtitlesAdded?(subtitles: VideoPlayerContent): void;
}

export const TrackSelector: FC<TrackSelectorProps> = ({
    videoTracks,
    audioTracks,
    subtitleTracks,
    selectedVideo,
    selectedAudio,
    selectedSubtitles,
    onVideoChange,
    onAudioChange,
    onSubtitlesChange,
    onVideoAdded,
    onAudioAdded,
    onSubtitlesAdded,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i]!;
            const contentKind = await guessFileKind(file);

            if (contentKind === 'video') {
                const url = URL.createObjectURL(file);
                onVideoAdded?.({ url, name: file.name, type: file.type });
            } else if (contentKind === 'audio') {
                const url = URL.createObjectURL(file);
                onAudioAdded?.({ url, name: file.name, type: file.type });
            } else if (contentKind === 'subtitles') {
                const start = await file.slice(0, Math.min(file.size, 50)).text();
                if (isSubRip(start)) {
                    const srt = await file.text();
                    const vtt = convertSubRipToWebVTT(srt);
                    const blob = new Blob([vtt]);
                    const url = URL.createObjectURL(blob);
                    onSubtitlesAdded?.({ url, name: file.name + ".vtt", type: 'text/vtt' });
                } else {
                    const url = URL.createObjectURL(file);
                    onSubtitlesAdded?.({ url, name: file.name, type: file.type });
                }
            }
        }

        // Reset input so the same file can be selected again
        e.target.value = '';
    }, [onVideoAdded, onAudioAdded, onSubtitlesAdded]);

    const showOpenButton = onVideoAdded || onAudioAdded || onSubtitlesAdded;

    return (
        <div className={classes['track-selector']}>
            <TrackGroup
                title="Video tracks"
                tracks={videoTracks}
                selectedTrack={selectedVideo}
                onTrackChange={onVideoChange}
            />
            <TrackGroup
                title="Audio tracks"
                tracks={audioTracks}
                selectedTrack={selectedAudio}
                onTrackChange={onAudioChange}
            />
            <TrackGroup
                title="Subtitle tracks"
                tracks={subtitleTracks}
                selectedTrack={selectedSubtitles}
                onTrackChange={onSubtitlesChange}
            />
            {showOpenButton && <>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,audio/*,.vtt,.srt"
                    multiple
                    className={classes['file-input']}
                    onChange={handleFileChange}
                />
                <button
                    className={classes['open-button']}
                    onClick={handleOpenClick}
                >
                    Add files...
                </button>
            </>}
        </div>
    );
};
