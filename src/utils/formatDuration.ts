// SPDX-FileCopyrightText: Copyright 2023 Fabio Iotti
// SPDX-License-Identifier: MIT

export const formatDuration = (seconds: number) => {
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds / (60 * 60));
    const m = Math.floor((seconds % (60 * 60)) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0)
        return `${h}:${m > 9 ? m : `0${m}`}:${s > 9 ? s : `0${s}`}`;

    return `${m}:${s > 9 ? s : `0${s}`}`;
};
