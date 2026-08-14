import * as React from "react";

import { Input, type InputProps } from "../components/input";

export type TimePickerProps = Omit<InputProps, "type">;

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>((props, ref) => (
  <Input ref={ref} type="time" {...props} />
));

TimePicker.displayName = "TimePicker";
