// SPDX-FileCopyrightText: Copyright 2023 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { VideoDrop } from '@components/video-drop';
import { VideoPlayer, VideoPlayerContent } from '@components/video-player';
import { FC, useCallback, useEffect, useState } from 'react';

export const App: FC = () => {
    const [videoTracks, setVideoTracks] = useState<VideoPlayerContent[]>([]);
    const [audioTracks, setAudioTracks] = useState<VideoPlayerContent[]>([]);
    const [subtitleTracks, setSubtitleTracks] = useState<VideoPlayerContent[]>([]);

    const [selectedVideo, setVideo] = useState<VideoPlayerContent | null>(videoTracks[0] ?? null);
    const [selectedAudio, setAudio] = useState<VideoPlayerContent | null>(audioTracks[0] ?? null);
    const [selectedSubtitles, setSubtitles] = useState<VideoPlayerContent | null>(subtitleTracks[0] ?? null);

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

    const handleVideoAdded = useCallback((video: VideoPlayerContent) => {
        setVideoTracks(current => [...current, video]);
        setVideo(current => current ?? video);
    }, []);

    const handleAudioAdded = useCallback((audio: VideoPlayerContent) => {
        setAudioTracks(current => [...current, audio]);
        setAudio(current => current ?? audio);
    }, []);

    const handleSubtitlesAdded = useCallback((subtitles: VideoPlayerContent) => {
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
