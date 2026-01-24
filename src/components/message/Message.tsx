// SPDX-FileCopyrightText: Copyright 2023 Fabio Iotti
// SPDX-License-Identifier: AGPL-3.0-only

import { FC, ReactNode } from 'react';
import classes from './Message.module.css';

export interface MessageProps {
    onDismiss?(): void
    children?: ReactNode | undefined
}

export const Message: FC<MessageProps> = ({
    onDismiss,
    children
}) => {
    return <div className={classes['message']}>
        {onDismiss && <button className={classes['close']} onClick={() => onDismiss()} />}
        {children}
    </div>;
};
