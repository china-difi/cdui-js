import { reactive } from '../../../src/reactive';
import { DatePicker } from '../../../src/components/DatePicker';

export const DatePickerPage = () => {
  let state = reactive({
    value: null,
  });

  return <DatePicker value={state.value} onchange={(event) => (state.value = event.detail)}></DatePicker>;
};
