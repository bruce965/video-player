// SPDX-FileCopyrightText: Copyright 2023 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { FC, useCallback, useEffect, useState } from 'react';
import { VideoDrop } from '../video-drop';
import { Content, VideoPlayer } from '../video-player';

export const App: FC = () => {
    const [videoTracks, setVideoTracks] = useState<Content[]>([]);
    const [audioTracks, setAudioTracks] = useState<Content[]>([]);
    const [subtitleTracks, setSubtitleTracks] = useState<Content[]>([]);

    const [selectedVideo, setVideo] = useState<Content | null>(videoTracks[0] ?? null);
    const [selectedAudio, setAudio] = useState<Content | null>(audioTracks[0] ?? null);
    const [selectedSubtitles, setSubtitles] = useState<Content | null>(subtitleTracks[0] ?? null);

    // update document title with video name
    useEffect(() => {
        const title = document.title;

        if (selectedVideo != null)
            document.title = `${selectedVideo.name} - ${document.title}`;

        return () => {
            if (name != null)
                document.title = title;
        };
    }, [selectedVideo]);

    const handleVideoAdded = useCallback((video: Content) => {
        setVideoTracks(current => [...current, video]);
        setVideo(current => current ?? video);
    }, []);

    const handleAudioAdded = useCallback((audio: Content) => {
        setAudioTracks(current => [...current, audio]);
        setAudio(current => current ?? audio);
    }, []);

    const handleSubtitlesAdded = useCallback((subtitles: Content) => {
        setSubtitleTracks(current => [...current, subtitles]);
        setSubtitles(current => current ?? subtitles);
    }, []);

    return <>
        <VideoPlayer
            videoTracks={videoTracks}
            audioTracks={audioTracks}
            subtitleTracks={subtitleTracks}
            selectedVideo={selectedVideo}
            selectedAudio={selectedAudio}
            selectedSubtitles={selectedSubtitles}
            onVideoChange={setVideo}
            onAudioChange={setAudio}
            onSubtitlesChange={setSubtitles}
        />

        <VideoDrop
            onVideoAdded={handleVideoAdded}
            onAudioAdded={handleAudioAdded}
            onSubtitlesAdded={handleSubtitlesAdded}
        />
    </>;
};
