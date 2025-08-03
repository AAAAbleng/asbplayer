import type { InputProps } from '@mui/material/Input';
import React, { MutableRefObject } from 'react';
import VideoControlInput from './VideoControlInput';

interface Props extends InputProps {
    inputRef: MutableRefObject<HTMLInputElement | undefined>;
    advancement: number;
    onAdvancement: (advancement: number) => void;
    disableKeyEvents?: boolean;
}

const valueToPrettyString = (v: number) => {
    const advancementSeconds = v / 1000;
    return advancementSeconds >= 0 ? '+' + advancementSeconds.toFixed(2) : String(advancementSeconds.toFixed(2));
};
const stringToValue = (s: string) => Number(s) * 1000;
const placeholder = '±' + Number(0).toFixed(2);

export default React.forwardRef(function SubtitleAdvancementInput({ inputRef, advancement, onAdvancement, ...rest }: Props, ref) {
    return (
        <VideoControlInput
            ref={ref}
            inputRef={inputRef}
            defaultNumberValue={0}
            valueToPrettyString={valueToPrettyString}
            stringToValue={stringToValue}
            numberValue={advancement}
            onNumberValue={onAdvancement}
            placeholder={placeholder}
            {...rest}
        />
    );
});
