import { FC, ReactNode } from 'react';
import * as classes from './style.module.scss';

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
